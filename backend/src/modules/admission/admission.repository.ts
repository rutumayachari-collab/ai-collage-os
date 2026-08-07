import { BaseRepository } from '../../shared/repositories/base.repository';
import { AdmissionModel, type AdmissionDocument, type AdmissionSchemaType } from './admission.model';

export class AdmissionRepository extends BaseRepository<AdmissionSchemaType> {
  constructor() {
    super(AdmissionModel);
  }

  // ─── Lookup ────────────────────────────────────────────────────────────────

  public async findByAdmissionId(admissionId: string): Promise<AdmissionDocument | null> {
    return this.model.findOne({ admissionId, deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicationNumber(applicationNumber: string): Promise<AdmissionDocument | null> {
    return this.model.findOne({ applicationNumber: applicationNumber.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByApplicantId(applicantId: string): Promise<AdmissionDocument | null> {
    return this.model.findOne({ applicantId, deletedAt: { $exists: false } }).exec();
  }

  public async findByAdmissionStatus(admissionStatus: string): Promise<AdmissionDocument[]> {
    return this.model.find({ admissionStatus, deletedAt: { $exists: false } }).exec();
  }

  public async findByReviewer(reviewerId: string): Promise<AdmissionDocument[]> {
    return this.model.find({ 'reviewerAssignments.reviewerId': reviewerId, deletedAt: { $exists: false } }).exec();
  }

  public async findByFinalDecision(finalDecision: string): Promise<AdmissionDocument[]> {
    return this.model.find({ 'approvalWorkflow.finalDecision': finalDecision, deletedAt: { $exists: false } }).exec();
  }

  public async findBySeatStatus(seatStatus: string): Promise<AdmissionDocument[]> {
    return this.model.find({ 'seatAllocation.status': seatStatus, deletedAt: { $exists: false } }).exec();
  }

  public async findByOfferLetterStatus(offerLetterStatus: string): Promise<AdmissionDocument[]> {
    return this.model.find({ 'offerLetter.status': offerLetterStatus, deletedAt: { $exists: false } }).exec();
  }

  public async findByPaymentStatus(paymentStatus: string): Promise<AdmissionDocument[]> {
    return this.model.find({ 'feeTrigger.paymentStatus': paymentStatus, deletedAt: { $exists: false } }).exec();
  }

  public async findWaitingList(): Promise<AdmissionDocument[]> {
    return this.model.find({ admissionStatus: 'WAITLISTED', deletedAt: { $exists: false } }).exec();
  }

  public async findPendingApproval(): Promise<AdmissionDocument[]> {
    return this.model.find({ admissionStatus: 'UNDER_REVIEW', deletedAt: { $exists: false } }).exec();
  }

  // ─── Search / Filter ───────────────────────────────────────────────────────

  public async listAdmissions(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: AdmissionDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchAdmissions(searchQuery: string, page = 1, limit = 20): Promise<{ items: AdmissionDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterAdmissions(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: AdmissionDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.admissionStatus) query.admissionStatus = filters.admissionStatus;
    if (filters.applicantId) query.applicantId = filters.applicantId;
    if (filters.applicationNumber) query.applicationNumber = filters.applicationNumber;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.seatStatus) query['seatAllocation.status'] = filters.seatStatus;
    if (filters.offerLetterStatus) query['offerLetter.status'] = filters.offerLetterStatus;
    if (filters.paymentStatus) query['feeTrigger.paymentStatus'] = filters.paymentStatus;
    if (filters.finalDecision) query['approvalWorkflow.finalDecision'] = filters.finalDecision;

    return this.paginate(query, page, limit, sort);
  }

  // ─── Approval Workflow ─────────────────────────────────────────────────────

  public async updateApprovalWorkflow(admissionId: string, approvalWorkflow: AdmissionSchemaType['approvalWorkflow']): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { approvalWorkflow, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addApprovalRecord(admissionId: string, approval: AdmissionSchemaType['approvalWorkflow']['approvals'][0]): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $push: { 'approvalWorkflow.approvals': approval }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Reviewer Assignment ──────────────────────────────────────────────────

  public async addReviewerAssignment(admissionId: string, assignment: AdmissionSchemaType['reviewerAssignments'][0]): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $push: { reviewerAssignments: assignment }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateReviewerAssignment(admissionId: string, reviewerId: string, status: string): Promise<AdmissionDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: admissionId, 'reviewerAssignments.reviewerId': reviewerId },
      { $set: { 'reviewerAssignments.$.status': status, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Seat Allocation ──────────────────────────────────────────────────────

  public async updateSeatAllocation(admissionId: string, seatAllocation: AdmissionSchemaType['seatAllocation']): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { seatAllocation, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Offer Letter ─────────────────────────────────────────────────────────

  public async updateOfferLetter(admissionId: string, offerLetter: AdmissionSchemaType['offerLetter']): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { offerLetter, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Admission Letter ─────────────────────────────────────────────────────

  public async updateAdmissionLetter(admissionId: string, admissionLetter: AdmissionSchemaType['admissionLetter']): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { admissionLetter, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Fee Trigger ──────────────────────────────────────────────────────────

  public async updateFeeTrigger(admissionId: string, feeTrigger: AdmissionSchemaType['feeTrigger']): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { feeTrigger, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Deadline ─────────────────────────────────────────────────────────────

  public async addDeadline(admissionId: string, deadline: AdmissionSchemaType['deadlines'][0]): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $push: { deadlines: deadline }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Waiting List ─────────────────────────────────────────────────────────

  public async addToWaitingList(admissionId: string, waitingListEntry: AdmissionSchemaType['waitingList'][0]): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $push: { waitingList: waitingListEntry }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeFromWaitingList(admissionId: string, position: number): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $pull: { waitingList: { position } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Priority Queue ───────────────────────────────────────────────────────

  public async addToPriorityQueue(admissionId: string, queueEntry: AdmissionSchemaType['priorityQueue'][0]): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $push: { priorityQueue: queueEntry }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updatePriorityQueueStatus(admissionId: string, queueId: string, status: string): Promise<AdmissionDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: admissionId, 'priorityQueue.queueId': queueId },
      { $set: { 'priorityQueue.$.status': status, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Timeline ─────────────────────────────────────────────────────────────

  public async addTimelineEvent(admissionId: string, event: AdmissionSchemaType['admissionTimeline'][0]): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $push: { admissionTimeline: event }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── AI Recommendation ────────────────────────────────────────────────────

  public async updateAIRecommendation(admissionId: string, aiRecommendation: AdmissionSchemaType['aiRecommendation']): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { aiRecommendation, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Audit Trail ──────────────────────────────────────────────────────────

  public async addAuditTrail(admissionId: string, auditEntry: AdmissionSchemaType['auditTrail'][0]): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $push: { auditTrail: auditEntry }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Archive / Restore ─────────────────────────────────────────────────────

  public async archive(admissionId: string, archivedBy: string): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { isActive: false, archivedBy, archivedAt: new Date(), updatedBy: archivedBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async restoreArchive(admissionId: string, restoredBy: string): Promise<AdmissionDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      admissionId,
      { $set: { isActive: true, archivedBy: undefined, archivedAt: undefined, updatedBy: restoredBy, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  public async softDelete(admissionId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: admissionId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(admissionId: string): Promise<AdmissionDocument | null> {
    const result = await this.model.updateOne({ _id: admissionId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(admissionId).exec();
    }
    return null;
  }

  // ─── Statistics ───────────────────────────────────────────────────────────

  public async countByStatus(status: string): Promise<number> {
    return this.count({ admissionStatus: status, deletedAt: { $exists: false } });
  }

  public async countPendingApproval(): Promise<number> {
    return this.count({ admissionStatus: 'UNDER_REVIEW', deletedAt: { $exists: false } });
  }

  public async countApproved(): Promise<number> {
    return this.count({ admissionStatus: 'APPROVED', deletedAt: { $exists: false } });
  }

  public async countRejected(): Promise<number> {
    return this.count({ admissionStatus: 'REJECTED', deletedAt: { $exists: false } });
  }

  public async countWaitlisted(): Promise<number> {
    return this.count({ admissionStatus: 'WAITLISTED', deletedAt: { $exists: false } });
  }

  public async countAdmitted(): Promise<number> {
    return this.count({ admissionStatus: 'ADMITTED', deletedAt: { $exists: false } });
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  public async bulkCreate(admissions: Partial<AdmissionSchemaType>[]): Promise<AdmissionDocument[]> {
    return this.model.insertMany(admissions, { ordered: true }) as Promise<AdmissionDocument[]>;
  }

  public async bulkUpdate(ids: string[], updates: Partial<AdmissionSchemaType>, updatedBy: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      { $set: { ...updates, updatedBy, updatedAt: new Date() } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  public async bulkApprove(ids: string[], decision: string, reviewedBy: string, _remarks?: string): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          admissionStatus: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
          'approvalWorkflow.finalDecision': decision,
          'approvalWorkflow.isCompleted': true,
          updatedBy: reviewedBy,
          updatedAt: new Date(),
        },
      },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  // ─── Existence ─────────────────────────────────────────────────────────────

  public async existsByAdmissionId(admissionId: string): Promise<boolean> {
    return this.exists({ admissionId, deletedAt: { $exists: false } });
  }

  public async existsByApplicationNumber(applicationNumber: string): Promise<boolean> {
    return this.exists({ applicationNumber: applicationNumber.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByApplicantId(applicantId: string): Promise<boolean> {
    return this.exists({ applicantId, deletedAt: { $exists: false } });
  }
}

export const admissionRepository = new AdmissionRepository();
