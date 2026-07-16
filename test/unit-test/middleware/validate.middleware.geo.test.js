import { describe, it, expect, vi } from 'vitest';
import { validateRequestMiddleware } from '../../../src/middleware/validate.middleware.js';

describe('validate.middleware.js - geocode', () => {
  it('deberia llamar a next() si la peticion contiene una direccion valida y cabeceras obligatorias', () => {
    const req = {
      headers: { 'x-clientid': 'MY_CLIENT_ID' },
      params: {},
      body: { address: 'Av. América 123, Cochabamba, Bolivia' }
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateRequestMiddleware.geocode()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deberia retornar 400 Bad Request si la direccion esta ausente', () => {
    const req = {
      headers: { 'x-clientid': 'MY_CLIENT_ID' },
      params: {},
      body: {}
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateRequestMiddleware.geocode()(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Address is required.'
    });
  });

  it('deberia retornar 400 Bad Request si la direccion esta vacia', () => {
    const req = {
      headers: { 'x-clientid': 'MY_CLIENT_ID' },
      params: {},
      body: { address: '    ' }
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateRequestMiddleware.geocode()(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Address is required.'
    });
  });

  it('deberia retornar 400 Bad Request si falta el header obligatorio x-clientid', () => {
    const req = {
      headers: {},
      params: {},
      body: { address: 'Av. América 123' }
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validateRequestMiddleware.geocode()(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
