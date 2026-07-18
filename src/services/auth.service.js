import bcrypt from 'bcrypt';
import { logger } from "@tigo/logger";
import { findClientByKey } from "../repositories/client.repository.js";
import { Cliente } from "../domain/Cliente.js";
import { errorCodes, setError } from "../utils/errorCodes.js";
import config from "../utils/config.js";
import { cacheAside } from "../utils/cache-aside.js";

const cachePrefix = "auth:";

export const authenticate = async (clientKey, clientSecret) => {
    Cliente.validar(clientKey, clientSecret);

    const cacheKey = `${cachePrefix}${clientKey}`;

    try {
        await cacheAside({
            cacheKey,
            ttl: config.AUTH_CACHE_TTL,
            onMiss: async () => {
                const row = await findClientByKey(clientKey);
                if (!row) {
                    logger.warn({
                        auth: { clientKey, cacheMiss: true, result: "client_not_found" },
                    });
                    throw setError("Client not found", errorCodes.INVALID_TOKEN);
                }

                const secretIsValid = await bcrypt.compare(clientSecret, row.client_secret_hash);
                if (!secretIsValid) {
                    logger.warn({
                        auth: { clientKey, cacheMiss: true, result: "invalid_secret" },
                    });
                    throw setError("Invalid client secret", errorCodes.INVALID_TOKEN);
                }

                logger.info({
                    auth: { clientKey, cacheMiss: true, result: "authenticated" },
                });

                return { id: row.id, status: row.status };
            },
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
