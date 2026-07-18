import { getValue, setValue } from "@tigo/redis-connector";
import { logger } from "@tigo/logger";

export async function cacheAside({ cacheKey, ttl, onMiss }) {
    try {
        const cached = await getValue(cacheKey);
        if (cached) {
            logger.info({ cacheHit: true, cacheKey });
            return JSON.parse(cached);
        }
    } catch (error) {
        logger.warn({ cacheReadError: error.message, cacheKey });
    }

    const data = await onMiss();

    try {
        await setValue(cacheKey, JSON.stringify(data), ttl);
    } catch (error) {
        logger.warn({ cacheWriteError: error.message, cacheKey });
    }

    return data;
}
