import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { FacultyService, facultyService } from './faculty.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createFacultySchema,
  updateFacultySchema,
  facultyQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignDepartmentSchema,
  type FacultyQueryInput,
  type CreateFacultyInput,
  type UpdateFacultyInput,
  type BulkImportInput,
  type BulkUpdateInput,
  type AssignDepartmentInput,
} from './faculty.validator';

export class FacultyController {
  constructor(private readonly service: FacultyService) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createFacultySchema.parse(req.body) as CreateFacultyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.createFaculty(input, user.id);
    sendSuccess(res, {
      message: 'Faculty created successfully',
      data: faculty,
      statusCode: HttpStatus.CREATED,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateFacultySchema.parse(req.body) as UpdateFacultyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.updateFaculty(id, input, user.id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty updated successfully', data: faculty });
  });

  public findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const faculty = await this.service.getFaculty(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty fetched successfully', data: faculty });
  });

  public findByEmployeeId = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const faculty = await this.service.getFacultyByEmployeeId(employeeId);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty fetched successfully', data: faculty });
  });

  public findByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const faculty = await this.service.getFacultyByEmail(email);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty fetched successfully', data: faculty });
  });

  public findByOfficialEmail = asyncHandler(async (req: Request, res: Response) => {
    const { officialEmail } = req.params;
    const faculty = await this.service.getFacultyByOfficialEmail(officialEmail);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty fetched successfully', data: faculty });
  });

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = facultyQuerySchema.parse(req.query) as FacultyQueryInput;
    const { items, total } = await this.service.listFaculty(query);
    sendSuccess(res, {
      message: 'Faculty fetched successfully',
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
    const query = facultyQuerySchema.parse(req.query) as FacultyQueryInput;
    const { items, total } = await this.service.searchFaculty(query.search || '', query.page, query.limit);
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
    const query = facultyQuerySchema.parse(req.query) as FacultyQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.departmentId) filters.departmentId = query.departmentId;
    if (query.designation) filters.designation = query.designation;
    if (query.employmentStatus) filters.employmentStatus = query.employmentStatus;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.isHOD !== undefined) filters.isHOD = query.isHOD;
    if (query.employeeType) filters.employeeType = query.employeeType;
    if (query.academicRank) filters.academicRank = query.academicRank;
    if (query.joiningDateFrom || query.joiningDateTo) {
      filters.joiningDate = {};
      if (query.joiningDateFrom) (filters.joiningDate as Record<string, unknown>).$gte = query.joiningDateFrom;
      if (query.joiningDateTo) (filters.joiningDate as Record<string, unknown>).$lte = query.joiningDateTo;
    }
    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    const { items, total } = await this.service.filterFaculty(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered faculty fetched successfully',
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

  public assignDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = assignDepartmentSchema.parse(req.body) as AssignDepartmentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.assignDepartment(id, input.departmentId, input.isPrimary);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Department assigned successfully', data: faculty });
  });

  public removeDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id, departmentId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.removeDepartment(id, departmentId);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Department removed successfully', data: faculty });
  });

  public assignCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { courseId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.assignCourse(id, courseId);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Course assigned successfully', data: faculty });
  });

  public assignSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { subjectId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.assignSubject(id, subjectId);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Subject assigned successfully', data: faculty });
  });

  public updateTeachingLoad = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const load = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.updateTeachingLoad(id, load);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Teaching load updated successfully', data: faculty });
  });

  public updateLeaveBalance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const balance = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.updateLeaveBalance(id, balance);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Leave balance updated successfully', data: faculty });
  });

  public updateOfficeHours = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const officeHours = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.updateOfficeHours(id, officeHours);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Office hours updated successfully', data: faculty });
  });

  public updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const availability = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.updateAvailability(id, availability);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Availability updated successfully', data: faculty });
  });

  public addCommitteeAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const assignment = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.addCommitteeAssignment(id, assignment);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Committee assignment added successfully', data: faculty });
  });

  public updateCommitteeAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { id, committeeId } = req.params;
    const updates = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.updateCommitteeAssignment(id, committeeId, updates);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Committee assignment updated successfully', data: faculty });
  });

  public removeCommitteeAssignment = asyncHandler(async (req: Request, res: Response) => {
    const { id, committeeId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.removeCommitteeAssignment(id, committeeId);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Committee assignment removed successfully', data: faculty });
  });

  public addResearchProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const project = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.addResearchProject(id, project);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Research project added successfully', data: faculty });
  });

  public updateResearchProject = asyncHandler(async (req: Request, res: Response) => {
    const { id, projectTitle } = req.params;
    const updates = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.updateResearchProject(id, projectTitle, updates);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Research project updated successfully', data: faculty });
  });

  public removeResearchProject = asyncHandler(async (req: Request, res: Response) => {
    const { id, projectTitle } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.removeResearchProject(id, projectTitle);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Research project removed successfully', data: faculty });
  });

  public archiveFaculty = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.archiveFaculty(id, user.id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty archived successfully', data: faculty });
  });

  public restoreArchivedFaculty = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const faculty = await this.service.restoreArchivedFaculty(id, user.id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty restored from archive successfully', data: faculty });
  });

  public softDelete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.softDelete(id, user.id);
    sendSuccess(res, { message: 'Faculty deleted successfully' });
  });

  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const faculty = await this.service.restore(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty restored successfully', data: faculty });
  });

  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportSchema.parse(req.body) as BulkImportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkImport(input, user.id);
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

  public publicProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const faculty = await this.service.getPublicProfile(id);
    if (!faculty) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Public profile fetched successfully', data: faculty });
  });

  public statistics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stats = await this.service.getFacultyStatistics(id);
    if (!stats) {
      throw new NotFoundError('Faculty not found');
    }
    sendSuccess(res, { message: 'Faculty statistics fetched successfully', data: stats });
  });
}

export const facultyController = new FacultyController(facultyService);
