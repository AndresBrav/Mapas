import { logger } from '@tigo/logger';
import { sendError } from '../utils/response.js';
import constants from '../utils/constants.js';
import { authenticate } from '../services/auth.service.js';

export async function authMiddleware(req, res, next) {
    try {
        const clientId = req.headers['x-clientid'];
        const clientSecret = req.headers['x-client-secret'];

        if (!clientId || !clientSecret) {
            logger.warn({ auth: { error: 'missing_credentials' } });
            const { statusHttp, response } = sendError(
                constants.errors.MISSING_TOKEN,
            );
            return res.status(statusHttp).json(response);
        }

        await authenticate(clientId, clientSecret);
        next();
    } catch (error) {
        logger.warn({ auth: { error: error.message } });
        const { statusHttp, response } = sendError(error?.errorCode);
        return res.status(statusHttp).json(response);
    }
}
