import { BaseRepository } from '../../shared/repositories/base.repository';
import { DepartmentModel, type DepartmentDocument, type DepartmentSchemaType } from './department.model';

export class DepartmentRepository extends BaseRepository<DepartmentSchemaType> {
  constructor() {
    super(DepartmentModel);
  }

  public async findByCode(code: string): Promise<DepartmentDocument | null> {
    return this.model.findOne({ code: code.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByName(name: string): Promise<DepartmentDocument | null> {
    return this.model.findOne({ name: name.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async findByEmail(email: string): Promise<DepartmentDocument | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPhone(phone: string): Promise<DepartmentDocument | null> {
    return this.model.findOne({ phone, deletedAt: { $exists: false } }).exec();
  }

  public async findByHodId(hodId: string): Promise<DepartmentDocument | null> {
    return this.model.findOne({ hodId, deletedAt: { $exists: false } }).exec();
  }

  public async listDepartments(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: DepartmentDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchDepartments(searchQuery: string, page = 1, limit = 20): Promise<{ items: DepartmentDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterDepartments(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: DepartmentDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.status) query.status = filters.status;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.hodId) query.hodId = filters.hodId;
    if (filters.building) query.building = filters.building;
    if (filters.accreditation) query.accreditation = filters.accreditation;
    if (filters.establishedYear) query.establishedYear = filters.establishedYear;
    if (filters.tags && Array.isArray(filters.tags)) query.tags = { $in: filters.tags };

    if (filters.establishedYearFrom || filters.establishedYearTo) {
      query.establishedYear = {};
      if (filters.establishedYearFrom) (query.establishedYear as Record<string, unknown>).$gte = filters.establishedYearFrom;
      if (filters.establishedYearTo) (query.establishedYear as Record<string, unknown>).$lte = filters.establishedYearTo;
    }

    if (filters.minIntake || filters.maxIntake) {
      query.intakeCapacity = {};
      if (filters.minIntake) (query.intakeCapacity as Record<string, unknown>).$gte = filters.minIntake;
      if (filters.maxIntake) (query.intakeCapacity as Record<string, unknown>).$lte = filters.maxIntake;
    }

    return this.paginate(query, page, limit, sort);
  }

  public async getDepartmentStatistics(departmentId: string): Promise<DepartmentDocument | null> {
    return this.model.findOne({ _id: departmentId, deletedAt: { $exists: false } }).exec();
  }

  public async assignHOD(departmentId: string, hodId: string): Promise<DepartmentDocument | null> {
    return this.model.findByIdAndUpdate(departmentId, { $set: { hodId, updatedAt: new Date() } }, { new: true, runValidators: true }).exec();
  }

  public async removeHOD(departmentId: string): Promise<DepartmentDocument | null> {
    return this.model.findByIdAndUpdate(departmentId, { $set: { hodId: undefined, updatedAt: new Date() } }, { new: true, runValidators: true }).exec();
  }

  public async bulkCreate(departments: Partial<DepartmentSchemaType>[]): Promise<DepartmentDocument[]> {
    return this.model.insertMany(departments, { ordered: true }) as Promise<DepartmentDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<DepartmentSchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } }
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  public async softDelete(departmentId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: departmentId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(departmentId: string): Promise<DepartmentDocument | null> {
    const result = await this.model.updateOne({ _id: departmentId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(departmentId).exec();
    }
    return null;
  }

  public async existsByCode(code: string): Promise<boolean> {
    return this.exists({ code: code.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByName(name: string): Promise<boolean> {
    return this.exists({ name: name.trim(), deletedAt: { $exists: false } });
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase(), deletedAt: { $exists: false } });
  }

  public async existsByPhone(phone: string): Promise<boolean> {
    return this.exists({ phone, deletedAt: { $exists: false } });
  }

  public async countStudents(departmentId: string): Promise<number> {
    return this.count({ departmentId });
  }

  public async countFaculty(departmentId: string): Promise<number> {
    return this.count({ departmentId });
  }

  public async countCourses(departmentId: string): Promise<number> {
    return this.count({ departmentId });
  }

  public async isDepartmentInUse(departmentId: string): Promise<boolean> {
    const [studentCount, courseCount] = await Promise.all([
      this.countStudents(departmentId),
      this.countCourses(departmentId),
    ]);
    return studentCount > 0 || courseCount > 0;
  }
}

export const departmentRepository = new DepartmentRepository();
