import axios from "axios";
import { logger } from "@tigo/logger";
import { Direccion } from "../domain/Direccion.js";
import { Distancia } from "../domain/Distancia.js";
import { Punto } from "../domain/Punto.js";
import { Ruta } from "../domain/Ruta.js";
import config from "../utils/config.js";
import { cacheAside } from "../utils/cache-aside.js";

export class GeoService {
    async geocodificar(address) {
        logger.info({ "GeoService.geocodificar": { address } });

        Direccion.validar(address);

        const cacheKey = `geo:geocode:${address}`;

        const coords = await cacheAside({
            cacheKey,
            ttl: config.GEO_CACHE_TTL,
            onMiss: async () => {
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
                        "User-Agent": "TigoGeolocalizacionBootcamp/1.0",
                    },
                    timeout: 4000,
                });

                const data = response.data;

                if (!data || data.length === 0) {
                    const error = new Error(`Address not found: ${address}`);
                    error.statusCode = 404;
                    logger.warn({
                        "GeoService.geocodificar": { notFound: address },
                    });
                    throw error;
                }

                return {
                    latitude: Number.parseFloat(data[0].lat),
                    longitude: Number.parseFloat(data[0].lon),
                };
            },
        });

        return new Direccion(address, new Punto(coords.latitude, coords.longitude));
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

        if (data?.code !== "Ok" || !data?.routes?.length) {
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

        return new Distancia({ origin, destination, distance: distanceKm, duration: durationMin });
    }
}

export const geoService = new GeoService();
