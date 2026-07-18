import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@tigo/redis-connector', () => ({
    getRedisClient: vi.fn(() => ({
        call: vi.fn().mockResolvedValue(undefined),
    })),
}));

describe('rateLimit.middleware.js', () => {
    it('deberia exportar una funcion middleware', async () => {
        const { rateLimitMiddleware } = await import('../../../src/middleware/rateLimit.middleware.js');
        expect(typeof rateLimitMiddleware).toBe('function');
    });

    it('deberia tener 3 parametros (req, res, next)', async () => {
        const { rateLimitMiddleware } = await import('../../../src/middleware/rateLimit.middleware.js');
        expect(rateLimitMiddleware.length).toBe(3);
    });
});
