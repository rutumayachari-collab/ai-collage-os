import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { eligibilityRepository } from './eligibility.repository';
import type { EligibilityDocument, EligibilitySchemaType } from './eligibility.model';
import type {
  CreateEligibilityInput,
  UpdateEligibilityInput,
  EligibilityQueryInput,
  BulkImportEligibilityInput,
} from './eligibility.validator';

/**
 * Valid eligibility status transitions.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'MANUAL_REVIEW_REQUIRED', 'ARCHIVED'],
  PROCESSING: ['ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONAL', 'MANUAL_REVIEW_REQUIRED', 'ARCHIVED'],
  ELIGIBLE: ['CONDITIONAL', 'NOT_ELIGIBLE', 'ARCHIVED'],
  NOT_ELIGIBLE: ['ELIGIBLE', 'CONDITIONAL', 'ARCHIVED'],
  CONDITIONAL: ['ELIGIBLE', 'NOT_ELIGIBLE', 'ARCHIVED'],
  MANUAL_REVIEW_REQUIRED: ['ELIGIBLE', 'NOT_ELIGIBLE', 'CONDITIONAL', 'ARCHIVED'],
};

export class EligibilityService {
  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Creates a new eligibility record.
   * @param input - Validated create eligibility payload.
   * @param createdBy - ID of the user creating the record.
   * @returns The created eligibility record.
   * @throws ConflictError if eligibility ID or duplicate applicant already exists.
   */
  public async createEligibility(input: CreateEligibilityInput, createdBy: string): Promise<EligibilityDocument> {
    const normalizedEligibilityId = `ELIG-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const normalizedApplicationNumber = input.applicationNumber.trim().toUpperCase();

    if (await eligibilityRepository.existsByEligibilityId(normalizedEligibilityId)) {
      throw new ConflictError('An eligibility record with this ID already exists');
    }

    const existingEligibility = await eligibilityRepository.findByApplicantId(input.applicantId);
    if (existingEligibility) {
      throw new ConflictError('An eligibility record already exists for this applicant');
    }

    const eligibility = await eligibilityRepository.create({
      ...input,
      eligibilityId: normalizedEligibilityId,
      applicationNumber: normalizedApplicationNumber,
      createdBy,
      updatedBy: createdBy,
    });

    // TODO: Domain event hook - EligibilityCreated
    // Publish EligibilityCreated event for downstream consumers.

    // TODO: AI service hook - runEligibilityCheck
    // SharedAiService.runEligibilityCheck(eligibility.id);

    return eligibility;
  }

  /**
   * Updates an existing eligibility record.
   * @param id - Eligibility document ID.
   * @param input - Partial update payload.
   * @param updatedBy - ID of the user performing the update.
   * @returns The updated eligibility record, or null if not found.
   */
  public async updateEligibility(id: string, input: UpdateEligibilityInput, updatedBy: string): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Cannot update a deleted eligibility record');
    }

    const updated = await eligibilityRepository.updateById(id, {
      ...input,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  /**
   * Retrieves an eligibility record by its internal MongoDB ID.
   * @param id - Eligibility document ID.
   * @returns Eligibility record or null.
   */
  public async getEligibility(id: string): Promise<EligibilityDocument | null> {
    return eligibilityRepository.findById(id);
  }

  /**
   * Retrieves an eligibility record by applicant ID.
   * @param applicantId - Applicant ID.
   * @returns Eligibility record or null.
   */
  public async getEligibilityByApplicantId(applicantId: string): Promise<EligibilityDocument | null> {
    return eligibilityRepository.findByApplicantId(applicantId);
  }

  /**
   * Soft deletes an eligibility record.
   * @param id - Eligibility document ID.
   * @param deletedBy - ID of the user performing the deletion.
   */
  public async deleteEligibility(id: string, deletedBy: string): Promise<void> {
    const eligibility = await eligibilityRepository.findById(id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Eligibility record is already deleted');
    }

    await eligibilityRepository.softDelete(id, deletedBy);

    // TODO: Domain event hook - EligibilityDeleted
    // Publish EligibilityDeleted event.
  }

  /**
   * Restores a previously soft-deleted eligibility record.
   * @param id - Eligibility document ID.
   * @returns Restored eligibility record or null.
   */
  public async restoreEligibility(id: string): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (!eligibility.deletedAt) {
      throw new BadRequestError('Eligibility record is not deleted');
    }

    const restored = await eligibilityRepository.restore(id);

    if (restored) {
      // TODO: Domain event hook - EligibilityRestored
      // Publish EligibilityRestored event.
    }

    return restored;
  }

  // ─── ELIGIBILITY CHECK ────────────────────────────────────────────────────

  /**
   * Runs eligibility check for an applicant.
   * @param input - Run eligibility check payload.
   * @param runBy - ID of the user or system running the check.
   * @returns Updated eligibility record.
   * @throws BadRequestError if eligibility record is not in PENDING or PROCESSING state.
   */
  public async runEligibilityCheck(input: { applicantId: string; applicationNumber: string; ruleTypes: string[] }, runBy: string): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findByApplicantId(input.applicantId);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Cannot run eligibility check on a deleted record');
    }

    if (eligibility.status !== 'PENDING' && eligibility.status !== 'PROCESSING') {
      throw new BadRequestError('Eligibility check can only be run on PENDING or PROCESSING records');
    }

    await eligibilityRepository.updateStatus(eligibility.id, 'PROCESSING', runBy);

    // TODO: Eligibility engine hook - runRules
    // SharedEligibilityEngine.runRules(eligibility.id, input.ruleTypes);

    // TODO: AI service hook - generateRecommendation
    // SharedAiService.generateEligibilityRecommendation(eligibility.id);

    return eligibilityRepository.findById(eligibility.id);
  }

  /**
   * Updates eligibility status with transition validation.
   * @param eligibilityId - Eligibility document ID.
   * @param newStatus - Target status.
   * @param updatedBy - ID of the user changing the status.
   * @param reason - Optional transition reason.
   * @returns Updated eligibility record.
   * @throws BadRequestError on invalid transitions.
   */
  public async updateEligibilityStatus(eligibilityId: string, newStatus: string, updatedBy: string, reason?: string): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(eligibilityId);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Cannot update status of a deleted eligibility record');
    }

    const currentStatus = eligibility.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    await eligibilityRepository.updateStatus(eligibilityId, newStatus, updatedBy);

    const decisionEntry: EligibilitySchemaType['decisionHistory'][0] = {
      decisionId: `DC-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      decision: newStatus as EligibilitySchemaType['decisionHistory'][0]['decision'],
      reviewedBy: updatedBy,
      remarks: reason?.trim(),
      createdAt: new Date(),
    };

    await eligibilityRepository.addDecisionHistory(eligibilityId, decisionEntry);

    // TODO: Domain event hook - EligibilityStatusChanged
    // Publish EligibilityStatusChanged event.

    return eligibilityRepository.findById(eligibilityId);
  }

  // ─── AI HOOKS ─────────────────────────────────────────────────────────────

  /**
   * Updates AI confidence for an eligibility record.
   * @param eligibilityId - Eligibility document ID.
   * @param aiConfidence - AI confidence details.
   * @returns Updated eligibility record.
   */
  public async updateAIConfidence(eligibilityId: string, aiConfidence: EligibilitySchemaType['aiConfidence']): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(eligibilityId);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Cannot update AI confidence of a deleted eligibility record');
    }

    const updated = await eligibilityRepository.updateAIConfidence(eligibilityId, aiConfidence);

    // TODO: AI service hook - confidenceUpdated
    // SharedAiService.updateEligibilityConfidence(eligibilityId, aiConfidence);

    return updated;
  }

  /**
   * Updates reason generation for an eligibility record.
   * @param eligibilityId - Eligibility document ID.
   * @param reasonGeneration - Reason generation details.
   * @returns Updated eligibility record.
   */
  public async updateReasonGeneration(eligibilityId: string, reasonGeneration: EligibilitySchemaType['reasonGeneration']): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(eligibilityId);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Cannot update reason generation of a deleted eligibility record');
    }

    const updated = await eligibilityRepository.updateReasonGeneration(eligibilityId, reasonGeneration);

    // TODO: AI service hook - reasonGenerationUpdated
    // SharedAiService.updateEligibilityReasons(eligibilityId, reasonGeneration);

    return updated;
  }

  /**
   * Updates recommendation for an eligibility record.
   * @param eligibilityId - Eligibility document ID.
   * @param recommendation - Recommendation details.
   * @returns Updated eligibility record.
   */
  public async updateRecommendation(eligibilityId: string, recommendation: EligibilitySchemaType['recommendation']): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(eligibilityId);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Cannot update recommendation of a deleted eligibility record');
    }

    const updated = await eligibilityRepository.updateRecommendation(eligibilityId, recommendation);

    // TODO: AI service hook - recommendationUpdated
    // SharedAiService.updateEligibilityRecommendation(eligibilityId, recommendation);

    return updated;
  }

  // ─── SEARCH / FILTER ─────────────────────────────────────────────────────

  /**
   * Lists eligibilities with text search, filters, sorting, and pagination.
   * @param query - Search and filter inputs.
   * @returns Paginated eligibility results.
   */
  public async listEligibilities(query: EligibilityQueryInput): Promise<{ items: EligibilityDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.status) filter.status = query.status;
    if (query.applicantId) filter.applicantId = query.applicantId;
    if (query.applicationNumber) filter.applicationNumber = query.applicationNumber;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return eligibilityRepository.filterEligibilities(filter, query.page, query.limit, sortOption);
  }

  /**
   * Performs a text search across indexed eligibility fields.
   * @param searchQuery - Search text.
   * @param page - Page number.
   * @param limit - Page size.
   * @returns Paginated search results.
   */
  public async searchEligibilities(searchQuery: string, page = 1, limit = 20): Promise<{ items: EligibilityDocument[]; total: number }> {
    return eligibilityRepository.searchEligibilities(searchQuery, page, limit);
  }

  // ─── ARCHIVE / RESTORE ────────────────────────────────────────────────────

  /**
   * Archives an eligibility record.
   * @param id - Eligibility document ID.
   * @param archivedBy - ID of the user archiving the record.
   * @returns Archived eligibility record.
   */
  public async archiveEligibility(id: string, archivedBy: string): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.deletedAt) {
      throw new BadRequestError('Cannot archive a deleted eligibility record');
    }

    if (!eligibility.isActive) {
      throw new BadRequestError('Eligibility record is already archived');
    }

    const archived = await eligibilityRepository.archive(id, archivedBy);

    // TODO: Domain event hook - EligibilityArchived
    // Publish EligibilityArchived event.

    return archived;
  }

  /**
   * Restores an archived eligibility record.
   * @param id - Eligibility document ID.
   * @param restoredBy - ID of the user restoring the record.
   * @returns Restored eligibility record.
   */
  public async restoreArchivedEligibility(id: string, restoredBy: string): Promise<EligibilityDocument | null> {
    const eligibility = await eligibilityRepository.findById(id);
    if (!eligibility) {
      throw new NotFoundError('Eligibility record not found');
    }

    if (eligibility.isActive) {
      throw new BadRequestError('Only archived eligibility records can be restored');
    }

    const restored = await eligibilityRepository.restoreArchive(id, restoredBy);

    // TODO: Domain event hook - EligibilityRestored
    // Publish EligibilityRestored event.

    return restored;
  }

  // ─── BULK OPERATIONS ──────────────────────────────────────────────────────

  /**
   * Bulk-creates eligibility records with per-item error handling.
   * @param input - Bulk import payload.
   * @param createdBy - ID of the user performing the bulk creation.
   * @returns Summary of created, failed, and error messages.
   */
  public async bulkCreateEligibilities(input: BulkImportEligibilityInput, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const eligibilityData of input.eligibilities) {
      try {
        await this.createEligibility(eligibilityData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${eligibilityData.applicationNumber || 'unknown'}: ${(error as Error).message}`);
      }
    }

    // TODO: Domain event hook - BulkEligibilitiesCreated
    // Publish BulkEligibilitiesCreated event with summary counts.

    return { created, failed, errors };
  }

  // ─── STATISTICS ───────────────────────────────────────────────────────────

  /**
   * Counts eligibilities by status.
   * @param status - Eligibility status.
   * @returns Count of eligibilities with the given status.
   */
  public async countByStatus(status: string): Promise<number> {
    return eligibilityRepository.countByStatus(status);
  }

  /**
   * Counts eligible applicants.
   * @returns Count of eligible applicants.
   */
  public async countEligible(): Promise<number> {
    return eligibilityRepository.countEligible();
  }

  /**
   * Counts not eligible applicants.
   * @returns Count of not eligible applicants.
   */
  public async countNotEligible(): Promise<number> {
    return eligibilityRepository.countNotEligible();
  }

  /**
   * Counts eligibilities pending manual review.
   * @returns Count of eligibilities pending manual review.
   */
  public async countPendingReview(): Promise<number> {
    return eligibilityRepository.countPendingReview();
  }
}

export const eligibilityService = new EligibilityService();
