import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { facultyRepository } from './faculty.repository';
import { departmentRepository } from '../department/department.repository';
import type { FacultyDocument } from './faculty.model';
import type {
  CreateFacultyInput,
  UpdateFacultyInput,
  FacultyQueryInput,
  BulkImportInput,
} from './faculty.validator';

export class FacultyService {
  public async createFaculty(input: CreateFacultyInput, createdBy: string): Promise<FacultyDocument> {
    const normalizedFacultyId = input.facultyId.trim().toUpperCase();
    const normalizedEmployeeId = input.employeeId.trim();
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedOfficialEmail = input.officialEmail.trim().toLowerCase();
    const normalizedPhone = input.phone.trim();
    const normalizedFirstName = input.firstName.trim();
    const normalizedLastName = input.lastName.trim();

    if (await facultyRepository.existsByFacultyId(normalizedFacultyId)) {
      throw new ConflictError('A faculty with this faculty ID already exists');
    }

    if (await facultyRepository.existsByEmployeeId(normalizedEmployeeId)) {
      throw new ConflictError('A faculty with this employee ID already exists');
    }

    if (await facultyRepository.existsByEmail(normalizedEmail)) {
      throw new ConflictError('A faculty with this email already exists');
    }

    if (await facultyRepository.existsByOfficialEmail(normalizedOfficialEmail)) {
      throw new ConflictError('A faculty with this official email already exists');
    }

    if (input.aadharNumber && await facultyRepository.existsByAadharNumber(input.aadharNumber)) {
      throw new ConflictError('A faculty with this Aadhar number already exists');
    }

    await this.validateDepartment(input.departmentId);
    if (input.supportingDepartmentIds) {
      for (const deptId of input.supportingDepartmentIds) {
        await this.validateDepartment(deptId);
      }
    }

    const displayName = `${input.title} ${normalizedFirstName} ${normalizedLastName}`;

    const cleanedInput = this.cleanEmptyStrings(input);

    return facultyRepository.create({
      ...cleanedInput,
      facultyId: normalizedFacultyId,
      employeeId: normalizedEmployeeId,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      displayName,
      email: normalizedEmail,
      officialEmail: normalizedOfficialEmail,
      phone: normalizedPhone,
      status: input.status || 'ACTIVE',
      isActive: input.isActive ?? true,
      employmentStatus: input.employmentStatus || 'ACTIVE',
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateFaculty(id: string, input: UpdateFacultyInput, updatedBy: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    if (input.email && input.email !== faculty.email) {
      const normalizedEmail = input.email.trim().toLowerCase();
      const existing = await facultyRepository.findByEmail(normalizedEmail);
      if (existing && existing.id !== id) {
        throw new ConflictError('A faculty with this email already exists');
      }
    }

    if (input.officialEmail && input.officialEmail !== faculty.officialEmail) {
      const normalizedOfficialEmail = input.officialEmail.trim().toLowerCase();
      const existing = await facultyRepository.findByOfficialEmail(normalizedOfficialEmail);
      if (existing && existing.id !== id) {
        throw new ConflictError('A faculty with this official email already exists');
      }
    }

    if (input.phone && input.phone !== faculty.phone) {
      const normalizedPhone = input.phone.trim();
      const existing = await facultyRepository.findByPhone(normalizedPhone);
      if (existing && existing.id !== id) {
        throw new ConflictError('A faculty with this phone number already exists');
      }
    }

    if (input.aadharNumber && input.aadharNumber !== faculty.aadharNumber) {
      const existing = await facultyRepository.existsByAadharNumber(input.aadharNumber);
      if (existing) {
        throw new ConflictError('A faculty with this Aadhar number already exists');
      }
    }

    if (input.departmentId && input.departmentId !== faculty.departmentId) {
      await this.validateDepartment(input.departmentId);
    }

    if (input.supportingDepartmentIds) {
      for (const deptId of input.supportingDepartmentIds) {
        await this.validateDepartment(deptId);
      }
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await facultyRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getFaculty(id: string): Promise<FacultyDocument | null> {
    return facultyRepository.findById(id);
  }

  public async getFacultyByEmployeeId(employeeId: string): Promise<FacultyDocument | null> {
    return facultyRepository.findByEmployeeId(employeeId);
  }

  public async getFacultyByEmail(email: string): Promise<FacultyDocument | null> {
    return facultyRepository.findByEmail(email);
  }

  public async getFacultyByOfficialEmail(officialEmail: string): Promise<FacultyDocument | null> {
    return facultyRepository.findByOfficialEmail(officialEmail);
  }

  public async listFaculty(query: FacultyQueryInput): Promise<{ items: FacultyDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.departmentId) filter.departmentId = query.departmentId;
    if (query.designation) filter.designation = query.designation;
    if (query.employmentStatus) filter.employmentStatus = query.employmentStatus;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.isHOD !== undefined) filter.isHOD = query.isHOD;
    if (query.employeeType) filter.employeeType = query.employeeType;
    if (query.academicRank) filter.academicRank = query.academicRank;
    if (query.joiningDateFrom || query.joiningDateTo) {
      filter.joiningDate = {};
      if (query.joiningDateFrom) (filter.joiningDate as Record<string, unknown>).$gte = query.joiningDateFrom;
      if (query.joiningDateTo) (filter.joiningDate as Record<string, unknown>).$lte = query.joiningDateTo;
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return facultyRepository.listFaculty(filter, query.page, query.limit, sortOption);
  }

  public async searchFaculty(searchQuery: string, page = 1, limit = 20): Promise<{ items: FacultyDocument[]; total: number }> {
    return facultyRepository.searchFaculty(searchQuery, page, limit);
  }

  public async filterFaculty(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: FacultyDocument[]; total: number }> {
    return facultyRepository.filterFaculty(filters, page, limit, sort);
  }

  public async assignDepartment(id: string, departmentId: string, isPrimary: boolean): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    await this.validateDepartment(departmentId);

    if (isPrimary) {
      const updated = await facultyRepository.updateById(id, {
        departmentId,
        updatedBy: id,
        updatedAt: new Date(),
      });
      return updated;
    }

    const updated = await facultyRepository.updateById(id, {
      $addToSet: { supportingDepartmentIds: departmentId },
      updatedBy: id,
      updatedAt: new Date(),
    });
    return updated;
  }

  public async removeDepartment(id: string, departmentId: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    if (faculty.departmentId === departmentId) {
      throw new BadRequestError('Cannot remove primary department. Assign a new primary department first.');
    }

    const updated = await facultyRepository.updateById(id, {
      $pull: { supportingDepartmentIds: departmentId },
      updatedBy: id,
      updatedAt: new Date(),
    });
    return updated;
  }

  public async assignCourse(id: string, courseId: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    const updated = await facultyRepository.updateById(id, {
      $addToSet: { courses: courseId },
      updatedBy: id,
      updatedAt: new Date(),
    });
    return updated;
  }

  public async assignSubject(id: string, subjectId: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    const updated = await facultyRepository.updateById(id, {
      $addToSet: { subjects: subjectId },
      updatedBy: id,
      updatedAt: new Date(),
    });
    return updated;
  }

  public async updateTeachingLoad(id: string, load: FacultyDocument['teachingLoad']): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.updateTeachingLoad(id, load);
  }

  public async updateLeaveBalance(id: string, balance: FacultyDocument['leaveBalance']): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.updateLeaveBalance(id, balance);
  }

  public async updateOfficeHours(id: string, officeHours: FacultyDocument['officeHours']): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.updateOfficeHours(id, officeHours);
  }

