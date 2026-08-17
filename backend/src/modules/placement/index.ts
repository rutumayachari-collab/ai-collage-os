import type { FeatureModule } from '../../shared/types';
import { placementRoutes } from './placement.routes';

export const placementModule: FeatureModule = {
  name: 'Placement',
  basePath: 'placement',
  router: placementRoutes,
  enabled: true,
};

export * from './placement.types';
export * from './placement.model';
export * from './placement.repository';
export * from './placement.service';
export * from './placement.controller';
export * from './placement.validator';
