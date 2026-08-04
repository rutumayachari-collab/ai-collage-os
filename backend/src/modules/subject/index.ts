import type { FeatureModule } from '../../shared/types';
import { subjectRoutes } from './subject.routes';

export const subjectModule: FeatureModule = {
  name: 'Subject',
  basePath: 'subjects',
  router: subjectRoutes,
  enabled: true,
};

export * from './subject.types';
export * from './subject.model';
export * from './subject.repository';
export * from './subject.service';
export * from './subject.controller';
export * from './subject.validator';
