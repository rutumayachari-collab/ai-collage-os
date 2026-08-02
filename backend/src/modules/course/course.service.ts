import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { courseRepository } from './course.repository';
import { departmentRepository } from '../department/department.repository';
import type { CourseDocument } from './course.model';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CourseQueryInput,
  UpdateCurriculumInput,
  UpdateSemesterInput,
} from './course.validator';

export class CourseService {
  public async createCourse(input: CreateCourseInput, createdBy: string): Promise<CourseDocument> {
    const normalizedCourseId = input.courseId.trim().toUpperCase();
    const normalizedCode = input.code.trim().toUpperCase();
    const normalizedName = input.name.trim();
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedPhone = input.phone.trim();

    if (await courseRepository.existsByCourseId(normalizedCourseId)) {
      throw new ConflictError('A course with this course ID already exists');
    }

    if (await courseRepository.existsByCode(normalizedCode)) {
      throw new ConflictError('A course with this code already exists');
    }

    if (await courseRepository.existsByName(normalizedName)) {
      throw new ConflictError('A course with this name already exists');
    }

    if (await courseRepository.existsByEmail(normalizedEmail)) {
      throw new ConflictError('A course with this email already exists');
    }

    if (await courseRepository.existsByPhone(normalizedPhone)) {
      throw new ConflictError('A course with this phone number already exists');
    }

    this.validateCoordinatorRules(input);
    await this.validateDepartmentRules(input);
    this.validateSemesterRules(input.semesters, input.totalSemesters, input.totalCredits);
    this.validatePrerequisites(input.prerequisites, normalizedCourseId);
    this.validateProgramDegreeConsistency(input.programType, input.degree);

    const curriculumHistory = this.buildInitialCurriculumHistory(input, createdBy);

    return courseRepository.create({
      ...input,
      courseId: normalizedCourseId,
      code: normalizedCode,
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      curriculumHistory,
      status: input.status || 'ACTIVE',
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateCourse(id: string, input: UpdateCourseInput, updatedBy: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (input.email && input.email !== course.email) {
      const normalizedEmail = input.email.trim().toLowerCase();
      const existing = await courseRepository.findByEmail(normalizedEmail);
      if (existing && existing.id !== id) {
        throw new ConflictError('A course with this email already exists');
      }
    }

    if (input.phone && input.phone !== course.phone) {
      const normalizedPhone = input.phone.trim();
      const existing = await courseRepository.findByPhone(normalizedPhone);
      if (existing && existing.id !== id) {
        throw new ConflictError('A course with this phone number already exists');
      }
    }

    if (input.name && input.name !== course.name) {
      const normalizedName = input.name.trim();
      const existing = await courseRepository.findByName(normalizedName);
      if (existing && existing.id !== id) {
        throw new ConflictError('A course with this name already exists');
      }
    }

    if (input.primaryCoordinatorId && input.primaryCoordinatorId !== course.primaryCoordinatorId) {
      if (input.coCoordinatorIds?.includes(input.primaryCoordinatorId)) {
        throw new BadRequestError('Primary coordinator cannot be in co-coordinator list');
      }
    }

    if (input.coCoordinatorIds) {
      const uniqueCoCoordinators = new Set(input.coCoordinatorIds);
      if (uniqueCoCoordinators.size !== input.coCoordinatorIds.length) {
        throw new BadRequestError('Co-coordinator list contains duplicates');
      }
      if (input.primaryCoordinatorId && input.coCoordinatorIds.includes(input.primaryCoordinatorId)) {
        throw new BadRequestError('Primary coordinator cannot be in co-coordinator list');
      }
    }

    if (input.supportingDepartmentIds) {
      if (input.supportingDepartmentIds.includes(course.primaryDepartmentId)) {
        throw new BadRequestError('Primary department cannot be in supporting departments list');
      }
    }

    if (input.isActive === false && course.isActive) {
      const studentCount = await courseRepository.countStudents(id);
      if (studentCount > 0) {
        throw new BadRequestError('Cannot deactivate course while students are enrolled');
      }
    }

    const updated = await courseRepository.updateById(id, {
      ...input,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getCourse(id: string): Promise<CourseDocument | null> {
    return courseRepository.findById(id);
  }

  public async getCourseByCode(code: string): Promise<CourseDocument | null> {
    return courseRepository.findByCode(code);
  }

  public async getCourseByCourseId(courseId: string): Promise<CourseDocument | null> {
    return courseRepository.findByCourseId(courseId);
  }

  public async listCourses(query: CourseQueryInput): Promise<{ items: CourseDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.departmentId) filter.primaryDepartmentId = query.departmentId;
    if (query.programType) filter.programType = query.programType;
    if (query.degree) filter.degree = query.degree;
    if (query.status) filter.status = query.status;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.coordinatorId) filter.primaryCoordinatorId = query.coordinatorId;
    if (query.intakeCapacityFrom || query.intakeCapacityTo) {
      filter.intakeCapacity = {};
      if (query.intakeCapacityFrom) (filter.intakeCapacity as Record<string, unknown>).$gte = query.intakeCapacityFrom;
      if (query.intakeCapacityTo) (filter.intakeCapacity as Record<string, unknown>).$lte = query.intakeCapacityTo;
    }
    if (query.durationYears) filter.durationYears = query.durationYears;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return courseRepository.listCourses(filter, query.page, query.limit, sortOption);
  }

  public async searchCourses(searchQuery: string, page = 1, limit = 20): Promise<{ items: CourseDocument[]; total: number }> {
    return courseRepository.searchCourses(searchQuery, page, limit);
  }

  public async filterCourses(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: CourseDocument[]; total: number }> {
    return courseRepository.filterCourses(filters, page, limit, sort);
  }

  public async assignPrimaryCoordinator(courseId: string, coordinatorId: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.coCoordinatorIds.includes(coordinatorId)) {
      throw new BadRequestError('Coordinator cannot be both primary and co-coordinator');
    }

    return courseRepository.updateById(courseId, {
      primaryCoordinatorId: coordinatorId,
      updatedBy: coordinatorId,
      updatedAt: new Date(),
    });
  }

  public async addCoCoordinator(courseId: string, coordinatorId: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.primaryCoordinatorId === coordinatorId) {
      throw new BadRequestError('Cannot add primary coordinator as co-coordinator');
    }

    if (course.coCoordinatorIds.includes(coordinatorId)) {
      throw new ConflictError('Coordinator is already a co-coordinator');
    }

    return courseRepository.updateById(courseId, {
      coCoordinatorIds: [...course.coCoordinatorIds, coordinatorId],
      updatedBy: coordinatorId,
      updatedAt: new Date(),
    });
  }

  public async removeCoCoordinator(courseId: string, coordinatorId: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (!course.coCoordinatorIds.includes(coordinatorId)) {
      throw new NotFoundError('Coordinator is not assigned as co-coordinator');
    }

    return courseRepository.updateById(courseId, {
      coCoordinatorIds: course.coCoordinatorIds.filter((id) => id !== coordinatorId),
      updatedBy: coordinatorId,
      updatedAt: new Date(),
    });
  }

  public async archiveCourse(id: string, archivedBy: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.status !== 'ACTIVE') {
      throw new BadRequestError('Only ACTIVE courses can be archived');
    }

    return courseRepository.archiveCourse(id, archivedBy);
  }

  public async restoreArchivedCourse(id: string, restoredBy: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.status !== 'ARCHIVED') {
      throw new BadRequestError('Only ARCHIVED courses can be restored');
    }

    return courseRepository.restoreArchivedCourse(id, restoredBy);
  }

