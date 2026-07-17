import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tigo/redis-connector', () => ({
    getValue: vi.fn(),
    setValue: vi.fn(),
}));

vi.mock('../../../src/repositories/client.repository.js', () => ({
    findClientById: vi.fn(),
}));

import { getValue, setValue } from '@tigo/redis-connector';
import { findClientById } from '../../../src/repositories/client.repository.js';
import { authenticate } from '../../../src/services/auth.service.js';

describe('auth.service.js — Cache-Aside (Redis + PostgreSQL)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deberia autenticar desde cache (Cache Hit)', async () => {
        getValue.mockResolvedValue(JSON.stringify({ clientSecret: 'sk-prod-abc123def' }));

        const result = await authenticate('geo-app-prod', 'sk-prod-abc123def');

        expect(getValue).toHaveBeenCalledWith('auth:client:geo-app-prod');
        expect(findClientById).not.toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('deberia rechazar si el secret no coincide en cache', async () => {
        getValue.mockResolvedValue(JSON.stringify({ clientSecret: 'sk-prod-abc123def' }));

        await expect(
            authenticate('geo-app-prod', 'wrong-secret')
        ).rejects.toThrow('Invalid client secret');
    });

    it('deberia consultar PostgreSQL si hay Cache Miss y autenticar', async () => {
        getValue.mockResolvedValue(null);
        findClientById.mockResolvedValue({
            client_id: 'geo-app-prod',
            client_secret: 'sk-prod-abc123def',
            name: 'Geo App',
            active: true,
        });

        const result = await authenticate('geo-app-prod', 'sk-prod-abc123def');

        expect(getValue).toHaveBeenCalled();
        expect(findClientById).toHaveBeenCalledWith('geo-app-prod');
        expect(setValue).toHaveBeenCalledWith(
            'auth:client:geo-app-prod',
            JSON.stringify({ clientSecret: 'sk-prod-abc123def' }),
            300
        );
        expect(result).toBe(true);
    });

    it('deberia rechazar si el cliente no existe en PostgreSQL', async () => {
        getValue.mockResolvedValue(null);
        findClientById.mockResolvedValue(null);

        await expect(
            authenticate('unknown-client', 'some-secret')
        ).rejects.toThrow('Client not found');
    });

    it('deberia rechazar si el secret no coincide en PostgreSQL', async () => {
        getValue.mockResolvedValue(null);
        findClientById.mockResolvedValue({
            client_id: 'geo-app-prod',
            client_secret: 'sk-prod-abc123def',
            name: 'Geo App',
            active: true,
        });

        await expect(
            authenticate('geo-app-prod', 'wrong-secret')
        ).rejects.toThrow('Invalid client secret');
    });

    it('deberia degradar gracefulmente si Redis falla al leer y consultar PostgreSQL', async () => {
        getValue.mockRejectedValue(new Error('Redis timeout'));
        findClientById.mockResolvedValue({
            client_id: 'geo-app-prod',
            client_secret: 'sk-prod-abc123def',
            name: 'Geo App',
            active: true,
        });

        const result = await authenticate('geo-app-prod', 'sk-prod-abc123def');

        expect(getValue).toHaveBeenCalled();
        expect(findClientById).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('deberia retornar exito aunque Redis falle al escribir (Resiliencia)', async () => {
        getValue.mockResolvedValue(null);
        setValue.mockRejectedValue(new Error('Redis write failed'));
        findClientById.mockResolvedValue({
            client_id: 'geo-app-prod',
            client_secret: 'sk-prod-abc123def',
            name: 'Geo App',
            active: true,
        });

        const result = await authenticate('geo-app-prod', 'sk-prod-abc123def');

        expect(setValue).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('deberia retornar error de servicio si PostgreSQL falla', async () => {
        getValue.mockResolvedValue(null);
        findClientById.mockRejectedValue(new Error('DB connection error'));

        await expect(
            authenticate('geo-app-prod', 'sk-prod-abc123def')
        ).rejects.toThrow('Authentication service unavailable');
    });

    it('deberia lanzar error si las credenciales son invalidas en dominio', async () => {
        await expect(
            authenticate('', 'some-secret')
        ).rejects.toThrow('Credenciales de cliente inválidas');
    });
});
