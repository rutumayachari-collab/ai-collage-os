import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { ApplicantService, applicantService } from './applicant.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createApplicantSchema,
  updateApplicantSchema,
  applicantQuerySchema,
  bulkImportSchema,
  bulkUpdateSchema,
  assignReviewerSchema,
  updateStatusSchema,
  interviewResultSchema,
  updatePaymentSchema,
  type CreateApplicantInput,
  type UpdateApplicantInput,
  type ApplicantQueryInput,
  type BulkImportInput,
  type BulkUpdateInput,
  type AssignReviewerInput,
  type UpdateStatusInput,
  type InterviewResultInput,
  type UpdatePaymentInput,
} from './applicant.validator';

// TODO: API versioning support - consider prefixing these routes under /api/v2/applicant for future breaking changes.

export class ApplicantController {
  constructor(private readonly service: ApplicantService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new applicant from validated request body.
   * @param req - Express request with validated create applicant payload.
   * @param res - Express response.
   * @returns HTTP 201 with created applicant document.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document 201 response schema and validation rules.
    // TODO: Audit logging - log applicant creation request.
    const input = createApplicantSchema.parse(req.body) as CreateApplicantInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.createApplicant(input, user.id);
    sendSuccess(res, {
      message: 'Applicant created successfully',
      data: applicant,
      statusCode: HttpStatus.CREATED,
    });
  });

  /**
   * Updates an existing applicant by internal MongoDB ID.
   * @param req - Express request with applicant ID param and validated update payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws NotFoundError if applicant does not exist.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document update fields and 404/400 responses.
    // TODO: Audit logging - log applicant update request.
    const { id } = req.params;
    const input = updateApplicantSchema.parse(req.body) as UpdateApplicantInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.updateApplicant(id, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Applicant updated successfully', data: applicant });
  });

  /**
   * Retrieves an applicant by internal MongoDB ID.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with applicant document.
   * @throws NotFoundError if applicant does not exist.
   */
  public getById = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response schema.
    const { id } = req.params;
    const applicant = await this.service.getApplicant(id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Applicant fetched successfully', data: applicant });
  });

  /**
   * Retrieves an applicant by business applicantId.
   * @param req - Express request with applicantId param.
   * @param res - Express response.
   * @returns HTTP 200 with applicant document.
   * @throws NotFoundError if applicant does not exist.
   */
  public getByApplicantId = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response schema.
    const { applicantId } = req.params;
    const applicant = await this.service.getApplicantByApplicantId(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Applicant fetched successfully', data: applicant });
  });

  /**
   * Retrieves an applicant by applicationNumber.
   * @param req - Express request with applicationNumber param.
   * @param res - Express response.
   * @returns HTTP 200 with applicant document.
   * @throws NotFoundError if applicant does not exist.
   */
  public getByApplicationNumber = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document response schema.
    const { applicationNumber } = req.params;
    const applicant = await this.service.getApplicantByApplicationNumber(applicationNumber);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Applicant fetched successfully', data: applicant });
  });

  /**
   * Soft deletes an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with success message.
   * @throws BadRequestError if applicant is already deleted or archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public delete = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document 400/404 responses.
    // TODO: Audit logging - log applicant deletion request.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteApplicant(id, user.id);
    sendSuccess(res, { message: 'Applicant deleted successfully' });
  });

  /**
   * Restores a previously soft-deleted applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored applicant document.
   * @throws BadRequestError if applicant is not deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restore = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document 400/404 responses.
    // TODO: Audit logging - log applicant restoration request.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.restoreApplicant(id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Applicant restored successfully', data: applicant });
  });

  // ─── SEARCH & FILTER ─────────────────────────────────────────────────────

  /**
   * Lists applicants with text search, filters, sorting, and pagination.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated applicant results.
   */
  public list = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document query parameters and pagination metadata.
    // TODO: Audit logging - log applicant list/search request.
    const query = applicantQuerySchema.parse(req.query) as ApplicantQueryInput;
    const { items, total } = await this.service.listApplicants(query);
    sendSuccess(res, {
      message: 'Applicants fetched successfully',
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
   * Performs a text search across indexed applicant fields.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated search results.
   */
  public search = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document search query parameter.
    // TODO: Audit logging - log applicant search request.
    const query = applicantQuerySchema.parse(req.query) as ApplicantQueryInput;
    const { items, total } = await this.service.searchApplicants(query.search || '', query.page, query.limit);
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
    // TODO: Audit logging - log applicant filter request.
    const query = applicantQuerySchema.parse(req.query) as ApplicantQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;
    if (query.admissionRound) filters.admissionRound = query.admissionRound;
    if (query.applicationChannel) filters.applicationChannel = query.applicationChannel;
    if (query.preferredCourseId) filters.preferredCourseId = query.preferredCourseId;
    if (query.preferredDepartmentId) filters.preferredDepartmentId = query.preferredDepartmentId;
    if (query.assignedReviewerId) filters.assignedReviewerId = query.assignedReviewerId;
    if (query.assignedInterviewerId) filters.assignedInterviewerId = query.assignedInterviewerId;
    if (query.paymentStatus) filters.paymentStatus = query.paymentStatus;
    if (query.aiRiskLevel) filters.aiRiskLevel = query.aiRiskLevel;
    if (query.isActive !== undefined) filters.isActive = query.isActive;

    if (query.applicationDateFrom) filters.applicationDateFrom = query.applicationDateFrom;
    if (query.applicationDateTo) filters.applicationDateTo = query.applicationDateTo;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    const { items, total } = await this.service.filterApplicants(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered applicants fetched successfully',
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

  // ─── WORKFLOW ────────────────────────────────────────────────────────────

  /**
   * Updates applicant status while enforcing valid lifecycle transitions.
   * @param req - Express request with applicant ID param and validated status payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError on invalid transitions or archived applicant.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateStatus = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document valid status transitions.
    // TODO: Audit logging - log status change.
    // TODO: Rate limiting - consider stricter limits for status mutations.
    const { applicantId } = req.params;
    const input = updateStatusSchema.parse(req.body) as UpdateStatusInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.updateStatus(applicantId, input.status, user.id, input.note);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Status updated successfully', data: applicant });
  });

  /**
   * Updates the admission checklist for an applicant.
   * @param req - Express request with applicant ID param and validated checklist body.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateChecklist = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const input = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.updateChecklist(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Checklist updated successfully', data: applicant });
  });

  // ─── DOCUMENTS ───────────────────────────────────────────────────────────

  /**
   * Adds a document to an applicant.
   * @param req - Express request with applicant ID param and validated document body.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is archived/deleted or document already exists.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public addDocument = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document request body schema.
    // TODO: Audit logging - log document upload.
    const { applicantId } = req.params;
    const input = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.addDocument(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Document added successfully', data: applicant });
  });

  /**
   * Verifies or rejects a submitted document.
   * @param req - Express request with applicant ID and document ID params.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws NotFoundError if applicant or document does not exist.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public verifyDocument = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document verification request body.
    // TODO: Audit logging - log document verification.
    const { applicantId, documentId } = req.params;
    const { verified, rejectionReason } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.verifyDocument(applicantId, documentId, verified, user.id, rejectionReason);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Document verification updated successfully', data: applicant });
  });

  // ─── INTERVIEW ───────────────────────────────────────────────────────────

  /**
   * Schedules an interview for an applicant.
   * @param req - Express request with applicant ID param and validated interview payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is not eligible or archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document interview schedule schema.
    // TODO: Audit logging - log interview scheduling.
    const { applicantId } = req.params;
    const input = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.scheduleInterview(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Interview scheduled successfully', data: applicant });
  });

  /**
   * Records interview results for an applicant.
   * @param req - Express request with applicant ID param and validated interview result payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if no interview is scheduled or applicant is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public recordInterviewResult = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document interview result schema.
    // TODO: Audit logging - log interview result.
    const { applicantId } = req.params;
    const input = interviewResultSchema.parse(req.body) as InterviewResultInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.recordInterviewResult(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Interview result recorded successfully', data: applicant });
  });

  // ─── SCHOLARSHIP ─────────────────────────────────────────────────────────

  /**
   * Updates scholarship details for an applicant.
   * @param req - Express request with applicant ID param and validated scholarship payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateScholarship = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document scholarship update schema.
    // TODO: Audit logging - log scholarship update.
    const { applicantId } = req.params;
    const input = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.updateScholarship(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Scholarship updated successfully', data: applicant });
  });

  // ─── SEAT ALLOCATION ─────────────────────────────────────────────────────

  /**
   * Allocates a seat for an applicant.
   * @param req - Express request with applicant ID param and validated seat allocation payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is not selected or archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public allocateSeat = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document seat allocation schema.
    // TODO: Audit logging - log seat allocation.
    const { applicantId } = req.params;
    const input = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.allocateSeat(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Seat allocated successfully', data: applicant });
  });

  // ─── FEE SUMMARY ─────────────────────────────────────────────────────────

  /**
   * Updates fee summary for an applicant.
   * @param req - Express request with applicant ID param and validated fee summary payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateFeeSummary = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document fee summary schema.
    // TODO: Audit logging - log fee summary update.
    const { applicantId } = req.params;
    const input = updatePaymentSchema.parse(req.body) as UpdatePaymentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.updateFeeSummary(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Fee summary updated successfully', data: applicant });
  });

  // ─── OFFER LETTER ────────────────────────────────────────────────────────

  /**
   * Generates an offer letter for an applicant.
   * @param req - Express request with applicant ID param and validated offer letter payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is not selected or archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public generateOfferLetter = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document offer letter schema.
    // TODO: Audit logging - log offer letter generation.
    const { applicantId } = req.params;
    const input = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.generateOfferLetter(applicantId, input, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Offer letter generated successfully', data: applicant });
  });

  /**
   * Records the applicant's response to the offer letter.
   * @param req - Express request with applicant ID param and validated response payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if no offer letter exists or applicant is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public respondToOffer = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document offer response schema.
    // TODO: Audit logging - log offer response.
    const { applicantId } = req.params;
    const { accepted } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.respondToOffer(applicantId, accepted, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: `Offer ${accepted ? 'accepted' : 'rejected'} successfully`, data: applicant });
  });

  // ─── CONVERSION ──────────────────────────────────────────────────────────

  /**
   * Converts an admitted applicant into a student record.
   * @param req - Express request with applicant ID param and student ID body.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is not admitted or already converted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public convertToStudent = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document studentId requirement and conversion response.
    // TODO: Audit logging - log conversion event.
    // TODO: Rate limiting - apply strict rate limiting for conversion endpoint.
    const { applicantId } = req.params;
    const { studentId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.convertToStudent(applicantId, studentId, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Applicant converted to student successfully', data: applicant });
  });

  // ─── ASSIGNMENTS ─────────────────────────────────────────────────────────

  /**
   * Assigns a reviewer to an applicant.
   * @param req - Express request with applicant ID param and validated reviewer ID body.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public assignReviewer = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document request body and response.
    // TODO: Audit logging - log reviewer assignment.
    const { applicantId } = req.params;
    const input = assignReviewerSchema.parse(req.body) as AssignReviewerInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.assignReviewer(applicantId, input.reviewerId, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Reviewer assigned successfully', data: applicant });
  });

  /**
   * Assigns an interviewer to an applicant.
   * @param req - Express request with applicant ID param and interviewer ID body.
   * @param res - Express response.
   * @returns HTTP 200 with updated applicant document.
   * @throws BadRequestError if applicant is archived/deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public assignInterviewer = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document request body and response.
    // TODO: Audit logging - log interviewer assignment.
    const { applicantId } = req.params;
    const { interviewerId } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.assignInterviewer(applicantId, interviewerId, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Interviewer assigned successfully', data: applicant });
  });

  // ─── ARCHIVE / RESTORE ───────────────────────────────────────────────────

  /**
   * Archives an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with archived applicant document.
   * @throws BadRequestError if applicant is already archived or deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public archiveApplicant = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document archive response.
    // TODO: Audit logging - log archive action.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.archiveApplicant(id, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Applicant archived successfully', data: applicant });
  });

  /**
   * Restores an archived applicant back to active state.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored applicant document.
   * @throws BadRequestError if applicant is not archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restoreArchivedApplicant = asyncHandler(async (req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document restore response.
    // TODO: Audit logging - log restore action.
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const applicant = await this.service.restoreArchivedApplicant(id, user.id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Archived applicant restored successfully', data: applicant });
  });

  /**
   * Retrieves documents for an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with documents array.
   * @throws NotFoundError if applicant does not exist.
   */
  public listDocuments = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const applicant = await this.service.getApplicant(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Documents fetched successfully', data: applicant.submittedDocuments });
  });

  /**
   * Retrieves the timeline for an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with timeline array.
   * @throws NotFoundError if applicant does not exist.
   */
  public listTimeline = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const applicant = await this.service.getApplicant(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Timeline fetched successfully', data: applicant.timeline });
  });

  /**
   * Retrieves interview details for an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with interview object.
   * @throws NotFoundError if applicant does not exist.
   */
  public getInterview = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const applicant = await this.service.getApplicant(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Interview fetched successfully', data: applicant.interview });
  });

  /**
   * Retrieves fee summary for an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with fee summary object.
   * @throws NotFoundError if applicant does not exist.
   */
  public getFeeSummary = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const applicant = await this.service.getApplicant(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Fee summary fetched successfully', data: applicant.feeSummary });
  });

  /**
   * Retrieves offer letter details for an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with offer letter object.
   * @throws NotFoundError if applicant does not exist.
   */
  public getOfferLetter = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const applicant = await this.service.getApplicant(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Offer letter fetched successfully', data: applicant.offerLetter });
  });

  /**
   * Retrieves admission checklist for an applicant.
   * @param req - Express request with applicant ID param.
   * @param res - Express response.
   * @returns HTTP 200 with checklist object.
   * @throws NotFoundError if applicant does not exist.
   */
  public getChecklist = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId } = req.params;
    const applicant = await this.service.getApplicant(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }
    sendSuccess(res, { message: 'Checklist fetched successfully', data: applicant.admissionChecklist });
  });

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Counts applicants by status.
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
   * Counts applicants by admission round.
   * @param req - Express request with admission round query parameter.
   * @param res - Express response.
   * @returns HTTP 200 with count object.
   */
  public countByAdmissionRound = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document admission round query parameter.
    const { admissionRound } = _req.query;
    const count = await this.service.countByAdmissionRound(admissionRound as string);
    sendSuccess(res, { message: 'Count fetched successfully', data: { count } });
  });

  /**
   * Counts hot lead applicants above the default threshold.
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
   * Counts converted applicants.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with converted count.
   */
  public countConverted = asyncHandler(async (_req: Request, res: Response) => {
    // TODO: OpenAPI/Swagger - document converted count response.
    const count = await this.service.countConverted();
    sendSuccess(res, { message: 'Converted applicants count fetched successfully', data: { count } });
  });

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────

  /**
   * Bulk-creates applicants with per-item error handling.
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
    const result = await this.service.bulkCreateApplicants(input, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  /**
   * Bulk-updates applicants with per-item error handling.
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
    const result = await this.service.bulkUpdateApplicants(input.ids, input.updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });
}

export const applicantController = new ApplicantController(applicantService);