  public async deleteCourse(id: string, deletedBy: string): Promise<void> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const [studentCount, subjectCount, timetableCount] = await Promise.all([
      courseRepository.countStudents(id),
      courseRepository.countSubjects(id),
      courseRepository.countActiveTimetables(id),
    ]);

    if (studentCount > 0) {
      throw new BadRequestError('Cannot delete course because it has enrolled students');
    }

    if (subjectCount > 0) {
      throw new BadRequestError('Cannot delete course because it has subjects');
    }

    if (timetableCount > 0) {
      throw new BadRequestError('Cannot delete course because it has active timetables');
    }

    await courseRepository.softDelete(id, deletedBy);
  }

  public async restoreCourse(id: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (!course.deletedAt) {
      throw new BadRequestError('Course is not deleted');
    }

    return courseRepository.restore(id);
  }

  public async updateCurriculum(id: string, input: UpdateCurriculumInput, updatedBy: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const existingActiveVersion = course.curriculumHistory.find((item) => item.status === 'ACTIVE');
    if (existingActiveVersion && existingActiveVersion.version === input.newVersion) {
      throw new ConflictError('This curriculum version is already ACTIVE');
    }

    const historyRecord = {
      version: input.newVersion,
      status: 'ACTIVE' as const,
      effectiveFrom: new Date(),
      effectiveTo: null,
      changedBy: updatedBy,
      changeReason: input.changeReason,
      approvedBy: input.approvedBy,
      approvedAt: new Date(),
      publishedAt: new Date(),
    };

    return courseRepository.updateCurriculum(id, input.newVersion, historyRecord);
  }

  public async updateSemesterStructure(id: string, input: UpdateSemesterInput, _updatedBy: string): Promise<CourseDocument | null> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    this.validateSemesterRules(input.semesters, course.totalSemesters, course.totalCredits);

    const studentCount = await courseRepository.countStudents(id);
    if (studentCount > 0) {
      throw new BadRequestError('Cannot modify semester structure while students are enrolled');
    }

    return courseRepository.updateSemesterStructure(id, input.semesters);
  }

  public async getCurriculumHistory(courseId: string): Promise<CourseDocument['curriculumHistory']> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course.curriculumHistory;
  }

  public async bulkCreateCourses(courses: CreateCourseInput[], createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const courseData of courses) {
      try {
        await this.createCourse(courseData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${courseData.courseId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkUpdateCourses(ids: string[], updates: UpdateCourseInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateCourse(id, updates, updatedBy);
        if (result) {
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { updated, failed };
  }

  public async courseStatistics(courseId: string): Promise<{
    courseId: string;
    totalStudents: number;
    totalSubjects: number;
    totalFaculty: number;
    totalTimetables: number;
  } | null> {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      return null;
    }

    const [totalStudents, totalSubjects, totalFaculty, totalTimetables] = await Promise.all([
      courseRepository.countStudents(courseId),
      courseRepository.countSubjects(courseId),
      courseRepository.countFaculty(courseId),
      courseRepository.countActiveTimetables(courseId),
    ]);

    return {
      courseId: course._id.toString(),
      totalStudents,
      totalSubjects,
      totalFaculty,
      totalTimetables,
    };
  }

  private validateCoordinatorRules(input: CreateCourseInput): void {
    if (!input.primaryCoordinatorId) {
      throw new BadRequestError('Primary coordinator is required');
    }

    if (input.coCoordinatorIds.includes(input.primaryCoordinatorId)) {
      throw new BadRequestError('Primary coordinator cannot be in co-coordinator list');
    }

    const uniqueCoCoordinators = new Set(input.coCoordinatorIds);
    if (uniqueCoCoordinators.size !== input.coCoordinatorIds.length) {
      throw new BadRequestError('Co-coordinator list contains duplicates');
    }
  }

  private async validateDepartmentRules(input: CreateCourseInput): Promise<void> {
    if (input.supportingDepartmentIds.includes(input.primaryDepartmentId)) {
      throw new BadRequestError('Primary department cannot be in supporting departments list');
    }

    const primaryDepartment = await departmentRepository.findById(input.primaryDepartmentId);
    if (!primaryDepartment) {
      throw new BadRequestError('Primary department does not exist');
    }

    const supportingDepartments = await Promise.all(
      input.supportingDepartmentIds.map((deptId) => departmentRepository.findById(deptId)),
    );
    for (const dept of supportingDepartments) {
      if (!dept) {
        throw new BadRequestError('Supporting department does not exist');
      }
    }
  }

  private validateSemesterRules(semesters: CreateCourseInput['semesters'], totalSemesters: number, totalCredits: number): void {
    if (semesters.length !== totalSemesters) {
      throw new BadRequestError('Semester count must equal totalSemesters');
    }

    const totalCreditsFromSemesters = semesters.reduce((sum, sem) => sum + sem.credits, 0);
    if (totalCreditsFromSemesters !== totalCredits) {
      throw new BadRequestError('Sum of semester credits must equal totalCredits');
    }

    const totalFromDistribution = this.calculateCreditDistribution(semesters);
    if (totalFromDistribution !== totalCredits) {
      throw new BadRequestError('Credit distribution must equal totalCredits');
    }
  }

  private calculateCreditDistribution(semesters: CreateCourseInput['semesters']): number {
    return (
      semesters.reduce((sum, sem) => sum + (sem.theoryCredits || 0), 0) +
      semesters.reduce((sum, sem) => sum + (sem.practicalCredits || 0), 0) +
      semesters.reduce((sum, sem) => sum + (sem.labCredits || 0), 0) +
      semesters.reduce((sum, sem) => sum + (sem.projectCredits || 0), 0) +
      semesters.reduce((sum, sem) => sum + (sem.internshipCredits || 0), 0) +
      semesters.reduce((sum, sem) => sum + (sem.electiveCredits || 0), 0) +
      semesters.reduce((sum, sem) => sum + (sem.mandatoryCredits || 0), 0)
    );
  }

  private buildInitialCurriculumHistory(input: CreateCourseInput, createdBy: string): CreateCourseInput['curriculumHistory'] {
    const curriculumHistory = [...(input.curriculumHistory || [])];
    if (curriculumHistory.length === 0) {
      curriculumHistory.push({
        version: input.curriculumVersion,
        status: 'ACTIVE',
        effectiveFrom: new Date(),
        effectiveTo: null,
        changedBy: createdBy,
        changeReason: 'Initial curriculum creation',
        approvedBy: createdBy,
        approvedAt: new Date(),
        publishedAt: new Date(),
      });
    }
    return curriculumHistory;
  }

  private validatePrerequisites(prerequisites: CreateCourseInput['prerequisites'], courseId: string): void {
    for (const prereq of prerequisites) {
      if (prereq.prerequisiteCourseId === courseId) {
        throw new BadRequestError('Course cannot reference itself as a prerequisite');
      }
    }

    const courseIds = new Set<string>();
    const adjacencyList = new Map<string, string[]>();

    for (const prereq of prerequisites) {
      courseIds.add(courseId);
      courseIds.add(prereq.prerequisiteCourseId);
      if (!adjacencyList.has(courseId)) {
        adjacencyList.set(courseId, []);
      }
      adjacencyList.get(courseId)!.push(prereq.prerequisiteCourseId);
    }

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = adjacencyList.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of courseIds) {
      if (!visited.has(node)) {
        if (hasCycle(node)) {
          throw new BadRequestError('Circular prerequisite dependencies are not allowed');
        }
      }
    }
  }

  private validateProgramDegreeConsistency(programType: CreateCourseInput['programType'], degree: CreateCourseInput['degree']): void {
    const validCombinations: Record<string, string[]> = {
      UG: ['BACHELOR', 'DIPLOMA', 'CERTIFICATE'],
      PG: ['MASTER', 'DIPLOMA', 'CERTIFICATE'],
      DIPLOMA: ['DIPLOMA'],
      CERTIFICATE: ['CERTIFICATE'],
      PHD: ['DOCTORATE'],
    };

    const allowedDegrees = validCombinations[programType];
    if (!allowedDegrees || !allowedDegrees.includes(degree)) {
      throw new BadRequestError(`Invalid program type and degree combination: ${programType} with ${degree}`);
    }
  }
}

export const courseService = new CourseService();
