import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { DocumentVerificationService, documentVerificationService } from './documentVerification.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createDocumentVerificationSchema,
  updateDocumentVerificationSchema,
  documentVerificationQuerySchema,
  bulkVerifySchema,
  bulkRejectSchema,
  bulkImportDocumentVerificationSchema,
  approveDocumentSchema,
  rejectDocumentSchema,
  reuploadDocumentSchema,
  type CreateDocumentVerificationInput,
  type UpdateDocumentVerificationInput,
  type DocumentVerificationQueryInput,
  type BulkVerifyInput,
  type BulkRejectInput,
  type BulkImportDocumentVerificationInput,
  type ApproveDocumentInput,
  type RejectDocumentInput,
  type ReuploadDocumentInput,
} from './documentVerification.validator';

// TODO: API versioning - consider prefixing these routes under /api/v2/document-verifications for future breaking changes.
// TODO: OpenAPI/Swagger - document all document verification endpoints.
// TODO: Webhook/event - publish domain events for document lifecycle changes.
// TODO: Notification hooks - integrate notification service for verification status changes.
// TODO: AI hooks - integrate OCR and fraud detection services.
// TODO: Audit hooks - log all mutations for compliance and traceability.
// TODO: Metrics - instrument endpoint latency, error rates, and business metrics.

