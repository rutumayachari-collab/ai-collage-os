import { BaseRepository } from '../../shared/repositories/base.repository';
import { DocumentVerificationModel, type DocumentVerificationDocument, type DocumentVerificationSchemaType } from './documentVerification.model';

export class DocumentVerificationRepository extends BaseRepository<DocumentVerificationSchemaType> {
  constructor() {
    super(DocumentVerificationModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findByDocumentVerificationId(documentVerificationId: string): Promise<DocumentVerificationDocument | null> {
    return this.model.findOne({ documentVerificationId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicantId(applicantId: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ applicantId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicationNumber(applicationNumber: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ applicationNumber: applicationNumber.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByDocumentId(documentId: string): Promise<DocumentVerificationDocument | null> {
    return this.model.findOne({ documentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByDocumentType(documentType: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ documentType, deletedAt: { $exists: false } }).exec();
  }

  public async findByVerificationStatus(verificationStatus: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ verificationStatus, deletedAt: { $exists: false } }).exec();
  }

  public async findByUploadedBy(uploadedBy: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ uploadedBy, deletedAt: { $exists: false } }).exec();
  }

  public async findByPriority(priority: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ priority, deletedAt: { $exists: false } }).exec();
  }

  public async findByFraudResult(fraudResult: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ 'fraudDetection.result': fraudResult, deletedAt: { $exists: false } }).exec();
  }

