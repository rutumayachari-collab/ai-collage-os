import type { FeatureModule } from '../shared/types';
import { healthModule } from '../modules/health';
import { authModule } from '../modules/auth';
import { studentModule } from '../modules/student';
import { departmentModule } from '../modules/department';
import { courseModule } from '../modules/course';
import { facultyModule } from '../modules/faculty';
import { subjectModule } from '../modules/subject';
import { inquiryModule } from '../modules/inquiry';
import { applicantModule } from '../modules/applicant';
import { documentVerificationModule } from '../modules/document-verification';
import { eligibilityModule } from '../modules/eligibility';
import { admissionModule } from '../modules/admission';
import { aiModule } from '../modules/ai';
import { ocrModule } from '../modules/ocr';
import { notificationModule } from '../modules/notification';
import { paymentModule } from '../modules/payment';

export const featureModules: readonly FeatureModule[] = [healthModule, authModule, studentModule, departmentModule, courseModule, facultyModule, subjectModule, inquiryModule, applicantModule, documentVerificationModule, eligibilityModule, admissionModule, aiModule, ocrModule, notificationModule, paymentModule];
