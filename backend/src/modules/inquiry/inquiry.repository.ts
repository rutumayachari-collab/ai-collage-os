import { BaseRepository } from '../../shared/repositories/base.repository';
import { InquiryModel, type InquiryDocument, type InquirySchemaType } from './inquiry.model';

export class InquiryRepository extends BaseRepository<InquirySchemaType> {
  constructor() {
    super(InquiryModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findByInquiryId(inquiryId: string): Promise<InquiryDocument | null> {
    return this.model.findOne({ inquiryId, deletedAt: { $exists: false } }).exec();
  }

  public async findByInquiryNumber(inquiryNumber: string): Promise<InquiryDocument | null> {
    return this.model.findOne({ inquiryNumber: inquiryNumber.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByEmail(email: string): Promise<InquiryDocument | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPhone(phone: string): Promise<InquiryDocument | null> {
    return this.model.findOne({ phone, deletedAt: { $exists: false } }).exec();
  }

  public async findByFullName(fullName: string): Promise<InquiryDocument[]> {
    return this.model.find({ fullName: fullName.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPreferredCourse(preferredCourseId: string): Promise<InquiryDocument[]> {
    return this.model.find({ preferredCourseId, deletedAt: { $exists: false } }).exec();
  }

  public async findByPreferredDepartment(preferredDepartmentId: string): Promise<InquiryDocument[]> {
    return this.model.find({ preferredDepartmentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByAssignedCounselor(assignedCounselorId: string): Promise<InquiryDocument[]> {
    return this.model.find({ assignedCounselorId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCampaign(campaign: string): Promise<InquiryDocument[]> {
    return this.model.find({ campaign, deletedAt: { $exists: false } }).exec();
  }

  public async findBySource(source: string): Promise<InquiryDocument[]> {
    return this.model.find({ source, deletedAt: { $exists: false } }).exec();
  }

  public async findByStatus(status: string): Promise<InquiryDocument[]> {
    return this.model.find({ status, deletedAt: { $exists: false } }).exec();
  }

  public async findByPriority(priority: string): Promise<InquiryDocument[]> {
    return this.model.find({ priority, deletedAt: { $exists: false } }).exec();
  }

  public async findByTag(tag: string): Promise<InquiryDocument[]> {
    return this.model.find({ tags: tag, deletedAt: { $exists: false } }).exec();
  }

  public async findByLeadScoreRange(minScore: number, maxScore: number): Promise<InquiryDocument[]> {
    return this.model.find({ aiLeadScore: { $gte: minScore, $lte: maxScore }, deletedAt: { $exists: false } }).exec();
  }

  public async findByConversionStatus(isConverted: boolean): Promise<InquiryDocument[]> {
    return this.model.find({ 'conversion.isConverted': isConverted, deletedAt: { $exists: false } }).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listInquiries(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: InquiryDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchInquiries(searchQuery: string, page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterInquiries(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: InquiryDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.source) query.source = filters.source;
    if (filters.preferredCourseId) query.preferredCourseId = filters.preferredCourseId;
    if (filters.preferredDepartmentId) query.preferredDepartmentId = filters.preferredDepartmentId;
    if (filters.assignedCounselorId) query.assignedCounselorId = filters.assignedCounselorId;
    if (filters.aiIntent) query.aiIntent = filters.aiIntent;
    if (filters.aiRiskLevel) query.aiRiskLevel = filters.aiRiskLevel;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.campaignId) query.campaignId = filters.campaignId;
    if (filters.tag) query.tags = filters.tag;

    if (filters.aiLeadScoreMin !== undefined || filters.aiLeadScoreMax !== undefined) {
      query.aiLeadScore = {};
      if (filters.aiLeadScoreMin !== undefined) (query.aiLeadScore as Record<string, unknown>).$gte = filters.aiLeadScoreMin;
      if (filters.aiLeadScoreMax !== undefined) (query.aiLeadScore as Record<string, unknown>).$lte = filters.aiLeadScoreMax;
    }

    if (filters.inquiryDateFrom || filters.inquiryDateTo) {
      query.inquiryDate = {};
      if (filters.inquiryDateFrom) (query.inquiryDate as Record<string, unknown>).$gte = filters.inquiryDateFrom;
      if (filters.inquiryDateTo) (query.inquiryDate as Record<string, unknown>).$lte = filters.inquiryDateTo;
    }

    if (filters.nextFollowUpDateFrom || filters.nextFollowUpDateTo) {
      query.nextFollowUpDate = {};
      if (filters.nextFollowUpDateFrom) (query.nextFollowUpDate as Record<string, unknown>).$gte = filters.nextFollowUpDateFrom;
      if (filters.nextFollowUpDateTo) (query.nextFollowUpDate as Record<string, unknown>).$lte = filters.nextFollowUpDateTo;
    }

    return this.paginate(query, page, limit, sort);
  }

  public async searchByTimeline(searchQuery: string, page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, 'timeline.description': { $exists: true }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async advancedSearch(filters: Record<string, unknown>, page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.source) query.source = filters.source;
    if (filters.preferredCourseId) query.preferredCourseId = filters.preferredCourseId;
    if (filters.preferredDepartmentId) query.preferredDepartmentId = filters.preferredDepartmentId;
    if (filters.assignedCounselorId) query.assignedCounselorId = filters.assignedCounselorId;
    if (filters.aiIntent) query.aiIntent = filters.aiIntent;
    if (filters.aiRiskLevel) query.aiRiskLevel = filters.aiRiskLevel;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.campaignId) query.campaignId = filters.campaignId;
    if (filters.tag) query.tags = filters.tag;

    if (filters.aiLeadScoreMin !== undefined || filters.aiLeadScoreMax !== undefined) {
      query.aiLeadScore = {};
      if (filters.aiLeadScoreMin !== undefined) (query.aiLeadScore as Record<string, unknown>).$gte = filters.aiLeadScoreMin;
      if (filters.aiLeadScoreMax !== undefined) (query.aiLeadScore as Record<string, unknown>).$lte = filters.aiLeadScoreMax;
    }

    if (filters.inquiryDateFrom || filters.inquiryDateTo) {
      query.inquiryDate = {};
      if (filters.inquiryDateFrom) (query.inquiryDate as Record<string, unknown>).$gte = filters.inquiryDateFrom;
      if (filters.inquiryDateTo) (query.inquiryDate as Record<string, unknown>).$lte = filters.inquiryDateTo;
    }

    if (filters.nextFollowUpDateFrom || filters.nextFollowUpDateTo) {
      query.nextFollowUpDate = {};
      if (filters.nextFollowUpDateFrom) (query.nextFollowUpDate as Record<string, unknown>).$gte = filters.nextFollowUpDateFrom;
      if (filters.nextFollowUpDateTo) (query.nextFollowUpDate as Record<string, unknown>).$lte = filters.nextFollowUpDateTo;
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (filters.sort) {
      sortOption[filters.sort as string] = filters.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return this.paginate(query, page, limit, sortOption);
  }

  // ─── Counselor ─────────────────────────────────────────────────────────────

  public async assignCounselor(inquiryId: string, counselorId: string, assignedAt?: Date): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { assignedCounselorId: counselorId, assignedAt: assignedAt || new Date(), updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeCounselor(inquiryId: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $unset: { assignedCounselorId: '', assignedAt: '' }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateCounselorNotes(inquiryId: string, notes: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { counselorNotes: notes, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateCounselingOutcome(inquiryId: string, counselingOutcome: InquirySchemaType['counselingOutcome']): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { counselingOutcome, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async getCounselorWorkload(counselorId: string): Promise<number> {
    return this.count({ assignedCounselorId: counselorId, deletedAt: { $exists: false } });
  }

  public async listCounselorInquiries(counselorId: string, page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    const filter: Record<string, unknown> = { assignedCounselorId: counselorId, deletedAt: { $exists: false } };
    const sort: Record<string, 1 | -1> = { createdAt: -1 };
    return this.paginate(filter, page, limit, sort);
  }

  // ─── Timeline ──────────────────────────────────────────────────────────────

  public async addTimelineEvent(inquiryId: string, event: InquirySchemaType['timeline'][0]): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $push: { timeline: event }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async listTimeline(inquiryId: string): Promise<InquiryDocument | null> {
    return this.model.findOne({ _id: inquiryId, deletedAt: { $exists: false } }, { timeline: 1 }).exec();
  }

  public async getLatestTimelineEvent(inquiryId: string): Promise<InquiryDocument | null> {
    return this.model.findOne({ _id: inquiryId, deletedAt: { $exists: false } }, { timeline: { $slice: 1 } }).exec();
  }

  public async clearTimeline(inquiryId: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { timeline: [], updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Follow Up ─────────────────────────────────────────────────────────────

  public async scheduleFollowUp(inquiryId: string, nextFollowUpDate: Date): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { nextFollowUpDate, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateFollowUp(inquiryId: string, lastContactDate: Date, lastFollowUpResult: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { lastContactDate, lastFollowUpResult, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async incrementFollowUpCount(inquiryId: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $inc: { followUpCount: 1 }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async listPendingFollowUps(page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    const filter: Record<string, unknown> = { nextFollowUpDate: { $exists: true, $ne: null }, deletedAt: { $exists: false } };
    const sort: Record<string, 1 | -1> = { nextFollowUpDate: 1 };
    return this.paginate(filter, page, limit, sort);
  }

  public async listOverdueFollowUps(page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    const filter: Record<string, unknown> = { nextFollowUpDate: { $lt: new Date() }, deletedAt: { $exists: false } };
    const sort: Record<string, 1 | -1> = { nextFollowUpDate: 1 };
    return this.paginate(filter, page, limit, sort);
  }

  // ─── AI Data Access ────────────────────────────────────────────────────────

  public async updateAISummary(inquiryId: string, aiSummary: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { aiSummary, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateLeadScore(inquiryId: string, aiLeadScore: number, historyEntry: InquirySchemaType['aiLeadScoreHistory'][0]): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { aiLeadScore, updatedAt: new Date() }, $push: { aiLeadScoreHistory: historyEntry } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateRecommendedCourses(inquiryId: string, aiRecommendedCourseIds: string[], aiRecommendedDepartmentId?: string): Promise<InquiryDocument | null> {
    const update: Record<string, unknown> = { aiRecommendedCourseIds, updatedAt: new Date() };
    if (aiRecommendedDepartmentId) {
      update.aiRecommendedDepartmentId = aiRecommendedDepartmentId;
    }
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: update },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateAIIntent(inquiryId: string, aiIntent: InquirySchemaType['aiIntent'], aiConfidenceScore?: number): Promise<InquiryDocument | null> {
    const update: Record<string, unknown> = { aiIntent, updatedAt: new Date() };
    if (aiConfidenceScore !== undefined) {
      update.aiConfidenceScore = aiConfidenceScore;
    }
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: update },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateAISentiment(inquiryId: string, aiSentiment: InquirySchemaType['aiSentiment'], aiRiskLevel?: InquirySchemaType['aiRiskLevel']): Promise<InquiryDocument | null> {
    const update: Record<string, unknown> = { aiSentiment, updatedAt: new Date() };
    if (aiRiskLevel) {
      update.aiRiskLevel = aiRiskLevel;
    }
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: update },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateAIConversation(inquiryId: string, aiConversationSummary: string, aiNextBestAction?: string): Promise<InquiryDocument | null> {
    const update: Record<string, unknown> = { aiConversationSummary, updatedAt: new Date() };
    if (aiNextBestAction) {
      update.aiNextBestAction = aiNextBestAction;
    }
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: update },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Conversion ────────────────────────────────────────────────────────────

  public async markConverted(inquiryId: string, applicantId: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { 'conversion.isConverted': true, 'conversion.applicantId': applicantId, 'conversion.convertedAt': new Date(), updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateConversion(inquiryId: string, conversion: Partial<InquirySchemaType['conversion']>): Promise<InquiryDocument | null> {
    const update: Record<string, unknown> = { 'conversion': conversion, updatedAt: new Date() };
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: update },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async getConversion(inquiryId: string): Promise<InquiryDocument | null> {
    return this.model.findOne({ _id: inquiryId, deletedAt: { $exists: false } }, { conversion: 1 }).exec();
  }

  public async listConverted(page = 1, limit = 20): Promise<{ items: InquiryDocument[]; total: number }> {
    const filter: Record<string, unknown> = { 'conversion.isConverted': true, deletedAt: { $exists: false } };
    const sort: Record<string, 1 | -1> = { 'conversion.convertedAt': -1 };
    return this.paginate(filter, page, limit, sort);
  }

  // ─── Archive / Restore ─────────────────────────────────────────────────────

  public async archive(inquiryId: string, archivedBy: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { status: 'ARCHIVED', isActive: false, archivedBy, archivedAt: new Date(), updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchive(inquiryId: string, restoredBy: string): Promise<InquiryDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      inquiryId,
      { $set: { status: 'NEW', isActive: true, archivedBy: undefined, archivedAt: undefined, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  public async softDelete(inquiryId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: inquiryId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(inquiryId: string): Promise<InquiryDocument | null> {
    const result = await this.model.updateOne({ _id: inquiryId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(inquiryId).exec();
    }
    return null;
  }

  // ─── Existence ─────────────────────────────────────────────────────────────

  public async existsByInquiryId(inquiryId: string): Promise<boolean> {
    return this.exists({ inquiryId, deletedAt: { $exists: false } });
  }

  public async existsByInquiryNumber(inquiryNumber: string): Promise<boolean> {
    return this.exists({ inquiryNumber: inquiryNumber.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase(), deletedAt: { $exists: false } });
  }

  public async existsByPhone(phone: string): Promise<boolean> {
    return this.exists({ phone, deletedAt: { $exists: false } });
  }

  public async existsDuplicate(fullName: string, email: string, phone: string): Promise<boolean> {
    return this.exists({
      $or: [
        { fullName: fullName.trim(), email: email.toLowerCase(), deletedAt: { $exists: false } },
        { phone, deletedAt: { $exists: false } },
      ],
    });
  }

  // ─── Counts ────────────────────────────────────────────────────────────────

  public async countByStatus(status: string): Promise<number> {
    return this.count({ status, deletedAt: { $exists: false } });
  }

  public async countBySource(source: string): Promise<number> {
    return this.count({ source, deletedAt: { $exists: false } });
  }

  public async countByCourse(preferredCourseId: string): Promise<number> {
    return this.count({ preferredCourseId, deletedAt: { $exists: false } });
  }

  public async countByDepartment(preferredDepartmentId: string): Promise<number> {
    return this.count({ preferredDepartmentId, deletedAt: { $exists: false } });
  }

  public async countByCounselor(assignedCounselorId: string): Promise<number> {
    return this.count({ assignedCounselorId, deletedAt: { $exists: false } });
  }

  public async countHotLeads(minScore = 70): Promise<number> {
    return this.count({ aiLeadScore: { $gte: minScore }, deletedAt: { $exists: false } });
  }

  public async countConverted(): Promise<number> {
    return this.count({ 'conversion.isConverted': true, deletedAt: { $exists: false } });
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(inquiries: Partial<InquirySchemaType>[]): Promise<InquiryDocument[]> {
    return this.model.insertMany(inquiries, { ordered: true }) as Promise<InquiryDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<InquirySchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }
}

export const inquiryRepository = new InquiryRepository();
