import type { FeatureModule } from '../../shared/types';
import { admissionIntelligenceRoutes } from './admission-intelligence.routes';

export const admissionIntelligenceModule: FeatureModule = {
  name: 'AdmissionIntelligence',
  basePath: 'admission-intelligence',
  router: admissionIntelligenceRoutes,
  enabled: true,
};

export * from './admission-intelligence.types';
export * from './admission-intelligence.service';
