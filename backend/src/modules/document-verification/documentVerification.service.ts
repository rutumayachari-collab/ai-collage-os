import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { documentVerificationRepository } from './documentVerification.repository';
import type { DocumentVerificationDocument, DocumentVerificationSchemaType } from './documentVerification.model';
import type {
  CreateDocumentVerificationInput,
  UpdateDocumentVerificationInput,
  ApproveDocumentInput,
  RejectDocumentInput,
  ReuploadDocumentInput,
  DocumentVerificationQueryInput,
  BulkVerifyInput,
  BulkRejectInput,
  BulkImportDocumentVerificationInput,
} from './documentVerification.validator';

export class DocumentVerificationService {
  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new document verification record.
   * @param input - Validated create document verification payload.
   * @param createdBy - ID of the user creating the record.
   * @returns The created document verification record.
   * @throws ConflictError if document verification ID or duplicate document already exists.
   */
  public async createDocumentVerification(input: CreateDocumentVerificationInput, createdBy: string): Promise<DocumentVerificationDocument> {
    const normalizedDocumentVerificationId = `DV-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const normalizedApplicationNumber = input.applicationNumber.trim().toUpperCase();

    if (await documentVerificationRepository.existsByDocumentVerificationId(normalizedDocumentVerificationId)) {
      throw new ConflictError('A document verification record with this ID already exists');
    }

    const duplicateCheck = await documentVerificationRepository.existsDuplicate(input.applicantId, input.documentType, input.fileUrl);
    if (duplicateCheck) {
      throw new ConflictError('A duplicate document already exists for this applicant');
    }

    const versions = [{
      version: 1,
      documentId: input.documentId,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      uploadedAt: new Date(),
      uploadedBy: input.uploadedBy,
      changeReason: 'Initial upload',
      isCurrent: true,
    }];

    const timelineEvent: DocumentVerificationSchemaType['verificationTimeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'DOCUMENT_UPLOADED',
      description: 'Document uploaded for verification',
      performedBy: input.uploadedBy,
      performedByRole: 'APPLICANT',
      createdAt: new Date(),
    };

    const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
      action: 'CREATED',
      performedBy: createdBy,
      performedByRole: 'SYSTEM',
      timestamp: new Date(),
    };

    const documentVerification = await documentVerificationRepository.create({
      ...input,
      documentVerificationId: normalizedDocumentVerificationId,
      applicationNumber: normalizedApplicationNumber,
      verificationStatus: 'PENDING',
      priority: input.priority || 'MEDIUM',
      currentVersion: 1,
      versions,
      verificationTimeline: [timelineEvent],
      auditTrail: [auditEntry],
      createdBy,
      updatedBy: createdBy,
    });

    // TODO: Domain event hook - DocumentVerificationCreated
    // Publish DocumentVerificationCreated event for downstream consumers.

    // TODO: OCR hook - trigger OCR processing
    // SharedOCRService.processDocument(documentVerification.id);

    // TODO: AI hook - trigger fraud detection
    // SharedAiService.detectFraud(documentVerification.id);

    return documentVerification;
  }

  /**
   * Updates an existing document verification record.
   * @param id - Document verification document ID.
   * @param input - Partial update payload.
   * @param updatedBy - ID of the user performing the update.
   * @returns The updated document verification record, or null if not found.
   */
  public async updateDocumentVerification(id: string, input: UpdateDocumentVerificationInput, updatedBy: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot update a deleted document verification record');
    }

    const updated = await documentVerificationRepository.updateById(id, {
      ...input,
      updatedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
        action: 'UPDATED',
        performedBy: updatedBy,
        performedByRole: 'USER',
        timestamp: new Date(),
        changes: input as Record<string, unknown>,
      };
      await documentVerificationRepository.addAuditTrail(id, auditEntry);
    }

    return updated;
  }

  /**
   * Retrieves a document verification record by its internal MongoDB ID.
   * @param id - Document verification document ID.
   * @returns Document verification record or null.
   */
  public async getDocumentVerification(id: string): Promise<DocumentVerificationDocument | null> {
    return documentVerificationRepository.findById(id);
  }

  /**
   * Soft deletes a document verification record.
   * @param id - Document verification document ID.
   * @param deletedBy - ID of the user performing the deletion.
   */
  public async deleteDocumentVerification(id: string, deletedBy: string): Promise<void> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Document verification record is already deleted');
    }

    await documentVerificationRepository.softDelete(id, deletedBy);

    const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
      action: 'ARCHIVED',
      performedBy: deletedBy,
      performedByRole: 'USER',
      timestamp: new Date(),
    };
    await documentVerificationRepository.addAuditTrail(id, auditEntry);
  }

  /**
   * Restores a previously soft-deleted document verification record.
   * @param id - Document verification document ID.
   * @returns Restored document verification record or null.
   */
  public async restoreDocumentVerification(id: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (!documentVerification.deletedAt) {
      throw new BadRequestError('Document verification record is not deleted');
    }

    const restored = await documentVerificationRepository.restore(id);

    if (restored) {
      const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
        action: 'RESTORED',
        performedBy: 'SYSTEM',
        performedByRole: 'SYSTEM',
        timestamp: new Date(),
      };
      await documentVerificationRepository.addAuditTrail(id, auditEntry);
    }

    return restored;
  }

  // ─── VERIFICATION WORKFLOW ────────────────────────────────────────────────

  /**
   * Approves a document verification record.
   * @param id - Document verification document ID.
   * @param input - Approval payload.
   * @param approvedBy - ID of the user approving the document.
   * @returns Updated document verification record.
   */
  public async approveDocument(id: string, input: ApproveDocumentInput, approvedBy: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot approve a deleted document verification record');
    }

    if (documentVerification.verificationStatus === 'VERIFIED') {
      throw new BadRequestError('Document is already verified');
    }

    const updated = await documentVerificationRepository.approve(id, approvedBy, input.remarks);

    if (updated) {
      const timelineEvent: DocumentVerificationSchemaType['verificationTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'VERIFIED',
        description: 'Document approved',
        performedBy: approvedBy,
        performedByRole: 'VERIFIER',
        createdAt: new Date(),
      };
      await documentVerificationRepository.addTimelineEvent(id, timelineEvent);

      const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
        action: 'VERIFIED',
        performedBy: approvedBy,
        performedByRole: 'VERIFIER',
        timestamp: new Date(),
        changes: { verificationStatus: 'VERIFIED', remarks: input.remarks },
      };
      await documentVerificationRepository.addAuditTrail(id, auditEntry);

      // TODO: Domain event hook - DocumentApproved
      // Publish DocumentApproved event.

      // TODO: Notification hook - DocumentApproved
      // NotifyNotificationService.sendDocumentApproved(documentVerification.applicantId, documentVerification.documentId);
    }

    return updated;
  }

  /**
   * Rejects a document verification record.
   * @param id - Document verification document ID.
   * @param input - Rejection payload.
   * @param rejectedBy - ID of the user rejecting the document.
   * @returns Updated document verification record.
   */
  public async rejectDocument(id: string, input: RejectDocumentInput, rejectedBy: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot reject a deleted document verification record');
    }

    if (documentVerification.verificationStatus === 'REJECTED' || documentVerification.verificationStatus === 'REQUIRES_REUPLOAD') {
      throw new BadRequestError('Document is already rejected or requires re-upload');
    }

    const updated = await documentVerificationRepository.reject(id, rejectedBy, input.rejectionReason, input.requiresReupload, input.reuploadReason);

    if (updated) {
      const timelineEvent: DocumentVerificationSchemaType['verificationTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: input.requiresReupload ? 'REUPLOAD_REQUESTED' : 'REJECTED',
        description: `Document ${input.requiresReupload ? 'requires re-upload' : 'rejected'}: ${input.rejectionReason}`,
        performedBy: rejectedBy,
        performedByRole: 'VERIFIER',
        createdAt: new Date(),
      };
      await documentVerificationRepository.addTimelineEvent(id, timelineEvent);

      const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
        action: 'REJECTED',
        performedBy: rejectedBy,
        performedByRole: 'VERIFIER',
        timestamp: new Date(),
        changes: { verificationStatus: updated.verificationStatus, rejectionReason: input.rejectionReason, requiresReupload: input.requiresReupload },
      };
      await documentVerificationRepository.addAuditTrail(id, auditEntry);

      // TODO: Domain event hook - DocumentRejected
      // Publish DocumentRejected event.

      // TODO: Notification hook - DocumentRejected
      // NotifyNotificationService.sendDocumentRejected(documentVerification.applicantId, documentVerification.documentId, input.rejectionReason);
    }

    return updated;
  }

  /**
   * Marks a document as under review.
   * @param id - Document verification document ID.
   * @param reviewedBy - ID of the user marking the document as under review.
   * @returns Updated document verification record.
   */
  public async markUnderReview(id: string, reviewedBy: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot update a deleted document verification record');
    }

    const updated = await documentVerificationRepository.markUnderReview(id, reviewedBy);

    if (updated) {
      const timelineEvent: DocumentVerificationSchemaType['verificationTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'STATUS_CHANGED',
        description: 'Document marked as under review',
        performedBy: reviewedBy,
        performedByRole: 'VERIFIER',
        createdAt: new Date(),
      };
      await documentVerificationRepository.addTimelineEvent(id, timelineEvent);
    }

    return updated;
  }

  // ─── RE-UPLOAD WORKFLOW ───────────────────────────────────────────────────

  /**
   * Processes a re-uploaded document by adding a new version.
   * @param id - Document verification document ID.
   * @param input - Re-upload payload.
   * @param uploadedBy - ID of the user uploading the document.
   * @returns Updated document verification record.
   */
  public async reuploadDocument(id: string, input: ReuploadDocumentInput, uploadedBy: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot re-upload to a deleted document verification record');
    }

    if (!documentVerification.reuploadWorkflow.requested) {
      throw new BadRequestError('Re-upload has not been requested for this document');
    }

    if (documentVerification.reuploadWorkflow.deadline && new Date() > documentVerification.reuploadWorkflow.deadline) {
      throw new BadRequestError('Re-upload deadline has passed');
    }

    const newVersion: DocumentVerificationSchemaType['versions'][0] = {
      version: documentVerification.currentVersion + 1,
      documentId: documentVerification.documentId,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      uploadedAt: new Date(),
      uploadedBy,
      changeReason: input.changeReason?.trim() || 'Re-upload',
      isCurrent: true,
    };

    const updated = await documentVerificationRepository.addVersion(id, newVersion);

    if (updated) {
      const timelineEvent: DocumentVerificationSchemaType['verificationTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'REUPLOAD_REQUESTED',
        description: `Document re-uploaded (version ${newVersion.version})`,
        performedBy: uploadedBy,
        performedByRole: 'APPLICANT',
        createdAt: new Date(),
      };
      await documentVerificationRepository.addTimelineEvent(id, timelineEvent);

      const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
        action: 'REUPLOADED',
        performedBy: uploadedBy,
        performedByRole: 'APPLICANT',
        timestamp: new Date(),
        changes: { version: newVersion.version, fileUrl: input.fileUrl },
      };
      await documentVerificationRepository.addAuditTrail(id, auditEntry);

      // TODO: Domain event hook - DocumentReuploaded
      // Publish DocumentReuploaded event.

      // TODO: OCR hook - re-trigger OCR processing
      // SharedOCRService.processDocument(documentVerification.id);

      // TODO: AI hook - re-trigger fraud detection
      // SharedAiService.detectFraud(documentVerification.id);
    }

    return updated;
  }

  // ─── SEARCH / FILTER ─────────────────────────────────────────────────────

  /**
   * Lists document verifications with text search, filters, sorting, and pagination.
   * @param query - Search and filter inputs.
   * @returns Paginated document verification results.
   */
  public async listDocumentVerifications(query: DocumentVerificationQueryInput): Promise<{ items: DocumentVerificationDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
    if (query.documentType) filter.documentType = query.documentType;
    if (query.applicantId) filter.applicantId = query.applicantId;
    if (query.applicationNumber) filter.applicationNumber = query.applicationNumber;
    if (query.uploadedBy) filter.uploadedBy = query.uploadedBy;
    if (query.verifiedBy) filter['manualReview.reviewedBy'] = query.verifiedBy;
    if (query.priority) filter.priority = query.priority;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.fraudResult) filter['fraudDetection.result'] = query.fraudResult;
    if (query.expiryStatus) filter['documentExpiry.status'] = query.expiryStatus;

    if (query.uploadedFrom || query.uploadedTo) {
      filter.uploadedAt = {};
      if (query.uploadedFrom) (filter.uploadedAt as Record<string, unknown>).$gte = query.uploadedFrom;
      if (query.uploadedTo) (filter.uploadedAt as Record<string, unknown>).$lte = query.uploadedTo;
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return documentVerificationRepository.filterDocumentVerifications(filter, query.page, query.limit, sortOption);
  }

  /**
   * Performs a text search across indexed document verification fields.
   * @param searchQuery - Search text.
   * @param page - Page number.
   * @param limit - Page size.
   * @returns Paginated search results.
   */
  public async searchDocumentVerifications(searchQuery: string, page = 1, limit = 20): Promise<{ items: DocumentVerificationDocument[]; total: number }> {
    return documentVerificationRepository.searchDocumentVerifications(searchQuery, page, limit);
  }

  // ─── BULK OPERATIONS ──────────────────────────────────────────────────────

  /**
   * Bulk-verifies document verification records.
   * @param input - Bulk verify payload.
   * @param verifiedBy - ID of the user performing the verification.
   * @returns Summary of verified and failed counts.
   */
  public async bulkVerifyDocuments(input: BulkVerifyInput, verifiedBy: string): Promise<{ verified: number; failed: number }> {
    let verified = 0;
    let failed = 0;

    for (const id of input.documentVerificationIds) {
      try {
        const result = await this.approveDocument(id, { remarks: input.remarks }, verifiedBy);
        if (result) {
          verified++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    // TODO: Domain event hook - BulkDocumentsVerified
    // Publish BulkDocumentsVerified event with summary counts.

    return { verified, failed };
  }

  /**
   * Bulk-rejects document verification records.
   * @param input - Bulk reject payload.
   * @param rejectedBy - ID of the user performing the rejection.
   * @returns Summary of rejected and failed counts.
   */
  public async bulkRejectDocuments(input: BulkRejectInput, rejectedBy: string): Promise<{ rejected: number; failed: number }> {
    let rejected = 0;
    let failed = 0;

    for (const id of input.documentVerificationIds) {
      try {
        const result = await this.rejectDocument(id, { rejectionReason: input.rejectionReason, requiresReupload: input.requiresReupload, reuploadReason: input.reuploadReason }, rejectedBy);
        if (result) {
          rejected++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    // TODO: Domain event hook - BulkDocumentsRejected
    // Publish BulkDocumentsRejected event with summary counts.

    return { rejected, failed };
  }

  /**
   * Bulk-creates document verification records with per-item error handling.
   * @param input - Bulk import payload.
   * @param createdBy - ID of the user performing the bulk creation.
   * @returns Summary of created, failed, and error messages.
   */
  public async bulkCreateDocumentVerifications(input: BulkImportDocumentVerificationInput, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const documentData of input.documents) {
      try {
        await this.createDocumentVerification(documentData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${documentData.documentId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  // ─── ARCHIVE / RESTORE ────────────────────────────────────────────────────

  /**
   * Archives a document verification record.
   * @param id - Document verification document ID.
   * @param archivedBy - ID of the user archiving the record.
   * @returns Archived document verification record.
   */
  public async archiveDocumentVerification(id: string, archivedBy: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot archive a deleted document verification record');
    }

    if (!documentVerification.isActive) {
      throw new BadRequestError('Document verification record is already archived');
    }

    const archived = await documentVerificationRepository.archive(id, archivedBy);

    if (archived) {
      const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
        action: 'ARCHIVED',
        performedBy: archivedBy,
        performedByRole: 'USER',
        timestamp: new Date(),
      };
      await documentVerificationRepository.addAuditTrail(id, auditEntry);

      // TODO: Domain event hook - DocumentVerificationArchived
      // Publish DocumentVerificationArchived event.
    }

    return archived;
  }

  /**
   * Restores an archived document verification record.
   * @param id - Document verification document ID.
   * @param restoredBy - ID of the user restoring the record.
   * @returns Restored document verification record.
   */
  public async restoreArchivedDocumentVerification(id: string, restoredBy: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.isActive) {
      throw new BadRequestError('Only archived document verification records can be restored');
    }

    const restored = await documentVerificationRepository.restoreArchive(id, restoredBy);

    if (restored) {
      const auditEntry: DocumentVerificationSchemaType['auditTrail'][0] = {
        action: 'RESTORED',
        performedBy: restoredBy,
        performedByRole: 'USER',
        timestamp: new Date(),
      };
      await documentVerificationRepository.addAuditTrail(id, auditEntry);

      // TODO: Domain event hook - DocumentVerificationRestored
      // Publish DocumentVerificationRestored event.
    }

    return restored;
  }

  // ─── STATISTICS ───────────────────────────────────────────────────────────

  /**
   * Counts document verifications by status.
   * @param status - Verification status.
   * @returns Count of document verifications with the given status.
   */
  public async countByStatus(status: string): Promise<number> {
    return documentVerificationRepository.countByStatus(status);
  }

  /**
   * Counts document verifications by document type.
   * @param documentType - Document type.
   * @returns Count of document verifications with the given document type.
   */
  public async countByDocumentType(documentType: string): Promise<number> {
    return documentVerificationRepository.countByDocumentType(documentType);
  }

  /**
   * Counts document verifications by fraud detection result.
   * @param fraudResult - Fraud detection result.
   * @returns Count of document verifications with the given fraud result.
   */
  public async countByFraudResult(fraudResult: string): Promise<number> {
    return documentVerificationRepository.countByFraudResult(fraudResult);
  }

  /**
   * Counts document verifications pending review.
   * @returns Count of pending document verifications.
   */
  public async countPendingReview(): Promise<number> {
    return documentVerificationRepository.countPendingReview();
  }

  // ─── AI HOOKS ─────────────────────────────────────────────────────────────

  /**
   * Triggers OCR processing for a document.
   * @param id - Document verification document ID.
   * @returns Updated document verification record.
   */
  public async triggerOCR(id: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot process OCR for a deleted document verification record');
    }

    await documentVerificationRepository.updateOCRResult(id, {
      status: 'PROCESSING',
      processedAt: new Date(),
      fields: documentVerification.ocrResult.fields,
    });

    // TODO: OCR service hook - processDocument
    // SharedOCRService.processDocument(id);

    return documentVerificationRepository.findById(id);
  }

  /**
   * Triggers fraud detection for a document.
   * @param id - Document verification document ID.
   * @returns Updated document verification record.
   */
  public async triggerFraudDetection(id: string): Promise<DocumentVerificationDocument | null> {
    const documentVerification = await documentVerificationRepository.findById(id);
    if (!documentVerification) {
      throw new NotFoundError('Document verification record not found');
    }

    if (documentVerification.deletedAt) {
      throw new BadRequestError('Cannot run fraud detection on a deleted document verification record');
    }

    // TODO: AI service hook - detectFraud
    // SharedAiService.detectFraud(id);

    return documentVerificationRepository.findById(id);
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  private cleanEmptyStrings(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      if (value instanceof Date) {
        cleaned[key] = value;
        continue;
      }
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => (typeof item === 'object' && item !== null && !(item instanceof Date) ? this.cleanEmptyStrings(item as Record<string, unknown>) : item));
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = this.cleanEmptyStrings(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}

export const documentVerificationService = new DocumentVerificationService();
