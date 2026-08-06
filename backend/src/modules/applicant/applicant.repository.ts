import { BaseRepository } from '../../shared/repositories/base.repository';
import { ApplicantModel, type ApplicantDocument, type ApplicantSchemaType } from './applicant.model';

export class ApplicantRepository extends BaseRepository<ApplicantSchemaType> {
  constructor() {
    super(ApplicantModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findByApplicantId(applicantId: string): Promise<ApplicantDocument | null> {
    return this.model.findOne({ applicantId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicationNumber(applicationNumber: string): Promise<ApplicantDocument | null> {
    return this.model.findOne({ applicationNumber: applicationNumber.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByInquiryId(inquiryId: string): Promise<ApplicantDocument | null> {
    return this.model.findOne({ inquiryId, deletedAt: { $exists: false } }).exec();
  }

  public async findByEmail(email: string): Promise<ApplicantDocument | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPhone(phone: string): Promise<ApplicantDocument | null> {
    return this.model.findOne({ phone, deletedAt: { $exists: false } }).exec();
  }

  public async findByFullName(fullName: string): Promise<ApplicantDocument[]> {
    return this.model.find({ fullName: fullName.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async findByPreferredCourse(preferredCourseId: string): Promise<ApplicantDocument[]> {
    return this.model.find({ preferredCourseId, deletedAt: { $exists: false } }).exec();
  }

  public async findByPreferredDepartment(preferredDepartmentId: string): Promise<ApplicantDocument[]> {
    return this.model.find({ preferredDepartmentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByStatus(status: string): Promise<ApplicantDocument[]> {
    return this.model.find({ status, deletedAt: { $exists: false } }).exec();
  }

  public async findByPriority(priority: string): Promise<ApplicantDocument[]> {
    return this.model.find({ priority, deletedAt: { $exists: false } }).exec();
  }

  public async findByAdmissionRound(admissionRound: string): Promise<ApplicantDocument[]> {
    return this.model.find({ admissionRound, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicationChannel(applicationChannel: string): Promise<ApplicantDocument[]> {
    return this.model.find({ applicationChannel, deletedAt: { $exists: false } }).exec();
  }

  public async findByAssignedReviewer(assignedReviewerId: string): Promise<ApplicantDocument[]> {
    return this.model.find({ assignedReviewerId, deletedAt: { $exists: false } }).exec();
  }

  public async findByAssignedInterviewer(assignedInterviewerId: string): Promise<ApplicantDocument[]> {
    return this.model.find({ assignedInterviewerId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCampaign(campaign: string): Promise<ApplicantDocument[]> {
    return this.model.find({ campaign, deletedAt: { $exists: false } }).exec();
  }

  public async findBySource(source: string): Promise<ApplicantDocument[]> {
    return this.model.find({ source, deletedAt: { $exists: false } }).exec();
  }

  public async findByAIConfidence(minScore: number, maxScore: number): Promise<ApplicantDocument[]> {
    return this.model.find({ aiRecommendationScore: { $gte: minScore, $lte: maxScore }, deletedAt: { $exists: false } }).exec();
  }

  public async findByAIRiskLevel(aiRiskLevel: string): Promise<ApplicantDocument[]> {
    return this.model.find({ aiRiskLevel, deletedAt: { $exists: false } }).exec();
  }

  public async findByConversionStatus(isConverted: boolean): Promise<ApplicantDocument[]> {
    return this.model.find({ 'conversion.studentId': { $exists: isConverted }, deletedAt: { $exists: false } }).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listApplicants(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: ApplicantDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchApplicants(searchQuery: string, page = 1, limit = 20): Promise<{ items: ApplicantDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterApplicants(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: ApplicantDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.admissionRound) query.admissionRound = filters.admissionRound;
    if (filters.applicationChannel) query.applicationChannel = filters.applicationChannel;
    if (filters.preferredCourseId) query.preferredCourseId = filters.preferredCourseId;
    if (filters.preferredDepartmentId) query.preferredDepartmentId = filters.preferredDepartmentId;
    if (filters.assignedReviewerId) query.assignedReviewerId = filters.assignedReviewerId;
    if (filters.assignedInterviewerId) query.assignedInterviewerId = filters.assignedInterviewerId;
    if (filters.paymentStatus) query['feeSummary.paymentStatus'] = filters.paymentStatus;
    if (filters.aiRiskLevel) query.aiRiskLevel = filters.aiRiskLevel;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.campaignId) query.campaignId = filters.campaignId;

    if (filters.aiEligibilityScoreMin !== undefined || filters.aiEligibilityScoreMax !== undefined) {
      query.aiEligibilityScore = {};
      if (filters.aiEligibilityScoreMin !== undefined) (query.aiEligibilityScore as Record<string, unknown>).$gte = filters.aiEligibilityScoreMin;
      if (filters.aiEligibilityScoreMax !== undefined) (query.aiEligibilityScore as Record<string, unknown>).$lte = filters.aiEligibilityScoreMax;
    }

    if (filters.aiRecommendationScoreMin !== undefined || filters.aiRecommendationScoreMax !== undefined) {
      query.aiRecommendationScore = {};
      if (filters.aiRecommendationScoreMin !== undefined) (query.aiRecommendationScore as Record<string, unknown>).$gte = filters.aiRecommendationScoreMin;
      if (filters.aiRecommendationScoreMax !== undefined) (query.aiRecommendationScore as Record<string, unknown>).$lte = filters.aiRecommendationScoreMax;
    }

    if (filters.applicationDateFrom || filters.applicationDateTo) {
      query.applicationDate = {};
      if (filters.applicationDateFrom) (query.applicationDate as Record<string, unknown>).$gte = filters.applicationDateFrom;
      if (filters.applicationDateTo) (query.applicationDate as Record<string, unknown>).$lte = filters.applicationDateTo;
    }

    return this.paginate(query, page, limit, sort);
  }

  // ─── Workflow ─────────────────────────────────────────────────────────────

  public async updateStatus(applicantId: string, status: string, updatedBy: string): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { status, updatedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateWorkflowHistory(applicantId: string, workflowHistory: ApplicantSchemaType['workflowHistory']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { workflowHistory, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async appendWorkflowHistory(applicantId: string, entry: ApplicantSchemaType['workflowHistory'][0]): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $push: { workflowHistory: entry }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Checklist ────────────────────────────────────────────────────────────

  public async updateChecklist(applicantId: string, checklist: ApplicantSchemaType['admissionChecklist']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { admissionChecklist: checklist, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Documents ────────────────────────────────────────────────────────────

  public async addDocument(applicantId: string, document: ApplicantSchemaType['submittedDocuments'][0]): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $push: { submittedDocuments: document }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateDocument(applicantId: string, documentId: string, updates: Partial<ApplicantSchemaType['submittedDocuments'][0]>): Promise<ApplicantDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: applicantId, 'submittedDocuments.id': documentId },
      { $set: { 'submittedDocuments.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async verifyDocument(applicantId: string, documentId: string, verified: boolean, verifiedBy?: string): Promise<ApplicantDocument | null> {
    const updateDoc: Record<string, unknown> = {
      'submittedDocuments.$.status': verified ? 'VERIFIED' : 'REJECTED',
      'submittedDocuments.$.verifiedAt': new Date(),
      updatedAt: new Date(),
    };
    if (verifiedBy) updateDoc['submittedDocuments.$.verifiedBy'] = verifiedBy;

    const result = await this.model.findOneAndUpdate(
      { _id: applicantId, 'submittedDocuments.id': documentId },
      { $set: updateDoc },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeDocument(applicantId: string, documentId: string): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $pull: { submittedDocuments: { id: documentId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Timeline ─────────────────────────────────────────────────────────────

  public async addTimelineEvent(applicantId: string, event: ApplicantSchemaType['timeline'][0]): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $push: { timeline: event }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Interview ────────────────────────────────────────────────────────────

  public async updateInterview(applicantId: string, interview: ApplicantSchemaType['interview']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { interview, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Scholarship ──────────────────────────────────────────────────────────

  public async updateScholarship(applicantId: string, scholarship: ApplicantSchemaType['scholarship']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { scholarship, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Seat Allocation ──────────────────────────────────────────────────────

  public async updateSeatAllocation(applicantId: string, seatAllocation: ApplicantSchemaType['seatAllocation']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { seatAllocation, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Fee Summary ──────────────────────────────────────────────────────────

  public async updateFeeSummary(applicantId: string, feeSummary: ApplicantSchemaType['feeSummary']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { feeSummary, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── AI Metadata ──────────────────────────────────────────────────────────

  public async updateAIMetadata(applicantId: string, updates: Record<string, unknown>): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Marketing ────────────────────────────────────────────────────────────

  public async updateMarketingAttribution(applicantId: string, updates: Record<string, unknown>): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Conversion ───────────────────────────────────────────────────────────

  public async updateConversion(applicantId: string, conversion: ApplicantSchemaType['conversion']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { conversion, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Offer Letter ─────────────────────────────────────────────────────────

  public async updateOfferLetter(applicantId: string, offerLetter: ApplicantSchemaType['offerLetter']): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { offerLetter, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Archive / Restore ─────────────────────────────────────────────────────

  public async archive(applicantId: string, archivedBy: string): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { status: 'ARCHIVED', isActive: false, archivedBy, archivedAt: new Date(), updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchive(applicantId: string, restoredBy: string): Promise<ApplicantDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      applicantId,
      { $set: { status: 'NEW', isActive: true, archivedBy: undefined, archivedAt: undefined, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  public async softDelete(applicantId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: applicantId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(applicantId: string): Promise<ApplicantDocument | null> {
    const result = await this.model.updateOne({ _id: applicantId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(applicantId).exec();
    }
    return null;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  public async countByStatus(status: string): Promise<number> {
    return this.count({ status, deletedAt: { $exists: false } });
  }

  public async countByAdmissionRound(admissionRound: string): Promise<number> {
    return this.count({ admissionRound, deletedAt: { $exists: false } });
  }

  public async countByApplicationChannel(applicationChannel: string): Promise<number> {
    return this.count({ applicationChannel, deletedAt: { $exists: false } });
  }

  public async countByPaymentStatus(paymentStatus: string): Promise<number> {
    return this.count({ 'feeSummary.paymentStatus': paymentStatus, deletedAt: { $exists: false } });
  }

  public async countConverted(): Promise<number> {
    return this.count({ 'conversion.studentId': { $exists: true }, deletedAt: { $exists: false } });
  }

  public async countHotLeads(minScore = 70): Promise<number> {
    return this.count({ aiRecommendationScore: { $gte: minScore }, deletedAt: { $exists: false } });
  }

  // ─── Existence ─────────────────────────────────────────────────────────────

  public async existsByApplicantId(applicantId: string): Promise<boolean> {
    return this.exists({ applicantId, deletedAt: { $exists: false } });
  }

  public async existsByApplicationNumber(applicationNumber: string): Promise<boolean> {
    return this.exists({ applicationNumber: applicationNumber.toUpperCase(), deletedAt: { $exists: false } });
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

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(applicants: Partial<ApplicantSchemaType>[]): Promise<ApplicantDocument[]> {
    return this.model.insertMany(applicants, { ordered: true }) as Promise<ApplicantDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<ApplicantSchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }
}

export const applicantRepository = new ApplicantRepository();
