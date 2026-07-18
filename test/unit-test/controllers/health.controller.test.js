import { describe, it, expect, vi } from 'vitest';
import { healthController } from '../../../src/controllers/health.controller.js';

describe('health.controller.js', () => {
  it('deberia retornar 200 con status UP', async () => {
    const req = {};
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await healthController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'UP' });
  });
});
