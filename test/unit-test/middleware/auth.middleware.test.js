import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/services/auth.service.js', () => ({
    authenticate: vi.fn(),
}));

vi.mock('../../../src/utils/response.js', () => ({
    sendError: vi.fn(),
}));

import { authMiddleware } from '../../../src/middleware/auth.middleware.js';
import { authenticate } from '../../../src/services/auth.service.js';
import { sendError } from '../../../src/utils/response.js';

describe('auth.middleware.js', () => {
    it('should call next() when credentials are valid', async () => {
        const req = {
            headers: { 'x-clientid': 'geo-app', 'x-client-secret': 'valid-secret-key' },
        };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();
        authenticate.mockResolvedValue(true);

        await authMiddleware(req, res, next);

        expect(authenticate).toHaveBeenCalledWith('geo-app', 'valid-secret-key');
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 when authentication fails', async () => {
        const req = {
            headers: { 'x-clientid': 'geo-app', 'x-client-secret': 'bad-secret' },
        };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();
        const authError = new Error('Invalid client secret');
        authError.errorCode = 'AU001';
        authenticate.mockRejectedValue(authError);
        sendError.mockReturnValue({ statusHttp: 401, response: { error: { code: 'AU001', message: 'Invalid client secret' } } });

        await authMiddleware(req, res, next);

        expect(sendError).toHaveBeenCalledWith('AU001');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when x-clientid is missing', async () => {
        const req = {
            headers: { 'x-client-secret': 'some-secret' },
        };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();
        sendError.mockReturnValue({ statusHttp: 400, response: { error: { code: 'AU003', message: 'Missing token' } } });

        await authMiddleware(req, res, next);

        expect(sendError).toHaveBeenCalledWith('AU003');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when x-client-secret is missing', async () => {
        const req = {
            headers: { 'x-clientid': 'geo-app' },
        };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();
        sendError.mockReturnValue({ statusHttp: 400, response: { error: { code: 'AU003', message: 'Missing token' } } });

        await authMiddleware(req, res, next);

        expect(sendError).toHaveBeenCalledWith('AU003');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });
});
