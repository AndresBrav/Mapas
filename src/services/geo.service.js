import { logger } from "@tigo/logger";
import { getValue, setValue } from "@tigo/redis-connector"; //funciones de Redis leer y guardar
import { Direccion } from "../domain/Direccion.js";
import { Punto } from "../domain/Punto.js";
import config from "../utils/config.js"; //importamos la configuracion de Redis

// Base de datos de direcciones para simular llamadas al proveedor (Tigo Library / Conector Mapas)
const MOCK_ADDRESSES = {
    "Av. América 123, Cochabamba, Bolivia": {
        latitude: -17.39345,
        longitude: -66.15678,
    },
    "Calle Calama 456, Cochabamba, Bolivia": {
        latitude: -19.3802,
        longitude: -68.1501,
    },
    "Calle Brasil 254, Cochabamba, Bolivia": {
        latitude: -18.3802,
        longitude: -67.1501,
    },
};

export class GeoService {
    async geocodificar(address) {
        logger.info({ "GeoService.geocodificar": { address } });

        // Instanciar entidad de dominio (realiza validaciones internas)
        const direccion = new Direccion(address);

        const cacheKey = `geo:geocode:${address}`;

        // 1. CACHE HIT: Intentar leer de Redis
        try {
            const cached = await getValue(cacheKey);
            if (cached) {
                logger.info({
                    "GeoService.geocodificar": { cacheHit: true, address },
                });
                const parsed = JSON.parse(cached);
                const punto = new Punto(parsed.latitude, parsed.longitude);
                return new Direccion(address, punto);
            }
        } catch (error) {
            // Resiliencia: si Redis falla, se loggea warning y continúa sin caché
            logger.warn({
                "GeoService.geocodificar": { cacheError: error.message },
            });
        }

        // 2. CACHE MISS: Consultar proveedor de mapas (mock)
        logger.info({
            "GeoService.geocodificar": { cacheMiss: true, address },
        });
        let coords = MOCK_ADDRESSES[address];

        if (!coords) {
            // Generar coordenadas deterministas basadas en el largo del texto
            const seed = address.length;
            const latitude = -17.39 - (seed % 100) / 1000;
            const longitude = -66.15 - (seed % 100) / 1000;
            coords = { latitude, longitude };
        }

        const punto = new Punto(coords.latitude, coords.longitude);

        // 3. Escribir resultado en Redis con TTL
        try {
            await setValue(
                cacheKey,
                JSON.stringify(coords),
                config.GEO_CACHE_TTL,
            );
            logger.info({
                "GeoService.geocodificar": {
                    cacheSaved: true,
                    ttl: config.GEO_CACHE_TTL,
                },
            });
        } catch (error) {
            // Resiliencia: si Redis falla en escritura, se loggea warning y continúa
            logger.warn({
                "GeoService.geocodificar": { cacheSaveError: error.message },
            });
        }

        // Retornamos la dirección del dominio enriquecida con sus coordenadas
        return new Direccion(address, punto);
    }
}

export const geoService = new GeoService();
