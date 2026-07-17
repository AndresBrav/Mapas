import { describe, it, expect } from 'vitest';
import { Cliente } from '../../../src/domain/Cliente.js';

describe('Cliente.js', () => {
    it('should create a Cliente with valid credentials', () => {
        const cliente = new Cliente('geo-app-prod', 'sk-prod-abc123def');
        expect(cliente.clientId).toBe('geo-app-prod');
        expect(cliente.clientSecret).toBe('sk-prod-abc123def');
    });

    it('should throw when clientId is empty', () => {
        expect(() => new Cliente('', 'sk-prod-abc123def')).toThrow('Credenciales de cliente inválidas');
    });

    it('should throw when clientSecret is too short (< 8 chars)', () => {
        expect(() => new Cliente('geo-app', 'short')).toThrow('Credenciales de cliente inválidas');
    });

    it('esValido should return true for valid inputs', () => {
        const cliente = new Cliente('valid-id', 'valid-secret-ok');
        expect(cliente.esValido()).toBe(true);
    });
});
