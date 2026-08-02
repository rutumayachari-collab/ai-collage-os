import { Router } from 'express';
import { featureModules } from './module.registry';
import { logger } from '../shared/utils/logger.util';
import { appConfig } from '../config/app.config';

/**
 * Builds the versioned API router by mounting every enabled feature module.
 */
export const createApiRouter = (): Router => {
  const router: Router = Router();

  for (const feature of featureModules) {
    if (feature.enabled === false) {
      logger.warn(`Module "${feature.name}" is disabled and was not mounted`);
      continue;
    }

    const path = `/${feature.basePath.replace(/^\/+|\/+$/g, '')}`;
    router.use(path, feature.router);
    logger.info(`Mounted module "${feature.name}" at ${appConfig.apiPrefix}${path}`);
  }

  return router;
};
