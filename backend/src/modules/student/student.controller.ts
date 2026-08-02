import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { StudentService, studentService } from './student.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createStudentSchema,
  updateStudentSchema,
  studentQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  linkParentSchema,
  type StudentQueryInput,
  type CreateStudentInput,
  type UpdateStudentInput,
  type BulkImportInput,
  type BulkUpdateInput,
  type LinkParentInput,
} from './student.validator';

export class StudentController {
  constructor(private readonly service: StudentService) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createStudentSchema.parse(req.body) as CreateStudentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const student = await this.service.create({ ...input, createdBy: user.id });
    sendSuccess(res, {
      message: 'Student created successfully',
      data: student,
      statusCode: HttpStatus.CREATED,
    });
  });

  public findMany = asyncHandler(async (req: Request, res: Response) => {
    const query = studentQuerySchema.parse(req.query) as StudentQueryInput;
    const { items, total } = await this.service.findMany(query);
    sendSuccess(res, {
      message: 'Students fetched successfully',
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

  public findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const student = await this.service.findById(id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    sendSuccess(res, { message: 'Student fetched successfully', data: student });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateStudentSchema.parse(req.body) as UpdateStudentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const student = await this.service.update(id, input, user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    sendSuccess(res, { message: 'Student updated successfully', data: student });
  });

  public softDelete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.softDelete(id, user.id);
    sendSuccess(res, { message: 'Student deleted successfully' });
  });

  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const student = await this.service.restore(id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    sendSuccess(res, { message: 'Student restored successfully', data: student });
  });

  public search = asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query;
    const query = studentQuerySchema.parse({ ...req.query, search: search as string | undefined });
    const { items, total } = await this.service.findMany({ ...query, search: query.search || undefined });
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
    const query = studentQuerySchema.parse(req.query) as StudentQueryInput;
    const { items, total } = await this.service.findMany(query);
    sendSuccess(res, {
      message: 'Filtered students fetched successfully',
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

  public findByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { departmentId } = req.params;
    const query = studentQuerySchema.parse(req.query);
    const { items, total } = await this.service.findMany({ ...query, departmentId });
    sendSuccess(res, {
      message: 'Students fetched successfully',
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

  public bulkImport = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportSchema.parse(req.body) as BulkImportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkImport(input.students, user.id);
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
    const result = await this.service.bulkUpdate(input.ids, input.updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public bulkDelete = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkDelete(ids, user.id);
    sendSuccess(res, {
      message: `Bulk delete completed. Deleted: ${result.deleted}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public getMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const student = await this.service.getProfile(user.id);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }
    sendSuccess(res, { message: 'Profile fetched successfully', data: student });
  });

  public updateMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const input = updateStudentSchema.parse(req.body) as UpdateStudentInput;
    const student = await this.service.updateProfile(user.id, input, user.id);
    if (!student) {
      throw new NotFoundError('Student profile not found');
    }
    sendSuccess(res, { message: 'Profile updated successfully', data: student });
  });

  public linkParent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = linkParentSchema.parse(req.body) as LinkParentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const student = await this.service.linkParent(id, input.parentId, user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    sendSuccess(res, { message: 'Parent linked successfully', data: student });
  });

  public unlinkParent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const student = await this.service.unlinkParent(id, user.id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    sendSuccess(res, { message: 'Parent unlinked successfully', data: student });
  });
}

export const studentController = new StudentController(studentService);
