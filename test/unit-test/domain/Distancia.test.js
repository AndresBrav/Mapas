import { describe, it, expect } from 'vitest';
import { Distancia } from '../../../src/domain/Distancia.js';

describe('Distancia Domain Model', () => {
    it('deberia crear una distancia con todos los campos', () => {
        const distancia = new Distancia({ distance: 350.5, duration: 240 });

        expect(distancia.distance).toBe(350.5);
        expect(distancia.duration).toBe(240);
    });
});
