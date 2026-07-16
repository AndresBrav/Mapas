import { describe, it, expect, vi } from 'vitest';

// Mock de geoService
vi.mock('../../../src/services/geo.service.js', () => ({
  geoService: {
    geocodificar: vi.fn()
  }
}));

import { geoService } from '../../../src/services/geo.service.js';
import { geocodeController } from '../../../src/controllers/geo.controller.js';

describe('geo.controller.js', () => {
  it('geocodeController deberia retornar 200 con la geocodificacion', async () => {
    const mockResultado = {
      address: 'Av. América 123, Cochabamba, Bolivia',
      coordenadas: { latitude: -17.39345, longitude: -66.15678 }
    };
    const req = { body: { address: 'Av. América 123, Cochabamba, Bolivia' }, params: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
    geoService.geocodificar.mockResolvedValue(mockResultado);

    await geocodeController(req, res);

    expect(geoService.geocodificar).toHaveBeenCalledWith(req.body.address);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        address: 'Av. América 123, Cochabamba, Bolivia',
        latitude: -17.39345,
        longitude: -66.15678
      }
    });
  });

  it('geocodeController deberia manejar excepciones y retornar error formateado', async () => {
    const req = { body: { address: 'Av. América 123, Cochabamba, Bolivia' }, params: {} };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    
    geoService.geocodificar.mockRejectedValue(new Error('Internal Map Provider Failure'));

    await geocodeController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'SE001'
      })
    }));
  });
});
