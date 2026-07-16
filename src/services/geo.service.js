import { logger } from "@tigo/logger";
import { Direccion } from "../domain/Direccion.js";
import { Punto } from "../domain/Punto.js";

// Base de datos de direcciones para simular llamadas al proveedor (Tigo Library / Conector Mapas)
const MOCK_ADDRESSES = {
    "Av. América 123, Cochabamba, Bolivia": {
        latitude: -17.39345,
        longitude: -66.15678,
    },
    "Calle Calama 456, Cochabamba, Bolivia": {
        latitude: -17.3802,
        longitude: -66.1501,
    },
};

export class GeoService {
    async geocodificar(address) {
        logger.info({ "GeoService.geocodificar": { address } });

        // Instanciar entidad de dominio (realiza validaciones internas)
        const direccion = new Direccion(address);

        // Simulación del conector de mapas:
        // Busca en nuestro diccionario mock de direcciones.
        // Si no está, genera coordenadas deterministas válidas para Cochabamba, Bolivia.
        let coords = MOCK_ADDRESSES[address];

        if (!coords) {
            // Generar coordenadas deterministas basadas en el largo del texto
            const seed = address.length;
            const latitude = -17.39 - (seed % 100) / 1000;
            const longitude = -66.15 - (seed % 100) / 1000;
            coords = { latitude, longitude };
        }

        const punto = new Punto(coords.latitude, coords.longitude);

        // Retornamos la dirección del dominio enriquecida con sus coordenadas
        return new Direccion(address, punto);
    }
}

export const geoService = new GeoService();
