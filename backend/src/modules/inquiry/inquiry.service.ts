import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { inquiryRepository } from './inquiry.repository';
import type { InquiryDocument, InquirySchemaType } from './inquiry.model';
import type { CreateInquiryInput, UpdateInquiryInput, InquiryQueryInput, BulkImportInput } from './inquiry.validator';

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['CONTACTED', 'INTERESTED', 'ARCHIVED'],
  CONTACTED: ['INTERESTED', 'APPLIED', 'ENROLLED', 'REJECTED', 'ARCHIVED'],
  INTERESTED: ['APPLIED', 'ENROLLED', 'REJECTED', 'ARCHIVED'],
  APPLIED: ['UNDER_REVIEW', 'REJECTED', 'ARCHIVED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'ARCHIVED'],
  APPROVED: ['PAYMENT_PENDING', 'REJECTED', 'ARCHIVED'],
  PAYMENT_PENDING: ['ADMITTED', 'REJECTED', 'ARCHIVED'],
  ADMITTED: ['ENROLLED', 'ARCHIVED'],
  ENROLLED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED'],
  ARCHIVED: ['NEW'],
};

export class InquiryService {
  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new inquiry with normalized identity, personal, contact, and academic data.
   * @param input - Validated create inquiry payload.
   * @param createdBy - ID of the user creating the inquiry.
   * @returns The created inquiry document.
   * @throws ConflictError if inquiryId, inquiryNumber, or duplicate contact details already exist.
   */
  public async createInquiry(input: CreateInquiryInput, createdBy: string): Promise<InquiryDocument> {
    const normalizedInquiryId = input.inquiryId.trim().toUpperCase();
    const normalizedInquiryNumber = input.inquiryNumber.trim().toUpperCase();
    const normalizedFullName = input.fullName.trim();
    const normalizedFirstName = input.firstName.trim();
    const normalizedLastName = input.lastName.trim();
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedPhone = input.phone.trim();

    if (await inquiryRepository.existsByInquiryId(normalizedInquiryId)) {
      throw new ConflictError('An inquiry with this inquiry ID already exists');
    }

    if (await inquiryRepository.existsByInquiryNumber(normalizedInquiryNumber)) {
      throw new ConflictError('An inquiry with this inquiry number already exists');
    }

    const duplicateCheck = await inquiryRepository.existsDuplicate(normalizedFullName, normalizedEmail, normalizedPhone);
    if (duplicateCheck) {
      throw new ConflictError('An inquiry with this name, email, or phone already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'CREATED',
      description: 'Inquiry created',
      performedBy: createdBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    const inquiry = await inquiryRepository.create({
      ...cleanedInput,
      inquiryId: normalizedInquiryId,
      inquiryNumber: normalizedInquiryNumber,
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

    // TODO: Domain event hook - InquiryCreated
    // Publish InquiryCreated event for downstream consumers such as notification service and analytics.

    // TODO: Notification hook - InquiryCreated
    // NotifyNotificationService.sendInquiryCreated(inquiry.id, createdBy);

    // TODO: AI service hook
    // SharedAiService.analyzeInquiry(inquiry.id);

    return inquiry;
  }

  /**
   * Updates an existing inquiry and appends an audit timeline event.
   * @param id - Inquiry document ID.
   * @param input - Partial update payload.
   * @param updatedBy - ID of the user performing the update.
   * @returns The updated inquiry document, or null if not found.
   */
  public async updateInquiry(id: string, input: UpdateInquiryInput, updatedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot update a deleted inquiry');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await inquiryRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    if (updated) {
      const timelineEvent: InquirySchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'NOTE_ADDED',
        description: 'Inquiry updated',
        performedBy: updatedBy,
        performedByRole: 'ADMIN',
        createdAt: new Date(),
      };
      await inquiryRepository.addTimelineEvent(id, timelineEvent);

      // TODO: Domain event hook - InquiryUpdated
      // Publish InquiryUpdated event.

      // TODO: Notification hook - InquiryUpdated
      // NotifyNotificationService.sendInquiryUpdated(inquiry.id, updatedBy);
    }

    return updated;
  }

  /**
   * Retrieves an inquiry by its internal MongoDB ID.
   * @param id - Inquiry document ID.
   * @returns Inquiry document or null.
   */
  public async getInquiry(id: string): Promise<InquiryDocument | null> {
    return inquiryRepository.findById(id);
  }

  /**
   * Retrieves an inquiry by its business inquiryId.
   * @param inquiryId - Business inquiry identifier.
   * @returns Inquiry document or null.
   */
  public async getInquiryByInquiryId(inquiryId: string): Promise<InquiryDocument | null> {
    return inquiryRepository.findByInquiryId(inquiryId);
  }

  /**
   * Retrieves an inquiry by its inquiryNumber.
   * @param inquiryNumber - Business inquiry number.
   * @returns Inquiry document or null.
   */
  public async getInquiryByInquiryNumber(inquiryNumber: string): Promise<InquiryDocument | null> {
    return inquiryRepository.findByInquiryNumber(inquiryNumber);
  }

  /**
   * Soft deletes an inquiry after guarding against already deleted or archived records.
   * @param id - Inquiry document ID.
   * @param deletedBy - ID of the user performing the deletion.
   */
  public async deleteInquiry(id: string, deletedBy: string): Promise<void> {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Inquiry is already deleted');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot delete an archived inquiry. Restore it first.');
    }

    await inquiryRepository.softDelete(id, deletedBy);

    // TODO: Domain event hook - InquiryDeleted
    // Publish InquiryDeleted event.

    // TODO: Notification hook - InquiryDeleted
    // NotifyNotificationService.sendInquiryDeleted(inquiry.id, deletedBy);
  }

