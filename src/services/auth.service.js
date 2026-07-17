import { logger } from "@tigo/logger";
import { getValue, setValue } from "@tigo/redis-connector";
import { findClientById } from "../repositories/client.repository.js";
import { Cliente } from "../domain/Cliente.js";
import { errorCodes, setError } from "../utils/errorCodes.js";
import config from "../utils/config.js";

const cachePrefix = "auth:client:";

export const authenticate = async (clientId, clientSecret) => {
    new Cliente(clientId, clientSecret);

    const cacheKey = `${cachePrefix}${clientId}`;

    // 1. CACHE HIT: Intentar leer de Redis
    try {
        const cached = await getValue(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.clientSecret === clientSecret) {
                logger.info({ auth: { clientId, cacheHit: true } });
                return true;
            }
            logger.warn({
                auth: { clientId, cacheHit: true, result: "invalid_secret" },
            });
            throw setError("Invalid client secret", errorCodes.INVALID_TOKEN);
        }
    } catch (error) {
        if (error.errorCode) throw error;
        logger.warn({
            auth: { clientId, cacheReadError: error.message },
        });
    }

    // 2. CACHE MISS: Consultar PostgreSQL
    try {
        const row = await findClientById(clientId);
        if (!row) {
            logger.warn({
                auth: { clientId, cacheMiss: true, result: "client_not_found" },
            });
            throw setError("Client not found", errorCodes.INVALID_TOKEN);
        }

        // 3. Validar secret
        if (row.client_secret !== clientSecret) {
            logger.warn({
                auth: { clientId, cacheMiss: true, result: "invalid_secret" },
            });
            throw setError("Invalid client secret", errorCodes.INVALID_TOKEN);
        }

        // 4. Guardar en Redis para próximos requests
        try {
            await setValue(
                cacheKey,
                JSON.stringify({ clientSecret: row.client_secret }),
                config.AUTH_CACHE_TTL,
            );
        } catch (cacheError) {
            logger.warn({
                auth: { clientId, cacheWriteError: cacheError.message },
            });
        }

        logger.info({
            auth: { clientId, cacheMiss: true, result: "authenticated" },
        });
        return true;
    } catch (error) {
        if (error.errorCode) throw error;
        logger.error({ auth: { clientId, dbError: error.message } });
        throw setError(
            "Authentication service unavailable",
            errorCodes.GENERIC_INTERNAL_SERVER_ERROR,
        );
    }
};
