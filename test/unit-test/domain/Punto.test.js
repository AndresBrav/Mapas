import { describe, it, expect } from 'vitest';
import { Punto } from '../../../src/domain/Punto.js';

describe('Punto Domain Model', () => {
  it('deberia crear un punto valido dentro de los rangos correctos', () => {
    const punto = new Punto(-17.39345, -66.15678);
    expect(punto.latitude).toBe(-17.39345);
    expect(punto.longitude).toBe(-66.15678);
  });

  it('deberia lanzar un error si la latitud esta fuera de rango (-90 a 90)', () => {
    expect(() => new Punto(-95, -66.15)).toThrowError();
    expect(() => new Punto(90.1, -66.15)).toThrowError();
  });

  it('deberia lanzar un error si la longitud esta fuera de rango (-180 a 180)', () => {
    expect(() => new Punto(-17.3, -181)).toThrowError();
    expect(() => new Punto(-17.3, 180.1)).toThrowError();
  });
});
