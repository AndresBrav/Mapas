import { describe, it, expect } from 'vitest';
import { Distancia } from '../../../src/domain/Distancia.js';
import { Punto } from '../../../src/domain/Punto.js';

describe('Distancia Domain Model', () => {
    it('deberia crear una distancia con todos los campos', () => {
        const origin = new Punto(-17.39345, -66.15678);
        const destination = new Punto(-17.784, -63.182);
        const distancia = new Distancia({ origin, destination, distance: 350.5, duration: 240 });

        expect(distancia.origin).toBe(origin);
        expect(distancia.destination).toBe(destination);
        expect(distancia.distance).toBe(350.5);
        expect(distancia.duration).toBe(240);
    });
});
