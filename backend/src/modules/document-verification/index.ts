import type { FeatureModule } from '../../shared/types';
import { documentVerificationRoutes } from './documentVerification.routes';

// TODO: API versioning - consider registering this module under /api/v2/document-verifications when introducing breaking changes.
// TODO: OpenAPI/Swagger - generate OpenAPI spec for all document verification endpoints.
// TODO: Webhook/event - publish domain events for document verification lifecycle changes.
// TODO: Notification hooks - integrate notification service for verification status changes.
// TODO: AI hooks - integrate OCR and fraud detection services.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export const documentVerificationModule: FeatureModule = {
  name: 'DocumentVerification',
  basePath: 'document-verifications',
  router: documentVerificationRoutes,
  enabled: true,
};

export * from './documentVerification.types';
export { DocumentVerificationDocument, DocumentVerificationSchemaType } from './documentVerification.model';
export * from './documentVerification.repository';
export * from './documentVerification.service';
export * from './documentVerification.controller';
export * from './documentVerification.validator';
