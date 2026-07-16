import { describe, it, expect } from 'vitest';
import { Direccion } from '../../../src/domain/Direccion.js';
import { Punto } from '../../../src/domain/Punto.js';

describe('Direccion Domain Model', () => {
  it('deberia crear una direccion con solo texto', () => {
    const direccion = new Direccion('Av. América 123');
    expect(direccion.address).toBe('Av. América 123');
    expect(direccion.coordenadas).toBeNull();
  });

  it('deberia crear una direccion con texto y coordenadas', () => {
    const punto = new Punto(-17.39, -66.15);
    const direccion = new Direccion('Av. América 123', punto);
    expect(direccion.address).toBe('Av. América 123');
    expect(direccion.coordenadas).toBe(punto);
  });

  it('deberia lanzar un error si la direccion esta vacia o es solo espacios', () => {
    expect(() => new Direccion('')).toThrowError("Address is required.");
    expect(() => new Direccion('   ')).toThrowError("Address is required.");
  });
});
