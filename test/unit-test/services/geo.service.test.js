import { describe, it, expect } from 'vitest';
import { geoService } from '../../../src/services/geo.service.js';

describe('GeoService', () => {
  it('deberia geocodificar una direccion conocida retornando las coordenadas mockeadas', async () => {
    const direccion = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');
    expect(direccion.address).toBe('Av. América 123, Cochabamba, Bolivia');
    expect(direccion.coordenadas.latitude).toBe(-17.39345);
    expect(direccion.coordenadas.longitude).toBe(-66.15678);
  });

  it('deberia geocodificar una direccion generica de forma determinista si no es conocida', async () => {
    const address = 'Cualquier direccion de pruebas';
    const direccion = await geoService.geocodificar(address);
    expect(direccion.address).toBe(address);
    expect(direccion.coordenadas.latitude).toBeLessThan(0);
    expect(direccion.coordenadas.longitude).toBeLessThan(0);
  });

  it('deberia lanzar error si se intenta geocodificar una direccion vacia', async () => {
    await expect(geoService.geocodificar('')).rejects.toThrowError("Address is required.");
  });
});
