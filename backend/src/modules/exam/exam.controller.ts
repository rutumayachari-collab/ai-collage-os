import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { ExamService, examService } from './exam.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createExamSchema,
  updateExamSchema,
  examQuerySchema,
  publishResultSchema,
  bulkPublishResultSchema,
  type CreateExamInput,
  type UpdateExamInput,
  type ExamQueryInput,
  type PublishResultInput,
  type BulkPublishResultInput,
} from './exam.validator';

export class ExamController {
  constructor(private readonly service: ExamService) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createExamSchema.parse(req.body) as CreateExamInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const exam = await this.service.createExam(input, user.id);
    sendSuccess(res, {
      message: 'Exam created successfully',
      data: exam,
      statusCode: HttpStatus.CREATED,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateExamSchema.parse(req.body) as UpdateExamInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const exam = await this.service.updateExam(id, input, user.id);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Exam updated successfully', data: exam });
  });

  public findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const exam = await this.service.getExam(id);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Exam fetched successfully', data: exam });
  });

  public findByExamId = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;
    const exam = await this.service.getExamByExamId(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Exam fetched successfully', data: exam });
  });

  public findByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const exam = await this.service.getExamByCode(code);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Exam fetched successfully', data: exam });
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteExam(id, user.id);
    sendSuccess(res, { message: 'Exam deleted successfully' });
  });

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = examQuerySchema.parse(req.query) as ExamQueryInput;
    const { items, total } = await this.service.listExams(query);
    sendSuccess(res, {
      message: 'Exams fetched successfully',
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
    const query = examQuerySchema.parse(req.query) as ExamQueryInput;
    const { items, total } = await this.service.searchExams(query.search || '', query.page, query.limit);
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
    const query = examQuerySchema.parse(req.query) as ExamQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.courseId) filters.courseId = query.courseId;
    if (query.subjectId) filters.subjectId = query.subjectId;
    if (query.semester) filters.semester = query.semester;
    if (query.academicYear) filters.academicYear = query.academicYear;
    if (query.examType) filters.examType = query.examType;
    if (query.status) filters.status = query.status;
    if (query.isActive !== undefined) filters.isActive = query.isActive;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    const { items, total } = await this.service.filterExams(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered exams fetched successfully',
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

  public register = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const exam = await this.service.registerForExam(examId, user.id);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Registered for exam successfully', data: exam });
  });

  public publishResult = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;
    const input = publishResultSchema.parse(req.body) as PublishResultInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const exam = await this.service.publishResult(examId, user.id, input.marksObtained, input.grade, input.remarks || '');
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Result published successfully', data: exam });
  });

  public bulkPublishResults = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;
    const input = bulkPublishResultSchema.parse(req.body) as BulkPublishResultInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkPublishResults(examId, input);
    sendSuccess(res, {
      message: `Bulk publish completed. Published: ${result.published}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public getStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { examId } = req.params;
    const stats = await this.service.getExamStatistics(examId);
    if (!stats) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Exam statistics fetched successfully', data: stats });
  });

  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const exam = await this.service.restoreExam(id);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }
    sendSuccess(res, { message: 'Exam restored successfully', data: exam });
  });

  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as { exams: CreateExamInput[] };
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateExams(input.exams, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
    const { ids, updates } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkUpdateExams(ids, updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });
}

export const examController = new ExamController(examService);
