import ultimateExpress from "ultimate-express";
import { healthController } from "../controllers/health.controller.js";
import {
    createExampleController,
    getExampleController,
} from "../controllers/example.controller.js";
import { geocodeController } from "../controllers/geo.controller.js";
import { validateRequestMiddleware } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const { Router } = ultimateExpress;

const router = Router();

// Health check (sin autenticacion)
router.get("/health", healthController);

// Middleware de autenticacion para todas las rutas protegidas
router.use(authMiddleware);

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
