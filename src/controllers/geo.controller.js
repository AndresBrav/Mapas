import { logger } from "@tigo/logger";
import { sendError } from "../utils/response.js";
import { geoService } from "../services/geo.service.js";

export async function geocodeController(req, res) {
    let responseBody = {};
    logger.startTimer("GeocodeExecutionTime");

    try {
        const { address } = req.body;

        // Llamar al servicio de geocodificación
        const resultado = await geoService.geocodificar(address);

        // Mapear la respuesta exitosa en el formato esperado
        responseBody = {
            success: true,
            data: {
                address: resultado.address,
                latitude: resultado.coordenadas.latitude,
                longitude: resultado.coordenadas.longitude,
            },
        };

        return res.status(200).json(responseBody);
    } catch (error) {
        logger.error("Error in geocodeController:", error);

        // En caso de fallas de negocio o de sistema, responder usando el estándar del proyecto
        const { statusHttp, response } = sendError(error?.errorCode);
        responseBody = response;
        return res.status(statusHttp).json(responseBody);
    } finally {
        logger.endTimer("GeocodeExecutionTime");
    }
}

export async function routeController(req, res) {
    let responseBody = {};
    logger.startTimer("RouteExecutionTime");

    try {
        const { origin, destination } = req.body;

        const ruta = await geoService.calcularRuta(
            origin.latitude,
            origin.longitude,
            destination.latitude,
            destination.longitude,
        );

        responseBody = {
            success: true,
            data: {
                origin: {
                    latitude: ruta.origin.latitude,
                    longitude: ruta.origin.longitude,
                },
                destination: {
                    latitude: ruta.destination.latitude,
                    longitude: ruta.destination.longitude,
                },
                path: ruta.path.map((p) => ({
                    latitude: p.latitude,
                    longitude: p.longitude,
                })),
            },
        };

        return res.status(200).json(responseBody);
    } catch (error) {
        logger.error("Error in routeController:", error);

        const { statusHttp, response } = sendError(error?.errorCode);
        responseBody = response;
        return res.status(statusHttp).json(responseBody);
    } finally {
        logger.endTimer("RouteExecutionTime");
    }
}

export async function distanceController(req, res) {
    let responseBody = {};
    logger.startTimer("DistanceExecutionTime");

    try {
        const { origin, destination } = req.body;

        const distancia = await geoService.calcularDistancia(
            origin.latitude,
            origin.longitude,
            destination.latitude,
            destination.longitude,
        );

        responseBody = {
            success: true,
            data: {
                distance: {
                    value: distancia.distance,
                    unit: "km",
                },
                duration: {
                    value: distancia.duration,
                    unit: "min",
                },
            },
        };

        return res.status(200).json(responseBody);
    } catch (error) {
        logger.error("Error in distanceController:", error);

        const { statusHttp, response } = sendError(error?.errorCode);
        responseBody = response;
        return res.status(statusHttp).json(responseBody);
    } finally {
        logger.endTimer("DistanceExecutionTime");
    }
}
