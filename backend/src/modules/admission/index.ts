import type { FeatureModule } from '../../shared/types';
import { admissionRoutes } from './admission.routes';

// TODO: API versioning - consider registering this module under /api/v2/admissions when introducing breaking changes.
// TODO: OpenAPI/Swagger - generate OpenAPI spec for all admission endpoints.
// TODO: Webhook/event - publish domain events for admission lifecycle changes.
// TODO: Notification hooks - integrate notification service for admission decisions.
// TODO: AI hooks - integrate AI service for admission recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export const admissionModule: FeatureModule = {
  name: 'Admission',
  basePath: 'admissions',
  router: admissionRoutes,
  enabled: true,
};

export * from './admission.types';
export { AdmissionDocument, AdmissionSchemaType } from './admission.model';
export * from './admission.repository';
export * from './admission.service';
export * from './admission.controller';
export * from './admission.validator';
