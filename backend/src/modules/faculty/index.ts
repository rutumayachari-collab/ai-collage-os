import type { FeatureModule } from '../../shared/types';
import { facultyRoutes } from './faculty.routes';

export const facultyModule: FeatureModule = {
  name: 'Faculty',
  basePath: 'faculty',
  router: facultyRoutes,
  enabled: true,
};

export * from './faculty.types';
export * from './faculty.model';
export * from './faculty.repository';
export * from './faculty.service';
export * from './faculty.controller';
export * from './faculty.validator';
