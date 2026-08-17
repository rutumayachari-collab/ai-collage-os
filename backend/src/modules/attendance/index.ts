import type { FeatureModule } from '../../shared/types';
import { attendanceRoutes } from './attendance.routes';

// TODO: API versioning - consider registering this module under /api/v2/attendance when introducing breaking changes.
// TODO: OpenAPI/Swagger - generate OpenAPI spec for all attendance endpoints.
// TODO: Webhook/event - publish domain events for attendance lifecycle changes.
// TODO: Notification hooks - integrate notification service for attendance alerts, reminders, and low attendance warnings.
// TODO: AI hooks - integrate AI service for attendance prediction, anomaly detection, and intervention recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.
// TODO: Integration hooks - connect with biometric/RFID attendance systems.
// TODO: Export hooks - generate attendance reports in PDF/Excel format.

export const attendanceModule: FeatureModule = {
  name: 'Attendance',
  basePath: 'attendance',
  router: attendanceRoutes,
  enabled: true,
};

export * from './attendance.types';
export { AttendanceDocument, AttendanceSchemaType } from './attendance.model';
export * from './attendance.repository';
export * from './attendance.service';
export * from './attendance.controller';
export * from './attendance.validator';
