import type { FeatureModule } from '../../shared/types';
import { hostelRoutes } from './hostel.routes';

export const hostelModule: FeatureModule = {
  name: 'Hostel',
  basePath: 'hostel',
  router: hostelRoutes,
  enabled: true,
};

export * from './hostel.types';
export * from './hostel.model';
export * from './hostel.repository';
export * from './hostel.service';
export * from './hostel.controller';
export * from './hostel.validator';
