import type { FeatureModule } from '../../shared/types';
import { applicantRoutes } from './applicant.routes';

// TODO: API versioning - consider registering this module under /api/v2/applicants when introducing breaking changes.
// TODO: OpenAPI/Swagger - generate OpenAPI spec for all applicant endpoints.
// TODO: Webhook/event - publish domain events for applicant lifecycle changes.
// TODO: Notification hooks - integrate notification service for status changes, interviews, and offer letters.
// TODO: AI hooks - integrate AI service for eligibility scoring, document analysis, and recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export const applicantModule: FeatureModule = {
  name: 'Applicant',
  basePath: 'applicants',
  router: applicantRoutes,
  enabled: true,
};

export * from './applicant.types';
export { ApplicantDocument, ApplicantSchemaType } from './applicant.model';
export * from './applicant.repository';
export * from './applicant.service';
export * from './applicant.controller';
export * from './applicant.validator';
