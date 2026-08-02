import type { Server } from 'node:http';
import { createApp } from './app';
import { appConfig } from './config/app.config';
import { connectDatabase, disconnectDatabase } from './database/connection';
import { logger } from './shared/utils/logger.util';

let httpServer: Server | null = null;
let isShuttingDown = false;

/**
 * Closes the HTTP server and database pool, forcing exit if it takes too long.
 */
const shutdown = async (reason: string, exitCode: number): Promise<void> => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  logger.info(`Shutting down: ${reason}`);

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, appConfig.shutdownTimeoutMs);
  forceExit.unref();

  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer?.close((error) => (error ? reject(error) : resolve()));
      });
      logger.info('HTTP server closed');
    }
    await disconnectDatabase();
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }

  clearTimeout(forceExit);
  process.exit(exitCode);
};

/**
 * Boots the service: database first, then HTTP traffic.
 */
const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();

  httpServer = app.listen(appConfig.port, () => {
    logger.info(
      `${appConfig.name} listening on port ${appConfig.port} [${appConfig.environment}] — ` +
        `health: http://localhost:${appConfig.port}${appConfig.apiPrefix}/health`,
    );
  });

  httpServer.on('error', (error) => {
    logger.error('HTTP server error', error);
    void shutdown('http server error', 1);
  });
};

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason);
  void shutdown('unhandled rejection', 1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  void shutdown('uncaught exception', 1);
});

process.on('SIGINT', () => void shutdown('SIGINT received', 0));
process.on('SIGTERM', () => void shutdown('SIGTERM received', 0));

void bootstrap().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
