import type { FeatureModule } from '../../shared/types';
import { courseRoutes } from './course.routes';

export const courseModule: FeatureModule = {
  name: 'Course',
  basePath: 'courses',
  router: courseRoutes,
  enabled: true,
};

export * from './course.types';
export * from './course.model';
export * from './course.repository';
export * from './course.service';
export * from './course.controller';
export * from './course.validator';
