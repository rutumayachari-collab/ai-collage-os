import type { FeatureModule } from '../../shared/types';
import { notificationRoutes } from './notification.routes';

export const notificationModule: FeatureModule = {
  name: 'Notification',
  basePath: 'notifications',
  router: notificationRoutes,
  enabled: true,
};

export * from './notification.types';
export * from './notification.service';
export * from './notification.controller';
export * from './notification.validator';
