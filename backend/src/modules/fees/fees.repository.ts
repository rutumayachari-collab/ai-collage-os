import { BaseRepository } from '../../shared/repositories/base.repository';
import type { FeeStructureSchemaType, StudentFeeAccountSchemaType, FeeInvoiceSchemaType } from './fees.model';
import { FeeStructureModel, StudentFeeAccountModel, FeeInvoiceModel } from './fees.model';

export class FeeStructureRepository extends BaseRepository<FeeStructureSchemaType> {
  constructor() {
    super(FeeStructureModel);
  }

  async findByCourse(courseId: string, academicYear?: string, semester?: number) {
    const query: Record<string, unknown> = { courseId, deletedAt: { $exists: false } };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    return this.model.find(query).lean();
  }

  async findByDepartment(departmentId: string, academicYear?: string) {
    const query: Record<string, unknown> = { departmentId, deletedAt: { $exists: false } };
    if (academicYear) query.academicYear = academicYear;
    return this.model.find(query).lean();
  }

  async softDelete(id: string, deletedBy: string) {
    const result = await this.model.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }
}

export class StudentFeeAccountRepository extends BaseRepository<StudentFeeAccountSchemaType> {
  constructor() {
    super(StudentFeeAccountModel);
  }

  async findByStudent(studentId: string) {
    return this.model.find({ studentId, deletedAt: { $exists: false } }).lean();
  }

  async findByCourse(courseId: string, academicYear?: string, semester?: number) {
    const query: Record<string, unknown> = { courseId };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;
    return this.model.find(query).lean();
  }
}

export class FeeInvoiceRepository extends BaseRepository<FeeInvoiceSchemaType> {
  constructor() {
    super(FeeInvoiceModel);
  }

  async findByStudent(studentId: string) {
    return this.model.find({ studentId, deletedAt: { $exists: false } }).sort({ generatedAt: -1 }).lean();
  }
}
