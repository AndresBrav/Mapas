import ultimateExpress from "ultimate-express";
import { healthController } from "../controllers/health.controller.js";
import {
    createExampleController,
    getExampleController,
} from "../controllers/example.controller.js";
import { geocodeController } from "../controllers/geo.controller.js";
import { validateRequestMiddleware } from "../middleware/validate.middleware.js";
const { Router } = ultimateExpress;

const router = Router();

// Health check (sin validacion)
router.get("/health", healthController);

// Recurso de ejemplo: insertar y obtener el registro insertado.
router.post(
    "/examples",
    validateRequestMiddleware.createExample(),
    createExampleController,
);
router.get(
    "/examples/:id",
    validateRequestMiddleware.getExample(),
    getExampleController,
);

// Rutas de Geolocalización
router.post(
    "/geo/geocode",
    validateRequestMiddleware.geocode(),
    geocodeController,
);

export default router;
