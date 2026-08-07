import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { AdmissionService, admissionService } from './admission.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createAdmissionSchema,
  updateAdmissionSchema,
  admissionQuerySchema,
  bulkApprovalSchema,
  approvalActionSchema,
  seatAllocationActionSchema,
  generateOfferLetterSchema,
  generateAdmissionLetterSchema,
  bulkImportAdmissionSchema,
  type CreateAdmissionInput,
  type UpdateAdmissionInput,
  type AdmissionQueryInput,
  type BulkApprovalInput,
  type ApprovalActionInput,
  type SeatAllocationActionInput,
  type GenerateOfferLetterInput,
  type GenerateAdmissionLetterInput,
  type BulkImportAdmissionInput,
} from './admission.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/admissions for future breaking changes.
// TODO: OpenAPI/Swagger - document all admission endpoints.
// TODO: Webhook/event - publish domain events for admission lifecycle changes.
// TODO: Notification hooks - integrate notification service for admission decisions.
// TODO: AI hooks - integrate AI service for admission recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export class AdmissionController {
  constructor(private readonly service: AdmissionService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new admission record.
   * @param req - Express request with validated create payload.
   * @param res - Express response.
   * @returns HTTP 201 with created admission record.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createAdmissionSchema.parse(req.body) as CreateAdmissionInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.createAdmission(input, user.id);
    sendSuccess(res, {
      message: 'Admission record created successfully',
      data: admission,
      statusCode: HttpStatus.CREATED,
    });
  });

  /**
   * Updates an existing admission record.
   * @param req - Express request with admission ID param and validated update payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated admission record.
   * @throws NotFoundError if record does not exist.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateAdmissionSchema.parse(req.body) as UpdateAdmissionInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.updateAdmission(id, input, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Admission record updated successfully', data: admission });
  });

  /**
   * Retrieves an admission record by internal MongoDB ID.
   * @param req - Express request with admission ID param.
   * @param res - Express response.
   * @returns HTTP 200 with admission record.
   * @throws NotFoundError if record does not exist.
   */
  public getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const admission = await this.service.getAdmission(id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Admission record fetched successfully', data: admission });
  });

  /**
   * Soft deletes an admission record.
   * @param req - Express request with admission ID param.
   * @param res - Express response.
   * @returns HTTP 200 with success message.
   * @throws BadRequestError if record is already deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteAdmission(id, user.id);
    sendSuccess(res, { message: 'Admission record deleted successfully' });
  });

  /**
   * Restores a previously soft-deleted admission record.
   * @param req - Express request with admission ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored admission record.
   * @throws BadRequestError if record is not deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.restoreAdmission(id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Admission record restored successfully', data: admission });
  });

  // ─── APPROVAL WORKFLOW ────────────────────────────────────────────────────

  /**
   * Processes an approval action for an admission record.
   * @param req - Express request with admission ID param and validated approval payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated admission record.
   * @throws BadRequestError on invalid transitions.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public processApproval = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = approvalActionSchema.parse(req.body) as ApprovalActionInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.processApproval(id, input, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Approval processed successfully', data: admission });
  });

  // ─── SEAT ALLOCATION ──────────────────────────────────────────────────────

  /**
   * Allocates a seat for an admission record.
   * @param req - Express request with admission ID param and validated seat allocation payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated admission record.
   * @throws BadRequestError if admission is not approved.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public allocateSeat = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = seatAllocationActionSchema.parse(req.body) as SeatAllocationActionInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.allocateSeat(id, { ...input, status: 'RESERVED' }, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Seat allocated successfully', data: admission });
  });

  // ─── OFFER LETTER ─────────────────────────────────────────────────────────

  /**
   * Generates an offer letter for an admission record.
   * @param req - Express request with admission ID param and validated offer letter payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated admission record.
   * @throws BadRequestError if admission is not approved.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public generateOfferLetter = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = generateOfferLetterSchema.parse(req.body) as GenerateOfferLetterInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.generateOfferLetter(id, { ...input, status: 'GENERATED' }, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Offer letter generated successfully', data: admission });
  });

  // ─── ADMISSION LETTER ─────────────────────────────────────────────────────

  /**
   * Generates an admission letter for an admission record.
   * @param req - Express request with admission ID param and validated admission letter payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated admission record.
   * @throws BadRequestError if admission is not admitted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public generateAdmissionLetter = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = generateAdmissionLetterSchema.parse(req.body) as GenerateAdmissionLetterInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.generateAdmissionLetter(id, { ...input, status: 'GENERATED' }, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Admission letter generated successfully', data: admission });
  });

  // ─── FEE TRIGGER ──────────────────────────────────────────────────────────

  /**
   * Triggers fee payment for an admission record.
   * @param req - Express request with admission ID param and validated fee trigger payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated admission record.
   * @throws BadRequestError if admission is not approved or admitted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public triggerFee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.triggerFee(id, input, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Fee triggered successfully', data: admission });
  });

  // ─── WAITING LIST ─────────────────────────────────────────────────────────

  /**
   * Adds an admission record to the waiting list.
   * @param req - Express request with admission ID param.
   * @param res - Express response.
   * @returns HTTP 200 with updated admission record.
   * @throws BadRequestError if admission is already in waiting list.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public addToWaitingList = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.addToWaitingList(id, {
      position: 0,
      listedAt: new Date(),
      priorityScore: 0,
      notified: false,
    }, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Added to waiting list successfully', data: admission });
  });

  // ─── SEARCH & FILTER ─────────────────────────────────────────────────────

  /**
   * Lists admissions with text search, filters, sorting, and pagination.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated admission results.
   */
  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = admissionQuerySchema.parse(req.query) as AdmissionQueryInput;
    const { items, total } = await this.service.listAdmissions(query);
    sendSuccess(res, {
      message: 'Admissions fetched successfully',
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
   * Performs a text search across indexed admission fields.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated search results.
   */
  public search = asyncHandler(async (req: Request, res: Response) => {
    const query = admissionQuerySchema.parse(req.query) as AdmissionQueryInput;
    const { items, total } = await this.service.searchAdmissions(query.search || '', query.page, query.limit);
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

  // ─── BULK OPERATIONS ──────────────────────────────────────────────────────

  /**
   * Bulk-approves or bulk-rejects admission records.
   * @param req - Express request with validated bulk approval payload.
   * @param res - Express response.
   * @returns HTTP 200 with processing summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkApproval = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkApprovalSchema.parse(req.body) as BulkApprovalInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkProcessApproval(input, user.id);
    sendSuccess(res, {
      message: `Bulk approval completed. Processed: ${result.processed}, Failed: ${result.failed}`,
      data: result,
    });
  });

  /**
   * Bulk-creates admission records with per-item error handling.
   * @param req - Express request with validated bulk import payload.
   * @param res - Express response.
   * @returns HTTP 200 with creation summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportAdmissionSchema.parse(req.body) as BulkImportAdmissionInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateAdmissions(input, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Counts admissions by status.
   * @param req - Express request with status query parameter.
   * @param res - Express response.
   * @returns HTTP 200 with count object.
   */
  public countByStatus = asyncHandler(async (_req: Request, res: Response) => {
    const { status } = _req.query;
    const count = await this.service.countByStatus(status as string);
    sendSuccess(res, { message: 'Count fetched successfully', data: { count } });
  });

  /**
   * Counts pending approvals.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with pending approval count.
   */
  public countPendingApproval = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countPendingApproval();
    sendSuccess(res, { message: 'Pending approval count fetched successfully', data: { count } });
  });

  /**
   * Counts approved admissions.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with approved count.
   */
  public countApproved = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countApproved();
    sendSuccess(res, { message: 'Approved count fetched successfully', data: { count } });
  });

  /**
   * Counts rejected admissions.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with rejected count.
   */
  public countRejected = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countRejected();
    sendSuccess(res, { message: 'Rejected count fetched successfully', data: { count } });
  });

  /**
   * Counts waitlisted admissions.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with waitlisted count.
   */
  public countWaitlisted = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countWaitlisted();
    sendSuccess(res, { message: 'Waitlisted count fetched successfully', data: { count } });
  });

  /**
   * Counts admitted students.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with admitted count.
   */
  public countAdmitted = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countAdmitted();
    sendSuccess(res, { message: 'Admitted count fetched successfully', data: { count } });
  });

  // ─── ARCHIVE / RESTORE ───────────────────────────────────────────────────

  /**
   * Archives an admission record.
   * @param req - Express request with admission ID param.
   * @param res - Express response.
   * @returns HTTP 200 with archived admission record.
   * @throws BadRequestError if record is already archived or deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public archive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.archiveAdmission(id, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Admission record archived successfully', data: admission });
  });

  /**
   * Restores an archived admission record.
   * @param req - Express request with admission ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored admission record.
   * @throws BadRequestError if record is not archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restoreArchive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const admission = await this.service.restoreArchivedAdmission(id, user.id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }
    sendSuccess(res, { message: 'Admission record restored successfully', data: admission });
  });
}

export const admissionController = new AdmissionController(admissionService);
