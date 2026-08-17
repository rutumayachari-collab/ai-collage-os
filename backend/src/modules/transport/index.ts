import type { FeatureModule } from '../../shared/types';
import { transportRoutes } from './transport.routes';

export const transportModule: FeatureModule = {
  name: 'Transport',
  basePath: 'transports',
  router: transportRoutes,
  enabled: true,
};

export * from './transport.types';
export * from './transport.model';
export * from './transport.repository';
export * from './transport.service';
export * from './transport.controller';
export * from './transport.validator';
