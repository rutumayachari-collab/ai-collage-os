import type { FeatureModule } from '../../shared/types';
import { aiRoutes } from './ai.routes';

export const aiModule: FeatureModule = {
  name: 'AI',
  basePath: 'ai',
  router: aiRoutes,
  enabled: true,
};

export * from './ai.types';
export * from './ai.service';
export * from './ai.controller';
export * from './ai.validator';