  /**
   * Restores a previously soft-deleted inquiry.
   * @param id - Inquiry document ID.
   * @returns Restored inquiry document or null.
   */
  public async restoreInquiry(id: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (!inquiry.deletedAt) {
      throw new BadRequestError('Inquiry is not deleted');
    }

    const restored = await inquiryRepository.restore(id);

    if (restored) {
      // TODO: Domain event hook - InquiryRestored
      // Publish InquiryRestored event.

      // TODO: Notification hook - InquiryRestored
      // NotifyNotificationService.sendInquiryRestored(restored.id);
    }

    return restored;
  }

  // ─── SEARCH / FILTER ─────────────────────────────────────────────────────

  /**
   * Lists inquiries with text search, filters, sorting, and pagination.
   * @param query - Search and filter inputs.
   * @returns Paginated inquiry results.
   */
  public async listInquiries(query: InquiryQueryInput): Promise<{ items: InquiryDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.source) filter.source = query.source;
    if (query.preferredCourseId) filter.preferredCourseId = query.preferredCourseId;
    if (query.preferredDepartmentId) filter.preferredDepartmentId = query.preferredDepartmentId;
    if (query.assignedCounselorId) filter.assignedCounselorId = query.assignedCounselorId;
    if (query.aiIntent) filter.aiIntent = query.aiIntent;
    if (query.aiRiskLevel) filter.aiRiskLevel = query.aiRiskLevel;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    if (query.aiLeadScoreMin !== undefined || query.aiLeadScoreMax !== undefined) {
      filter.aiLeadScore = {};
      if (query.aiLeadScoreMin !== undefined) (filter.aiLeadScore as Record<string, unknown>).$gte = query.aiLeadScoreMin;
      if (query.aiLeadScoreMax !== undefined) (filter.aiLeadScore as Record<string, unknown>).$lte = query.aiLeadScoreMax;
    }

    if (query.inquiryDateFrom || query.inquiryDateTo) {
      filter.inquiryDate = {};
      if (query.inquiryDateFrom) (filter.inquiryDate as Record<string, unknown>).$gte = query.inquiryDateFrom;
      if (query.inquiryDateTo) (filter.inquiryDate as Record<string, unknown>).$lte = query.inquiryDateTo;
    }

