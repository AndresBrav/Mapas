import { describe, it, expect, vi } from 'vitest';

import { validateRequestMiddleware } from '../../../src/middleware/validate.middleware.js';

describe('validate.middleware.js', () => {
  it('createExample should call next() with a valid request', () => {
    const req = {
      headers: { 'x-clientid': 'CLIENT' },
      params: {},
      body: { name: 'item' }
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateRequestMiddleware.createExample()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('createExample should return 400 when validation fails (no customErrorHandler)', () => {
    const req = {
      headers: { 'x-clientid': 'CLIENT' },
      params: {},
      body: { name: '' }
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateRequestMiddleware.createExample()(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
  });

  it('getExample should call next() with a valid request', () => {
    const req = {
      headers: { 'x-clientid': 'CLIENT' },
      params: { id: '1' },
      body: {}
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateRequestMiddleware.getExample()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
