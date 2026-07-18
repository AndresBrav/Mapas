import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de Redis
vi.mock('@tigo/redis-connector', () => ({
    getValue: vi.fn(),
    setValue: vi.fn(),
    initializeRedis: vi.fn(),
}));

// Mock de Axios: simulamos las respuestas HTTP sin hacer peticiones reales
vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
    },
}));

import axios from 'axios';
import { getValue, setValue } from '@tigo/redis-connector';
import { geoService } from '../../../src/services/geo.service.js';

// Respuesta simulada de Nominatim para una direccion conocida
const NOMINATIM_RESPONSE_OK = [
    { lat: '-17.39345', lon: '-66.15678', display_name: 'Av. America, Cochabamba, Bolivia' },
];

describe('GeoService - Nominatim + Cache-Aside', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -----------------------------------------------------------------------
    // CACHE HIT: Redis tiene el dato, NO se llama a Nominatim
    // -----------------------------------------------------------------------
    it('deberia resolver desde cache (Cache Hit) sin llamar a Nominatim', async () => {
        const cachedCoords = { latitude: -17.39345, longitude: -66.15678 };
        getValue.mockResolvedValue(JSON.stringify(cachedCoords));

        const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

        expect(getValue).toHaveBeenCalledWith('geo:geocode:Av. América 123, Cochabamba, Bolivia');
        expect(axios.get).not.toHaveBeenCalled(); // Nominatim NO fue consultado
        expect(setValue).not.toHaveBeenCalled();  // No se guardo nada nuevo
        expect(result.address).toBe('Av. América 123, Cochabamba, Bolivia');
        expect(result.coordenadas.latitude).toBe(-17.39345);
        expect(result.coordenadas.longitude).toBe(-66.15678);
    });

    // -----------------------------------------------------------------------
    // CACHE MISS: Redis no tiene el dato, se consulta Nominatim y se guarda
    // -----------------------------------------------------------------------
    it('deberia consultar Nominatim y guardar en cache si hay Cache Miss', async () => {
        getValue.mockResolvedValue(null);
        setValue.mockResolvedValue(undefined);
        axios.get.mockResolvedValue({ data: NOMINATIM_RESPONSE_OK });

        const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

        expect(getValue).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledOnce(); // Nominatim SI fue consultado
        expect(setValue).toHaveBeenCalledWith(
            'geo:geocode:Av. América 123, Cochabamba, Bolivia',
            JSON.stringify({ latitude: -17.39345, longitude: -66.15678 }),
            86400
        );
        expect(result.coordenadas.latitude).toBe(-17.39345);
        expect(result.coordenadas.longitude).toBe(-66.15678);
    });

    // -----------------------------------------------------------------------
    // NOMINATIM SIN RESULTADOS: La direccion no existe en el mapa
    // -----------------------------------------------------------------------
    it('deberia lanzar error 404 si Nominatim no encuentra la direccion', async () => {
        getValue.mockResolvedValue(null);
        axios.get.mockResolvedValue({ data: [] }); // Nominatim retorna array vacio

        await expect(
            geoService.geocodificar('Direccion Completamente Inexistente XYZ 999')
        ).rejects.toThrow('Address not found');
    });

    // -----------------------------------------------------------------------
    // RESILIENCIA REDIS LECTURA: Redis falla al leer, continua con Nominatim
    // -----------------------------------------------------------------------
    it('deberia continuar con Nominatim si Redis falla al leer (Resiliencia)', async () => {
        getValue.mockRejectedValue(new Error('Connection timeout'));
        setValue.mockResolvedValue(undefined);
        axios.get.mockResolvedValue({ data: NOMINATIM_RESPONSE_OK });

        const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

        expect(getValue).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledOnce(); // Continuo y llamo a Nominatim
        expect(result.coordenadas.latitude).toBe(-17.39345);
    });

    // -----------------------------------------------------------------------
    // RESILIENCIA REDIS ESCRITURA: Redis falla al escribir, retorna igual
    // -----------------------------------------------------------------------
    it('deberia retornar resultado aunque Redis falle al escribir (Resiliencia)', async () => {
        getValue.mockResolvedValue(null);
        setValue.mockRejectedValue(new Error('Write command failed'));
        axios.get.mockResolvedValue({ data: NOMINATIM_RESPONSE_OK });

        const result = await geoService.geocodificar('Av. América 123, Cochabamba, Bolivia');

        expect(setValue).toHaveBeenCalled(); // Intento guardar
        expect(result.coordenadas.latitude).toBe(-17.39345); // Retorno igual
    });

    // -----------------------------------------------------------------------
    // VALIDACION: Direccion vacia lanza error de dominio
    // -----------------------------------------------------------------------
    it('deberia lanzar error si la direccion es vacia', async () => {
        await expect(geoService.geocodificar('')).rejects.toThrowError('Address is required.');
    });
});

// -----------------------------------------------------------------------
// RUTAS: Pruebas para calcularRuta con OSRM
// -----------------------------------------------------------------------
const OSRM_RESPONSE_OK = {
    code: 'Ok',
    routes: [
        {
            distance: 350000,
            duration: 12000,
            geometry: {
                coordinates: [
                    [-66.15678, -17.39345],
                    [-66.15, -17.4],
                    [-63.182, -17.784],
                ],
                type: 'LineString',
            },
            legs: [],
        },
    ],
    waypoints: [],
};

describe('GeoService - OSRM Route Calculation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deberia calcular ruta exitosamente con OSRM', async () => {
        axios.get.mockResolvedValue({ data: OSRM_RESPONSE_OK });

        const result = await geoService.calcularRuta(-17.39345, -66.15678, -17.784, -63.182);

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('overview=full&geometries=geojson'),
            expect.anything(),
        );
        expect(result.path).toHaveLength(3);
        expect(result.origin.latitude).toBe(-17.39345);
        expect(result.origin.longitude).toBe(-66.15678);
        expect(result.destination.latitude).toBe(-17.784);
        expect(result.destination.longitude).toBe(-63.182);
    });

    it('deberia lanzar error si OSRM no encuentra ruta', async () => {
        axios.get.mockResolvedValue({ data: { code: 'NoRoute' } });

        await expect(
            geoService.calcularRuta(-17.39345, -66.15678, -17.784, -63.182),
        ).rejects.toThrow('Route not found');
    });

    it('deberia lanzar error si las coordenadas de origen son invalidas', async () => {
        await expect(
            geoService.calcularRuta(200, -66.15678, -17.784, -63.182),
        ).rejects.toThrow('Coordenadas fuera de rango');
    });

    it('deberia calcular distancia exitosamente con OSRM', async () => {
        axios.get.mockResolvedValue({ data: OSRM_RESPONSE_OK });

        const result = await geoService.calcularDistancia(-17.39345, -66.15678, -17.784, -63.182);

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('overview=false'),
            expect.anything(),
        );
        expect(result.distance).toBe(350);
        expect(result.duration).toBe(200);
    });

    it('deberia lanzar error si OSRM no encuentra distancia', async () => {
        axios.get.mockResolvedValue({ data: { code: 'NoRoute' } });

        await expect(
            geoService.calcularDistancia(-17.39345, -66.15678, -17.784, -63.182),
        ).rejects.toThrow('Route not found');
    });

    it('deberia lanzar error si las coordenadas de distancia son invalidas', async () => {
        await expect(
            geoService.calcularDistancia(200, -66.15678, -17.784, -63.182),
        ).rejects.toThrow('Coordenadas fuera de rango');
    });
});