export class DocumentVerificationController {
  constructor(private readonly service: DocumentVerificationService) {}

  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new document verification record.
   * @param req - Express request with validated create payload.
   * @param res - Express response.
   * @returns HTTP 201 with created document verification record.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createDocumentVerificationSchema.parse(req.body) as CreateDocumentVerificationInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.createDocumentVerification(input, user.id);
    sendSuccess(res, {
      message: 'Document verification record created successfully',
      data: documentVerification,
      statusCode: HttpStatus.CREATED,
    });
  });

  /**
   * Updates an existing document verification record.
   * @param req - Express request with document verification ID param and validated update payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated document verification record.
   * @throws NotFoundError if record does not exist.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateDocumentVerificationSchema.parse(req.body) as UpdateDocumentVerificationInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.updateDocumentVerification(id, input, user.id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document verification record updated successfully', data: documentVerification });
  });

  /**
   * Retrieves a document verification record by internal MongoDB ID.
   * @param req - Express request with document verification ID param.
   * @param res - Express response.
   * @returns HTTP 200 with document verification record.
   * @throws NotFoundError if record does not exist.
   */
  public getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const documentVerification = await this.service.getDocumentVerification(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document verification record fetched successfully', data: documentVerification });
  });

  /**
   * Soft deletes a document verification record.
   * @param req - Express request with document verification ID param.
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
    await this.service.deleteDocumentVerification(id, user.id);
    sendSuccess(res, { message: 'Document verification record deleted successfully' });
  });

  /**
   * Restores a previously soft-deleted document verification record.
   * @param req - Express request with document verification ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored document verification record.
   * @throws BadRequestError if record is not deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.restoreDocumentVerification(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document verification record restored successfully', data: documentVerification });
  });

  // ─── VERIFICATION WORKFLOW ────────────────────────────────────────────────

  /**
   * Approves a document verification record.
   * @param req - Express request with document verification ID param and validated approval payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated document verification record.
   * @throws BadRequestError if record is already verified.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public approve = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = approveDocumentSchema.parse(req.body) as ApproveDocumentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.approveDocument(id, input, user.id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document approved successfully', data: documentVerification });
  });

  /**
   * Rejects a document verification record.
   * @param req - Express request with document verification ID param and validated rejection payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated document verification record.
   * @throws BadRequestError if record is already rejected.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public reject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = rejectDocumentSchema.parse(req.body) as RejectDocumentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.rejectDocument(id, input, user.id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document rejected successfully', data: documentVerification });
  });

  /**
   * Marks a document verification record as under review.
   * @param req - Express request with document verification ID param.
   * @param res - Express response.
   * @returns HTTP 200 with updated document verification record.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public markUnderReview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.markUnderReview(id, user.id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document marked as under review', data: documentVerification });
  });

  // ─── RE-UPLOAD WORKFLOW ──────────────────────────────────────────────────

  /**
   * Processes a re-uploaded document.
   * @param req - Express request with document verification ID param and validated re-upload payload.
   * @param res - Express response.
   * @returns HTTP 200 with updated document verification record.
   * @throws BadRequestError if re-upload has not been requested or deadline has passed.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public reupload = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = reuploadDocumentSchema.parse(req.body) as ReuploadDocumentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.reuploadDocument(id, input, user.id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document re-uploaded successfully', data: documentVerification });
  });

  // ─── SEARCH & FILTER ─────────────────────────────────────────────────────

  /**
   * Lists document verifications with text search, filters, sorting, and pagination.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated document verification results.
   */
  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = documentVerificationQuerySchema.parse(req.query) as DocumentVerificationQueryInput;
    const { items, total } = await this.service.listDocumentVerifications(query);
    sendSuccess(res, {
      message: 'Document verifications fetched successfully',
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
   * Performs a text search across indexed document verification fields.
   * @param req - Express request with validated query parameters.
   * @param res - Express response.
   * @returns HTTP 200 with paginated search results.
   */
  public search = asyncHandler(async (req: Request, res: Response) => {
    const query = documentVerificationQuerySchema.parse(req.query) as DocumentVerificationQueryInput;
    const { items, total } = await this.service.searchDocumentVerifications(query.search || '', query.page, query.limit);
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
   * Bulk-verifies document verification records.
   * @param req - Express request with validated bulk verify payload.
   * @param res - Express response.
   * @returns HTTP 200 with verification summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkVerify = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkVerifySchema.parse(req.body) as BulkVerifyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkVerifyDocuments(input, user.id);
    sendSuccess(res, {
      message: `Bulk verify completed. Verified: ${result.verified}, Failed: ${result.failed}`,
      data: result,
    });
  });

  /**
   * Bulk-rejects document verification records.
   * @param req - Express request with validated bulk reject payload.
   * @param res - Express response.
   * @returns HTTP 200 with rejection summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkReject = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkRejectSchema.parse(req.body) as BulkRejectInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkRejectDocuments(input, user.id);
    sendSuccess(res, {
      message: `Bulk reject completed. Rejected: ${result.rejected}, Failed: ${result.failed}`,
      data: result,
    });
  });

  /**
   * Bulk-creates document verification records with per-item error handling.
   * @param req - Express request with validated bulk import payload.
   * @param res - Express response.
   * @returns HTTP 200 with creation summary.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = bulkImportDocumentVerificationSchema.parse(req.body) as BulkImportDocumentVerificationInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateDocumentVerifications(input, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Counts document verifications by status.
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
   * Counts document verifications by document type.
   * @param req - Express request with document type query parameter.
   * @param res - Express response.
   * @returns HTTP 200 with count object.
   */
  public countByDocumentType = asyncHandler(async (_req: Request, res: Response) => {
    const { documentType } = _req.query;
    const count = await this.service.countByDocumentType(documentType as string);
    sendSuccess(res, { message: 'Count fetched successfully', data: { count } });
  });

  /**
   * Counts pending document verifications.
   * @param req - Express request.
   * @param res - Express response.
   * @returns HTTP 200 with pending count.
   */
  public countPendingReview = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countPendingReview();
    sendSuccess(res, { message: 'Pending review count fetched successfully', data: { count } });
  });

  // ─── ARCHIVE / RESTORE ───────────────────────────────────────────────────

  /**
   * Archives a document verification record.
   * @param req - Express request with document verification ID param.
   * @param res - Express response.
   * @returns HTTP 200 with archived document verification record.
   * @throws BadRequestError if record is already archived or deleted.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public archive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.archiveDocumentVerification(id, user.id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document verification record archived successfully', data: documentVerification });
  });

  /**
   * Restores an archived document verification record.
   * @param req - Express request with document verification ID param.
   * @param res - Express response.
   * @returns HTTP 200 with restored document verification record.
   * @throws BadRequestError if record is not archived.
   * @throws UnauthorizedError if user is not authenticated.
   */
  public restoreArchive = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const documentVerification = await this.service.restoreArchivedDocumentVerification(id, user.id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }
    sendSuccess(res, { message: 'Document verification record restored successfully', data: documentVerification });
  });
}

export const documentVerificationController = new DocumentVerificationController(documentVerificationService);
