import morgan, { type StreamOptions } from 'morgan';
import type { RequestHandler } from 'express';
import { isProduction } from '../config/env.config';
import { logger } from '../shared/utils/logger.util';

const stream: StreamOptions = { write: (message: string) => logger.info(message.trim()) };

/** HTTP access logging, verbose in development and concise in production. */
export const requestLogger: RequestHandler = morgan(isProduction ? 'combined' : 'dev', {
  stream,
  skip: (req) => req.originalUrl === '/api/v1/health/live',
});
