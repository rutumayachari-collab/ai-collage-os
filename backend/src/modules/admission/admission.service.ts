import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { admissionRepository } from './admission.repository';
import type { AdmissionDocument, AdmissionSchemaType } from './admission.model';
import type {
  CreateAdmissionInput,
  UpdateAdmissionInput,
  AdmissionQueryInput,
  ApprovalActionInput,
  BulkApprovalInput,
  BulkImportAdmissionInput,
} from './admission.validator';

export class AdmissionService {
  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new admission record.
   * @param input - Validated create admission payload.
   * @param createdBy - ID of the user creating the record.
   * @returns The created admission record.
   * @throws ConflictError if admission ID or duplicate applicant already exists.
   */
  public async createAdmission(input: CreateAdmissionInput, createdBy: string): Promise<AdmissionDocument> {
    const normalizedAdmissionId = `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const normalizedApplicationNumber = input.applicationNumber.trim().toUpperCase();

    if (await admissionRepository.existsByAdmissionId(normalizedAdmissionId)) {
      throw new ConflictError('An admission record with this ID already exists');
    }

    const existingAdmission = await admissionRepository.findByApplicantId(input.applicantId);
    if (existingAdmission) {
      throw new ConflictError('An admission record already exists for this applicant');
    }

    const timelineEvent: AdmissionSchemaType['admissionTimeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'APPLICATION_SUBMITTED',
      description: 'Admission record created',
      performedBy: createdBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    const auditEntry: AdmissionSchemaType['auditTrail'][0] = {
      action: 'CREATED',
      performedBy: createdBy,
      performedByRole: 'ADMIN',
      timestamp: new Date(),
    };

    const admission = await admissionRepository.create({
      ...input,
      admissionId: normalizedAdmissionId,
      applicationNumber: normalizedApplicationNumber,
      admissionTimeline: [timelineEvent],
      auditTrail: [auditEntry],
      createdBy,
      updatedBy: createdBy,
    });

    // TODO: Domain event hook - AdmissionCreated
    // Publish AdmissionCreated event for downstream consumers.

    // TODO: Notification hook - AdmissionCreated
    // NotifyNotificationService.sendAdmissionCreated(admission.id, createdBy);

    // TODO: AI service hook
    // SharedAiService.analyzeAdmission(admission.id);

    return admission;
  }

  /**
   * Updates an existing admission record.
   * @param id - Admission document ID.
   * @param input - Partial update payload.
   * @param updatedBy - ID of the user performing the update.
   * @returns The updated admission record, or null if not found.
   */
  public async updateAdmission(id: string, input: UpdateAdmissionInput, updatedBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findById(id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot update a deleted admission record');
    }

    const updated = await admissionRepository.updateById(id, {
      ...input,
      updatedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const auditEntry: AdmissionSchemaType['auditTrail'][0] = {
        action: 'UPDATED',
        performedBy: updatedBy,
        performedByRole: 'USER',
        timestamp: new Date(),
        changes: input as Record<string, unknown>,
      };
      await admissionRepository.addAuditTrail(id, auditEntry);
    }

    return updated;
  }

  /**
   * Retrieves an admission record by its internal MongoDB ID.
   * @param id - Admission document ID.
   * @returns Admission record or null.
   */
  public async getAdmission(id: string): Promise<AdmissionDocument | null> {
    return admissionRepository.findById(id);
  }

  /**
   * Soft deletes an admission record.
   * @param id - Admission document ID.
   * @param deletedBy - ID of the user performing the deletion.
   */
  public async deleteAdmission(id: string, deletedBy: string): Promise<void> {
    const admission = await admissionRepository.findById(id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Admission record is already deleted');
    }

    await admissionRepository.softDelete(id, deletedBy);

    const auditEntry: AdmissionSchemaType['auditTrail'][0] = {
      action: 'ARCHIVED',
      performedBy: deletedBy,
      performedByRole: 'USER',
      timestamp: new Date(),
    };
    await admissionRepository.addAuditTrail(id, auditEntry);
  }

  /**
   * Restores a previously soft-deleted admission record.
   * @param id - Admission document ID.
   * @returns Restored admission record or null.
   */
  public async restoreAdmission(id: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findById(id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (!admission.deletedAt) {
      throw new BadRequestError('Admission record is not deleted');
    }

    const restored = await admissionRepository.restore(id);

    if (restored) {
      const auditEntry: AdmissionSchemaType['auditTrail'][0] = {
        action: 'RESTORED',
        performedBy: 'SYSTEM',
        performedByRole: 'SYSTEM',
        timestamp: new Date(),
      };
      await admissionRepository.addAuditTrail(id, auditEntry);
    }

    return restored;
  }

  // ─── APPROVAL WORKFLOW ────────────────────────────────────────────────────

  /**
   * Processes an approval action for an admission record.
   * @param admissionId - Admission document ID.
   * @param action - Approval action payload.
   * @param reviewedBy - ID of the user reviewing the admission.
   * @returns Updated admission record.
   * @throws BadRequestError on invalid transitions.
   */
  public async processApproval(admissionId: string, action: ApprovalActionInput, reviewedBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findByAdmissionId(admissionId);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot process approval for a deleted admission record');
    }

    const currentStatus = admission.admissionStatus;
    if (currentStatus !== 'UNDER_REVIEW' && currentStatus !== 'PENDING') {
      throw new BadRequestError('Admission is not in a reviewable state');
    }

    const approvalRecord: AdmissionSchemaType['approvalWorkflow']['approvals'][0] = {
      level: admission.approvalWorkflow.currentLevel,
      decision: action.decision,
      reviewedBy,
      reviewedAt: new Date(),
      remarks: action.remarks?.trim(),
      conditions: action.conditions,
    };

    await admissionRepository.addApprovalRecord(admission.id, approvalRecord);

    let newStatus = admission.admissionStatus;
    if (action.decision === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (action.decision === 'REJECTED') {
      newStatus = 'REJECTED';
    } else if (action.decision === 'HOLD') {
      newStatus = 'HOLD';
    } else if (action.decision === 'CONDITIONAL') {
      newStatus = 'CONDITIONAL';
    }

    const updated = await admissionRepository.updateById(admission.id, {
      admissionStatus: newStatus,
      updatedBy: reviewedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const timelineEvent: AdmissionSchemaType['admissionTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: action.decision === 'APPROVED' ? 'ADMISSION_APPROVED' : 'ADMISSION_REJECTED',
        description: `Admission ${action.decision.toLowerCase()}${action.remarks ? `. Remarks: ${action.remarks}` : ''}`,
        performedBy: reviewedBy,
        performedByRole: 'ADMISSION_HEAD',
        createdAt: new Date(),
      };
      await admissionRepository.addTimelineEvent(admission.id, timelineEvent);

      const auditEntry: AdmissionSchemaType['auditTrail'][0] = {
        action: action.decision === 'APPROVED' ? 'ADMISSION_APPROVED' : 'ADMISSION_REJECTED',
        performedBy: reviewedBy,
        performedByRole: 'ADMISSION_HEAD',
        timestamp: new Date(),
        changes: { admissionStatus: newStatus, remarks: action.remarks },
      };
      await admissionRepository.addAuditTrail(admission.id, auditEntry);

      // TODO: Domain event hook - AdmissionApproved/Rejected
      // Publish AdmissionApproved or AdmissionRejected event.

      // TODO: Notification hook
      // NotifyNotificationService.sendAdmissionDecision(admission.applicantId, newStatus);
    }

    return updated;
  }

  // ─── SEAT ALLOCATION ──────────────────────────────────────────────────────

  /**
   * Allocates a seat for an admission record.
   * @param admissionId - Admission document ID.
   * @param seatAllocation - Seat allocation details.
   * @param updatedBy - ID of the user allocating the seat.
   * @returns Updated admission record.
   */
  public async allocateSeat(admissionId: string, seatAllocation: AdmissionSchemaType['seatAllocation'], updatedBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findByAdmissionId(admissionId);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot allocate seat for a deleted admission record');
    }

    if (admission.admissionStatus !== 'APPROVED' && seatAllocation.status === 'CONFIRMED') {
      throw new BadRequestError('Only approved admissions can have seats confirmed');
    }

    const updated = await admissionRepository.updateSeatAllocation(admission.id, seatAllocation);

    if (updated && seatAllocation.status === 'CONFIRMED') {
      const timelineEvent: AdmissionSchemaType['admissionTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'SEAT_ALLOCATED',
        description: `Seat allocated: ${seatAllocation.seatNumber || 'TBD'}`,
        performedBy: updatedBy,
        performedByRole: 'ADMISSION_HEAD',
        createdAt: new Date(),
      };
      await admissionRepository.addTimelineEvent(admission.id, timelineEvent);

      // TODO: Domain event hook - SeatAllocated
      // Publish SeatAllocated event.

      // TODO: Notification hook - SeatAllocated
      // NotifyNotificationService.sendSeatAllocated(admission.applicantId, seatAllocation.seatNumber);
    }

    return updated;
  }

  // ─── OFFER LETTER ─────────────────────────────────────────────────────────

  /**
   * Generates an offer letter for an admission record.
   * @param admissionId - Admission document ID.
   * @param offerLetter - Offer letter details.
   * @param updatedBy - ID of the user generating the offer letter.
   * @returns Updated admission record.
   */
  public async generateOfferLetter(admissionId: string, offerLetter: AdmissionSchemaType['offerLetter'], updatedBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findByAdmissionId(admissionId);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot generate offer letter for a deleted admission record');
    }

    if (admission.admissionStatus !== 'APPROVED') {
      throw new BadRequestError('Only approved admissions can receive offer letters');
    }

    const updated = await admissionRepository.updateOfferLetter(admission.id, offerLetter);

    if (updated) {
      const timelineEvent: AdmissionSchemaType['admissionTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'OFFER_LETTER_GENERATED',
        description: 'Offer letter generated',
        performedBy: updatedBy,
        performedByRole: 'ADMISSION_HEAD',
        createdAt: new Date(),
      };
      await admissionRepository.addTimelineEvent(admission.id, timelineEvent);

      // TODO: Domain event hook - OfferLetterGenerated
      // Publish OfferLetterGenerated event.

      // TODO: Notification hook - OfferLetterGenerated
      // NotifyNotificationService.sendOfferLetterGenerated(admission.applicantId, offerLetter.documentId);
    }

    return updated;
  }

  // ─── ADMISSION LETTER ─────────────────────────────────────────────────────

  /**
   * Generates an admission letter for an admission record.
   * @param admissionId - Admission document ID.
   * @param admissionLetter - Admission letter details.
   * @param updatedBy - ID of the user generating the admission letter.
   * @returns Updated admission record.
   */
  public async generateAdmissionLetter(admissionId: string, admissionLetter: AdmissionSchemaType['admissionLetter'], updatedBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findByAdmissionId(admissionId);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot generate admission letter for a deleted admission record');
    }

    if (admission.admissionStatus !== 'ADMITTED') {
      throw new BadRequestError('Only admitted students can receive admission letters');
    }

    const updated = await admissionRepository.updateAdmissionLetter(admission.id, admissionLetter);

    if (updated) {
      const timelineEvent: AdmissionSchemaType['admissionTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'STUDENT_CREATED',
        description: 'Admission letter generated',
        performedBy: updatedBy,
        performedByRole: 'ADMISSION_HEAD',
        createdAt: new Date(),
      };
      await admissionRepository.addTimelineEvent(admission.id, timelineEvent);

      // TODO: Domain event hook - AdmissionLetterGenerated
      // Publish AdmissionLetterGenerated event.

      // TODO: Notification hook - AdmissionLetterGenerated
      // NotifyNotificationService.sendAdmissionLetterGenerated(admission.applicantId, admissionLetter.documentId);
    }

    return updated;
  }

  // ─── FEE TRIGGER ──────────────────────────────────────────────────────────

  /**
   * Triggers fee payment for an admission record.
   * @param admissionId - Admission document ID.
   * @param feeTrigger - Fee trigger details.
   * @param triggeredBy - ID of the user triggering the fee.
   * @returns Updated admission record.
   */
  public async triggerFee(admissionId: string, feeTrigger: AdmissionSchemaType['feeTrigger'], triggeredBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findByAdmissionId(admissionId);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot trigger fee for a deleted admission record');
    }

    if (admission.admissionStatus !== 'APPROVED' && admission.admissionStatus !== 'ADMITTED') {
      throw new BadRequestError('Fee can only be triggered for approved or admitted students');
    }

    const updated = await admissionRepository.updateFeeTrigger(admission.id, {
      ...feeTrigger,
      triggered: true,
      triggeredAt: new Date(),
      triggeredBy,
    });

    if (updated) {
      const timelineEvent: AdmissionSchemaType['admissionTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'FEE_PAID',
        description: `Fee triggered. Total: ${feeTrigger.totalFee}`,
        performedBy: triggeredBy,
        performedByRole: 'ADMIN',
        createdAt: new Date(),
      };
      await admissionRepository.addTimelineEvent(admission.id, timelineEvent);

      // TODO: Domain event hook - FeeTriggered
      // Publish FeeTriggered event.

      // TODO: Notification hook - FeeTriggered
      // NotifyNotificationService.sendFeeTriggered(admission.applicantId, feeTrigger.totalFee);
    }

    return updated;
  }

  // ─── WAITING LIST ─────────────────────────────────────────────────────────

  /**
   * Adds an admission record to the waiting list.
   * @param admissionId - Admission document ID.
   * @param waitingListEntry - Waiting list entry details.
   * @param addedBy - ID of the user adding to the waiting list.
   * @returns Updated admission record.
   */
  public async addToWaitingList(admissionId: string, waitingListEntry: AdmissionSchemaType['waitingList'][0], addedBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findByAdmissionId(admissionId);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot add deleted admission record to waiting list');
    }

    if (admission.admissionStatus === 'WAITLISTED') {
      throw new BadRequestError('Admission is already in waiting list');
    }

    const updated = await admissionRepository.updateById(admission.id, {
      admissionStatus: 'WAITLISTED',
      waitingList: [...admission.waitingList, waitingListEntry],
      updatedBy: addedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const timelineEvent: AdmissionSchemaType['admissionTimeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'STATUS_CHANGED',
        description: 'Added to waiting list',
        performedBy: addedBy,
        performedByRole: 'ADMISSION_HEAD',
        createdAt: new Date(),
      };
      await admissionRepository.addTimelineEvent(admission.id, timelineEvent);
    }

    return updated;
  }

  // ─── SEARCH / FILTER ─────────────────────────────────────────────────────

  /**
   * Lists admissions with text search, filters, sorting, and pagination.
   * @param query - Search and filter inputs.
   * @returns Paginated admission results.
   */
  public async listAdmissions(query: AdmissionQueryInput): Promise<{ items: AdmissionDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.admissionStatus) filter.admissionStatus = query.admissionStatus;
    if (query.applicantId) filter.applicantId = query.applicantId;
    if (query.applicationNumber) filter.applicationNumber = query.applicationNumber;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return admissionRepository.filterAdmissions(filter, query.page, query.limit, sortOption);
  }

  /**
   * Performs a text search across indexed admission fields.
   * @param searchQuery - Search text.
   * @param page - Page number.
   * @param limit - Page size.
   * @returns Paginated search results.
   */
  public async searchAdmissions(searchQuery: string, page = 1, limit = 20): Promise<{ items: AdmissionDocument[]; total: number }> {
    return admissionRepository.searchAdmissions(searchQuery, page, limit);
  }

  // ─── BULK OPERATIONS ──────────────────────────────────────────────────────

  /**
   * Bulk-approves or bulk-rejects admission records.
   * @param input - Bulk approval payload.
   * @param processedBy - ID of the user processing the bulk action.
   * @returns Summary of processed and failed counts.
   */
  public async bulkProcessApproval(input: BulkApprovalInput, processedBy: string): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    for (const admissionId of input.admissionIds) {
      try {
        const result = await this.processApproval(admissionId, { decision: input.decision, remarks: input.remarks, conditions: input.conditions }, processedBy);
        if (result) {
          processed++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    // TODO: Domain event hook - BulkAdmissionProcessed
    // Publish BulkAdmissionProcessed event with summary counts.

    return { processed, failed };
  }

  /**
   * Bulk-creates admission records with per-item error handling.
   * @param input - Bulk import payload.
   * @param createdBy - ID of the user performing the bulk creation.
   * @returns Summary of created, failed, and error messages.
   */
  public async bulkCreateAdmissions(input: BulkImportAdmissionInput, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const admissionData of input.admissions) {
      try {
        await this.createAdmission(admissionData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${admissionData.applicationNumber || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  // ─── ARCHIVE / RESTORE ────────────────────────────────────────────────────

  /**
   * Archives an admission record.
   * @param id - Admission document ID.
   * @param archivedBy - ID of the user archiving the record.
   * @returns Archived admission record.
   */
  public async archiveAdmission(id: string, archivedBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findById(id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.deletedAt) {
      throw new BadRequestError('Cannot archive a deleted admission record');
    }

    if (!admission.isActive) {
      throw new BadRequestError('Admission record is already archived');
    }

    const archived = await admissionRepository.archive(id, archivedBy);

    if (archived) {
      const auditEntry: AdmissionSchemaType['auditTrail'][0] = {
        action: 'ARCHIVED',
        performedBy: archivedBy,
        performedByRole: 'USER',
        timestamp: new Date(),
      };
      await admissionRepository.addAuditTrail(id, auditEntry);

      // TODO: Domain event hook - AdmissionArchived
      // Publish AdmissionArchived event.
    }

    return archived;
  }

  /**
   * Restores an archived admission record.
   * @param id - Admission document ID.
   * @param restoredBy - ID of the user restoring the record.
   * @returns Restored admission record.
   */
  public async restoreArchivedAdmission(id: string, restoredBy: string): Promise<AdmissionDocument | null> {
    const admission = await admissionRepository.findById(id);
    if (!admission) {
      throw new NotFoundError('Admission record not found');
    }

    if (admission.isActive) {
      throw new BadRequestError('Only archived admission records can be restored');
    }

    const restored = await admissionRepository.restoreArchive(id, restoredBy);

    if (restored) {
      const auditEntry: AdmissionSchemaType['auditTrail'][0] = {
        action: 'RESTORED',
        performedBy: restoredBy,
        performedByRole: 'USER',
        timestamp: new Date(),
      };
      await admissionRepository.addAuditTrail(id, auditEntry);

      // TODO: Domain event hook - AdmissionRestored
      // Publish AdmissionRestored event.
    }

    return restored;
  }

  // ─── STATISTICS ───────────────────────────────────────────────────────────

  /**
   * Counts admissions by status.
   * @param status - Admission status.
   * @returns Count of admissions with the given status.
   */
  public async countByStatus(status: string): Promise<number> {
    return admissionRepository.countByStatus(status);
  }

  /**
   * Counts admissions pending approval.
   * @returns Count of pending approvals.
   */
  public async countPendingApproval(): Promise<number> {
    return admissionRepository.countPendingApproval();
  }

  /**
   * Counts approved admissions.
   * @returns Count of approved admissions.
   */
  public async countApproved(): Promise<number> {
    return admissionRepository.countApproved();
  }

  /**
   * Counts rejected admissions.
   * @returns Count of rejected admissions.
   */
  public async countRejected(): Promise<number> {
    return admissionRepository.countRejected();
  }

  /**
   * Counts waitlisted admissions.
   * @returns Count of waitlisted admissions.
   */
  public async countWaitlisted(): Promise<number> {
    return admissionRepository.countWaitlisted();
  }

  /**
   * Counts admitted students.
   * @returns Count of admitted students.
   */
  public async countAdmitted(): Promise<number> {
    return admissionRepository.countAdmitted();
  }
}

export const admissionService = new AdmissionService();
