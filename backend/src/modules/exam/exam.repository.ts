import { BaseRepository } from '../../shared/repositories/base.repository';
import { ExamModel, type ExamDocument, type ExamSchemaType } from './exam.model';

export class ExamRepository extends BaseRepository<ExamSchemaType> {
  constructor() {
    super(ExamModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findByExamId(examId: string): Promise<ExamDocument | null> {
    return this.model.findOne({ examId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCode(code: string): Promise<ExamDocument | null> {
    return this.model.findOne({ code: code.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByCourse(courseId: string): Promise<ExamDocument[]> {
    return this.model.find({ courseId, deletedAt: { $exists: false } }).exec();
  }

  public async findBySubject(subjectId: string): Promise<ExamDocument[]> {
    return this.model.find({ subjectId, deletedAt: { $exists: false } }).exec();
  }

  public async findBySemester(courseId: string, semester: number): Promise<ExamDocument[]> {
    return this.model.find({ courseId, semester, deletedAt: { $exists: false } }).exec();
  }

  public async findByStudent(studentId: string): Promise<ExamDocument[]> {
    return this.model.find({
      'registrations.studentId': studentId,
      deletedAt: { $exists: false },
    }).exec();
  }

  public async findByInvigilator(invigilatorId: string): Promise<ExamDocument[]> {
    return this.model.find({
      'schedule.invigilatorId': invigilatorId,
      deletedAt: { $exists: false },
    }).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listExams(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: ExamDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchExams(searchQuery: string, page = 1, limit = 20): Promise<{ items: ExamDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterExams(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: ExamDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.courseId) query.courseId = filters.courseId;
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.semester) query.semester = filters.semester;
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.examType) query.examType = filters.examType;
    if (filters.status) query.status = filters.status;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.studentId) query['registrations.studentId'] = filters.studentId;
    if (filters.invigilatorId) query['schedule.invigilatorId'] = filters.invigilatorId;

    return this.paginate(query, page, limit, sort);
  }

  // ─── Schedule Management ───────────────────────────────────────────────────

  public async addSchedule(examId: string, schedule: ExamSchemaType['schedule'][0]): Promise<ExamDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      examId,
      { $push: { schedule: schedule }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateSchedule(examId: string, scheduleId: string, updates: Partial<ExamSchemaType['schedule'][0]>): Promise<ExamDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: examId, 'schedule.id': scheduleId },
      { $set: { 'schedule.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeSchedule(examId: string, scheduleId: string): Promise<ExamDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      examId,
      { $pull: { schedule: { id: scheduleId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Registration Management ───────────────────────────────────────────────

  public async addRegistration(examId: string, registration: ExamSchemaType['registrations'][0]): Promise<ExamDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      examId,
      { $push: { registrations: registration }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateRegistration(examId: string, registrationId: string, updates: Partial<ExamSchemaType['registrations'][0]>): Promise<ExamDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: examId, 'registrations.id': registrationId },
      { $set: { 'registrations.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeRegistration(examId: string, registrationId: string): Promise<ExamDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      examId,
      { $pull: { registrations: { id: registrationId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async findRegistration(examId: string, studentId: string): Promise<ExamDocument | null> {
    return this.model.findOne({
      _id: examId,
      'registrations.studentId': studentId,
      deletedAt: { $exists: false },
    }).exec();
  }

  // ─── Result Management ────────────────────────────────────────────────────

  public async addResult(examId: string, result: ExamSchemaType['results'][0]): Promise<ExamDocument | null> {
    const resultDoc = await this.model.findOneAndUpdate(
      { _id: examId, 'results.studentId': result.studentId },
      {
        $set: {
          'results.$': result,
          status: 'RESULTS_PUBLISHED',
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    ).exec();

    if (!resultDoc) {
      const updated = await this.model.findByIdAndUpdate(
        examId,
        { $push: { results: result }, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).exec();
      return updated;
    }

    return resultDoc;
  }

  public async updateResult(examId: string, resultId: string, updates: Partial<ExamSchemaType['results'][0]>): Promise<ExamDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: examId, 'results.id': resultId },
      { $set: { 'results.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async findResult(examId: string, studentId: string): Promise<ExamDocument | null> {
    return this.model.findOne({
      _id: examId,
      'results.studentId': studentId,
      deletedAt: { $exists: false },
    }).exec();
  }

  // ─── Statistics ────────────────────────────────────────────────────────────

  public async getExamStatistics(examId: string): Promise<ExamDocument | null> {
    return this.model.findOne({ _id: examId, deletedAt: { $exists: false } }).exec();
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  public async softDelete(examId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: examId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(examId: string): Promise<ExamDocument | null> {
    const result = await this.model.updateOne({ _id: examId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(examId).exec();
    }
    return null;
  }

  // ─── Existence ─────────────────────────────────────────────────────────────

  public async existsByExamId(examId: string): Promise<boolean> {
    return this.exists({ examId, deletedAt: { $exists: false } });
  }

  public async existsByCode(code: string): Promise<boolean> {
    return this.exists({ code: code.toUpperCase(), deletedAt: { $exists: false } });
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(exams: Partial<ExamSchemaType>[]): Promise<ExamDocument[]> {
    return this.model.insertMany(exams, { ordered: true }) as Promise<ExamDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<ExamSchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }
}

export const examRepository = new ExamRepository();
