import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { SubjectService, subjectService } from './subject.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignFacultySchema,
  assignPrerequisiteSchema,
  createVersionSchema,
  rejectVersionSchema,
  uploadDocumentSchema,
  verifyDocumentSchema,
  addLearningResourceSchema,
  type CreateSubjectInput,
  type UpdateSubjectInput,
  type SubjectQueryInput,
  type BulkImportInput,
  type BulkUpdateInput,
  type AssignFacultyInput,
  type AssignPrerequisiteInput,
  type CreateVersionInput,
  type RejectVersionInput,
  type UploadDocumentInput,
  type VerifyDocumentInput,
  type AddLearningResourceInput,
} from './subject.validator';

export class SubjectController {
  constructor(private readonly service: SubjectService) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createSubjectSchema.parse(req.body) as CreateSubjectInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.createSubject(input, user.id);
    sendSuccess(res, {
      message: 'Subject created successfully',
      data: subject,
      statusCode: HttpStatus.CREATED,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateSubjectSchema.parse(req.body) as UpdateSubjectInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.updateSubject(id, input, user.id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject updated successfully', data: subject });
  });

  public findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subject = await this.service.getSubject(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject fetched successfully', data: subject });
  });

  public findBySubjectId = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const subject = await this.service.getSubjectBySubjectId(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject fetched successfully', data: subject });
  });

  public findByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const subject = await this.service.getSubjectByCode(code);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject fetched successfully', data: subject });
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteSubject(id, user.id);
    sendSuccess(res, { message: 'Subject deleted successfully' });
  });

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = subjectQuerySchema.parse(req.query) as SubjectQueryInput;
    const { items, total } = await this.service.listSubjects(query);
    sendSuccess(res, {
      message: 'Subjects fetched successfully',
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
    const query = subjectQuerySchema.parse(req.query) as SubjectQueryInput;
    const { items, total } = await this.service.searchSubjects(query.search || '', query.page, query.limit);
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
    const query = subjectQuerySchema.parse(req.query) as SubjectQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.courseId) filters.courseId = query.courseId;
    if (query.departmentId) filters.departmentId = query.departmentId;
    if (query.semester) filters.semester = query.semester;
    if (query.academicYear) filters.academicYear = query.academicYear;
    if (query.regulationYear) filters.regulationYear = query.regulationYear;
    if (query.subjectType) filters.subjectType = query.subjectType;
    if (query.category) filters.category = query.category;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.status) filters.status = query.status;
    if (query.primaryFacultyId) filters.primaryFacultyId = query.primaryFacultyId;
    if (query.hasPrerequisites !== undefined) filters.hasPrerequisites = query.hasPrerequisites;
    if (query.outcomeMapped !== undefined) filters.outcomeMapped = query.outcomeMapped;
    if (query.hasDocuments !== undefined) filters.hasDocuments = query.hasDocuments;
    if (query.hasLearningResources !== undefined) filters.hasLearningResources = query.hasLearningResources;
    if (query.predictedDifficulty) filters.predictedDifficulty = query.predictedDifficulty;
    if (query.difficultyTrend) filters.difficultyTrend = query.difficultyTrend;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    const { items, total } = await this.service.filterSubjects(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered subjects fetched successfully',
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

  public assignPrimaryFaculty = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const input = assignFacultySchema.parse(req.body) as AssignFacultyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.assignPrimaryFaculty(subjectId, input.facultyId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Primary faculty assigned successfully', data: subject });
  });

  public addCoFaculty = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const input = assignFacultySchema.parse(req.body) as AssignFacultyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.addCoFaculty(subjectId, input.facultyId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Co-faculty added successfully', data: subject });
  });

  public removeCoFaculty = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, facultyId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.removeCoFaculty(subjectId, facultyId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Co-faculty removed successfully', data: subject });
  });

  public addPrerequisite = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const input = assignPrerequisiteSchema.parse(req.body) as AssignPrerequisiteInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.addPrerequisite(subjectId, input.prerequisiteSubjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Prerequisite added successfully', data: subject });
  });

  public removePrerequisite = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, prerequisiteSubjectId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.removePrerequisite(subjectId, prerequisiteSubjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Prerequisite removed successfully', data: subject });
  });

  public getPrerequisiteGraph = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const graph = await this.service.getPrerequisiteGraph(subjectId);
    sendSuccess(res, { message: 'Prerequisite graph fetched successfully', data: graph });
  });

  public updateOutcomeMapping = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const mapping = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.updateOutcomeMapping(subjectId, mapping);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Outcome mapping updated successfully', data: subject });
  });

  public getOutcomeMapping = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const subject = await this.service.getOutcomeMapping(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Outcome mapping fetched successfully', data: subject.outcomeMapping });
  });

  public calculateOutcomeCoverage = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const coverage = await this.service.calculateOutcomeCoverage(subjectId);
    sendSuccess(res, { message: 'Outcome coverage calculated successfully', data: { coverage } });
  });

  public createVersion = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const input = createVersionSchema.parse(req.body) as CreateVersionInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.createVersion(subjectId, input.version, input.changeSummary, user.id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Version created successfully', data: subject });
  });

  public approveVersion = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, version } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.approveVersion(subjectId, version, user.id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Version approved successfully', data: subject });
  });

  public rejectVersion = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, version } = req.params;
    const input = rejectVersionSchema.parse(req.body) as RejectVersionInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.rejectVersion(subjectId, version, user.id, input.reason);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Version rejected successfully', data: subject });
  });

  public publishVersion = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, version } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.publishVersion(subjectId, version);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Version published successfully', data: subject });
  });

  public restoreVersion = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, version } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.restoreVersion(subjectId, version);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Version restored successfully', data: subject });
  });

  public compareVersions = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, versionA, versionB } = req.params;
    const comparison = await this.service.compareVersions(subjectId, versionA, versionB);
    if (!comparison) {
      throw new NotFoundError('Subject or versions not found');
    }
    sendSuccess(res, { message: 'Versions compared successfully', data: comparison });
  });

  public getVersionHistory = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const subject = await this.service.getVersionHistory(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Version history fetched successfully', data: subject.versionHistory });
  });

  public addDocument = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const input = uploadDocumentSchema.parse(req.body) as UploadDocumentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const document = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: input.name,
      type: input.type,
      description: input.description,
      version: '1.0',
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      uploadedBy: user.id,
      uploadedAt: new Date(),
      isCurrent: true,
      verified: false,
      accessLevel: input.accessLevel,
    };
    const subject = await this.service.addDocument(subjectId, document);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Document added successfully', data: subject });
  });

  public updateDocument = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, documentId } = req.params;
    const updates = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.updateDocument(subjectId, documentId, updates);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Document updated successfully', data: subject });
  });

  public verifyDocument = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, documentId } = req.params;
    const input = verifyDocumentSchema.parse(req.body) as VerifyDocumentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.verifyDocument(subjectId, documentId, input.verified, user.id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Document verification updated successfully', data: subject });
  });

  public removeDocument = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, documentId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.removeDocument(subjectId, documentId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Document removed successfully', data: subject });
  });

  public listDocuments = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const subject = await this.service.listDocuments(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Documents fetched successfully', data: subject.documents });
  });

  public addLearningResource = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const input = addLearningResourceSchema.parse(req.body) as AddLearningResourceInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const resource = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: input.type,
      title: input.title,
      description: input.description,
      url: input.url,
      author: input.author,
      publisher: input.publisher,
      year: input.year,
      isbn: input.isbn,
      duration: input.duration,
      language: input.language || 'en',
      difficultyLevel: input.difficultyLevel,
      tags: input.tags,
      isRecommended: input.isRecommended,
      addedBy: user.id,
      addedAt: new Date(),
      usageCount: 0,
    };
    const subject = await this.service.addLearningResource(subjectId, resource);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Learning resource added successfully', data: subject });
  });

  public updateLearningResource = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, resourceId } = req.params;
    const updates = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.updateLearningResource(subjectId, resourceId, updates);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Learning resource updated successfully', data: subject });
  });

  public removeLearningResource = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, resourceId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.removeLearningResource(subjectId, resourceId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Learning resource removed successfully', data: subject });
  });

  public verifyLearningResource = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, resourceId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.verifyLearningResource(subjectId, resourceId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Learning resource verified successfully', data: subject });
  });

  public recommendLearningResources = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const subject = await this.service.recommendLearningResources(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Recommended learning resources fetched successfully', data: subject.learningResources });
  });

  public listLearningResources = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const subject = await this.service.listLearningResources(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Learning resources fetched successfully', data: subject.learningResources });
  });

  public getSubjectStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const subject = await this.service.getSubjectStatistics(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject statistics fetched successfully', data: subject.subjectStatistics });
  });

  public recalculateStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.recalculateStatistics(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Statistics recalculated successfully', data: subject.subjectStatistics });
  });

  public archiveSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.archiveSubject(id, user.id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject archived successfully', data: subject });
  });

  public restoreArchivedSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.restoreArchivedSubject(id, user.id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject restored from archive successfully', data: subject });
  });

  public restoreSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const subject = await this.service.restoreSubject(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    sendSuccess(res, { message: 'Subject restored successfully', data: subject });
  });

  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportSchema.parse(req.body) as BulkImportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateSubjects(input, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkUpdateSchema.parse(req.body) as BulkUpdateInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkUpdateSubjects(input.ids, input.updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });
}

export const subjectController = new SubjectController(subjectService);
