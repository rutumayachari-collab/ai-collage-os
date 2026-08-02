import { BaseRepository } from '../../shared/repositories/base.repository';
import { StudentModel, type StudentDocument, type StudentSchemaType } from './student.model';

export class StudentRepository extends BaseRepository<StudentSchemaType> {
  constructor() {
    super(StudentModel);
  }

  public async findByUserId(userId: string): Promise<StudentDocument | null> {
    return this.model.findOne({ userId, deletedAt: { $exists: false } }).exec();
  }

  public async findByStudentId(studentId: string): Promise<StudentDocument | null> {
    return this.model.findOne({ studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByAdmissionNumber(admissionNumber: string): Promise<StudentDocument | null> {
    return this.model.findOne({ admissionNumber, deletedAt: { $exists: false } }).exec();
  }

  public async findByEmail(email: string): Promise<StudentDocument | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPhone(phone: string): Promise<StudentDocument | null> {
    return this.model.findOne({ phone, deletedAt: { $exists: false } }).exec();
  }

  public async findByRollNumber(rollNumber: string, departmentId: string, batch: string, semester: number, section?: string): Promise<StudentDocument | null> {
    const query: Record<string, unknown> = { rollNumber, departmentId, batch, semester, deletedAt: { $exists: false } };
    if (section) {
      query.section = section;
    }
    return this.model.findOne(query).exec();
  }

  public async findManyByDepartment(departmentId: string, batch?: string, semester?: number): Promise<StudentDocument[]> {
    const query: Record<string, unknown> = { departmentId, deletedAt: { $exists: false } };
    if (batch) query.batch = batch;
    if (semester) query.semester = semester;
    return this.model.find(query).exec();
  }

  public async softDelete(studentId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: studentId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(studentId: string): Promise<StudentDocument | null> {
    const result = await this.model.updateOne({ _id: studentId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(studentId).exec();
    }
    return null;
  }

  public async updateProfileCompletion(studentId: string, percentage: number): Promise<void> {
    await this.model.updateOne({ _id: studentId }, { $set: { profileCompletion: percentage } }).exec();
  }
}

export const studentRepository = new StudentRepository();
