import { BaseRepository } from '../../shared/repositories/base.repository';
import { EligibilityModel, type EligibilityDocument, type EligibilitySchemaType } from './eligibility.model';

export class EligibilityRepository extends BaseRepository<EligibilitySchemaType> {
  constructor() {
    super(EligibilityModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findByEligibilityId(eligibilityId: string): Promise<EligibilityDocument | null> {
    return this.model.findOne({ eligibilityId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicantId(applicantId: string): Promise<EligibilityDocument | null> {
    return this.model.findOne({ applicantId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicationNumber(applicationNumber: string): Promise<EligibilityDocument | null> {
    return this.model.findOne({ applicationNumber: applicationNumber.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByStatus(status: string): Promise<EligibilityDocument[]> {
    return this.model.find({ status, deletedAt: { $exists: false } }).exec();
  }

  public async findByAIConfidenceLevel(level: string): Promise<EligibilityDocument[]> {
    return this.model.find({ 'aiConfidence.level': level, deletedAt: { $exists: false } }).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listEligibilities(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: EligibilityDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchEligibilities(searchQuery: string, page = 1, limit = 20): Promise<{ items: EligibilityDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterEligibilities(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: EligibilityDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.status) query.status = filters.status;
    if (filters.applicantId) query.applicantId = filters.applicantId;
    if (filters.applicationNumber) query.applicationNumber = filters.applicationNumber;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.aiConfidenceLevel) query['aiConfidence.level'] = filters.aiConfidenceLevel;

    if (filters.minAiScore !== undefined || filters.maxAiScore !== undefined) {
      query['aiConfidence.score'] = {};
      if (filters.minAiScore !== undefined) (query['aiConfidence.score'] as Record<string, unknown>).$gte = filters.minAiScore;
      if (filters.maxAiScore !== undefined) (query['aiConfidence.score'] as Record<string, unknown>).$lte = filters.maxAiScore;
    }

    return this.paginate(query, page, limit, sort);
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  public async updateStatus(eligibilityId: string, status: string, updatedBy: string): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $set: { status, updatedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateCheckResults(eligibilityId: string, checkResults: EligibilitySchemaType['checkResults']): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $set: { checkResults, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateAIConfidence(eligibilityId: string, aiConfidence: EligibilitySchemaType['aiConfidence']): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $set: { aiConfidence, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateReasonGeneration(eligibilityId: string, reasonGeneration: EligibilitySchemaType['reasonGeneration']): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $set: { reasonGeneration, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateRecommendation(eligibilityId: string, recommendation: EligibilitySchemaType['recommendation']): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $set: { recommendation, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addDecisionHistory(eligibilityId: string, decisionEntry: EligibilitySchemaType['decisionHistory'][0]): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $push: { decisionHistory: decisionEntry }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Archive / Restore ─────────────────────────────────────────────────────

  public async archive(eligibilityId: string, archivedBy: string): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $set: { isActive: false, archivedBy, archivedAt: new Date(), updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchive(eligibilityId: string, restoredBy: string): Promise<EligibilityDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      eligibilityId,
      { $set: { isActive: true, archivedBy: undefined, archivedAt: undefined, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  public async softDelete(eligibilityId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: eligibilityId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(eligibilityId: string): Promise<EligibilityDocument | null> {
    const result = await this.model.updateOne({ _id: eligibilityId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(eligibilityId).exec();
    }
    return null;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  public async countByStatus(status: string): Promise<number> {
    return this.count({ status, deletedAt: { $exists: false } });
  }

  public async countEligible(): Promise<number> {
    return this.count({ status: 'ELIGIBLE', deletedAt: { $exists: false } });
  }

  public async countNotEligible(): Promise<number> {
    return this.count({ status: 'NOT_ELIGIBLE', deletedAt: { $exists: false } });
  }

  public async countPendingReview(): Promise<number> {
    return this.count({ status: 'MANUAL_REVIEW_REQUIRED', deletedAt: { $exists: false } });
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(eligibilities: Partial<EligibilitySchemaType>[]): Promise<EligibilityDocument[]> {
    return this.model.insertMany(eligibilities, { ordered: true }) as Promise<EligibilityDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<EligibilitySchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  // ─── Existence ─────────────────────────────────────────────────────────────

  public async existsByEligibilityId(eligibilityId: string): Promise<boolean> {
    return this.exists({ eligibilityId, deletedAt: { $exists: false } });
  }

  public async existsByApplicantId(applicantId: string): Promise<boolean> {
    return this.exists({ applicantId, deletedAt: { $exists: false } });
  }

  public async existsByApplicationNumber(applicationNumber: string): Promise<boolean> {
    return this.exists({ applicationNumber: applicationNumber.toUpperCase(), deletedAt: { $exists: false } });
  }
}

export const eligibilityRepository = new EligibilityRepository();
