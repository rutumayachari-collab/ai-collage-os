import type { FeatureModule } from '../shared/types';
import { healthModule } from '../modules/health';
import { authModule } from '../modules/auth';
import { studentModule } from '../modules/student';
import { departmentModule } from '../modules/department';
import { courseModule } from '../modules/course';
import { facultyModule } from '../modules/faculty';

export const featureModules: readonly FeatureModule[] = [healthModule, authModule, studentModule, departmentModule, courseModule, facultyModule];
