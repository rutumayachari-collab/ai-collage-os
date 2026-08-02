import type { FeatureModule } from '../../shared/types';
import { healthRoutes } from './health.routes';

export const healthModule: FeatureModule = {
  name: 'Health',
  basePath: 'health',
  router: healthRoutes,
  enabled: true,
};

export * from './health.service';
