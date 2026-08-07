import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { EligibilityService, eligibilityService } from './eligibility.service';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../../shared/utils/api-error.util';
import {
  createEligibilitySchema,
  updateEligibilitySchema,
  eligibilityQuerySchema,
  bulkImportEligibilitySchema,
  type CreateEligibilityInput,
  type UpdateEligibilityInput,
  type EligibilityQueryInput,
  type BulkImportEligibilityInput,
} from './eligibility.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/eligibility for future breaking changes.
// TODO: OpenAPI/Swagger - document all eligibility endpoints.
// TODO: Webhook/event - publish domain events for eligibility lifecycle changes.
// TODO: Notification hooks - integrate notification service for eligibility status changes.
// TODO: AI hooks - integrate AI service for eligibility rule engine and recommendations.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export class EligibilityController {
  constructor(private readonly service: EligibilityService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new eligibility record.
   * @param req - Express request with validated create payload.
   * @param res - Express response.
   * @returns HTTP 201 with created eligibility record.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createEligibilitySchema.parse(req.body) as CreateEligibilityInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const eligibility = await this.service.createEligibility(input, user.id);
    sendSuccess(res, {
      message: 'Eligibility record created successfully',
      data: eligibility,
      statusCode: HttpStatus.CREATED,
    });
  });

  /**
   * Updates an existing eligibility record.
   * @param req - Express request with eligibility ID param and validated update payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated eligibility record.
   * @throws NotFoundError if record does not exist.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateEligibilitySchema.parse(req.body) as UpdateEligibilityInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const eligibility = await this.service.updateEligibility(id, input, user.id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Eligibility record updated successfully', data: eligibility });
  });

  /**
   * Retrieves an eligibility record by internal MongoDB ID.
   * @param req - Express request with eligibility ID param.
   * @param res - Express response.
   * @returns HTTP 200 with eligibility record.
   * @throws NotFoundError if record does not exist.
   */
  public getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const eligibility = await this.service.getEligibility(id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Eligibility record fetched successfully', data: eligibility });
  });

  /**
   * Soft deletes an eligibility record.
   * @param req - Express request with eligibility ID param.
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
    await this.service.deleteEligibility(id, user.id);
    sendSuccess(res, { message: 'Eligibility record deleted successfully' });
  });

  /**
   * Restores a previously soft-deleted eligibility record.
   * @param req - Express request with eligibility ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored eligibility record.
   * @throws BadRequestError if record is not deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const eligibility = await this.service.restoreEligibility(id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Eligibility record restored successfully', data: eligibility });
  });

  // ─── ELIGIBILITY CHECK ────────────────────────────────────────────────────

  /**
   * Runs eligibility check for an applicant.
   * @param req - Express request with eligibility ID param and validated check payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated eligibility record.
   * @throws BadRequestError if record is not in PENDING or PROCESSING state.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public runCheck = asyncHandler(async (req: Request, res: Response) => {
    const { applicantId, applicationNumber, ruleTypes } = req.body;
    const input = { applicantId, applicationNumber, ruleTypes };
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const eligibility = await this.service.runEligibilityCheck(input, user.id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Eligibility check completed successfully', data: eligibility });
  });

  /**
   * Updates eligibility status with transition validation.
   * @param req - Express request with eligibility ID param and validated status payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated eligibility record.
   * @throws BadRequestError on invalid transitions.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateEligibilitySchema.parse(req.body) as UpdateEligibilityInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const eligibility = await this.service.updateEligibilityStatus(id, input.status || 'PENDING', user.id, input.reasonGeneration?.primaryReason);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Eligibility status updated successfully', data: eligibility });
  });

  // ─── AI HOOKS ─────────────────────────────────────────────────────────────

  /**
   * Updates AI confidence for an eligibility record.
   * @param req - Express request with eligibility ID param and validated AI confidence payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated eligibility record.
   * @throws BadRequestError if record is deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateAIConfidence = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateEligibilitySchema.parse(req.body) as UpdateEligibilityInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    if (!input.aiConfidence) {
      throw new BadRequestError('AI confidence data is required');
    }
    const eligibility = await this.service.updateAIConfidence(id, input.aiConfidence);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'AI confidence updated successfully', data: eligibility });
  });

  /**
   * Updates reason generation for an eligibility record.
   * @param req - Express request with eligibility ID param and validated reason generation payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated eligibility record.
   * @throws BadRequestError if record is deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateReasonGeneration = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateEligibilitySchema.parse(req.body) as UpdateEligibilityInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    if (!input.reasonGeneration) {
      throw new BadRequestError('Reason generation data is required');
    }
    const eligibility = await this.service.updateReasonGeneration(id, input.reasonGeneration);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Reason generation updated successfully', data: eligibility });
  });

  /**
   * Updates recommendation for an eligibility record.
   * @param req - Express request with eligibility ID param and validated recommendation payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated eligibility record.
   * @throws BadRequestError if record is deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public updateRecommendation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateEligibilitySchema.parse(req.body) as UpdateEligibilityInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    if (!input.recommendation) {
      throw new BadRequestError('Recommendation data is required');
    }
    const eligibility = await this.service.updateRecommendation(id, input.recommendation);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Recommendation updated successfully', data: eligibility });
  });

  // ─── SEARCH & FILTER ─────────────────────────────────────────────────────

  /**
   * Lists eligibilities with text search, filters, sorting, and pagination.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated eligibility results.
   */
  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = eligibilityQuerySchema.parse(req.query) as EligibilityQueryInput;
    const { items, total } = await this.service.listEligibilities(query);
    sendSuccess(res, {
      message: 'Eligibilities fetched successfully',
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
   * Performs a text search across indexed eligibility fields.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated search results.
   */
  public search = asyncHandler(async (req: Request, res: Response) => {
    const query = eligibilityQuerySchema.parse(req.query) as EligibilityQueryInput;
    const { items, total } = await this.service.searchEligibilities(query.search || '', query.page, query.limit);
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
   * Bulk-creates eligibility records with per-item error handling.
   * @param req - Express request with validated bulk import payload.
   * @param res - Express response.
   * @returns HTTP 200 with creation summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportEligibilitySchema.parse(req.body) as BulkImportEligibilityInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateEligibilities(input, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  // ─── ARCHIVE / RESTORE ───────────────────────────────────────────────────

  /**
   * Archives an eligibility record.
   * @param req - Express request with eligibility ID param.
   * @param res - Express response.
   * @returns HTTP 200 with archived eligibility record.
   * @throws BadRequestError if record is already archived or deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public archive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const eligibility = await this.service.archiveEligibility(id, user.id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Eligibility record archived successfully', data: eligibility });
  });

  /**
   * Restores an archived eligibility record.
   * @param req - Express request with eligibility ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored eligibility record.
   * @throws BadRequestError if record is not archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restoreArchive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const eligibility = await this.service.restoreArchivedEligibility(id, user.id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }
    sendSuccess(res, { message: 'Eligibility record restored successfully', data: eligibility });
  });

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Counts eligibilities by status.
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
   * Counts eligible applicants.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with eligible count.
   */
  public countEligible = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countEligible();
    sendSuccess(res, { message: 'Eligible count fetched successfully', data: { count } });
  });

  /**
   * Counts not eligible applicants.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with not eligible count.
   */
  public countNotEligible = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countNotEligible();
    sendSuccess(res, { message: 'Not eligible count fetched successfully', data: { count } });
  });

  /**
   * Counts eligibilities pending manual review.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with pending review count.
   */
  public countPendingReview = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countPendingReview();
    sendSuccess(res, { message: 'Pending review count fetched successfully', data: { count } });
  });
}

export const eligibilityController = new EligibilityController(eligibilityService);
