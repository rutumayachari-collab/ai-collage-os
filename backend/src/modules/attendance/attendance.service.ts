import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { attendanceRepository } from './attendance.repository';
import type { AttendanceDocument, AttendanceSchemaType } from './attendance.model';
import type {
  CreateAttendanceRecordInput,
  UpdateAttendanceRecordInput,
  AttendanceQueryInput,
  BulkMarkAttendanceInput,
  AttendanceStatisticsQueryInput,
} from './attendance.validator';

export class AttendanceService {
  // ─── CRUD ────────────────────────────────────────────────────────────────

  public async createAttendanceRecord(input: CreateAttendanceRecordInput, createdBy: string): Promise<AttendanceDocument> {
    const parsedDate = new Date(input.date);
    const cleanedInput = this.cleanEmptyStrings(input);

    const existing = await attendanceRepository.findOne({
      studentId: cleanedInput.studentId as string,
      subjectId: cleanedInput.subjectId as string,
      date: parsedDate,
      periodNumber: cleanedInput.periodNumber as number | undefined,
      deletedAt: { $exists: false },
    });

    if (existing) {
      throw new ConflictError('An attendance record already exists for this student, subject, date, and period');
    }

    const compensationDate = cleanedInput.compensationDate ? new Date(cleanedInput.compensationDate as string | number | Date) : undefined;

    return attendanceRepository.create({
      ...cleanedInput,
      date: parsedDate,
      compensationDate,
      createdBy,
      updatedBy: createdBy,
    } as Partial<AttendanceSchemaType>);
  }

  public async updateAttendanceRecord(id: string, input: UpdateAttendanceRecordInput, updatedBy: string): Promise<AttendanceDocument | null> {
    const record = await attendanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError('Attendance record not found');
    }

