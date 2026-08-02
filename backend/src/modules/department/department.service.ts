import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { departmentRepository } from './department.repository';
import type { DepartmentDocument } from './department.model';
import type { CreateDepartmentInput, UpdateDepartmentInput, DepartmentQueryInput } from './department.validator';

export class DepartmentService {
  public async createDepartment(input: CreateDepartmentInput, createdBy: string): Promise<DepartmentDocument> {
    const normalizedCode = input.code.trim().toUpperCase();
    const normalizedName = input.name.trim();
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedPhone = input.phone.trim();

    if (await departmentRepository.existsByCode(normalizedCode)) {
      throw new ConflictError('A department with this code already exists');
    }

    if (await departmentRepository.existsByName(normalizedName)) {
      throw new ConflictError('A department with this name already exists');
    }

    if (await departmentRepository.existsByEmail(normalizedEmail)) {
      throw new ConflictError('A department with this email already exists');
    }

    if (await departmentRepository.existsByPhone(normalizedPhone)) {
      throw new ConflictError('A department with this phone number already exists');
    }

    if (input.hodId) {
      const existingHodDepartment = await departmentRepository.findByHodId(input.hodId);
      if (existingHodDepartment) {
        throw new ConflictError('This HOD is already assigned to another department');
      }
    }

    return departmentRepository.create({
      ...input,
      code: normalizedCode,
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      status: input.status || 'ACTIVE',
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateDepartment(id: string, input: UpdateDepartmentInput, updatedBy: string): Promise<DepartmentDocument | null> {
    const department = await departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    if (input.email && input.email !== department.email) {
      const normalizedEmail = input.email.trim().toLowerCase();
      const existing = await departmentRepository.findByEmail(normalizedEmail);
      if (existing && existing.id !== id) {
        throw new ConflictError('A department with this email already exists');
      }
    }

    if (input.phone && input.phone !== department.phone) {
      const normalizedPhone = input.phone.trim();
      const existing = await departmentRepository.findByPhone(normalizedPhone);
      if (existing && existing.id !== id) {
        throw new ConflictError('A department with this phone number already exists');
      }
    }

    if (input.hodId && input.hodId !== department.hodId) {
      const hodDepartment = await departmentRepository.findByHodId(input.hodId);
      if (hodDepartment && hodDepartment.id !== id) {
        throw new ConflictError('This HOD is already assigned to another department');
      }
    }

    if (input.isActive === false && department.isActive) {
      const courseCount = await departmentRepository.countCourses(id);
      if (courseCount > 0) {
        throw new BadRequestError('Cannot deactivate department while active courses exist');
      }
    }

    const updated = await departmentRepository.updateById(id, {
      ...input,
      updatedBy,
    });

    return updated;
  }

  public async getDepartment(id: string): Promise<DepartmentDocument | null> {
    return departmentRepository.findById(id);
  }

  public async getDepartmentByCode(code: string): Promise<DepartmentDocument | null> {
    return departmentRepository.findByCode(code.toUpperCase());
  }

  public async listDepartments(query: DepartmentQueryInput): Promise<{ items: DepartmentDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.status) filter.status = query.status;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.hodId) filter.hodId = query.hodId;
    if (query.building) filter.building = query.building;
    if (query.accreditation) filter.accreditation = query.accreditation;
    if (query.establishedYear) filter.establishedYear = query.establishedYear;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return departmentRepository.listDepartments(filter, query.page, query.limit, sortOption);
  }

  public async searchDepartments(searchQuery: string, page = 1, limit = 20): Promise<{ items: DepartmentDocument[]; total: number }> {
    return departmentRepository.searchDepartments(searchQuery, page, limit);
  }

  public async filterDepartments(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: DepartmentDocument[]; total: number }> {
    return departmentRepository.filterDepartments(filters, page, limit, sort);
  }

  public async assignHOD(departmentId: string, hodId: string): Promise<DepartmentDocument | null> {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    const hodDepartment = await departmentRepository.findByHodId(hodId);
    if (hodDepartment && hodDepartment.id !== departmentId) {
      throw new ConflictError('This HOD is already assigned to another department');
    }

    const updated = await departmentRepository.assignHOD(departmentId, hodId);
    if (!updated) {
      throw new NotFoundError('Department not found');
    }

    return updated;
  }

  public async removeHOD(departmentId: string): Promise<DepartmentDocument | null> {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return departmentRepository.removeHOD(departmentId);
  }

  public async deleteDepartment(id: string, deletedBy: string): Promise<void> {
    const department = await departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }

    const [studentCount, facultyCount, courseCount] = await Promise.all([
      departmentRepository.countStudents(id),
      departmentRepository.countFaculty(id),
      departmentRepository.countCourses(id),
    ]);

    if (studentCount > 0 || facultyCount > 0 || courseCount > 0) {
      throw new BadRequestError('Cannot delete department because it has associated students, faculty, or courses');
    }

    await departmentRepository.softDelete(id, deletedBy);
  }

  public async restoreDepartment(id: string): Promise<DepartmentDocument | null> {
    const existing = await departmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Department not found');
    }

    if (!existing.deletedAt) {
      throw new BadRequestError('Department is not deleted');
    }

    return departmentRepository.restore(id);
  }

  public async bulkCreateDepartments(departments: CreateDepartmentInput[], createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const departmentData of departments) {
      try {
        await this.createDepartment(departmentData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${departmentData.code || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkUpdateDepartments(ids: string[], updates: UpdateDepartmentInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateDepartment(id, updates, updatedBy);
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

  public async departmentStatistics(departmentId: string): Promise<{
    departmentId: string;
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
  } | null> {
    const department = await departmentRepository.findById(departmentId);
    if (!department) {
      return null;
    }

    const [totalStudents, totalFaculty, totalCourses] = await Promise.all([
      departmentRepository.countStudents(departmentId),
      departmentRepository.countFaculty(departmentId),
      departmentRepository.countCourses(departmentId),
    ]);

    return {
      departmentId: department._id.toString(),
      totalStudents,
      totalFaculty,
      totalCourses,
    };
  }
}

export const departmentService = new DepartmentService();
