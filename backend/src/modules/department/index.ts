import type { FeatureModule } from '../../shared/types';
import { departmentRoutes } from './department.routes';

export const departmentModule: FeatureModule = {
  name: 'Department',
  basePath: 'departments',
  router: departmentRoutes,
  enabled: true,
};

export * from './department.types';
export * from './department.model';
export * from './department.repository';
export * from './department.service';
export * from './department.controller';
export * from './department.validator';
