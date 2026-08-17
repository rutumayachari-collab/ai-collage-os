import type { FeatureModule } from '../../shared/types';
import { examRoutes } from './exam.routes';

export const examModule: FeatureModule = {
  name: 'Exam',
  basePath: 'exams',
  router: examRoutes,
  enabled: true,
};

export * from './exam.types';
export * from './exam.model';
export * from './exam.repository';
export * from './exam.service';
export * from './exam.controller';
export * from './exam.validator';
