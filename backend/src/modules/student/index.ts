import type { FeatureModule } from '../../shared/types';
import { studentRoutes } from './student.routes';

export const studentModule: FeatureModule = {
  name: 'Student',
  basePath: 'students',
  router: studentRoutes,
  enabled: true,
};

export * from './student.types';
export { StudentDocument, StudentSchemaType } from './student.model';
export * from './student.repository';
export * from './student.service';
export * from './student.controller';
export * from './student.validator';
