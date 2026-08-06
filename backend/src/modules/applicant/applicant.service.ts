import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { applicantRepository } from './applicant.repository';
import type { ApplicantDocument, ApplicantSchemaType } from './applicant.model';
import type { ApplicantStatus, Interview, InterviewRecommendation } from './applicant.types';
import type {
  CreateApplicantInput,
  UpdateApplicantInput,
  ApplicantQueryInput,
  BulkImportInput,
} from './applicant.validator';

/**
 * Valid applicant workflow transitions.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['DOCUMENTS_VERIFIED', 'REJECTED', 'ARCHIVED'],
  DOCUMENTS_VERIFIED: ['ELIGIBLE', 'REJECTED', 'ARCHIVED'],
  ELIGIBLE: ['INTERVIEW_SCHEDULED', 'REJECTED', 'ARCHIVED'],
  INTERVIEW_SCHEDULED: ['INTERVIEWED', 'REJECTED', 'ARCHIVED'],
  INTERVIEWED: ['SELECTED', 'REJECTED', 'ARCHIVED'],
  SELECTED: ['OFFERED', 'REJECTED', 'ARCHIVED'],
  OFFERED: ['ADMITTED', 'REJECTED', 'ARCHIVED'],
  ADMITTED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED'],
  ARCHIVED: ['NEW'],
};

export class ApplicantService {
  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new applicant with normalized identity, personal, academic, and admission data.
   * @param input - Validated create applicant payload.
   * @param createdBy - ID of the user creating the applicant.
   * @returns The created applicant document.
   * @throws ConflictError if applicationNumber or duplicate contact details already exist.
   */
  public async createApplicant(input: CreateApplicantInput, createdBy: string): Promise<ApplicantDocument> {
    const normalizedApplicationNumber = input.applicationNumber.trim().toUpperCase();
    const normalizedFullName = input.fullName.trim();
    const normalizedFirstName = input.firstName.trim();
    const normalizedLastName = input.lastName.trim();
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedPhone = input.phone.trim();

    if (await applicantRepository.existsByApplicationNumber(normalizedApplicationNumber)) {
      throw new ConflictError('An applicant with this application number already exists');
    }

    const duplicateCheck = await applicantRepository.existsDuplicate(normalizedFullName, normalizedEmail, normalizedPhone);
    if (duplicateCheck) {
      throw new ConflictError('An applicant with this name, email, or phone already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const timelineEvent: ApplicantSchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'APPLICATION_SUBMITTED',
      description: 'Application submitted',
      performedBy: createdBy,
      createdAt: new Date(),
    };

    const applicant = await applicantRepository.create({
      ...cleanedInput,
      applicationNumber: normalizedApplicationNumber,
      fullName: normalizedFullName,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      phone: normalizedPhone,
      timeline: [timelineEvent],
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });

    // TODO: Domain event hook - ApplicantCreated
    // Publish ApplicantCreated event for downstream consumers such as notification service and analytics.

    // TODO: Notification hook - ApplicantCreated
    // NotifyNotificationService.sendApplicantCreated(applicant.id, createdBy);

    // TODO: AI service hook
    // SharedAiService.analyzeApplicant(applicant.id);

    return applicant;
  }

  /**
   * Updates an existing applicant and appends an audit timeline event.
   * @param id - Applicant document ID.
   * @param input - Partial update payload.
   * @param updatedBy - ID of the user performing the update.
   * @returns The updated applicant document, or null if not found.
   */
  public async updateApplicant(id: string, input: UpdateApplicantInput, updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot update a deleted applicant');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await applicantRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'NOTE_ADDED',
        description: 'Applicant updated',
        performedBy: updatedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(id, timelineEvent);

      // TODO: Domain event hook - ApplicantUpdated
      // Publish ApplicantUpdated event.

      // TODO: Notification hook - ApplicantUpdated
      // NotifyNotificationService.sendApplicantUpdated(applicant.id, updatedBy);
    }

    return updated;
  }

  /**
   * Retrieves an applicant by its internal MongoDB ID.
   * @param id - Applicant document ID.
   * @returns Applicant document or null.
   */
  public async getApplicant(id: string): Promise<ApplicantDocument | null> {
    return applicantRepository.findById(id);
  }

  /**
   * Retrieves an applicant by its business applicantId.
   * @param applicantId - Business applicant identifier.
   * @returns Applicant document or null.
   */
  public async getApplicantByApplicantId(applicantId: string): Promise<ApplicantDocument | null> {
    return applicantRepository.findByApplicantId(applicantId);
  }

  /**
   * Retrieves an applicant by its applicationNumber.
   * @param applicationNumber - Business application number.
   * @returns Applicant document or null.
   */
  public async getApplicantByApplicationNumber(applicationNumber: string): Promise<ApplicantDocument | null> {
    return applicantRepository.findByApplicationNumber(applicationNumber);
  }

  /**
   * Soft deletes an applicant after guarding against already deleted or archived records.
   * @param id - Applicant document ID.
   * @param deletedBy - ID of the user performing the deletion.
   */
  public async deleteApplicant(id: string, deletedBy: string): Promise<void> {
    const applicant = await applicantRepository.findById(id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Applicant is already deleted');
    }

    if (applicant.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot delete an archived applicant. Restore it first.');
    }

    await applicantRepository.softDelete(id, deletedBy);

    // TODO: Domain event hook - ApplicantDeleted
    // Publish ApplicantDeleted event.

    // TODO: Notification hook - ApplicantDeleted
    // NotifyNotificationService.sendApplicantDeleted(applicant.id, deletedBy);
  }

  /**
   * Restores a previously soft-deleted applicant.
   * @param id - Applicant document ID.
   * @returns Restored applicant document or null.
   */
  public async restoreApplicant(id: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (!applicant.deletedAt) {
      throw new BadRequestError('Applicant is not deleted');
    }

    const restored = await applicantRepository.restore(id);

    if (restored) {
      // TODO: Domain event hook - ApplicantRestored
      // Publish ApplicantRestored event.

      // TODO: Notification hook - ApplicantRestored
      // NotifyNotificationService.sendApplicantRestored(restored.id);
    }

    return restored;
  }

  // ─── DUPLICATE DETECTION ──────────────────────────────────────────────────

  /**
   * Checks whether an applicant already exists by email or phone.
   * @param email - Contact email.
   * @param phone - Contact phone.
   * @returns Existing applicant document if a duplicate is found, otherwise null.
   */
  public async checkDuplicateApplicant(email: string, phone: string): Promise<ApplicantDocument | null> {
    const byEmail = await applicantRepository.findByEmail(email);
    if (byEmail) return byEmail;

    const byPhone = await applicantRepository.findByPhone(phone);
    if (byPhone) return byPhone;

    return null;
  }

  /**
   * Merges a duplicate applicant into a primary applicant and soft-deletes the duplicate.
   * @param primaryId - Target applicant ID.
   * @param duplicateId - Source applicant ID to merge and delete.
   * @param mergedBy - ID of the user performing the merge.
   * @returns Updated primary applicant document.
   * @throws NotFoundError or BadRequestError on invalid merge targets.
   */
  public async mergeDuplicateApplicant(primaryId: string, duplicateId: string, mergedBy: string): Promise<ApplicantDocument | null> {
    const [primary, duplicate] = await Promise.all([
      applicantRepository.findById(primaryId),
      applicantRepository.findById(duplicateId),
    ]);

    if (!primary) {
      throw new NotFoundError('Primary applicant not found');
    }

    if (!duplicate) {
      throw new NotFoundError('Duplicate applicant not found');
    }

    if (primary.deletedAt || duplicate.deletedAt) {
      throw new BadRequestError('Cannot merge deleted applicants');
    }

    if (primary.id === duplicate.id) {
      throw new BadRequestError('Cannot merge an applicant with itself');
    }

    const timelineEvent: ApplicantSchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'NOTE_ADDED',
      description: `Merged duplicate applicant ${duplicate.applicationNumber} into ${primary.applicationNumber}`,
      performedBy: mergedBy,
      createdAt: new Date(),
    };

    await applicantRepository.addTimelineEvent(primaryId, timelineEvent);
    await applicantRepository.softDelete(duplicateId, mergedBy);

    // TODO: Domain event hook - ApplicantMerged
    // Publish ApplicantMerged event for analytics or reconciliation.

    return applicantRepository.findById(primaryId);
  }

  // ─── SEARCH / FILTER ─────────────────────────────────────────────────────

  /**
   * Lists applicants with text search, filters, sorting, and pagination.
   * @param query - Search and filter inputs.
   * @returns Paginated applicant results.
   */
  public async listApplicants(query: ApplicantQueryInput): Promise<{ items: ApplicantDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.admissionRound) filter.admissionRound = query.admissionRound;
    if (query.applicationChannel) filter.applicationChannel = query.applicationChannel;
    if (query.preferredCourseId) filter.preferredCourseId = query.preferredCourseId;
    if (query.preferredDepartmentId) filter.preferredDepartmentId = query.preferredDepartmentId;
    if (query.assignedReviewerId) filter.assignedReviewerId = query.assignedReviewerId;
    if (query.assignedInterviewerId) filter.assignedInterviewerId = query.assignedInterviewerId;
    if (query.paymentStatus) filter['feeSummary.paymentStatus'] = query.paymentStatus;
    if (query.aiRiskLevel) filter.aiRiskLevel = query.aiRiskLevel;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    if (query.applicationDateFrom) filter.applicationDate = { $gte: query.applicationDateFrom };
    if (query.applicationDateTo) filter.applicationDate = { ...filter.applicationDate as Record<string, unknown>, $lte: query.applicationDateTo };

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return applicantRepository.filterApplicants(filter, query.page, query.limit, sortOption);
  }

  /**
   * Performs a text search across indexed applicant fields.
   * @param searchQuery - Search text.
   * @param page - Page number.
   * @param limit - Page size.
   * @returns Paginated search results.
   */
  public async searchApplicants(searchQuery: string, page = 1, limit = 20): Promise<{ items: ApplicantDocument[]; total: number }> {
    return applicantRepository.searchApplicants(searchQuery, page, limit);
  }

  /**
   * Applies structured filters with pagination.
   * @param filters - Filter criteria.
   * @param page - Page number.
   * @param limit - Page size.
   * @param sort - Sort option.
   * @returns Paginated filtered results.
   */
  public async filterApplicants(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: ApplicantDocument[]; total: number }> {
    return applicantRepository.filterApplicants(filters, page, limit, sort);
  }

  // ─── WORKFLOW ENGINE ─────────────────────────────────────────────────────

  /**
   * Updates applicant status while enforcing valid lifecycle transitions.
   * @param applicantId - Applicant document ID.
   * @param newStatus - Target status.
   * @param updatedBy - ID of the user changing the status.
   * @param reason - Optional transition reason.
   * @returns Updated applicant document.
   * @throws BadRequestError on invalid transitions.
   */
  public async updateStatus(applicantId: string, newStatus: ApplicantStatus, updatedBy: string, reason?: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot update status of a deleted applicant');
    }

    if (applicant.status === 'ARCHIVED' && newStatus !== 'ARCHIVED') {
      throw new BadRequestError('Cannot change status of an archived applicant');
    }

    const currentStatus = applicant.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    const workflowEntry: ApplicantSchemaType['workflowHistory'][0] = {
      previousState: currentStatus,
      newState: newStatus,
      changedBy: updatedBy,
      changedAt: new Date(),
      reason: reason?.trim(),
    };

    await applicantRepository.appendWorkflowHistory(applicantId, workflowEntry);
    await applicantRepository.updateStatus(applicantId, newStatus, updatedBy);

    const timelineEvent: ApplicantSchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'STATUS_CHANGED',
      description: `Status changed from ${currentStatus} to ${newStatus}${reason ? `. Reason: ${reason}` : ''}`,
      performedBy: updatedBy,
      createdAt: new Date(),
    };

    await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

    // TODO: Domain event hook - ApplicantStatusChanged
    // Publish ApplicantStatusChanged event.

    // TODO: Notification hook - ApplicantStatusChanged
    // NotifyNotificationService.sendApplicantStatusChanged(applicantId, currentStatus, newStatus);

    return applicantRepository.findById(applicantId);
  }

  // ─── CHECKLIST VALIDATION ────────────────────────────────────────────────

  /**
   * Updates the admission checklist for an applicant.
   * @param applicantId - Applicant document ID.
   * @param checklist - Updated checklist.
   * @param updatedBy - ID of the user updating the checklist.
   * @returns Updated applicant document.
   */
  public async updateChecklist(applicantId: string, checklist: ApplicantSchemaType['admissionChecklist'], _updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot update checklist of a deleted applicant');
    }

    await applicantRepository.updateChecklist(applicantId, checklist);

    // TODO: Domain event hook - ChecklistUpdated
    // Publish ChecklistUpdated event if all items are complete.

    return applicantRepository.findById(applicantId);
  }

  // ─── DOCUMENT PROCESSING ─────────────────────────────────────────────────

  /**
   * Adds a document to an applicant's submitted documents.
   * @param applicantId - Applicant document ID.
   * @param document - Document to add.
   * @param uploadedBy - ID of the user uploading the document.
   * @returns Updated applicant document.
   */
  public async addDocument(applicantId: string, document: ApplicantSchemaType['submittedDocuments'][0], uploadedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot add document to a deleted applicant');
    }

    if (applicant.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot add document to an archived applicant');
    }

    if (!document.fileUrl || !document.name || !document.type) {
      throw new BadRequestError('Document name, type, and file URL are required');
    }

    if (applicant.submittedDocuments.some((d) => d.id === document.id)) {
      throw new BadRequestError('Document with this ID already exists');
    }

    const documentWithMeta: ApplicantSchemaType['submittedDocuments'][0] = {
      ...document,
      uploadedBy,
      uploadedAt: new Date(),
    };

    const updated = await applicantRepository.addDocument(applicantId, documentWithMeta);

    if (updated) {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'DOCUMENT_UPLOADED',
        description: `Document uploaded: ${document.name}`,
        performedBy: uploadedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

      // TODO: Domain event hook - DocumentUploaded
      // Publish DocumentUploaded event.

      // TODO: AI service hook - DocumentAnalysis
      // SharedAiService.analyzeDocument(applicantId, document.id);
    }

    return updated;
  }

  /**
   * Verifies or rejects a submitted document.
   * @param applicantId - Applicant document ID.
   * @param documentId - Document ID.
   * @param verified - Whether the document is verified.
   * @param verifiedBy - ID of the user verifying the document.
   * @param rejectionReason - Optional rejection reason.
   * @returns Updated applicant document.
   */
  public async verifyDocument(applicantId: string, documentId: string, verified: boolean, verifiedBy: string, rejectionReason?: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    const document = applicant.submittedDocuments.find((d) => d.id === documentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.status === 'VERIFIED') {
      throw new BadRequestError('Document is already verified');
    }

    const updates: Partial<ApplicantSchemaType['submittedDocuments'][0]> = {
      status: verified ? 'VERIFIED' : 'REJECTED',
      verifiedAt: new Date(),
      verifiedBy,
    };

    if (!verified && rejectionReason) {
      updates.rejectionReason = rejectionReason.trim();
    }

    const updated = await applicantRepository.verifyDocument(applicantId, documentId, verified, verifiedBy);

    if (updated) {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'DOCUMENT_VERIFIED',
        description: `Document ${verified ? 'verified' : 'rejected'}: ${document.name}`,
        performedBy: verifiedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

      // TODO: Domain event hook - DocumentVerified
      // Publish DocumentVerified event.

      // TODO: Notification hook - DocumentVerified
      // NotifyNotificationService.sendDocumentVerified(applicantId, documentId, verified);
    }

    return updated;
  }

  // ─── INTERVIEW SCHEDULING ────────────────────────────────────────────────

  /**
   * Schedules an interview for an applicant.
   * @param applicantId - Applicant document ID.
   * @param interview - Interview details.
   * @param updatedBy - ID of the user scheduling the interview.
   * @returns Updated applicant document.
   */
  public async scheduleInterview(applicantId: string, interview: ApplicantSchemaType['interview'], updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot schedule interview for a deleted applicant');
    }

    if (applicant.status !== 'ELIGIBLE' && applicant.status !== 'INTERVIEW_SCHEDULED') {
      throw new BadRequestError('Applicant is not eligible for interview scheduling');
    }

    await applicantRepository.updateInterview(applicantId, interview);
    await this.updateStatus(applicantId, 'INTERVIEW_SCHEDULED', updatedBy, 'Interview scheduled');

    // TODO: Domain event hook - InterviewScheduled
    // Publish InterviewScheduled event.

    // TODO: Notification hook - InterviewScheduled
    // NotifyNotificationService.sendInterviewScheduled(applicantId, interview.scheduledAt);

    return applicantRepository.findById(applicantId);
  }

  /**
   * Records interview results for an applicant.
   * @param applicantId - Applicant document ID.
   * @param result - Interview result details.
   * @param updatedBy - ID of the user recording the result.
   * @returns Updated applicant document.
   */
  public async recordInterviewResult(applicantId: string, result: { score: number; remarks?: string; recommendation: string }, updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    const existingInterview = applicant.interview;
    if (!existingInterview) {
      throw new BadRequestError('No interview scheduled for this applicant');
    }

    const interview: Interview = {
      ...existingInterview,
      completedAt: new Date(),
      score: result.score,
      remarks: result.remarks?.trim(),
      recommendation: result.recommendation as InterviewRecommendation,
    };

    await applicantRepository.updateInterview(applicantId, interview);
    await this.updateStatus(applicantId, 'INTERVIEWED', updatedBy, 'Interview completed');

    const timelineEvent: ApplicantSchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'INTERVIEW_COMPLETED',
      description: `Interview completed. Score: ${result.score}. Recommendation: ${result.recommendation}`,
      performedBy: updatedBy,
      createdAt: new Date(),
    };

    await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

    // TODO: Domain event hook - InterviewCompleted
    // Publish InterviewCompleted event.

    // TODO: AI service hook - InterviewScorePrediction
    // SharedAiService.predictInterviewScore(applicantId);

    return applicantRepository.findById(applicantId);
  }

  // ─── SCHOLARSHIP PROCESSING ──────────────────────────────────────────────

  /**
   * Updates scholarship details for an applicant.
   * @param applicantId - Applicant document ID.
   * @param scholarship - Scholarship details.
   * @param updatedBy - ID of the user updating the scholarship.
   * @returns Updated applicant document.
   */
  public async updateScholarship(applicantId: string, scholarship: ApplicantSchemaType['scholarship'], _updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot update scholarship of a deleted applicant');
    }

    const updated = await applicantRepository.updateScholarship(applicantId, scholarship);

    if (updated) {
      // TODO: Domain event hook - ScholarshipUpdated
      // Publish ScholarshipUpdated event.

      // TODO: Notification hook - ScholarshipUpdated
      // NotifyNotificationService.sendScholarshipUpdated(applicantId, scholarship.status);
    }

    return updated;
  }

  // ─── SEAT ALLOCATION ─────────────────────────────────────────────────────

  /**
   * Allocates a seat for an applicant.
   * @param applicantId - Applicant document ID.
   * @param seatAllocation - Seat allocation details.
   * @param updatedBy - ID of the user allocating the seat.
   * @returns Updated applicant document.
   */
  public async allocateSeat(applicantId: string, seatAllocation: ApplicantSchemaType['seatAllocation'], updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot allocate seat for a deleted applicant');
    }

    if (applicant.status !== 'SELECTED' && seatAllocation.status === 'CONFIRMED') {
      throw new BadRequestError('Only selected applicants can be allocated seats');
    }

    const updated = await applicantRepository.updateSeatAllocation(applicantId, seatAllocation);

    if (updated && seatAllocation.status === 'CONFIRMED') {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'NOTE_ADDED',
        description: `Seat allocated: ${seatAllocation.seatNumber || 'TBD'}`,
        performedBy: updatedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

      // TODO: Domain event hook - SeatAllocated
      // Publish SeatAllocated event.

      // TODO: Notification hook - SeatAllocated
      // NotifyNotificationService.sendSeatAllocated(applicantId, seatAllocation.seatNumber);
    }

    return updated;
  }

  // ─── FEE PROCESSING ──────────────────────────────────────────────────────

  /**
   * Updates fee summary for an applicant.
   * @param applicantId - Applicant document ID.
   * @param feeUpdate - Partial fee summary update.
   * @param updatedBy - ID of the user updating the fee summary.
   * @returns Updated applicant document.
   */
  public async updateFeeSummary(applicantId: string, feeUpdate: { paidAmount: number; paymentStatus: ApplicantSchemaType['feeSummary']['paymentStatus'] }, updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot update fee summary of a deleted applicant');
    }

    const mergedFeeSummary: ApplicantSchemaType['feeSummary'] = {
      ...applicant.feeSummary,
      ...feeUpdate,
      lastPaymentDate: feeUpdate.paymentStatus === 'PAID' ? new Date() : applicant.feeSummary.lastPaymentDate,
    };

    const updated = await applicantRepository.updateFeeSummary(applicantId, mergedFeeSummary);

    if (updated && feeUpdate.paymentStatus === 'PAID') {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'FEE_PAID',
        description: `Fee payment completed. Amount: ${feeUpdate.paidAmount}`,
        performedBy: updatedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

      // TODO: Domain event hook - FeePaid
      // Publish FeePaid event.

      // TODO: Notification hook - FeePaid
      // NotifyNotificationService.sendFeePaid(applicantId, feeUpdate.paidAmount);
    }

    return updated;
  }

  // ─── AI ORCHESTRATION HOOKS ──────────────────────────────────────────────

  /**
   * Updates AI metadata for an applicant.
   * @param applicantId - Applicant document ID.
   * @param updates - AI metadata fields to update.
   * @param updatedBy - ID of the user or system updating the metadata.
   * @returns Updated applicant document.
   */
  public async updateAIMetadata(applicantId: string, updates: Record<string, unknown>, _updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot update AI metadata of a deleted applicant');
    }

    const updated = await applicantRepository.updateAIMetadata(applicantId, updates);

    // TODO: AI service hook - MetadataUpdated
    // SharedAiService.updateMetadata(applicantId, updates);

    return updated;
  }

  // ─── OFFER LETTER WORKFLOW ───────────────────────────────────────────────

  /**
   * Generates an offer letter for an applicant.
   * @param applicantId - Applicant document ID.
   * @param offerLetter - Offer letter details.
   * @param updatedBy - ID of the user generating the offer letter.
   * @returns Updated applicant document.
   */
  public async generateOfferLetter(applicantId: string, offerLetter: ApplicantSchemaType['offerLetter'], updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot generate offer letter for a deleted applicant');
    }

    if (applicant.status !== 'SELECTED') {
      throw new BadRequestError('Only selected applicants can receive offer letters');
    }

    const updated = await applicantRepository.updateOfferLetter(applicantId, offerLetter);
    await this.updateStatus(applicantId, 'OFFERED', updatedBy, 'Offer letter generated');

    if (updated) {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'OFFER_GENERATED',
        description: 'Offer letter generated',
        performedBy: updatedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

      // TODO: Domain event hook - OfferGenerated
      // Publish OfferGenerated event.

      // TODO: Notification hook - OfferGenerated
      // NotifyNotificationService.sendOfferGenerated(applicantId, offerLetter.documentId);
    }

    return updated;
  }

  /**
   * Records the applicant's response to the offer letter.
   * @param applicantId - Applicant document ID.
   * @param accepted - Whether the offer was accepted.
   * @param updatedBy - ID of the user recording the response.
   * @returns Updated applicant document.
   */
  public async respondToOffer(applicantId: string, accepted: boolean, updatedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (!applicant.offerLetter) {
      throw new BadRequestError('No offer letter has been generated for this applicant');
    }

    const offerLetter: ApplicantSchemaType['offerLetter'] = {
      ...applicant.offerLetter,
      status: accepted ? 'ACCEPTED' : 'REJECTED',
      acceptedAt: new Date(),
    };

    const updated = await applicantRepository.updateOfferLetter(applicantId, offerLetter);

    if (updated) {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'OFFER_ACCEPTED',
        description: `Offer ${accepted ? 'accepted' : 'rejected'}`,
        performedBy: updatedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

      if (accepted) {
        await this.updateStatus(applicantId, 'ADMITTED', updatedBy, 'Offer accepted');
      }

      // TODO: Domain event hook - OfferResponded
      // Publish OfferResponded event.

      // TODO: Notification hook - OfferResponded
      // NotifyNotificationService.sendOfferResponded(applicantId, accepted);
    }

    return updated;
  }

  // ─── CONVERSION TO STUDENT ───────────────────────────────────────────────

  /**
   * Converts an admitted applicant into a student record.
   * @param applicantId - Applicant document ID.
   * @param studentId - New student ID created in the Student module.
   * @param convertedBy - ID of the user performing the conversion.
   * @returns Updated applicant document.
   * @throws BadRequestError if applicant is not admitted or already converted.
   */
  public async convertToStudent(applicantId: string, studentId: string, convertedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot convert a deleted applicant');
    }

    if (applicant.status !== 'ADMITTED') {
      throw new BadRequestError('Only admitted applicants can be converted to students');
    }

    if (applicant.conversion?.studentId) {
      throw new BadRequestError('Applicant has already been converted to a student');
    }

    const conversion = {
      studentId,
      convertedAt: new Date(),
      convertedBy,
    };

    const updated = await applicantRepository.updateConversion(applicantId, conversion);

    if (updated) {
      const timelineEvent: ApplicantSchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'STUDENT_CREATED',
        description: `Converted to student: ${studentId}`,
        performedBy: convertedBy,
        createdAt: new Date(),
      };
      await applicantRepository.addTimelineEvent(applicantId, timelineEvent);

      // TODO: Transaction preparation - convertToStudent
      // Wrap conversion update, status change, timeline append, and downstream student module writes
      // in a MongoDB transaction once Student module is implemented.

      // TODO: Domain event hook - ApplicantConverted
      // Publish ApplicantConverted event with studentId for downstream workflows.

      // TODO: Notification hook - ApplicantConverted
      // NotifyNotificationService.sendApplicantConverted(applicantId, studentId);
    }

    return updated;
  }

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Counts active applicants by status.
   * @param status - Applicant status.
   * @returns Count of applicants with the given status.
   */
  public async countByStatus(status: string): Promise<number> {
    return applicantRepository.countByStatus(status);
  }

  /**
   * Counts active applicants by admission round.
   * @param admissionRound - Admission round.
   * @returns Count of applicants in the given round.
   */
  public async countByAdmissionRound(admissionRound: string): Promise<number> {
    return applicantRepository.countByAdmissionRound(admissionRound);
  }

  /**
   * Counts applicants with a given payment status.
   * @param paymentStatus - Payment status.
   * @returns Count of applicants with the given payment status.
   */
  public async countByPaymentStatus(paymentStatus: string): Promise<number> {
    return applicantRepository.countByPaymentStatus(paymentStatus);
  }

  /**
   * Counts applicants with AI recommendation score above a threshold.
   * @param minScore - Minimum recommendation score threshold.
   * @returns Count of hot leads.
   */
  public async countHotLeads(minScore = 70): Promise<number> {
    return applicantRepository.countHotLeads(minScore);
  }

  /**
   * Counts applicants that have been converted to students.
   * @returns Count of converted applicants.
   */
  public async countConverted(): Promise<number> {
    return applicantRepository.countConverted();
  }

  // ─── ARCHIVE / RESTORE ───────────────────────────────────────────────────

  /**
   * Archives an applicant and records an archive timeline event.
   * @param id - Applicant document ID.
   * @param archivedBy - ID of the user archiving the applicant.
   * @returns Archived applicant document.
   */
  public async archiveApplicant(id: string, archivedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot archive a deleted applicant');
    }

    if (applicant.status === 'ARCHIVED') {
      throw new BadRequestError('Applicant is already archived');
    }

    const timelineEvent: ApplicantSchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'ARCHIVED',
      description: 'Applicant archived',
      performedBy: archivedBy,
      createdAt: new Date(),
    };

    await applicantRepository.addTimelineEvent(id, timelineEvent);

    const archived = await applicantRepository.archive(id, archivedBy);

    // TODO: Domain event hook - ApplicantArchived
    // Publish ApplicantArchived event.

    // TODO: Notification hook - ApplicantArchived
    // NotifyNotificationService.sendApplicantArchived(id, archivedBy);

    return archived;
  }

  /**
   * Restores an archived applicant back to active state.
   * @param id - Applicant document ID.
   * @param restoredBy - ID of the user restoring the applicant.
   * @returns Restored applicant document.
   */
  public async restoreArchivedApplicant(id: string, restoredBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(id);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.status !== 'ARCHIVED') {
      throw new BadRequestError('Only archived applicants can be restored');
    }

    const timelineEvent: ApplicantSchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'STATUS_CHANGED',
      description: 'Applicant restored from archive',
      performedBy: restoredBy,
      createdAt: new Date(),
    };

    await applicantRepository.addTimelineEvent(id, timelineEvent);

    const restored = await applicantRepository.restoreArchive(id, restoredBy);

    // TODO: Domain event hook - ApplicantRestoredFromArchive
    // Publish ApplicantRestoredFromArchive event.

    // TODO: Notification hook - ApplicantRestoredFromArchive
    // NotifyNotificationService.sendApplicantRestoredFromArchive(id, restoredBy);

    return restored;
  }

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────

  /**
   * Bulk-creates applicants with per-item error handling.
   * @param input - Bulk import payload.
   * @param createdBy - ID of the user performing the bulk creation.
   * @returns Summary of created, failed, and error messages.
   */
  public async bulkCreateApplicants(input: BulkImportInput, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const applicantData of input.applicants) {
      try {
        await this.createApplicant(applicantData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${applicantData.applicationNumber || 'unknown'}: ${(error as Error).message}`);
      }
    }

    // TODO: Domain event hook - BulkApplicantsCreated
    // Publish BulkApplicantsCreated event with summary counts.

    return { created, failed, errors };
  }

  /**
   * Bulk-updates applicants with per-item error handling.
   * @param ids - Applicant document IDs.
   * @param updates - Update payload applied to each applicant.
   * @param updatedBy - ID of the user performing the bulk update.
   * @returns Summary of updated, failed, and error counts.
   */
  public async bulkUpdateApplicants(ids: string[], updates: UpdateApplicantInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateApplicant(id, updates, updatedBy);
        if (result) {
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    // TODO: Domain event hook - BulkApplicantsUpdated
    // Publish BulkApplicantsUpdated event with summary counts.

    return { updated, failed };
  }

  // ─── ASSIGNMENTS ─────────────────────────────────────────────────────────

  /**
   * Assigns a reviewer to an applicant.
   * @param applicantId - Applicant document ID.
   * @param reviewerId - Reviewer user ID.
   * @param assignedBy - ID of the user performing the assignment.
   * @returns Updated applicant document.
   */
  public async assignReviewer(applicantId: string, reviewerId: string, assignedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot assign reviewer to a deleted applicant');
    }

    const updated = await applicantRepository.updateById(applicantId, {
      assignedReviewerId: reviewerId,
      updatedBy: assignedBy,
      updatedAt: new Date(),
    });

    // TODO: Domain event hook - ReviewerAssigned
    // Publish ReviewerAssigned event.

    // TODO: Notification hook - ReviewerAssigned
    // NotifyNotificationService.sendReviewerAssigned(applicantId, reviewerId);

    return updated;
  }

  /**
   * Assigns an interviewer to an applicant.
   * @param applicantId - Applicant document ID.
   * @param interviewerId - Interviewer user ID.
   * @param assignedBy - ID of the user performing the assignment.
   * @returns Updated applicant document.
   */
  public async assignInterviewer(applicantId: string, interviewerId: string, assignedBy: string): Promise<ApplicantDocument | null> {
    const applicant = await applicantRepository.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError('Applicant not found');
    }

    if (applicant.deletedAt) {
      throw new BadRequestError('Cannot assign interviewer to a deleted applicant');
    }

    const updated = await applicantRepository.updateById(applicantId, {
      assignedInterviewerId: interviewerId,
      updatedBy: assignedBy,
      updatedAt: new Date(),
    });

    // TODO: Domain event hook - InterviewerAssigned
    // Publish InterviewerAssigned event.

    // TODO: Notification hook - InterviewerAssigned
    // NotifyNotificationService.sendInterviewerAssigned(applicantId, interviewerId);

    return updated;
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

export const applicantService = new ApplicantService();
