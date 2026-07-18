import { rateLimit } from "express-rate-limit";
import { getValue, setValue } from "@tigo/redis-connector";
import config from "../utils/config.js";

export class RedisConnectorStore {
    constructor() {
        this.windowMs = config.RATE_LIMIT_WINDOW_MS;
    }

    async increment(key) {
        const redisKey = `ratelimit:${key}`;
        const current = await getValue(redisKey);
        const totalHits = current ? parseInt(current, 10) + 1 : 1;
        const ttlSeconds = Math.ceil(this.windowMs / 1000);
        await setValue(redisKey, String(totalHits), ttlSeconds);
        const resetTime = new Date(Date.now() + this.windowMs);
        return { totalHits, resetTime };
    }

    async decrement(key) {
        const redisKey = `ratelimit:${key}`;
        const current = await getValue(redisKey);
        if (current) {
            const totalHits = parseInt(current, 10) - 1;
            if (totalHits <= 0) {
                await setValue(redisKey, "0", Math.ceil(this.windowMs / 1000));
            } else {
                await setValue(
                    redisKey,
                    String(totalHits),
                    Math.ceil(this.windowMs / 1000),
                );
            }
        }
    }

    async resetKey(key) {
        const redisKey = `ratelimit:${key}`;
        await setValue(redisKey, "0", Math.ceil(this.windowMs / 1000));
    }
}

export const rateLimitMiddleware = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisConnectorStore(),
});
