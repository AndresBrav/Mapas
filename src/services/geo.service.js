import axios from "axios";
import { logger } from "@tigo/logger";
import { getValue, setValue } from "@tigo/redis-connector";
import { Direccion } from "../domain/Direccion.js";
import { Punto } from "../domain/Punto.js";
import config from "../utils/config.js";

export class GeoService {
    async geocodificar(address) {
        logger.info({ "GeoService.geocodificar": { address } });

        // Validacion de dominio: lanza error si la direccion es invalida
        new Direccion(address);

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
            // Resiliencia: si Redis falla en lectura, se loggea warning y continua sin cache
            logger.warn({
                "GeoService.geocodificar": { cacheReadError: error.message },
            });
        }

        // 2. CACHE MISS: Consultar proveedor real de mapas (OpenStreetMap / Nominatim)
        logger.info({
            "GeoService.geocodificar": { cacheMiss: true, address },
        });

        const response = await axios.get(config.NOMINATIM_BASE_URL, {
            params: {
                q: address,
                format: "json",
                limit: 1,
            },
            headers: {
                // Cabecera obligatoria exigida por las politicas de uso de OpenStreetMap
                "User-Agent": "TigoGeolocalizacionBootcamp/1.0",
            },
            timeout: 4000, // Resiliencia: aborta la peticion si demora mas de 4 segundos
        });

        const data = response.data;

        // Si Nominatim no encuentra coincidencias retorna un array vacio
        if (!data || data.length === 0) {
            const error = new Error(`Address not found: ${address}`);
            error.statusCode = 404;
            logger.warn({ "GeoService.geocodificar": { notFound: address } });
            throw error;
        }

        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);

        const coords = { latitude, longitude };
        const punto = new Punto(latitude, longitude);

        // 3. Guardar resultado en Redis con TTL configurable
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
            // Resiliencia: si Redis falla en escritura, se loggea warning y continua
            logger.warn({
                "GeoService.geocodificar": { cacheWriteError: error.message },
            });
        }

        // Retornamos la direccion del dominio enriquecida con sus coordenadas reales
        return new Direccion(address, punto);
    }
}

export const geoService = new GeoService();
