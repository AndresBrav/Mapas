import bcrypt from 'bcrypt';
import { logger } from "@tigo/logger";
import { getValue, setValue } from "@tigo/redis-connector";
import { findClientByKey } from "../repositories/client.repository.js";
import { Cliente } from "../domain/Cliente.js";
import { errorCodes, setError } from "../utils/errorCodes.js";
import config from "../utils/config.js";

const cachePrefix = "auth:";

export const authenticate = async (clientKey, clientSecret) => {
    Cliente.validar(clientKey, clientSecret);

    const cacheKey = `${cachePrefix}${clientKey}`;

    // 1. CACHE HIT: Redis ya validó este cliente antes
    try {
        const cached = await getValue(cacheKey);
        if (cached) {
            logger.info({ auth: { clientKey, cacheHit: true } });
            return true;
        }
    } catch (error) {
        logger.warn({
            auth: { clientKey, cacheReadError: error.message },
        });
    }

    // 2. CACHE MISS: Consultar PostgreSQL
    try {
        const row = await findClientByKey(clientKey);
        if (!row) {
            logger.warn({
                auth: { clientKey, cacheMiss: true, result: "client_not_found" },
            });
            throw setError("Client not found", errorCodes.INVALID_TOKEN);
        }

        // 3. Validar secret con bcrypt
        const secretIsValid = await bcrypt.compare(clientSecret, row.client_secret_hash);
        if (!secretIsValid) {
            logger.warn({
                auth: { clientKey, cacheMiss: true, result: "invalid_secret" },
            });
            throw setError("Invalid client secret", errorCodes.INVALID_TOKEN);
        }

        // 4. Guardar en Redis solo el estado (sin el hash)
        try {
            await setValue(
                cacheKey,
                JSON.stringify({ id: row.id, status: row.status }),
                config.AUTH_CACHE_TTL,
            );
        } catch (cacheError) {
            logger.warn({
                auth: { clientKey, cacheWriteError: cacheError.message },
            });
        }

        logger.info({
            auth: { clientKey, cacheMiss: true, result: "authenticated" },
        });
        return true;
    } catch (error) {
        if (error.errorCode) throw error;
        logger.error({ auth: { clientKey, dbError: error.message } });
        throw setError(
            "Authentication service unavailable",
            errorCodes.GENERIC_INTERNAL_SERVER_ERROR,
        );
    }
};