  public async updateAvailability(id: string, availability: FacultyDocument['availability']): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.updateAvailability(id, availability);
  }

  public async addCommitteeAssignment(id: string, assignment: FacultyDocument['committeeAssignments'][0]): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.addCommitteeAssignment(id, assignment);
  }

  public async updateCommitteeAssignment(id: string, committeeId: string, updates: Partial<FacultyDocument['committeeAssignments'][0]>): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.updateCommitteeAssignment(id, committeeId, updates);
  }

  public async removeCommitteeAssignment(id: string, committeeId: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.removeCommitteeAssignment(id, committeeId);
  }

  public async addResearchProject(id: string, project: FacultyDocument['researchProjects'][0]): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.addResearchProject(id, project);
  }

  public async updateResearchProject(id: string, projectTitle: string, updates: Partial<FacultyDocument['researchProjects'][0]>): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.updateResearchProject(id, projectTitle, updates);
  }

  public async removeResearchProject(id: string, projectTitle: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    return facultyRepository.removeResearchProject(id, projectTitle);
  }

  public async archiveFaculty(id: string, archivedBy: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    if (faculty.status === 'ARCHIVED') {
      throw new BadRequestError('Faculty is already archived');
    }

    return facultyRepository.archiveFaculty(id, archivedBy);
  }

  public async restoreArchivedFaculty(id: string, restoredBy: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    if (faculty.status !== 'ARCHIVED') {
      throw new BadRequestError('Only archived faculty can be restored');
    }

    return facultyRepository.restoreArchivedFaculty(id, restoredBy);
  }

  public async softDelete(id: string, deletedBy: string): Promise<void> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    if (faculty.isActive && await facultyRepository.isFacultyInUse(id)) {
      throw new BadRequestError('Cannot delete faculty while they have assigned courses, subjects, or research projects');
    }

    await facultyRepository.softDelete(id, deletedBy);
  }

  public async restore(id: string): Promise<FacultyDocument | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }

    if (!faculty.deletedAt) {
      throw new BadRequestError('Faculty is not deleted');
    }

    return facultyRepository.restore(id);
  }

  public async bulkImport(input: BulkImportInput, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const facultyData of input.faculty) {
      try {
        await this.createFaculty(facultyData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${facultyData.facultyId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkUpdate(ids: string[], updates: UpdateFacultyInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateFaculty(id, updates, updatedBy);
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

  public async getPublicProfile(id: string): Promise<FacultyDocument | null> {
    return facultyRepository.publicProfile(id);
  }

  public async getFacultyStatistics(id: string): Promise<{
    facultyId: string;
    totalCourses: number;
    totalSubjects: number;
    totalStudents: number;
    totalResearchProjects: number;
    isInUse: boolean;
  } | null> {
    const faculty = await facultyRepository.findById(id);
    if (!faculty) {
      return null;
    }

    const [totalCourses, totalSubjects, totalStudents, totalResearchProjects] = await Promise.all([
      facultyRepository.countCourses(id),
      facultyRepository.countSubjects(id),
      facultyRepository.countStudents(id),
      facultyRepository.countResearchProjects(id),
    ]);

    const isInUse = totalCourses > 0 || totalSubjects > 0 || totalStudents > 0 || totalResearchProjects > 0;

    return {
      facultyId: faculty._id.toString(),
      totalCourses,
      totalSubjects,
      totalStudents,
      totalResearchProjects,
      isInUse,
    };
  }

  private cleanEmptyStrings(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === '' || value === null) {
        continue;
      }
      if (value instanceof Date) {
        cleaned[key] = value;
        continue;
      }
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => (typeof item === 'object' && item !== null && !(item instanceof Date) ? this.cleanEmptyStrings(item as Record<string, unknown>) : item));
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = this.cleanEmptyStrings(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  private async validateDepartment(departmentId: string): Promise<void> {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new BadRequestError('Department does not exist');
    }
  }
}

export const facultyService = new FacultyService();
