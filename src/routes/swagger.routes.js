import { Router } from "ultimate-express";
import swaggerUi from "swagger-ui-express";
import * as yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerDocument = yaml.load(
    fs.readFileSync(path.join(__dirname, "../../docs/openapi.yaml"), "utf8"),
);

const router = Router();

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
