import { logger } from '@tigo/logger';

export function requestLoggerMiddleware(req, res, next) {
    const start = Date.now();
    const traceId = req.headers['x-traceid'] || req.headers['x-clientid'] || 'no-trace';

    res.on('finish', () => {
        logger.info({
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            duration: `${Date.now() - start}ms`,
            traceId,
        });
    });

    next();
}
