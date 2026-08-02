import type { FeatureModule } from '../../shared/types';
import { authRoutes } from './auth.routes';

export const authModule: FeatureModule = {
  name: 'Auth',
  basePath: 'auth',
  router: authRoutes,
  enabled: true,
};

export * from './auth.model';
export * from './auth.repository';
export * from './auth.service';
export * from './auth.controller';
export * from './auth.validator';
