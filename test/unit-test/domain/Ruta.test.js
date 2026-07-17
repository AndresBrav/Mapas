import { describe, it, expect } from 'vitest';
import { Ruta } from '../../../src/domain/Ruta.js';
import { Punto } from '../../../src/domain/Punto.js';

describe('Ruta Domain Model', () => {
    it('deberia crear una ruta con todos los campos', () => {
        const origin = new Punto(-17.39345, -66.15678);
        const destination = new Punto(-17.7840, -63.1820);
        const path = [origin, destination];
        const ruta = new Ruta({
            origin,
            destination,
            distance: 350.5,
            duration: 240,
            path,
        });

        expect(ruta.origin).toBe(origin);
        expect(ruta.destination).toBe(destination);
        expect(ruta.distance).toBe(350.5);
        expect(ruta.duration).toBe(240);
        expect(ruta.path).toEqual(path);
    });
});