    if (record.deletedAt) {
      throw new BadRequestError('Cannot update a deleted attendance record');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await attendanceRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    } as Partial<AttendanceSchemaType>);

    return updated;
  }

  public async getAttendanceRecord(id: string): Promise<AttendanceDocument | null> {
    return attendanceRepository.findById(id);
  }

  public async deleteAttendanceRecord(id: string, deletedBy: string): Promise<void> {
    const record = await attendanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError('Attendance record not found');
    }

    if (record.deletedAt) {
      throw new BadRequestError('Attendance record is already deleted');
    }

    await attendanceRepository.softDelete(id, deletedBy);
  }

  public async restoreAttendanceRecord(id: string): Promise<AttendanceDocument | null> {
    const record = await attendanceRepository.findById(id);
    if (!record) {
      throw new NotFoundError('Attendance record not found');
    }

    if (!record.deletedAt) {
      throw new BadRequestError('Attendance record is not deleted');
    }

    return attendanceRepository.restore(id);
  }

  // ─── Search & Filter ─────────────────────────────────────────────────────

  public async listAttendanceRecords(query: AttendanceQueryInput): Promise<{ items: AttendanceDocument[]; total: number }> {
    const filters: Record<string, unknown> = {};

    if (query.studentId) filters.studentId = query.studentId;
    if (query.subjectId) filters.subjectId = query.subjectId;
    if (query.facultyId) filters.facultyId = query.facultyId;
    if (query.status) filters.status = query.status;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.dateFrom || query.dateTo) {
      filters.date = {};
      if (query.dateFrom) (filters.date as Record<string, Date>).$gte = new Date(query.dateFrom);
      if (query.dateTo) (filters.date as Record<string, Date>).$lte = new Date(query.dateTo);
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.date = -1;
    }

    return attendanceRepository.listAttendanceRecords(filters, query.page, query.limit, sortOption);
  }

  public async searchAttendanceRecords(searchQuery: string, page = 1, limit = 20): Promise<{ items: AttendanceDocument[]; total: number }> {
    return attendanceRepository.searchAttendanceRecords(searchQuery, page, limit);
  }

  public async filterAttendanceRecords(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { date: -1 }): Promise<{ items: AttendanceDocument[]; total: number }> {
    return attendanceRepository.filterAttendanceRecords(filters, page, limit, sort);
  }

  // ─── Business Logic ──────────────────────────────────────────────────────

  public async bulkMarkAttendance(input: BulkMarkAttendanceInput, markedBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    const parsedDate = new Date(input.date);
    const errors: string[] = [];
    let created = 0;
    let failed = 0;

    await attendanceRepository.deleteBySession(input.subjectId, parsedDate, input.sessionType, input.periodNumber);

    const records: Partial<AttendanceSchemaType>[] = [];
    for (const record of input.records) {
      try {
        records.push({
          studentId: record.studentId,
          subjectId: input.subjectId,
          facultyId: input.facultyId,
          date: parsedDate,
          status: record.status,
          remarks: record.remarks || '',
          sessionType: input.sessionType || '',
          periodNumber: input.periodNumber,
          topicCovered: input.topicCovered || '',
          isCompensated: false,
          createdBy: markedBy,
          updatedBy: markedBy,
        });
        created++;
      } catch {
        failed++;
        errors.push(`Failed to prepare record for student ${record.studentId}`);
      }
    }

    if (records.length > 0) {
      await attendanceRepository.bulkCreate(records);
    }

    return { created, failed, errors };
  }

  public async calculateStudentAttendancePercentage(studentId: string, subjectId: string): Promise<{
    studentId: string;
    subjectId: string;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
  }> {
    const result = await attendanceRepository.calculateAttendancePercentage(studentId, subjectId);
    return { studentId, subjectId, ...result };
  }

  public async getStudentAttendanceSummary(studentId: string, subjectId: string): Promise<{
    studentId: string;
    subjectId: string;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
    lastUpdatedAt: Date;
  }> {
    const result = await attendanceRepository.calculateAttendancePercentage(studentId, subjectId);
    return { studentId, subjectId, ...result, lastUpdatedAt: new Date() };
  }

  public async getMonthlyAttendanceSummary(studentId: string, subjectId: string, month: number, year: number): Promise<{
    studentId: string;
    subjectId: string;
    month: number;
    year: number;
    totalClasses: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
  }> {
    const result = await attendanceRepository.getMonthlyAttendanceSummary(studentId, subjectId, month, year);
    return { studentId, subjectId, ...result };
  }

  public async getStudentAttendanceRecords(studentId: string, page = 1, limit = 20): Promise<{ items: AttendanceDocument[]; total: number }> {
    const filters = { studentId };
    const sort = { date: -1 as const };
    return attendanceRepository.listAttendanceRecords(filters, page, limit, sort);
  }

  // ─── Statistics ──────────────────────────────────────────────────────────

  public async getOverallStatistics(filters: Record<string, unknown> = {}): Promise<{
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    overallPercentage: number;
  }> {
    return attendanceRepository.getOverallStatistics(filters);
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
    return attendanceRepository.getSubjectWiseStatistics(subjectId);
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
    return attendanceRepository.getStudentWiseStatistics(studentId);
  }

  public async getStatisticsByQuery(query: AttendanceStatisticsQueryInput): Promise<{
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    overallPercentage: number;
  }> {
    const filters: Record<string, unknown> = {};
    if (query.studentId) filters.studentId = query.studentId;
    if (query.subjectId) filters.subjectId = query.subjectId;

    if (query.month && query.year) {
      const dateFrom = new Date(query.year, query.month - 1, 1);
      const dateTo = new Date(query.year, query.month, 0, 23, 59, 59);
      filters.date = { $gte: dateFrom, $lte: dateTo } as Record<string, Date>;
    }

    return attendanceRepository.getOverallStatistics(filters);
  }

  // ─── Utilities ───────────────────────────────────────────────────────────

  private cleanEmptyStrings(input: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      if (input[key] === '') {
        cleaned[key] = undefined;
      } else {
        cleaned[key] = input[key];
      }
    }
    return cleaned;
  }
}

export const attendanceService = new AttendanceService();
