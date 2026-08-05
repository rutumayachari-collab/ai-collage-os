import type { FeatureModule } from '../../shared/types';
import { inquiryRoutes } from './inquiry.routes';

// TODO: API versioning - consider registering this module under /api/v2/inquiries when introducing breaking changes.

export const inquiryModule: FeatureModule = {
  name: 'Inquiry',
  basePath: 'inquiries',
  router: inquiryRoutes,
  enabled: true,
};

export * from './inquiry.types';
export * from './inquiry.model';
export * from './inquiry.repository';
export * from './inquiry.service';
export * from './inquiry.controller';
export * from './inquiry.validator';