  public async findByExpiryStatus(expiryStatus: string): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ 'documentExpiry.status': expiryStatus, deletedAt: { $exists: false } }).exec();
  }

  public async findReuploadPending(): Promise<DocumentVerificationDocument[]> {
    return this.model.find({ 'reuploadWorkflow.isCompleted': false, 'reuploadWorkflow.requested': true, deletedAt: { $exists: false } }).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listDocumentVerifications(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: DocumentVerificationDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchDocumentVerifications(searchQuery: string, page = 1, limit = 20): Promise<{ items: DocumentVerificationDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterDocumentVerifications(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: DocumentVerificationDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.verificationStatus) query.verificationStatus = filters.verificationStatus;
    if (filters.documentType) query.documentType = filters.documentType;
    if (filters.applicantId) query.applicantId = filters.applicantId;
    if (filters.applicationNumber) query.applicationNumber = filters.applicationNumber;
    if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy;
    if (filters.priority) query.priority = filters.priority;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.fraudResult) query['fraudDetection.result'] = filters.fraudResult;
    if (filters.expiryStatus) query['documentExpiry.status'] = filters.expiryStatus;

    if (filters.uploadedFrom || filters.uploadedTo) {
      query.uploadedAt = {};
      if (filters.uploadedFrom) (query.uploadedAt as Record<string, unknown>).$gte = filters.uploadedFrom;
      if (filters.uploadedTo) (query.uploadedAt as Record<string, unknown>).$lte = filters.uploadedTo;
    }

    return this.paginate(query, page, limit, sort);
  }

  // ─── Verification ─────────────────────────────────────────────────────────

  public async approve(documentVerificationId: string, approvedBy: string, remarks?: string): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      {
        $set: {
          verificationStatus: 'VERIFIED',
          updatedBy: approvedBy,
          updatedAt: new Date(),
          'manualReview.decision': 'APPROVE',
          'manualReview.reviewedBy': approvedBy,
          'manualReview.reviewedAt': new Date(),
          'manualReview.remarks': remarks?.trim(),
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async reject(documentVerificationId: string, rejectedBy: string, rejectionReason: string, requiresReupload = false, reuploadReason?: string): Promise<DocumentVerificationDocument | null> {
    const update: Record<string, unknown> = {
      verificationStatus: requiresReupload ? 'REQUIRES_REUPLOAD' : 'REJECTED',
      updatedBy: rejectedBy,
      updatedAt: new Date(),
      'manualReview.decision': requiresReupload ? 'REQUIRES_REUPLOAD' : 'REJECT',
      'manualReview.reviewedBy': rejectedBy,
      'manualReview.reviewedAt': new Date(),
      'manualReview.rejectionReason': rejectionReason.trim(),
      'manualReview.requiresReupload': requiresReupload,
    };

    if (requiresReupload && reuploadReason) {
      update['reuploadWorkflow.requested'] = true;
      update['reuploadWorkflow.requestedAt'] = new Date();
      update['reuploadWorkflow.requestedBy'] = rejectedBy;
      update['reuploadWorkflow.reason'] = reuploadReason.trim();
      update['reuploadWorkflow.deadline'] = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      update['reuploadWorkflow.isCompleted'] = false;
    }

    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $set: update },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async markUnderReview(documentVerificationId: string, reviewedBy: string): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      {
        $set: {
          verificationStatus: 'UNDER_REVIEW',
          updatedBy: reviewedBy,
          updatedAt: new Date(),
          'manualReview.reviewedBy': reviewedBy,
          'manualReview.reviewedAt': new Date(),
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Re-upload ────────────────────────────────────────────────────────────

  public async addVersion(documentVerificationId: string, version: DocumentVerificationSchemaType['versions'][0]): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      {
        $inc: { currentVersion: 1 },
        $push: { versions: version },
        $set: {
          verificationStatus: 'PENDING',
          updatedAt: new Date(),
          'reuploadWorkflow.reuploadedAt': new Date(),
          'reuploadWorkflow.reuploadedBy': version.uploadedBy,
          'reuploadWorkflow.isCompleted': true,
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── OCR ──────────────────────────────────────────────────────────────────

  public async updateOCRResult(documentVerificationId: string, ocrResult: DocumentVerificationSchemaType['ocrResult']): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $set: { ocrResult, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateFraudDetection(documentVerificationId: string, fraudDetection: DocumentVerificationSchemaType['fraudDetection']): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $set: { fraudDetection, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Timeline ─────────────────────────────────────────────────────────────

  public async addTimelineEvent(documentVerificationId: string, event: DocumentVerificationSchemaType['verificationTimeline'][0]): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $push: { verificationTimeline: event }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addVerifierNote(documentVerificationId: string, note: string): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $push: { verifierNotes: note }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── AI Metadata ──────────────────────────────────────────────────────────

  public async updateAIMetadata(documentVerificationId: string, aiMetadata: DocumentVerificationSchemaType['aiMetadata']): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $set: { aiMetadata, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Audit Trail ──────────────────────────────────────────────────────────

  public async addAuditTrail(documentVerificationId: string, auditEntry: DocumentVerificationSchemaType['auditTrail'][0]): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $push: { auditTrail: auditEntry }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Archive / Restore ─────────────────────────────────────────────────────

  public async archive(documentVerificationId: string, archivedBy: string): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $set: { isActive: false, archivedBy, archivedAt: new Date(), updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchive(documentVerificationId: string, restoredBy: string): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      documentVerificationId,
      { $set: { isActive: true, archivedBy: undefined, archivedAt: undefined, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  public async softDelete(documentVerificationId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: documentVerificationId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(documentVerificationId: string): Promise<DocumentVerificationDocument | null> {
    const result = await this.model.updateOne({ _id: documentVerificationId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(documentVerificationId).exec();
    }
    return null;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  public async countByStatus(status: string): Promise<number> {
    return this.count({ verificationStatus: status, deletedAt: { $exists: false } });
  }

  public async countByDocumentType(documentType: string): Promise<number> {
    return this.count({ documentType, deletedAt: { $exists: false } });
  }

  public async countByFraudResult(fraudResult: string): Promise<number> {
    return this.count({ 'fraudDetection.result': fraudResult, deletedAt: { $exists: false } });
  }

  public async countPendingReview(): Promise<number> {
    return this.count({ verificationStatus: 'PENDING', deletedAt: { $exists: false } });
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(documents: Partial<DocumentVerificationSchemaType>[]): Promise<DocumentVerificationDocument[]> {
    return this.model.insertMany(documents, { ordered: true }) as Promise<DocumentVerificationDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<DocumentVerificationSchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  public async bulkApprove(ids: string[], approvedBy: string, remarks?: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          verificationStatus: 'VERIFIED',
          updatedBy: approvedBy,
          updatedAt: new Date(),
          'manualReview.decision': 'APPROVE',
          'manualReview.reviewedBy': approvedBy,
          'manualReview.reviewedAt': new Date(),
          'manualReview.remarks': remarks?.trim(),
        },
      },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  public async bulkReject(ids: string[], rejectedBy: string, rejectionReason: string, requiresReupload = false, reuploadReason?: string): Promise<{ modifiedCount: number }> {
    const update: Record<string, unknown> = {
      verificationStatus: requiresReupload ? 'REQUIRES_REUPLOAD' : 'REJECTED',
      updatedBy: rejectedBy,
      updatedAt: new Date(),
      'manualReview.decision': requiresReupload ? 'REQUIRES_REUPLOAD' : 'REJECT',
      'manualReview.reviewedBy': rejectedBy,
      'manualReview.reviewedAt': new Date(),
      'manualReview.rejectionReason': rejectionReason.trim(),
      'manualReview.requiresReupload': requiresReupload,
    };

    if (requiresReupload && reuploadReason) {
      update['reuploadWorkflow.requested'] = true;
      update['reuploadWorkflow.requestedAt'] = new Date();
      update['reuploadWorkflow.requestedBy'] = rejectedBy;
      update['reuploadWorkflow.reason'] = reuploadReason.trim();
      update['reuploadWorkflow.deadline'] = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      update['reuploadWorkflow.isCompleted'] = false;
    }

    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: update },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  // ─── Existence ─────────────────────────────────────────────────────────────

  public async existsByDocumentVerificationId(documentVerificationId: string): Promise<boolean> {
    return this.exists({ documentVerificationId, deletedAt: { $exists: false } });
  }

  public async existsByDocumentId(documentId: string): Promise<boolean> {
    return this.exists({ documentId, deletedAt: { $exists: false } });
  }

  public async existsDuplicate(applicantId: string, documentType: string, fileUrl: string): Promise<boolean> {
    return this.exists({
      applicantId,
      documentType,
      fileUrl,
      deletedAt: { $exists: false },
    });
  }
}

export const documentVerificationRepository = new DocumentVerificationRepository();
