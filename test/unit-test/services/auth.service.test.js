import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn(),
    },
}));

vi.mock('@tigo/redis-connector', () => ({
    getValue: vi.fn(),
    setValue: vi.fn(),
}));

vi.mock('../../../src/repositories/client.repository.js', () => ({
    findClientByKey: vi.fn(),
}));

import bcrypt from 'bcrypt';
import { getValue, setValue } from '@tigo/redis-connector';
import { findClientByKey } from '../../../src/repositories/client.repository.js';
import { authenticate } from '../../../src/services/auth.service.js';

describe('auth.service.js — Cache-Aside con bcrypt (Redis + PostgreSQL)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deberia autenticar desde cache (Cache Hit) sin consultar DB', async () => {
        getValue.mockResolvedValue(JSON.stringify({ id: 1, status: 'ACTIVE' }));

        const result = await authenticate('envio-app', '123456789ABC');

        expect(getValue).toHaveBeenCalledWith('auth:envio-app');
        expect(findClientByKey).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('deberia consultar PostgreSQL si hay Cache Miss y autenticar con bcrypt', async () => {
        getValue.mockResolvedValue(null);
        findClientByKey.mockResolvedValue({
            id: 1,
            name: 'Servicio de Envíos',
            client_key: 'envio-app',
            client_secret_hash: '$2b$12$hashfake',
            status: 'ACTIVE',
        });
        bcrypt.compare.mockResolvedValue(true);

        const result = await authenticate('envio-app', '123456789ABC');

        expect(getValue).toHaveBeenCalled();
        expect(findClientByKey).toHaveBeenCalledWith('envio-app');
        expect(bcrypt.compare).toHaveBeenCalledWith('123456789ABC', '$2b$12$hashfake');
        expect(setValue).toHaveBeenCalledWith(
            'auth:envio-app',
            JSON.stringify({ id: 1, status: 'ACTIVE' }),
            300,
        );
        expect(result).toBe(true);
    });

    it('deberia rechazar si el cliente no existe en PostgreSQL', async () => {
        getValue.mockResolvedValue(null);
        findClientByKey.mockResolvedValue(null);

        await expect(
            authenticate('unknown-client', 'some-secret'),
        ).rejects.toThrow('Client not found');
    });

    it('deberia rechazar si bcrypt falla al comparar el secret', async () => {
        getValue.mockResolvedValue(null);
        findClientByKey.mockResolvedValue({
            id: 1,
            client_key: 'envio-app',
            client_secret_hash: '$2b$12$hashfake',
            status: 'ACTIVE',
        });
        bcrypt.compare.mockResolvedValue(false);

        await expect(
            authenticate('envio-app', 'wrong-secret'),
        ).rejects.toThrow('Invalid client secret');
    });

    it('deberia degradar gracefulmente si Redis falla al leer y consultar PostgreSQL', async () => {
        getValue.mockRejectedValue(new Error('Redis timeout'));
        findClientByKey.mockResolvedValue({
            id: 1,
            client_key: 'envio-app',
            client_secret_hash: '$2b$12$hashfake',
            status: 'ACTIVE',
        });
        bcrypt.compare.mockResolvedValue(true);

        const result = await authenticate('envio-app', '123456789ABC');

        expect(getValue).toHaveBeenCalled();
        expect(findClientByKey).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('deberia retornar exito aunque Redis falle al escribir (Resiliencia)', async () => {
        getValue.mockResolvedValue(null);
        setValue.mockRejectedValue(new Error('Redis write failed'));
        findClientByKey.mockResolvedValue({
            id: 1,
            client_key: 'envio-app',
            client_secret_hash: '$2b$12$hashfake',
            status: 'ACTIVE',
        });
        bcrypt.compare.mockResolvedValue(true);

        const result = await authenticate('envio-app', '123456789ABC');

        expect(setValue).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('deberia retornar error de servicio si PostgreSQL falla', async () => {
        getValue.mockResolvedValue(null);
        findClientByKey.mockRejectedValue(new Error('DB connection error'));

        await expect(
            authenticate('envio-app', '123456789ABC'),
        ).rejects.toThrow('Authentication service unavailable');
    });

    it('deberia lanzar error si las credenciales son invalidas en dominio', async () => {
        await expect(
            authenticate('', 'some-secret'),
        ).rejects.toThrow('Credenciales de cliente inválidas');
    });
});
