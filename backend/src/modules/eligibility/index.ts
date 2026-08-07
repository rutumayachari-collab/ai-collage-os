import type { FeatureModule } from '../../shared/types';
import { eligibilityRoutes } from './eligibility.routes';

// TODO: API versioning - consider registering this module under /api/v2/eligibility when introducing breaking changes.
// TODO: OpenAPI/Swagger - generate OpenAPI spec for all eligibility endpoints.
// TODO: Webhook/event - publish domain events for eligibility lifecycle changes.
// TODO: Notification hooks - integrate notification service for eligibility status changes.
// TODO: AI hooks - integrate AI service for eligibility rule engine and recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export const eligibilityModule: FeatureModule = {
  name: 'Eligibility',
  basePath: 'eligibility',
  router: eligibilityRoutes,
  enabled: true,
};

export * from './eligibility.types';
export { EligibilityDocument, EligibilitySchemaType } from './eligibility.model';
export * from './eligibility.repository';
export * from './eligibility.service';
export * from './eligibility.controller';
export * from './eligibility.validator';
