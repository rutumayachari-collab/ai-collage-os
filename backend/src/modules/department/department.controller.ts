import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { DepartmentService, departmentService } from './department.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignHodSchema,
  type DepartmentQueryInput,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  type BulkImportInput,
  type BulkUpdateInput,
  type AssignHodInput,
} from './department.validator';

export class DepartmentController {
  constructor(private readonly service: DepartmentService) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createDepartmentSchema.parse(req.body) as CreateDepartmentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const department = await this.service.createDepartment(input, user.id);
    sendSuccess(res, {
      message: 'Department created successfully',
      data: department,
      statusCode: HttpStatus.CREATED,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateDepartmentSchema.parse(req.body) as UpdateDepartmentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const department = await this.service.updateDepartment(id, input, user.id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    sendSuccess(res, { message: 'Department updated successfully', data: department });
  });

  public findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const department = await this.service.getDepartment(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    sendSuccess(res, { message: 'Department fetched successfully', data: department });
  });

  public findByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const department = await this.service.getDepartmentByCode(code);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    sendSuccess(res, { message: 'Department fetched successfully', data: department });
  });

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = departmentQuerySchema.parse(req.query) as DepartmentQueryInput;
    const { items, total } = await this.service.listDepartments(query);
    sendSuccess(res, {
      message: 'Departments fetched successfully',
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
    const query = departmentQuerySchema.parse(req.query) as DepartmentQueryInput;
    const { items, total } = await this.service.searchDepartments(
      query.search || '',
      query.page,
      query.limit,
    );
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
    const query = departmentQuerySchema.parse(req.query) as DepartmentQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.status) filters.status = query.status;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.hodId) filters.hodId = query.hodId;
    if (query.building) filters.building = query.building;
    if (query.accreditation) filters.accreditation = query.accreditation;
    if (query.establishedYear) filters.establishedYear = query.establishedYear;
    const { items, total } = await this.service.filterDepartments(filters, query.page, query.limit);
    sendSuccess(res, {
      message: 'Filtered departments fetched successfully',
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

  public assignHOD = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = assignHodSchema.parse(req.body) as AssignHodInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const department = await this.service.assignHOD(id, input.hodId);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    sendSuccess(res, { message: 'HOD assigned successfully', data: department });
  });

  public removeHOD = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const department = await this.service.removeHOD(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    sendSuccess(res, { message: 'HOD removed successfully', data: department });
  });

  public softDelete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteDepartment(id, user.id);
    sendSuccess(res, { message: 'Department deleted successfully' });
  });

  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const department = await this.service.restoreDepartment(id);
    if (!department) {
      throw new NotFoundError('Department not found');
    }
    sendSuccess(res, { message: 'Department restored successfully', data: department });
  });

  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportSchema.parse(req.body) as BulkImportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateDepartments(input.departments, user.id);
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
    const result = await this.service.bulkUpdateDepartments(input.ids, input.updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public statistics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stats = await this.service.departmentStatistics(id);
    if (!stats) {
      throw new NotFoundError('Department not found');
    }
    sendSuccess(res, { message: 'Department statistics fetched successfully', data: stats });
  });
}

export const departmentController = new DepartmentController(departmentService);
