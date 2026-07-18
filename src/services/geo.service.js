import axios from "axios";
import { logger } from "@tigo/logger";
import { getValue, setValue } from "@tigo/redis-connector";
import { Direccion } from "../domain/Direccion.js";
import { Distancia } from "../domain/Distancia.js";
import { Punto } from "../domain/Punto.js";
import { Ruta } from "../domain/Ruta.js";
import config from "../utils/config.js";

export class GeoService {
    async geocodificar(address) {
        logger.info({ "GeoService.geocodificar": { address } });

        // Validacion de dominio: lanza error si la direccion es invalida
        Direccion.validar(address);

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

        const latitude = Number.parseFloat(data[0].lat);
        const longitude = Number.parseFloat(data[0].lon);

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

    async _requestOSRM(originLat, originLng, destLat, destLng, params = "") {
        const url = `${config.OSRM_BASE_URL}/${originLng},${originLat};${destLng},${destLat}${params}`;

        const response = await axios.get(url, {
            headers: {
                "User-Agent": "TigoGeolocalizacionBootcamp/1.0",
            },
            timeout: 5000,
        });

        const data = response.data;

        if (!data || data.code !== "Ok" || !data.routes || data.routes.length === 0) {
            const error = new Error(
                `Route not found between (${originLat},${originLng}) and (${destLat},${destLng})`,
            );
            error.statusCode = 404;
            throw error;
        }

        return data.routes[0];
    }

    async calcularRuta(originLat, originLng, destLat, destLng) {
        logger.info({ "GeoService.calcularRuta": { originLat, originLng, destLat, destLng } });

        const origin = new Punto(originLat, originLng);
        const destination = new Punto(destLat, destLng);

        const route = await this._requestOSRM(originLat, originLng, destLat, destLng, "?overview=full&geometries=geojson");

        const coords = route.geometry.coordinates.map(
            ([lng, lat]) => new Punto(lat, lng),
        );

        return new Ruta({ origin, destination, path: coords });
    }

    async calcularDistancia(originLat, originLng, destLat, destLng) {
        logger.info({ "GeoService.calcularDistancia": { originLat, originLng, destLat, destLng } });

        const origin = new Punto(originLat, originLng);
        const destination = new Punto(destLat, destLng);

        const route = await this._requestOSRM(originLat, originLng, destLat, destLng, "?overview=false");

        const distanceKm = Number.parseFloat((route.distance / 1000).toFixed(2));
        const durationMin = Math.ceil(route.duration / 60);

        return new Distancia({ distance: distanceKm, duration: durationMin });
    }
}

export const geoService = new GeoService();
