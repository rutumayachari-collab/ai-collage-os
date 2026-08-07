import type { FeatureModule } from '../../shared/types';
import { paymentRoutes } from './payment.routes';

export const paymentModule: FeatureModule = {
  name: 'Payment',
  basePath: 'payments',
  router: paymentRoutes,
  enabled: true,
};

export * from './payment.types';
export * from './payment.service';
export * from './payment.controller';
export * from './payment.validator';
