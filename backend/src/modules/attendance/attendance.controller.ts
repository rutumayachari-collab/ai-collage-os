import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { AttendanceService, attendanceService } from './attendance.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createAttendanceRecordSchema,
  updateAttendanceRecordSchema,
  attendanceQuerySchema,
  bulkMarkAttendanceSchema,
  attendanceStatisticsQuerySchema,
  type CreateAttendanceRecordInput,
  type UpdateAttendanceRecordInput,
  type AttendanceQueryInput,
  type BulkMarkAttendanceInput,
  type AttendanceStatisticsQueryInput,
} from './attendance.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/attendance for future breaking changes.
// TODO: OpenAPI/Swagger - document all attendance endpoints.
// TODO: Webhook/event - publish domain events for attendance lifecycle changes.
// TODO: Notification hooks - integrate notification service for attendance alerts and reminders.
// TODO: AI hooks - integrate AI service for attendance prediction and anomaly detection.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createAttendanceRecordSchema.parse(req.body) as CreateAttendanceRecordInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const record = await this.service.createAttendanceRecord(input, user.id);
    sendSuccess(res, {
      message: 'Attendance record created successfully',
      data: record,
      statusCode: HttpStatus.CREATED,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateAttendanceRecordSchema.parse(req.body) as UpdateAttendanceRecordInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const record = await this.service.updateAttendanceRecord(id, input, user.id);
    if (!record) {
      throw new NotFoundError('Attendance record not found');
    }
    sendSuccess(res, { message: 'Attendance record updated successfully', data: record });
  });

  public getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const record = await this.service.getAttendanceRecord(id);
    if (!record) {
      throw new NotFoundError('Attendance record not found');
    }
    sendSuccess(res, { message: 'Attendance record fetched successfully', data: record });
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteAttendanceRecord(id, user.id);
    sendSuccess(res, { message: 'Attendance record deleted successfully' });
  });

  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const record = await this.service.restoreAttendanceRecord(id);
    if (!record) {
      throw new NotFoundError('Attendance record not found');
    }
    sendSuccess(res, { message: 'Attendance record restored successfully', data: record });
  });

  // ─── SEARCH & FILTER ─────────────────────────────────────────────────────

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = attendanceQuerySchema.parse(req.query) as AttendanceQueryInput;
    const { items, total } = await this.service.listAttendanceRecords(query);
    sendSuccess(res, {
      message: 'Attendance records fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public search = asyncHandler(async (req: Request, res: Response) => {
    const query = attendanceQuerySchema.parse(req.query) as AttendanceQueryInput;
    const { items, total } = await this.service.searchAttendanceRecords(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public filter = asyncHandler(async (req: Request, res: Response) => {
    const query = attendanceQuerySchema.parse(req.query) as AttendanceQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.studentId) filters.studentId = query.studentId;
    if (query.subjectId) filters.subjectId = query.subjectId;
    if (query.facultyId) filters.facultyId = query.facultyId;
    if (query.status) filters.status = query.status;
    if (query.dateFrom || query.dateTo) {
      filters.date = {};
      if (query.dateFrom) (filters.date as Record<string, Date>).$gte = new Date(query.dateFrom);
      if (query.dateTo) (filters.date as Record<string, Date>).$lte = new Date(query.dateTo);
    }
    if (query.isActive !== undefined) filters.isActive = query.isActive;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.date = -1;
    }

    const { items, total } = await this.service.filterAttendanceRecords(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered attendance records fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────

  public bulkMark = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkMarkAttendanceSchema.parse(req.body) as BulkMarkAttendanceInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkMarkAttendance(input, user.id);
    sendSuccess(res, {
      message: `Bulk mark completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  // ─── STUDENT SELF-SERVICE ────────────────────────────────────────────────

  public getMyAttendance = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const { items, total } = await this.service.getStudentAttendanceRecords(user.id, 1, 100);
    sendSuccess(res, {
      message: 'My attendance records fetched successfully',
      data: items,
      meta: {
        page: 1,
        limit: 100,
        total,
        totalPages: Math.ceil(total / 100),
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  public getMyAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const { subjectId } = req.params;
    const summary = await this.service.getStudentAttendanceSummary(user.id, subjectId);
    sendSuccess(res, { message: 'Attendance summary fetched successfully', data: summary });
  });

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  public getOverallStatistics = asyncHandler(async (req: Request, res: Response) => {
    const query = attendanceStatisticsQuerySchema.parse(req.query) as AttendanceStatisticsQueryInput;
    const stats = await this.service.getStatisticsByQuery(query);
    sendSuccess(res, { message: 'Statistics fetched successfully', data: stats });
  });

  public getSubjectWiseStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const stats = await this.service.getSubjectWiseStatistics(subjectId);
    sendSuccess(res, { message: 'Subject statistics fetched successfully', data: stats });
  });

  public getStudentWiseStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const stats = await this.service.getStudentWiseStatistics(studentId);
    sendSuccess(res, { message: 'Student statistics fetched successfully', data: stats });
  });

  public getMonthlySummary = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const { studentId, subjectId, month, year } = req.params;
    const summary = await this.service.getMonthlyAttendanceSummary(
      user.role === 'STUDENT' ? user.id : studentId,
      subjectId,
      parseInt(month, 10),
      parseInt(year, 10)
    );
    sendSuccess(res, { message: 'Monthly summary fetched successfully', data: summary });
  });

  public getStudentAttendancePercentage = asyncHandler(async (req: Request, res: Response) => {
    const { studentId, subjectId } = req.params;
    const result = await this.service.calculateStudentAttendancePercentage(studentId, subjectId);
    sendSuccess(res, { message: 'Attendance percentage fetched successfully', data: result });
  });
}

export const attendanceController = new AttendanceController(attendanceService);
