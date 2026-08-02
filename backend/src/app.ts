import express, { type Application } from 'express';
import cookieParser from 'cookie-parser';
import { appConfig } from './config/app.config';
import {
  corsMiddleware,
  errorHandler,
  notFoundHandler,
  requestId,
  requestLogger,
  securityMiddleware,
} from './middleware';
import { createApiRouter } from './routes/route-loader';
import { sendSuccess } from './shared/utils';

/**
 * Composes the Express application. Kept free of side effects (no listening,
 * no database connection) so it can be imported by tests and tooling.
 */
export const createApp = (): Application => {
  const app: Application = express();

  if (appConfig.trustProxy) {
    app.set('trust proxy', 1);
  }
  app.disable('x-powered-by');

  // Observability
  app.use(requestId);
  app.use(requestLogger);

  // Security
  app.use(securityMiddleware);
  app.use(corsMiddleware);

  // Body parsing
  app.use(express.json({ limit: appConfig.requestBodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: appConfig.requestBodyLimit }));
  app.use(cookieParser());

  // Service root
  app.get('/', (_req, res) => {
    sendSuccess(res, {
      message: `${appConfig.name} API`,
      data: { version: 'v1', docs: `${appConfig.apiPrefix}/health` },
    });
  });

  // Versioned API
  app.use(appConfig.apiPrefix, createApiRouter());

  // Terminal handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
