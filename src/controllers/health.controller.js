import { logger } from '@tigo/logger';

export async function healthController(req, res) {
  const responseBody = { status: 'UP' };
  logger.info({ '[HEALTH RESPONSE]': responseBody });
  return res.status(200).json(responseBody);
}
