import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { InquiryService, inquiryService } from './inquiry.service';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../shared/utils/api-error.util';
import {
  createInquirySchema,
  updateInquirySchema,
  inquiryQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignCounselorSchema,
  updateStatusSchema,
  followUpSchema,
  timelineEventSchema,
  type CreateInquiryInput,
  type UpdateInquiryInput,
  type InquiryQueryInput,
  type BulkImportInput,
  type BulkUpdateInput,
  type AssignCounselorInput,
  type UpdateStatusInput,
  type FollowUpInput,
  type TimelineEventInput,
} from './inquiry.validator';

// TODO: API versioning support - consider prefixing these routes under /api/v2/inquiry for future breaking changes.

export class InquiryController {
  constructor(private readonly service: InquiryService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new inquiry from validated request body.
   * @param req - Express request with validated create inquiry payload.
   * @param res - Express response.
   * @returns HTTP 201 with created inquiry document.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document 201 response schema and validation rules.
    // TODO: Audit logging - log inquiry creation request.
    const input = createInquirySchema.parse(req.body) as CreateInquiryInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.createInquiry(input, user.id);
    sendSuccess(res, {
      message: 'Inquiry created successfully',
      data: inquiry,
      statusCode: HttpStatus.CREATED,
    });
  });

  /**
   * Updates an existing inquiry by internal MongoDB ID.
   * @param req - Express request with inquiry ID param and validated update payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws NotFoundError if inquiry does not exist.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document update fields and 404/400 responses.
    // TODO: Audit logging - log inquiry update request.
    const { id } = req.params;
    const input = updateInquirySchema.parse(req.body) as UpdateInquiryInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateInquiry(id, input, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Inquiry updated successfully', data: inquiry });
  });

  /**
   * Retrieves an inquiry by internal MongoDB ID.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with inquiry document.
   * @throws NotFoundError if inquiry does not exist.
   */
  public getById = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response schema.
    const { id } = req.params;
    const inquiry = await this.service.getInquiry(id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Inquiry fetched successfully', data: inquiry });
  });

  /**
   * Retrieves an inquiry by business inquiryId.
   * @param req - Express request with inquiryId param.
   * @param res - Express response.
   * @returns HTTP 200 with inquiry document.
   * @throws NotFoundError if inquiry does not exist.
   */
  public getByInquiryId = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response schema.
    const { inquiryId } = req.params;
    const inquiry = await this.service.getInquiryByInquiryId(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Inquiry fetched successfully', data: inquiry });
  });

  /**
   * Retrieves an inquiry by inquiryNumber.
   * @param req - Express request with inquiryNumber param.
   * @param res - Express response.
   * @returns HTTP 200 with inquiry document.
   * @throws NotFoundError if inquiry does not exist.
   */
  public getByInquiryNumber = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response schema.
    const { inquiryNumber } = req.params;
    const inquiry = await this.service.getInquiryByInquiryNumber(inquiryNumber);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Inquiry fetched successfully', data: inquiry });
  });

  /**
   * Soft deletes an inquiry.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with success message.
   * @throws BadRequestError if inquiry is already deleted or archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public delete = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document 400/404 responses.
    // TODO: Audit logging - log inquiry deletion request.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteInquiry(id, user.id);
    sendSuccess(res, { message: 'Inquiry deleted successfully' });
  });

  /**
   * Restores a previously soft-deleted inquiry.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored inquiry document.
   * @throws BadRequestError if inquiry is not deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restore = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document 400/404 responses.
    // TODO: Audit logging - log inquiry restoration request.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.restoreInquiry(id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Inquiry restored successfully', data: inquiry });
  });

  // ─── SEARCH & FILTER ─────────────────────────────────────────────────────

  /**
   * Lists inquiries with text search, filters, sorting, and pagination.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated inquiry results.
   */
  public list = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document query parameters and pagination metadata.
    // TODO: Audit logging - log inquiry list/search request.
    const query = inquiryQuerySchema.parse(req.query) as InquiryQueryInput;
    const { items, total } = await this.service.listInquiries(query);
    sendSuccess(res, {
      message: 'Inquiries fetched successfully',
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

  /**
   * Performs a text search across indexed inquiry fields.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated search results.
   */
  public search = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document search query parameter.
    // TODO: Audit logging - log inquiry search request.
    const query = inquiryQuerySchema.parse(req.query) as InquiryQueryInput;
    const { items, total } = await this.service.searchInquiries(query.search || '', query.page, query.limit);
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

  /**
   * Applies structured filters with pagination.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated filtered results.
   */
  public filter = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document filter query parameters.
    // TODO: Audit logging - log inquiry filter request.
    const query = inquiryQuerySchema.parse(req.query) as InquiryQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;
    if (query.source) filters.source = query.source;
    if (query.preferredCourseId) filters.preferredCourseId = query.preferredCourseId;
    if (query.preferredDepartmentId) filters.preferredDepartmentId = query.preferredDepartmentId;
    if (query.assignedCounselorId) filters.assignedCounselorId = query.assignedCounselorId;
    if (query.aiIntent) filters.aiIntent = query.aiIntent;
    if (query.aiRiskLevel) filters.aiRiskLevel = query.aiRiskLevel;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.tag) filters.tag = query.tag;

    if (query.aiLeadScoreMin !== undefined || query.aiLeadScoreMax !== undefined) {
      filters.aiLeadScoreMin = query.aiLeadScoreMin;
      filters.aiLeadScoreMax = query.aiLeadScoreMax;
    }

    if (query.inquiryDateFrom) filters.inquiryDateFrom = query.inquiryDateFrom;
    if (query.inquiryDateTo) filters.inquiryDateTo = query.inquiryDateTo;
    if (query.nextFollowUpDateFrom) filters.nextFollowUpDateFrom = query.nextFollowUpDateFrom;
    if (query.nextFollowUpDateTo) filters.nextFollowUpDateTo = query.nextFollowUpDateTo;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    const { items, total } = await this.service.filterInquiries(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered inquiries fetched successfully',
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

  /**
   * Performs advanced search combining text search with structured filters.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated advanced search results.
   */
  public advancedSearch = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document advanced search parameters.
    // TODO: Audit logging - log advanced search request.
    const query = inquiryQuerySchema.parse(req.query) as InquiryQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.search) filters.search = query.search;
    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;
    if (query.source) filters.source = query.source;
    if (query.preferredCourseId) filters.preferredCourseId = query.preferredCourseId;
    if (query.preferredDepartmentId) filters.preferredDepartmentId = query.preferredDepartmentId;
    if (query.assignedCounselorId) filters.assignedCounselorId = query.assignedCounselorId;
    if (query.aiIntent) filters.aiIntent = query.aiIntent;
    if (query.aiRiskLevel) filters.aiRiskLevel = query.aiRiskLevel;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.tag) filters.tag = query.tag;

    if (query.aiLeadScoreMin !== undefined || query.aiLeadScoreMax !== undefined) {
      filters.aiLeadScoreMin = query.aiLeadScoreMin;
      filters.aiLeadScoreMax = query.aiLeadScoreMax;
    }

    if (query.inquiryDateFrom) filters.inquiryDateFrom = query.inquiryDateFrom;
    if (query.inquiryDateTo) filters.inquiryDateTo = query.inquiryDateTo;
    if (query.nextFollowUpDateFrom) filters.nextFollowUpDateFrom = query.nextFollowUpDateFrom;
    if (query.nextFollowUpDateTo) filters.nextFollowUpDateTo = query.nextFollowUpDateTo;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    const { items, total } = await this.service.advancedSearch(filters, query.page, query.limit);
    sendSuccess(res, {
      message: 'Advanced search results fetched successfully',
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

  // ─── COUNSELOR MANAGEMENT ────────────────────────────────────────────────

  /**
   * Assigns a counselor to an inquiry.
   * @param req - Express request with inquiry ID param and validated counselor ID body.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if counselor is already assigned or inquiry is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public assignCounselor = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document request body and response.
    // TODO: Audit logging - log counselor assignment.
    // TODO: Notification hook - counselor assignment notification.
    const { inquiryId } = req.params;
    const input = assignCounselorSchema.parse(req.body) as AssignCounselorInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.assignCounselor(inquiryId, input.counselorId, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Counselor assigned successfully', data: inquiry });
  });

  /**
   * Removes the assigned counselor from an inquiry.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if no counselor is assigned or inquiry is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public removeCounselor = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response.
    // TODO: Audit logging - log counselor removal.
    const { inquiryId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.removeCounselor(inquiryId, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Counselor removed successfully', data: inquiry });
  });

  /**
   * Updates counselor notes for an inquiry.
   * @param req - Express request with inquiry ID param and notes body.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if notes are empty or inquiry is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateCounselorNotes = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document request body schema.
    // TODO: Audit logging - log notes update.
    const { inquiryId } = req.params;
    const { notes } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateCounselorNotes(inquiryId, notes, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Counselor notes updated successfully', data: inquiry });
  });

  /**
   * Updates the counseling outcome for an inquiry.
   * @param req - Express request with inquiry ID param and counseling outcome body.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if inquiry is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateCounselingOutcome = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document counseling outcome enum.
    // TODO: Audit logging - log counseling outcome change.
    const { inquiryId } = req.params;
    const { counselingOutcome } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateCounselingOutcome(inquiryId, counselingOutcome, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Counseling outcome updated successfully', data: inquiry });
  });

  /**
   * Lists inquiries assigned to a specific counselor.
   * @param req - Express request with counselorId param.
   * @param res - Express response.
   * @returns HTTP 200 with paginated inquiry results.
   * @throws NotFoundError if counselor has no inquiries or invalid counselor ID.
   */
  public listCounselorInquiries = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document counselorId parameter and response.
    // TODO: Audit logging - log counselor inquiries access.
    const { counselorId } = _req.params;
    const { items, total } = await this.service.listInquiries({ assignedCounselorId: counselorId } as InquiryQueryInput);
    sendSuccess(res, {
      message: 'Counselor inquiries fetched successfully',
      data: items,
      meta: {
        page: 1,
        limit: items.length,
        total,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  // ─── FOLLOW-UP ───────────────────────────────────────────────────────────

  /**
   * Schedules a follow-up for an inquiry.
   * @param req - Express request with inquiry ID param and validated follow-up payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if follow-up date is missing or in the past, or inquiry is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public scheduleFollowUp = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document date validation rules.
    // TODO: Audit logging - log follow-up scheduling.
    // TODO: Rate limiting - consider stricter limits for mutation endpoints.
    // TODO: Notification hook - follow-up scheduled notification.
    const { inquiryId } = req.params;
    const input = followUpSchema.parse(req.body) as FollowUpInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    if (!input.nextFollowUpDate) {
      throw new BadRequestError('Follow-up date is required');
    }
    const inquiry = await this.service.scheduleFollowUp(inquiryId, input.nextFollowUpDate, user.id, input.note);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Follow-up scheduled successfully', data: inquiry });
  });

  /**
   * Records a completed follow-up result.
   * @param req - Express request with inquiry ID param and validated follow-up payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if result is empty or inquiry is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateFollowUp = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document follow-up result schema.
    // TODO: Audit logging - log follow-up completion.
    // TODO: Rate limiting - consider stricter limits for mutation endpoints.
    const { inquiryId } = req.params;
    const input = followUpSchema.parse(req.body) as FollowUpInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateFollowUp(inquiryId, input.result, user.id, input.note);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Follow-up updated successfully', data: inquiry });
  });

  /**
   * Alias for updateFollowUp to mark a follow-up as completed.
   * @param req - Express request with inquiry ID param and validated follow-up payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if result is empty or inquiry is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public completeFollowUp = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document follow-up completion alias.
    // TODO: Rate limiting - consider stricter limits for mutation endpoints.
    const { inquiryId } = req.params;
    const input = followUpSchema.parse(req.body) as FollowUpInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.completeFollowUp(inquiryId, input.result, user.id, input.note);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Follow-up completed successfully', data: inquiry });
  });

  /**
   * Lists pending follow-ups across inquiries.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with list of inquiries having pending follow-ups.
   */
  public listPendingFollowUps = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response schema.
    // TODO: Audit logging - log pending follow-up access.
    // TODO: Rate limiting - consider stricter limits for bulk read endpoints.
    const result = await this.service.listInquiries({ page: 1, limit: 100, sort: 'nextFollowUpDate', order: 'asc' } as InquiryQueryInput);
    sendSuccess(res, {
      message: 'Pending follow-ups fetched successfully',
      data: result.items,
      meta: {
        page: 1,
        limit: result.items.length,
        total: result.total,
        totalPages: Math.ceil(result.total / 100) || 1,
        hasNextPage: result.items.length >= 100,
        hasPreviousPage: false,
      },
    });
  });

  // ─── TIMELINE ────────────────────────────────────────────────────────────

  /**
   * Appends a custom timeline event to an inquiry.
   * @param req - Express request with inquiry ID param and validated timeline event body.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if inquiry is deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public addTimelineEvent = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document timeline event schema.
    // TODO: Audit logging - log timeline event creation.
    const { inquiryId } = req.params;
    const input = timelineEventSchema.parse(req.body) as TimelineEventInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const event = {
      ...input,
      createdAt: new Date(),
    };
    const inquiry = await this.service.addTimelineEvent(inquiryId, event);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Timeline event added successfully', data: inquiry });
  });

  /**
   * Retrieves the timeline for an inquiry.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with timeline array.
   * @throws NotFoundError if inquiry does not exist.
   */
  public listTimeline = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document timeline response schema.
    const { inquiryId } = req.params;
    const inquiry = await this.service.listTimeline(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Timeline fetched successfully', data: inquiry.timeline });
  });

  // ─── STATUS WORKFLOW ─────────────────────────────────────────────────────

  /**
   * Updates inquiry status while enforcing valid lifecycle transitions.
   * @param req - Express request with inquiry ID param and validated status payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError on invalid transitions or archived inquiry.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateStatus = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document valid status transitions.
    // TODO: Audit logging - log status change.
    // TODO: Rate limiting - consider stricter limits for status mutations.
    const { inquiryId } = req.params;
    const input = updateStatusSchema.parse(req.body) as UpdateStatusInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateStatus(inquiryId, input.status, user.id, input.note);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Status updated successfully', data: inquiry });
  });

  /**
   * Retrieves status change history for an inquiry.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with filtered STATUS_CHANGED timeline events.
   * @throws NotFoundError if inquiry does not exist.
   */
  public getStatusHistory = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document status history response schema.
    const { inquiryId } = req.params;
    const inquiry = await this.service.listTimeline(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    const statusEvents = inquiry.timeline.filter(event => event.eventType === 'STATUS_CHANGED');
    sendSuccess(res, { message: 'Status history fetched successfully', data: statusEvents });
  });

  // ─── AI OPERATIONS ───────────────────────────────────────────────────────

  /**
   * Updates AI-generated summary for an inquiry.
   * @param req - Express request with inquiry ID param and summary body.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if summary is empty or inquiry is deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateAISummary = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document AI summary schema.
    // TODO: Audit logging - log AI summary update.
    // TODO: Rate limiting - consider stricter limits for AI write endpoints.
    const { inquiryId } = req.params;
    const { aiSummary } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateAISummary(inquiryId, aiSummary, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'AI summary updated successfully', data: inquiry });
  });

  /**
   * Updates AI lead score with reason and history tracking.
   * @param req - Express request with inquiry ID param and score payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if score is out of range or reason is empty.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateLeadScore = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document lead score range and reason schema.
    // TODO: Audit logging - log lead score update.
    // TODO: Rate limiting - consider stricter limits for AI write endpoints.
    const { inquiryId } = req.params;
    const { aiLeadScore, reason } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateLeadScore(inquiryId, aiLeadScore, reason, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Lead score updated successfully', data: inquiry });
  });

  /**
   * Updates AI-recommended courses for an inquiry.
   * @param req - Express request with inquiry ID param and course recommendation payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if no courses are provided.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateRecommendedCourses = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document recommended courses array schema.
    // TODO: Audit logging - log AI recommendation update.
    // TODO: Rate limiting - consider stricter limits for AI write endpoints.
    const { inquiryId } = req.params;
    const { aiRecommendedCourseIds, aiRecommendedDepartmentId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateRecommendedCourses(inquiryId, aiRecommendedCourseIds, aiRecommendedDepartmentId, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Recommended courses updated successfully', data: inquiry });
  });

  /**
   * Updates AI conversation summary and optional next-best-action.
   * @param req - Express request with inquiry ID param and conversation payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if summary is empty or inquiry is deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateAIConversation = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document AI conversation schema.
    // TODO: Audit logging - log AI conversation update.
    // TODO: Rate limiting - consider stricter limits for AI write endpoints.
    const { inquiryId } = req.params;
    const { aiConversationSummary, aiNextBestAction } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.updateAIConversation(inquiryId, aiConversationSummary, aiNextBestAction, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'AI conversation updated successfully', data: inquiry });
  });

  // ─── CONVERSION ──────────────────────────────────────────────────────────

  /**
   * Converts an inquiry into an applicant by marking conversion metadata.
   * @param req - Express request with inquiry ID param and applicant ID body.
   * @param res - Express response.
   * @returns HTTP 200 with updated inquiry document.
   * @throws BadRequestError if already converted, deleted, or archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public convertToApplicant = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document applicantId requirement and conversion response.
    // TODO: Audit logging - log conversion event.
    // TODO: Rate limiting - apply strict rate limiting for conversion endpoint.
    // TODO: API versioning - review in /api/v2 if conversion workflow changes.
    const { inquiryId } = req.params;
    const { applicantId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.convertToApplicant(inquiryId, applicantId, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Inquiry converted to applicant successfully', data: inquiry });
  });

  /**
   * Retrieves conversion status for an inquiry.
   * @param req - Express request with inquiryId param.
   * @param res - Express response.
   * @returns HTTP 200 with conversion metadata.
   * @throws NotFoundError if inquiry does not exist.
   */
  public getConversionStatus = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document conversion response schema.
    const { inquiryId } = req.params;
    const inquiry = await this.service.getInquiryByInquiryId(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Conversion status fetched successfully', data: inquiry.conversion });
  });

  // ─── ARCHIVE / RESTORE ───────────────────────────────────────────────────

  /**
   * Archives an inquiry.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with archived inquiry document.
   * @throws BadRequestError if inquiry is already archived or deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public archiveInquiry = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document archive response.
    // TODO: Audit logging - log archive action.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.archiveInquiry(id, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Inquiry archived successfully', data: inquiry });
  });

  /**
   * Restores an archived inquiry back to active state.
   * @param req - Express request with inquiry ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored inquiry document.
   * @throws BadRequestError if inquiry is not archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restoreArchivedInquiry = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document restore response.
    // TODO: Audit logging - log restore action.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const inquiry = await this.service.restoreArchivedInquiry(id, user.id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }
    sendSuccess(res, { message: 'Archived inquiry restored successfully', data: inquiry });
  });

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Counts inquiries by status.
   * @param req - Express request with status query parameter.
   * @param res - Express response.
   * @returns HTTP 200 with count object.
   */
  public countByStatus = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document status query parameter.
    const { status } = _req.query;
    const count = await this.service.countByStatus(status as string);
    sendSuccess(res, { message: 'Count fetched successfully', data: { count } });
  });

  /**
   * Counts inquiries by source.
   * @param req - Express request with source query parameter.
   * @param res - Express response.
   * @returns HTTP 200 with count object.
   */
  public countBySource = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document source query parameter.
    const { source } = _req.query;
    const count = await this.service.countBySource(source as string);
    sendSuccess(res, { message: 'Count fetched successfully', data: { count } });
  });

  /**
   * Counts hot lead inquiries above the default threshold.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with hot lead count.
   */
  public countHotLeads = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document hot lead threshold.
    const count = await this.service.countHotLeads();
    sendSuccess(res, { message: 'Hot leads count fetched successfully', data: { count } });
  });

  /**
   * Counts converted inquiries.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with converted count.
   */
  public countConverted = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document converted count response.
    const count = await this.service.countConverted();
    sendSuccess(res, { message: 'Converted inquiries count fetched successfully', data: { count } });
  });

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────

  /**
   * Bulk-creates inquiries with per-item error handling.
   * @param req - Express request with validated bulk import payload.
   * @param res - Express response.
   * @returns HTTP 200 with creation summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document bulk import schema and error response format.
    // TODO: Audit logging - log bulk creation request.
    // TODO: Rate limiting - apply strict rate limiting for bulk mutation endpoints.
    const input = bulkImportSchema.parse(req.body) as BulkImportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateInquiries(input, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  /**
   * Bulk-updates inquiries with per-item error handling.
   * @param req - Express request with validated bulk update payload.
   * @param res - Express response.
   * @returns HTTP 200 with update summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document bulk update schema and error response format.
    // TODO: Audit logging - log bulk update request.
    // TODO: Rate limiting - apply strict rate limiting for bulk mutation endpoints.
    const input = bulkUpdateSchema.parse(req.body) as BulkUpdateInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkUpdateInquiries(input.ids, input.updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });
}

export const inquiryController = new InquiryController(inquiryService);