    if (query.nextFollowUpDateFrom || query.nextFollowUpDateTo) {
      filter.nextFollowUpDate = {};
      if (query.nextFollowUpDateFrom) (filter.nextFollowUpDate as Record<string, unknown>).$gte = query.nextFollowUpDateFrom;
      if (query.nextFollowUpDateTo) (filter.nextFollowUpDate as Record<string, unknown>).$lte = query.nextFollowUpDateTo;
    }

    if (query.tag) filter.tags = query.tag;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return inquiryRepository.filterInquiries(filter, query.page, query.limit, sortOption);
  }

  /**
   * Performs a text search across indexed inquiry fields.
   * @param searchQuery - Search text.
   * @param page - Page number.
   * @param limit - Page size.
   * @returns Paginated search results.
   */
  public async searchInquiries(searchQuery: string, page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    return inquiryRepository.searchInquiries(searchQuery, page, limit);
  }

  /**
   * Applies structured filters with pagination.
   * @param filters - Filter criteria.
   * @param page - Page number.
   * @param limit - Page size.
   * @param sort - Sort option.
   * @returns Paginated filtered results.
   */
  public async filterInquiries(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: InquiryDocument[]; total: number }> {
    return inquiryRepository.filterInquiries(filters, page, limit, sort);
  }

  /**
   * Performs advanced search combining text search with structured filters.
   * @param filters - Combined search/filter criteria.
   * @param page - Page number.
   * @param limit - Page size.
   * @returns Paginated advanced search results.
   */
  public async advancedSearch(filters: Record<string, unknown>, page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    return inquiryRepository.advancedSearch(filters, page, limit);
  }

  // ─── DUPLICATE DETECTION ──────────────────────────────────────────────────

  /**
   * Checks whether an inquiry already exists by email or phone.
   * @param email - Contact email.
   * @param phone - Contact phone.
   * @returns Existing inquiry document if a duplicate is found, otherwise null.
   */
  public async checkDuplicateInquiry(email: string, phone: string): Promise<InquiryDocument | null> {
    const byEmail = await inquiryRepository.findByEmail(email);
    if (byEmail) return byEmail;

    const byPhone = await inquiryRepository.findByPhone(phone);
    if (byPhone) return byPhone;

    return null;
  }

  /**
   * Merges a duplicate inquiry into a primary inquiry and soft-deletes the duplicate.
   * @param primaryId - Target inquiry ID.
   * @param duplicateId - Source inquiry ID to merge and delete.
   * @param mergedBy - ID of the user performing the merge.
   * @returns Updated primary inquiry document.
   * @throws NotFoundError or BadRequestError on invalid merge targets.
   */
  public async mergeDuplicateInquiry(primaryId: string, duplicateId: string, mergedBy: string): Promise<InquiryDocument | null> {
    const [primary, duplicate] = await Promise.all([
      inquiryRepository.findById(primaryId),
      inquiryRepository.findById(duplicateId),
    ]);

    if (!primary) {
      throw new NotFoundError('Primary inquiry not found');
    }

    if (!duplicate) {
      throw new NotFoundError('Duplicate inquiry not found');
    }

    if (primary.deletedAt || duplicate.deletedAt) {
      throw new BadRequestError('Cannot merge deleted inquiries');
    }

    if (primary.id === duplicate.id) {
      throw new BadRequestError('Cannot merge an inquiry with itself');
    }

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'NOTE_ADDED',
      description: `Merged duplicate inquiry ${duplicate.inquiryNumber} into ${primary.inquiryNumber}`,
      performedBy: mergedBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(primaryId, timelineEvent);
    await inquiryRepository.softDelete(duplicateId, mergedBy);

    // TODO: Domain event hook - InquiryMerged
    // Publish InquiryMerged event for analytics or reconciliation.

    return inquiryRepository.findById(primaryId);
  }

  // ─── COUNSELOR ───────────────────────────────────────────────────────────

  /**
   * Assigns a counselor to an inquiry if one is not already assigned.
   * @param inquiryId - Inquiry document ID.
   * @param counselorId - Counselor user ID.
   * @param assignedBy - ID of the user performing the assignment.
   * @returns Updated inquiry document.
   */
  public async assignCounselor(inquiryId: string, counselorId: string, assignedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot assign counselor to a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot assign counselor to an archived inquiry');
    }

    if (inquiry.assignedCounselorId) {
      throw new BadRequestError('Inquiry already has an assigned counselor');
    }

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'COUNSELING_SCHEDULED',
      description: `Counselor assigned: ${counselorId}`,
      performedBy: assignedBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    await inquiryRepository.assignCounselor(inquiryId, counselorId);
    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    // TODO: Domain event hook - CounselorAssigned
    // Publish CounselorAssigned event.

    // TODO: Notification hook - CounselorAssigned
    // NotifyNotificationService.sendCounselorAssigned(inquiryId, counselorId);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Removes the assigned counselor from an inquiry.
   * @param inquiryId - Inquiry document ID.
   * @param removedBy - ID of the user performing the removal.
   * @returns Updated inquiry document.
   */
  public async removeCounselor(inquiryId: string, removedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot remove counselor from a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot remove counselor from an archived inquiry');
    }

    if (!inquiry.assignedCounselorId) {
      throw new BadRequestError('Inquiry does not have an assigned counselor');
    }

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'NOTE_ADDED',
      description: 'Counselor removed',
      performedBy: removedBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    await inquiryRepository.removeCounselor(inquiryId);
    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    // TODO: Domain event hook - CounselorRemoved
    // Publish CounselorRemoved event.

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Updates counselor notes for an inquiry.
   * @param inquiryId - Inquiry document ID.
   * @param notes - Counselor notes content.
   * @param updatedBy - ID of the counselor or admin updating notes.
   * @returns Updated inquiry document.
   */
  public async updateCounselorNotes(inquiryId: string, notes: string, updatedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot update notes on a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot update notes on an archived inquiry');
    }

    const trimmedNotes = notes.trim();
    if (!trimmedNotes) {
      throw new BadRequestError('Notes cannot be empty');
    }

    await inquiryRepository.updateCounselorNotes(inquiryId, trimmedNotes);

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'NOTE_ADDED',
      description: 'Counselor notes updated',
      performedBy: updatedBy,
      performedByRole: 'COUNSELOR',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    // TODO: Notification hook - CounselorNotesUpdated
    // NotifyNotificationService.sendCounselorNotesUpdated(inquiryId, updatedBy);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Updates the counseling outcome and records a timeline event.
   * @param inquiryId - Inquiry document ID.
   * @param counselingOutcome - New counseling outcome value.
   * @param updatedBy - ID of the counselor or admin performing the update.
   * @returns Updated inquiry document.
   */
  public async updateCounselingOutcome(inquiryId: string, counselingOutcome: InquirySchemaType['counselingOutcome'], updatedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot update counseling outcome on a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot update counseling outcome on an archived inquiry');
    }

    await inquiryRepository.updateCounselingOutcome(inquiryId, counselingOutcome);

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'COUNSELING_COMPLETED',
      description: `Counseling outcome updated to ${counselingOutcome}`,
      performedBy: updatedBy,
      performedByRole: 'COUNSELOR',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    // TODO: Domain event hook - CounselingCompleted
    // Publish CounselingCompleted event.

    // TODO: Notification hook - CounselingCompleted
    // NotifyNotificationService.sendCounselingCompleted(inquiryId, counselingOutcome);

    return inquiryRepository.findById(inquiryId);
  }

  // ─── FOLLOW UP ───────────────────────────────────────────────────────────

  /**
   * Schedules a follow-up for an inquiry.
   * @param inquiryId - Inquiry document ID.
   * @param nextFollowUpDate - Future follow-up date.
   * @param scheduledBy - ID of the user scheduling the follow-up.
   * @param note - Optional follow-up note.
   * @returns Updated inquiry document.
   * @throws BadRequestError if the follow-up date is in the past or inquiry is inactive.
   */
  public async scheduleFollowUp(inquiryId: string, nextFollowUpDate: Date, scheduledBy: string, note?: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot schedule follow-up on a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot schedule follow-up on an archived inquiry');
    }

    if (nextFollowUpDate <= new Date()) {
      throw new BadRequestError('Follow-up date cannot be in the past');
    }

    await inquiryRepository.scheduleFollowUp(inquiryId, nextFollowUpDate);

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'FOLLOW_UP',
      description: `Follow-up scheduled for ${nextFollowUpDate.toISOString()}${note ? `. Note: ${note}` : ''}`,
      performedBy: scheduledBy,
      performedByRole: 'COUNSELOR',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);
    await inquiryRepository.incrementFollowUpCount(inquiryId);

    // TODO: Domain event hook - FollowUpScheduled
    // Publish FollowUpScheduled event.

    // TODO: Notification hook - FollowUpScheduled
    // NotifyNotificationService.sendFollowUpScheduled(inquiryId, nextFollowUpDate);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Records a completed follow-up result.
   * @param inquiryId - Inquiry document ID.
   * @param result - Follow-up result description.
   * @param updatedBy - ID of the user completing the follow-up.
   * @param note - Optional completion note.
   * @returns Updated inquiry document.
   */
  public async updateFollowUp(inquiryId: string, result: string, updatedBy: string, note?: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot update follow-up on a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot update follow-up on an archived inquiry');
    }

    const trimmedResult = result.trim();
    if (!trimmedResult) {
      throw new BadRequestError('Follow-up result cannot be empty');
    }

    await inquiryRepository.updateFollowUp(inquiryId, new Date(), trimmedResult);

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'FOLLOW_UP',
      description: `Follow-up completed: ${trimmedResult}${note ? `. Note: ${note}` : ''}`,
      performedBy: updatedBy,
      performedByRole: 'COUNSELOR',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    // TODO: Domain event hook - FollowUpCompleted
    // Publish FollowUpCompleted event.

    // TODO: Notification hook - FollowUpCompleted
    // NotifyNotificationService.sendFollowUpCompleted(inquiryId, trimmedResult);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Alias for updateFollowUp to complete a follow-up entry.
   * @param inquiryId - Inquiry document ID.
   * @param result - Follow-up result description.
   * @param completedBy - ID of the user completing the follow-up.
   * @param note - Optional completion note.
   * @returns Updated inquiry document.
   */
  public async completeFollowUp(inquiryId: string, result: string, completedBy: string, note?: string): Promise<InquiryDocument | null> {
    return this.updateFollowUp(inquiryId, result, completedBy, note);
  }

  // ─── TIMELINE ────────────────────────────────────────────────────────────

  /**
   * Appends a custom timeline event to an inquiry.
   * @param inquiryId - Inquiry document ID.
   * @param event - Timeline event payload.
   * @returns Updated inquiry document.
   */
  public async addTimelineEvent(inquiryId: string, event: InquirySchemaType['timeline'][0]): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot add timeline event to a deleted inquiry');
    }

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      ...event,
      eventId: event.eventId || `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: event.createdAt || new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Retrieves the timeline for an inquiry.
   * @param inquiryId - Inquiry document ID.
   * @returns Inquiry document containing timeline array, or null.
   */
  public async listTimeline(inquiryId: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    return inquiryRepository.listTimeline(inquiryId);
  }

  // ─── STATUS WORKFLOW ─────────────────────────────────────────────────────

  /**
   * Updates inquiry status while enforcing valid lifecycle transitions.
   * @param inquiryId - Inquiry document ID.
   * @param newStatus - Target status.
   * @param updatedBy - ID of the user changing the status.
   * @param note - Optional transition note.
   * @returns Updated inquiry document.
   * @throws BadRequestError on invalid transitions.
   */
  public async updateStatus(inquiryId: string, newStatus: string, updatedBy: string, note?: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot update status of a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED' && newStatus !== 'ARCHIVED') {
      throw new BadRequestError('Cannot change status of an archived inquiry');
    }

    const currentStatus = inquiry.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    await inquiryRepository.updateById(inquiryId, { status: newStatus, updatedBy, updatedAt: new Date() });

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'STATUS_CHANGED',
      description: `Status changed from ${currentStatus} to ${newStatus}${note ? `. Note: ${note}` : ''}`,
      performedBy: updatedBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    // TODO: Domain event hook - StatusChanged
    // Publish InquiryStatusChanged event.

    // TODO: Notification hook - StatusChanged
    // NotifyNotificationService.sendStatusChanged(inquiryId, currentStatus, newStatus);

    return inquiryRepository.findById(inquiryId);
  }

  // ─── AI ──────────────────────────────────────────────────────────────────

  /**
   * Persists an AI-generated summary for an inquiry.
   * @param inquiryId - Inquiry document ID.
   * @param aiSummary - AI-generated summary text.
   * @param updatedBy - ID of the user or system updating the summary.
   * @returns Updated inquiry document.
   */
  public async updateAISummary(inquiryId: string, aiSummary: string, updatedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    const trimmedSummary = aiSummary.trim();
    if (!trimmedSummary) {
      throw new BadRequestError('AI summary cannot be empty');
    }

    await inquiryRepository.updateAISummary(inquiryId, trimmedSummary);

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'NOTE_ADDED',
      description: 'AI summary updated',
      performedBy: updatedBy,
      performedByRole: 'AI',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);

    // TODO: AI service hook - SummaryGeneration
    // SharedAiService.generateSummary(inquiryId);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Persists a new lead score with historical tracking.
   * @param inquiryId - Inquiry document ID.
   * @param aiLeadScore - Score between 0 and 100.
   * @param reason - Reason for the score.
   * @param generatedBy - ID of the user or system generating the score.
   * @returns Updated inquiry document.
   */
  public async updateLeadScore(inquiryId: string, aiLeadScore: number, reason: string, generatedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (aiLeadScore < 0 || aiLeadScore > 100) {
      throw new BadRequestError('Lead score must be between 0 and 100');
    }

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      throw new BadRequestError('Lead score reason is required');
    }

    const historyEntry: InquirySchemaType['aiLeadScoreHistory'][0] = {
      score: aiLeadScore,
      reason: trimmedReason,
      generatedAt: new Date(),
      generatedBy,
    };

    await inquiryRepository.updateLeadScore(inquiryId, aiLeadScore, historyEntry);

    // TODO: AI service hook - LeadScoring
    // SharedAiService.computeLeadScore(inquiryId);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Persists AI-recommended course IDs and optional department recommendation.
   * @param inquiryId - Inquiry document ID.
   * @param aiRecommendedCourseIds - Recommended course IDs.
   * @param aiRecommendedDepartmentId - Optional recommended department ID.
   * @param updatedBy - ID of the user or system updating recommendations.
   * @returns Updated inquiry document.
   */
  public async updateRecommendedCourses(inquiryId: string, aiRecommendedCourseIds: string[], aiRecommendedDepartmentId?: string, updatedBy?: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (!aiRecommendedCourseIds || aiRecommendedCourseIds.length === 0) {
      throw new BadRequestError('At least one recommended course is required');
    }

    await inquiryRepository.updateRecommendedCourses(inquiryId, aiRecommendedCourseIds, aiRecommendedDepartmentId);

    if (updatedBy) {
      const timelineEvent: InquirySchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'NOTE_ADDED',
        description: 'AI recommended courses updated',
        performedBy: updatedBy,
        performedByRole: 'AI',
        createdAt: new Date(),
      };
      await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);
    }

    // TODO: AI service hook - CourseRecommendation
    // SharedAiService.recommendCourses(inquiryId);

    return inquiryRepository.findById(inquiryId);
  }

  /**
   * Persists AI conversation summary and optional next-best-action.
   * @param inquiryId - Inquiry document ID.
   * @param aiConversationSummary - Conversation summary text.
   * @param aiNextBestAction - Optional next-best-action recommendation.
   * @param updatedBy - ID of the user or system updating the conversation state.
   * @returns Updated inquiry document.
   */
  public async updateAIConversation(inquiryId: string, aiConversationSummary: string, aiNextBestAction?: string, updatedBy?: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    const trimmedSummary = aiConversationSummary.trim();
    if (!trimmedSummary) {
      throw new BadRequestError('AI conversation summary cannot be empty');
    }

    await inquiryRepository.updateAIConversation(inquiryId, trimmedSummary, aiNextBestAction);

    if (updatedBy) {
      const timelineEvent: InquirySchemaType['timeline'][0] = {
        eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        eventType: 'NOTE_ADDED',
        description: 'AI conversation summary updated',
        performedBy: updatedBy,
        performedByRole: 'AI',
        createdAt: new Date(),
      };
      await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);
    }

    // TODO: AI service hook - ConversationSummary
    // SharedAiService.summarizeConversation(inquiryId);

    // TODO: AI service hook - SentimentAnalysis
    // SharedAiService.analyzeSentiment(inquiryId);

    // TODO: AI service hook - IntentDetection
    // SharedAiService.detectIntent(inquiryId);

    return inquiryRepository.findById(inquiryId);
  }

  // ─── CONVERSION ──────────────────────────────────────────────────────────

  /**
   * Converts an inquiry into an applicant by marking conversion metadata.
   * @param inquiryId - Inquiry document ID.
   * @param applicantId - New applicant ID created in the Applicant module.
   * @param convertedBy - ID of the user performing the conversion.
   * @returns Updated inquiry document.
   * @throws BadRequestError if already converted, deleted, or archived.
   *
   * @remarks Future implementations should wrap inquiry update and applicant creation
   * in a MongoDB transaction to guarantee consistency across modules.
   */
  public async convertToApplicant(inquiryId: string, applicantId: string, convertedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot convert a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot convert an archived inquiry');
    }

    if (inquiry.conversion.isConverted) {
      throw new BadRequestError('Inquiry has already been converted to an applicant');
    }

    // TODO: Transaction preparation - convertToApplicant
    // Wrap markConverted, status update, timeline append, and downstream applicant module writes
    // in a MongoDB transaction once Applicant module is implemented.

    await inquiryRepository.markConverted(inquiryId, applicantId);

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'APPLIED',
      description: `Inquiry converted to applicant: ${applicantId}`,
      performedBy: convertedBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(inquiryId, timelineEvent);
    await inquiryRepository.updateById(inquiryId, { status: 'APPLIED', updatedBy: convertedBy, updatedAt: new Date() });

    // TODO: Domain event hook - InquiryConverted
    // Publish InquiryConverted event with applicantId for downstream workflows.

    // TODO: Notification hook - ApplicantConverted
    // NotifyNotificationService.sendApplicantConverted(inquiryId, applicantId);

    // TODO: Future applicant sync
    // await applicantService.createFromInquiry(inquiry, applicantId);

    return inquiryRepository.findById(inquiryId);
  }

  // ─── ARCHIVE / RESTORE ───────────────────────────────────────────────────

  /**
   * Archives an inquiry and records an archive timeline event.
   * @param id - Inquiry document ID.
   * @param archivedBy - ID of the user archiving the inquiry.
   * @returns Archived inquiry document.
   */
  public async archiveInquiry(id: string, archivedBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.deletedAt) {
      throw new BadRequestError('Cannot archive a deleted inquiry');
    }

    if (inquiry.status === 'ARCHIVED') {
      throw new BadRequestError('Inquiry is already archived');
    }

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'ARCHIVED',
      description: 'Inquiry archived',
      performedBy: archivedBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(id, timelineEvent);

    const archived = await inquiryRepository.archive(id, archivedBy);

    // TODO: Domain event hook - InquiryArchived
    // Publish InquiryArchived event.

    // TODO: Notification hook - InquiryArchived
    // NotifyNotificationService.sendInquiryArchived(id, archivedBy);

    return archived;
  }

  /**
   * Restores an archived inquiry back to active state.
   * @param id - Inquiry document ID.
   * @param restoredBy - ID of the user restoring the inquiry.
   * @returns Restored inquiry document.
   */
  public async restoreArchivedInquiry(id: string, restoredBy: string): Promise<InquiryDocument | null> {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.status !== 'ARCHIVED') {
      throw new BadRequestError('Only archived inquiries can be restored');
    }

    const timelineEvent: InquirySchemaType['timeline'][0] = {
      eventId: `TL-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      eventType: 'STATUS_CHANGED',
      description: 'Inquiry restored from archive',
      performedBy: restoredBy,
      performedByRole: 'ADMIN',
      createdAt: new Date(),
    };

    await inquiryRepository.addTimelineEvent(id, timelineEvent);

    const restored = await inquiryRepository.restoreArchive(id, restoredBy);

    // TODO: Domain event hook - InquiryRestoredFromArchive
    // Publish InquiryRestoredFromArchive event.

    // TODO: Notification hook - InquiryRestoredFromArchive
    // NotifyNotificationService.sendInquiryRestoredFromArchive(id, restoredBy);

    return restored;
  }

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Counts active inquiries by status.
   * @param status - Inquiry status.
   * @returns Count of inquiries with the given status.
   */
  public async countByStatus(status: string): Promise<number> {
    return inquiryRepository.countByStatus(status);
  }

  /**
   * Counts active inquiries by source.
   * @param source - Inquiry source.
   * @returns Count of inquiries with the given source.
   */
  public async countBySource(source: string): Promise<number> {
    return inquiryRepository.countBySource(source);
  }

  /**
   * Counts inquiries with AI lead score above a threshold.
   * @param minScore - Minimum lead score threshold.
   * @returns Count of hot leads.
   */
  public async countHotLeads(minScore = 70): Promise<number> {
    return inquiryRepository.countHotLeads(minScore);
  }

  /**
   * Counts inquiries that have been converted to applicants.
   * @returns Count of converted inquiries.
   */
  public async countConverted(): Promise<number> {
    return inquiryRepository.countConverted();
  }

  // ─── BULK ────────────────────────────────────────────────────────────────

  /**
   * Bulk-creates inquiries with per-item error handling.
   * @param input - Bulk import payload.
   * @param createdBy - ID of the user performing the bulk creation.
   * @returns Summary of created, failed, and error messages.
   */
  public async bulkCreateInquiries(input: BulkImportInput, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const inquiryData of input.inquiries) {
      try {
        await this.createInquiry(inquiryData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${inquiryData.inquiryId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    // TODO: Domain event hook - BulkInquiriesCreated
    // Publish BulkInquiriesCreated event with summary counts.

    return { created, failed, errors };
  }

  /**
   * Bulk-updates inquiries with per-item error handling.
   * @param ids - Inquiry document IDs.
   * @param updates - Update payload applied to each inquiry.
   * @param updatedBy - ID of the user performing the bulk update.
   * @returns Summary of updated, failed, and error counts.
   */
  public async bulkUpdateInquiries(ids: string[], updates: UpdateInquiryInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateInquiry(id, updates, updatedBy);
        if (result) {
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    // TODO: Domain event hook - BulkInquiriesUpdated
    // Publish BulkInquiriesUpdated event with summary counts.

    return { updated, failed };
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

export const inquiryService = new InquiryService();
