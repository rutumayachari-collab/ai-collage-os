import { BaseRepository } from '../../shared/repositories/base.repository';
import { AttendanceModel, type AttendanceDocument, type AttendanceSchemaType } from './attendance.model';

export class AttendanceRepository extends BaseRepository<AttendanceSchemaType> {
  constructor() {
    super(AttendanceModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findByStudentId(studentId: string): Promise<AttendanceDocument[]> {
    return this.model.find({ studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findBySubjectId(subjectId: string): Promise<AttendanceDocument[]> {
    return this.model.find({ subjectId, deletedAt: { $exists: false } }).exec();
  }

  public async findByFacultyId(facultyId: string): Promise<AttendanceDocument[]> {
    return this.model.find({ facultyId, deletedAt: { $exists: false } }).exec();
  }

  public async findByStudentAndSubject(studentId: string, subjectId: string): Promise<AttendanceDocument[]> {
    return this.model.find({ studentId, subjectId, deletedAt: { $exists: false } }).exec();
  }

  public async findByStudentSubjectAndDateRange(studentId: string, subjectId: string, dateFrom: Date, dateTo: Date): Promise<AttendanceDocument[]> {
    return this.model.find({
      studentId,
      subjectId,
      date: { $gte: dateFrom, $lte: dateTo },
      deletedAt: { $exists: false },
    }).exec();
  }

  public async findByDateRange(dateFrom: Date, dateTo: Date): Promise<AttendanceDocument[]> {
    return this.model.find({ date: { $gte: dateFrom, $lte: dateTo }, deletedAt: { $exists: false } }).exec();
  }

  public async findBySession(subjectId: string, date: Date, sessionType?: string, periodNumber?: number): Promise<AttendanceDocument[]> {
    const query: Record<string, unknown> = { subjectId, date, deletedAt: { $exists: false } };
    if (sessionType) query.sessionType = sessionType;
    if (periodNumber) query.periodNumber = periodNumber;
    return this.model.find(query).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listAttendanceRecords(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { date: -1 }): Promise<{ items: AttendanceDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchAttendanceRecords(searchQuery: string, page = 1, limit = 20): Promise<{ items: AttendanceDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterAttendanceRecords(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { date: -1 }): Promise<{ items: AttendanceDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.facultyId) query.facultyId = filters.facultyId;
    if (filters.status) query.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      query.date = {};
      if (filters.dateFrom) (query.date as Record<string, Date>).$gte = filters.dateFrom as Date;
      if (filters.dateTo) (query.date as Record<string, Date>).$lte = filters.dateTo as Date;
    }
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.sessionType) query.sessionType = filters.sessionType;

    return this.paginate(query, page, limit, sort);
  }

  // ─── Statistics ────────────────────────────────────────────────────────────

  public async calculateAttendancePercentage(studentId: string, subjectId: string): Promise<{
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
  }> {
    const records = await this.findByStudentAndSubject(studentId, subjectId);
    const totalClasses = records.length;
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
    const attendancePercentage = totalClasses > 0 ? Math.round(((presentCount + lateCount) / totalClasses) * 10000) / 100 : 0;

    return { totalClasses, presentCount, absentCount, lateCount, excusedCount, attendancePercentage };
  }

  public async getMonthlyAttendanceSummary(studentId: string, subjectId: string, month: number, year: number): Promise<{
    month: number;
    year: number;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
  }> {
    const dateFrom = new Date(year, month - 1, 1);
    const dateTo = new Date(year, month, 0, 23, 59, 59);
    const records = await this.findByStudentSubjectAndDateRange(studentId, subjectId, dateFrom, dateTo);
    const totalClasses = records.length;
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
    const attendancePercentage = totalClasses > 0 ? Math.round(((presentCount + lateCount) / totalClasses) * 10000) / 100 : 0;

    return { month, year, totalClasses, presentCount, absentCount, lateCount, excusedCount, attendancePercentage };
  }

  public async getOverallStatistics(filters: Record<string, unknown> = {}): Promise<{
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    overallPercentage: number;
  }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.facultyId) query.facultyId = filters.facultyId;

    const [records, present, absent, late, excused] = await Promise.all([
      this.model.countDocuments(query).exec(),
      this.model.countDocuments({ ...query, status: 'PRESENT' }).exec(),
      this.model.countDocuments({ ...query, status: 'ABSENT' }).exec(),
      this.model.countDocuments({ ...query, status: 'LATE' }).exec(),
      this.model.countDocuments({ ...query, status: 'EXCUSED' }).exec(),
    ]);

    const overallPercentage = records > 0 ? Math.round(((present + late) / records) * 10000) / 100 : 0;

    return { totalRecords: records, presentCount: present, absentCount: absent, lateCount: late, excusedCount: excused, overallPercentage };
  }

  public async getSubjectWiseStatistics(subjectId: string): Promise<{
    subjectId: string;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    percentage: number;
  }> {
    const records = await this.findBySubjectId(subjectId);
    const totalClasses = records.length;
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
    const percentage = totalClasses > 0 ? Math.round(((presentCount + lateCount) / totalClasses) * 10000) / 100 : 0;

    return { subjectId, totalClasses, presentCount, absentCount, lateCount, excusedCount, percentage };
  }

  public async getStudentWiseStatistics(studentId: string): Promise<{
    studentId: string;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    percentage: number;
  }> {
    const records = await this.findByStudentId(studentId);
    const totalClasses = records.length;
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
    const percentage = totalClasses > 0 ? Math.round(((presentCount + lateCount) / totalClasses) * 10000) / 100 : 0;

    return { studentId, totalClasses, presentCount, absentCount, lateCount, excusedCount, percentage };
  }

  // ─── Soft Delete / Restore ────────────────────────────────────────────────

  public async softDelete(id: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(id: string): Promise<AttendanceDocument | null> {
    const result = await this.model.updateOne({ _id: id }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(id).exec();
    }
    return null;
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(records: Partial<AttendanceSchemaType>[]): Promise<AttendanceDocument[]> {
    return this.model.insertMany(records, { ordered: true }) as Promise<AttendanceDocument[]>;
  }

  public async deleteBySession(subjectId: string, date: Date, sessionType?: string, periodNumber?: number): Promise<void> {
    const query: Record<string, unknown> = { subjectId, date, deletedAt: { $exists: false } };
    if (sessionType) query.sessionType = sessionType;
    if (periodNumber) query.periodNumber = periodNumber;
    await this.model.deleteMany(query).exec();
  }

  public async findOne(filter: Record<string, unknown>): Promise<AttendanceDocument | null> {
    return this.model.findOne(filter).exec();
  }
}

export const attendanceRepository = new AttendanceRepository();
