import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { CourseService, courseService } from './course.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  updateCurriculumSchema,
  updateSemesterSchema,
  type CourseQueryInput,
  type CreateCourseInput,
  type UpdateCourseInput,
  type BulkImportInput,
  type BulkUpdateInput,
  type UpdateCurriculumInput,
  type UpdateSemesterInput,
} from './course.validator';

export class CourseController {
  constructor(private readonly service: CourseService) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createCourseSchema.parse(req.body) as CreateCourseInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.createCourse(input, user.id);
    sendSuccess(res, {
      message: 'Course created successfully',
      data: course,
      statusCode: HttpStatus.CREATED,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateCourseSchema.parse(req.body) as UpdateCourseInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.updateCourse(id, input, user.id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course updated successfully', data: course });
  });

  public findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await this.service.getCourse(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course fetched successfully', data: course });
  });

  public findByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const course = await this.service.getCourseByCode(code);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course fetched successfully', data: course });
  });

  public findByCourseId = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = await this.service.getCourseByCourseId(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course fetched successfully', data: course });
  });

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = courseQuerySchema.parse(req.query) as CourseQueryInput;
    const { items, total } = await this.service.listCourses(query);
    sendSuccess(res, {
      message: 'Courses fetched successfully',
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
    const query = courseQuerySchema.parse(req.query) as CourseQueryInput;
    const { items, total } = await this.service.searchCourses(query.search || '', query.page, query.limit);
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
    const query = courseQuerySchema.parse(req.query) as CourseQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.departmentId) filters.departmentId = query.departmentId;
    if (query.programType) filters.programType = query.programType;
    if (query.degree) filters.degree = query.degree;
    if (query.status) filters.status = query.status;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.coordinatorId) filters.coordinatorId = query.coordinatorId;
    if (query.intakeCapacityFrom) filters.intakeCapacityFrom = query.intakeCapacityFrom;
    if (query.intakeCapacityTo) filters.intakeCapacityTo = query.intakeCapacityTo;
    if (query.durationYears) filters.durationYears = query.durationYears;
    const { items, total } = await this.service.filterCourses(filters, query.page, query.limit);
    sendSuccess(res, {
      message: 'Filtered courses fetched successfully',
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

  public assignPrimaryCoordinator = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { primaryCoordinatorId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.assignPrimaryCoordinator(id, primaryCoordinatorId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Primary coordinator assigned successfully', data: course });
  });

  public addCoCoordinator = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { coordinatorId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.addCoCoordinator(id, coordinatorId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Co-coordinator added successfully', data: course });
  });

  public removeCoCoordinator = asyncHandler(async (req: Request, res: Response) => {
    const { id, facultyId } = req.params;
    const { coordinatorId } = req.body;
    const targetId = facultyId || coordinatorId;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.removeCoCoordinator(id, targetId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Co-coordinator removed successfully', data: course });
  });

  public archiveCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.archiveCourse(id, user.id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course archived successfully', data: course });
  });

  public restoreArchivedCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.restoreArchivedCourse(id, user.id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course restored from archive successfully', data: course });
  });

  public deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteCourse(id, user.id);
    sendSuccess(res, { message: 'Course deleted successfully' });
  });

  public restoreCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await this.service.restoreCourse(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course restored successfully', data: course });
  });

  public updateCurriculum = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateCurriculumSchema.parse(req.body) as UpdateCurriculumInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.updateCurriculum(id, input, user.id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Curriculum updated successfully', data: course });
  });

  public updateSemesterStructure = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateSemesterSchema.parse(req.body) as UpdateSemesterInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const course = await this.service.updateSemesterStructure(id, input, user.id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Semester structure updated successfully', data: course });
  });

  public getCurriculumHistory = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const history = await this.service.getCurriculumHistory(courseId);
    sendSuccess(res, { message: 'Curriculum history fetched successfully', data: history });
  });

  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportSchema.parse(req.body) as BulkImportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateCourses(input.courses, user.id);
    sendSuccess(res, {
      message: `Import completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkUpdateSchema.parse(req.body) as BulkUpdateInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkUpdateCourses(input.ids, input.updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public statistics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stats = await this.service.courseStatistics(id);
    if (!stats) {
      throw new NotFoundError('Course not found');
    }
    sendSuccess(res, { message: 'Course statistics fetched successfully', data: stats });
  });
}

export const courseController = new CourseController(courseService);
