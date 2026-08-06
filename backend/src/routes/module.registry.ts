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

// TODO: API versioning - consider grouping feature modules under /api/v1 and /api/v2 prefixes for future breaking changes.

export const featureModules: readonly FeatureModule[] = [healthModule, authModule, studentModule, departmentModule, courseModule, facultyModule, subjectModule, inquiryModule, applicantModule];
