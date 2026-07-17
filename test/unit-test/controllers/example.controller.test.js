import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/services/example.services.js', () => ({
  createExampleService: vi.fn(),
  getExampleService: vi.fn()
}));

vi.mock('../../../src/utils/response.js', () => ({
  sendError: vi.fn()
}));

import { createExampleService, getExampleService } from '../../../src/services/example.services.js';
import { sendError } from '../../../src/utils/response.js';
import { createExampleController, getExampleController } from '../../../src/controllers/example.controller.js';

describe('example.controller.js', () => {
  it('createExampleController should return 201 with the created resource', async () => {
    const created = { id: 1, name: 'item' };
    const req = { body: { name: 'item' }, params: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    createExampleService.mockResolvedValue(created);

    await createExampleController(req, res);

    expect(createExampleService).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('createExampleController should return error when service throws', async () => {
    const req = { body: { name: 'item' }, params: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const error = new Error('Service error');
    error.errorCode = 'SE001';
    createExampleService.mockRejectedValue(error);
    sendError.mockReturnValue({ statusHttp: 500, response: { error: { code: 'SE001', message: 'Internal error' } } });

    await createExampleController(req, res);

    expect(sendError).toHaveBeenCalledWith('SE001');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'SE001', message: 'Internal error' } });
  });

  it('getExampleController should return 200 with the resource', async () => {
    const example = { id: 1, name: 'item' };
    const req = { params: { id: '1' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    getExampleService.mockResolvedValue(example);

    await getExampleController(req, res);

    expect(getExampleService).toHaveBeenCalledWith({ id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(example);
  });

  it('getExampleController should return error when service throws', async () => {
    const req = { params: { id: '999' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const error = new Error('example 999 not found');
    error.errorCode = 'NF001';
    getExampleService.mockRejectedValue(error);
    sendError.mockReturnValue({ statusHttp: 404, response: { error: { code: 'NF001', message: 'Not found' } } });

    await getExampleController(req, res);

    expect(sendError).toHaveBeenCalledWith('NF001');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'NF001', message: 'Not found' } });
  });
});
