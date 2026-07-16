import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de la libreria de Redis del bootcamp
vi.mock('@tigo/redis-connector', () => ({
  getValue: vi.fn(),
  setValue: vi.fn(),
  initializeRedis: vi.fn()
}));

import { getValue, setValue } from '@tigo/redis-connector';
import { geoService } from '../../../src/services/geo.service.js';

describe('GeoService - Cache-Aside Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deberia resolver desde cache si hay un acierto (Cache Hit) sin guardar nada nuevo', async () => {
    const cachedCoords = { latitude: -17.39345, longitude: -66.15678 };
    getValue.mockResolvedValue(JSON.stringify(cachedCoords));

    const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

    expect(getValue).toHaveBeenCalledWith('geo:geocode:Av. América 123, Cochabamba, Bolivia');
    expect(setValue).not.toHaveBeenCalled();
    expect(result.address).toBe('Av. América 123, Cochabamba, Bolivia');
    expect(result.coordenadas.latitude).toBe(-17.39345);
    expect(result.coordenadas.longitude).toBe(-66.15678);
  });

  it('deberia consultar y guardar en cache si hay un fallo de cache (Cache Miss)', async () => {
    getValue.mockResolvedValue(null);
    setValue.mockResolvedValue(undefined);

    const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

    expect(getValue).toHaveBeenCalledWith('geo:geocode:Av. América 123, Cochabamba, Bolivia');
    expect(setValue).toHaveBeenCalledWith(
      'geo:geocode:Av. América 123, Cochabamba, Bolivia',
      JSON.stringify({ latitude: -17.39345, longitude: -66.15678 }),
      86400
    );
    expect(result.address).toBe('Av. América 123, Cochabamba, Bolivia');
    expect(result.coordenadas.latitude).toBe(-17.39345);
    expect(result.coordenadas.longitude).toBe(-66.15678);
  });

  it('deberia continuar el flujo de geocodificacion si Redis falla al leer (Resiliencia en Lectura)', async () => {
    getValue.mockRejectedValue(new Error('Connection timeout'));
    setValue.mockResolvedValue(undefined);

    const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

    expect(getValue).toHaveBeenCalled();
    // Debe continuar al cache miss y guardar en cache
    expect(setValue).toHaveBeenCalled();
    expect(result.address).toBe('Av. América 123, Cochabamba, Bolivia');
    expect(result.coordenadas.latitude).toBe(-17.39345);
  });

  it('deberia retornar el resultado aun si Redis falla al escribir (Resiliencia en Escritura)', async () => {
    getValue.mockResolvedValue(null);
    setValue.mockRejectedValue(new Error('Write command failed'));

    const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

    expect(getValue).toHaveBeenCalled();
    expect(setValue).toHaveBeenCalled();
    expect(result.address).toBe('Av. América 123, Cochabamba, Bolivia');
    expect(result.coordenadas.latitude).toBe(-17.39345);
  });

  it('deberia geocodificar una direccion generica deterministicamente si no existe en MOCK_ADDRESSES', async () => {
    getValue.mockResolvedValue(null);
    setValue.mockResolvedValue(undefined);

    const result = await geoService.geocodificar('Direccion Generica Inexistente');

    expect(getValue).toHaveBeenCalled();
    expect(setValue).toHaveBeenCalled();
    expect(result.address).toBe('Direccion Generica Inexistente');
    expect(result.coordenadas.latitude).toBeLessThan(0);
    expect(result.coordenadas.longitude).toBeLessThan(0);
  });

  it('deberia lanzar error si se intenta geocodificar una direccion vacia', async () => {
    await expect(geoService.geocodificar('')).rejects.toThrowError("Address is required.");
  });
});
