import type { FeatureModule } from '../../shared/types';
import { feeRoutes } from './fees.routes';

export const feeModule: FeatureModule = {
  basePath: 'fees',
  name: 'fees',
  router: feeRoutes,
};
