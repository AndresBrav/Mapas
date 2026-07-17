import { logger } from "@tigo/logger";
import {
    createExampleSchema,
    idParamSchema,
} from "../../schemas/example.schema.js";
import { geocodeSchema, routeSchema } from "../../schemas/geo.schema.js";
import constants from "../utils/constants.js";
import { sendError } from "../utils/response.js";

/**
 * Factory de validacion. Combina body + params + headers relevantes y los
 * valida contra un schema de Zod. Si falla, responde con BAD_REQUEST.
 */
const validate =
    (schema, customErrorHandler = null) =>
    (req, res, next) => {
        try {
            logger.info({ "[REQUEST HEADERS]": req.headers });
            logger.info({ "[REQUEST PARAMS]": req.params });
            logger.info({ "[REQUEST BODY]": req.body });

            const xtraceid = req.headers["x-traceid"];
            const xclientid = req.headers["x-clientid"];

            const data = {
                ...req.body,
                ...req.params,
                xtraceid,
                xclientid,
            };

            const result = schema.safeParse(data);
            if (!result.success) {
                logger.info(
                    `Validation failed ${JSON.stringify(result?.error?.issues)}`,
                );
                if (customErrorHandler) {
                    return customErrorHandler(result.error, res);
                }
                throw new Error("Invalid request data");
            }
            next();
        } catch (error) {
            logger.warn({ validationError: error.message });
            const { statusHttp, response } = sendError(
                constants.errors.BAD_REQUEST,
            );
            res.status(statusHttp).json(response);
        }
    };

// Agregamos una función manejadora para los fallos del geocode:
const handleGeocodeValidationError = (error, res) => {
    // Retorna el formato exacto requerido: success: false, message: "Address is required."
    const hasAddressIssue = error.issues.some((issue) =>
        issue.path.includes("address"),
    );
    const message = hasAddressIssue
        ? "Address is required."
        : "Invalid request data";
    return res.status(400).json({
        success: false,
        message: message,
    });
};

export const validateRequestMiddleware = {
    createExample: () => validate(createExampleSchema),
    getExample: () => validate(idParamSchema),
    geocode: () => validate(geocodeSchema, handleGeocodeValidationError),
    route: () => validate(routeSchema),
};
