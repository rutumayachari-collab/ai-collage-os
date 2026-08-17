import type { FeatureModule } from '../../shared/types';
import { libraryRoutes } from './library.routes';

export const libraryModule: FeatureModule = {
  name: 'Library',
  basePath: 'library',
  router: libraryRoutes,
  enabled: true,
};

export * from './library.types';
export * from './library.model';
export * from './library.repository';
export * from './library.service';
export * from './library.controller';
export * from './library.validator';
