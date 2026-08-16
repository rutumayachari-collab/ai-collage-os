import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  CallingCampaignModel,
  CallQueueItemModel,
  CallRecordModel,
  DoNotCallModel,
  type CallingCampaignDocument,
  type CallingCampaignSchemaType,
  type CallQueueItemDocument,
  type CallQueueItemSchemaType,
  type CallRecordDocument,
  type CallRecordSchemaType,
  type DoNotCallDocument,
  type DoNotCallSchemaType,
} from './calling-agent.model';
import type { CallAnalytics, SupportedLanguage, CallSentiment, CallOutcome, PriorityLevel } from './calling-agent.types';

// ─── Campaign Repository ────────────────────────────────────────────────────

export class CallingCampaignRepository extends BaseRepository<CallingCampaignSchemaType> {
  constructor() {
    super(CallingCampaignModel);
  }

  public async findByCampaignId(campaignId: string): Promise<CallingCampaignDocument | null> {
    return this.model.findOne({ campaignId, deletedAt: { $exists: false } }).exec();
  }

  public async findByStatus(status: string): Promise<CallingCampaignDocument[]> {
    return this.model.find({ status, deletedAt: { $exists: false } }).sort({ createdAt: -1 }).exec();
  }

  public async findByCreatedBy(createdBy: string): Promise<CallingCampaignDocument[]> {
    return this.model.find({ createdBy, deletedAt: { $exists: false } }).sort({ createdAt: -1 }).exec();
  }

  public async incrementStats(
    campaignId: string,
    updates: {
      completedCalls?: number;
      pendingCalls?: number;
      successfulCalls?: number;
      callbacksScheduled?: number;
      escalationsCount?: number;
      campusVisitsCount?: number;
      dncCount?: number;
    },
  ): Promise<CallingCampaignDocument | null> {
    const incObj: Record<string, number> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) {
        incObj[k] = v;
      }
    }
    return this.model
      .findOneAndUpdate({ campaignId }, { $inc: incObj, $set: { updatedAt: new Date() } }, { new: true })
      .exec();
  }
}

export const callingCampaignRepository = new CallingCampaignRepository();

// ─── Queue Item Repository ──────────────────────────────────────────────────

export class CallQueueItemRepository extends BaseRepository<CallQueueItemSchemaType> {
  constructor() {
    super(CallQueueItemModel);
  }

  public async findByQueueId(queueId: string): Promise<CallQueueItemDocument | null> {
    return this.model.findOne({ queueId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCampaignId(
    campaignId: string,
    status?: string,
    page = 1,
    limit = 50,
  ): Promise<{ items: CallQueueItemDocument[]; total: number }> {
    const filter: Record<string, unknown> = { campaignId, deletedAt: { $exists: false } };
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ priorityScore: -1, attempts: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async getNextPrioritizedCall(campaignId: string): Promise<CallQueueItemDocument | null> {
    const now = new Date();
    // 1. Check for due callbacks first
    let item = await this.model
      .findOneAndUpdate(
        {
          campaignId,
          status: 'CALLBACK_SCHEDULED',
          nextCallbackAt: { $lte: now },
          $expr: { $lt: ['$attempts', '$maxAttempts'] },
          deletedAt: { $exists: false },
        },
        {
          $set: { status: 'IN_PROGRESS', lastCalledAt: now, updatedAt: now },
          $inc: { attempts: 1 },
        },
        { new: true, sort: { nextCallbackAt: 1, priorityScore: -1 } },
      )
      .exec();

    if (item) return item;

    // 2. Otherwise get highest priority pending item
    item = await this.model
      .findOneAndUpdate(
        {
          campaignId,
          status: { $in: ['PENDING', 'FOLLOW_UP_REQUIRED'] },
          $expr: { $lt: ['$attempts', '$maxAttempts'] },
          deletedAt: { $exists: false },
        },
        {
          $set: { status: 'IN_PROGRESS', lastCalledAt: now, updatedAt: now },
          $inc: { attempts: 1 },
        },
        { new: true, sort: { priorityScore: -1, attempts: 1, createdAt: 1 } },
      )
      .exec();

    return item;
  }

  public async bulkInsertQueue(items: Partial<CallQueueItemSchemaType>[]): Promise<CallQueueItemDocument[]> {
    if (items.length === 0) return [];
    return this.model.insertMany(items, { ordered: false }) as Promise<CallQueueItemDocument[]>;
  }

  public async countByCampaignAndStatus(campaignId: string, status?: string): Promise<number> {
    const filter: Record<string, unknown> = { campaignId, deletedAt: { $exists: false } };
    if (status) filter.status = status;
    return this.model.countDocuments(filter).exec();
  }
}

export const callQueueItemRepository = new CallQueueItemRepository();

// ─── Call Record Repository ─────────────────────────────────────────────────

export class CallRecordRepository extends BaseRepository<CallRecordSchemaType> {
  constructor() {
    super(CallRecordModel);
  }

  public async findByCallId(callId: string): Promise<CallRecordDocument | null> {
    return this.model.findOne({ callId, deletedAt: { $exists: false } }).exec();
  }

  public async findByCampaignId(campaignId: string, page = 1, limit = 50): Promise<{ items: CallRecordDocument[]; total: number }> {
    const filter = { campaignId, deletedAt: { $exists: false } };
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async getCampaignAnalytics(campaignId: string): Promise<CallAnalytics> {
    const campaign = await callingCampaignRepository.findByCampaignId(campaignId);
    const records = await this.model.find({ campaignId, deletedAt: { $exists: false } }).exec();
    const queueItems = await callQueueItemRepository.findMany({ campaignId, deletedAt: { $exists: false } });

    const totalLeads = campaign ? campaign.totalLeads : queueItems.length;
    const callsAttempted = queueItems.filter((q) => q.attempts > 0).length;
    const callsCompleted = records.filter((r) => r.status === 'COMPLETED').length;
    const pendingCalls = queueItems.filter((q) => ['PENDING', 'CALLBACK_SCHEDULED', 'IN_PROGRESS'].includes(q.status)).length;

    const interestedCount = records.filter((r) => r.outcome === 'INTERESTED' || r.admissionInterest === 'HIGH').length;
    const highIntentCount = records.filter((r) => r.admissionInterest === 'HIGH').length;
    const callbacksScheduled = records.filter((r) => r.outcome === 'CALLBACK_REQUESTED').length;
    const counselorEscalations = records.filter((r) => r.outcome === 'COUNSELOR_ESCALATED').length;
    const campusVisitsRequested = records.filter((r) => r.outcome === 'CAMPUS_VISIT_SCHEDULED').length;
    const applicationsInitiated = records.filter((r) => r.outcome === 'APPLICATION_INITIATED').length;
    const notInterestedCount = records.filter((r) => r.outcome === 'NOT_INTERESTED').length;
    const dncCount = records.filter((r) => r.outcome === 'OPTED_OUT_DNC').length;
    const unreachableCount = queueItems.filter((q) => q.status === 'UNREACHABLE' || q.attempts >= q.maxAttempts).length;

    const totalDuration = records.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
    const averageDurationSeconds = records.length > 0 ? Math.round(totalDuration / records.length) : 0;
    const interestRate = callsCompleted > 0 ? Number(((interestedCount / callsCompleted) * 100).toFixed(1)) : 0;

    const sentimentBreakdown: Record<CallSentiment, number> = {
      POSITIVE: 0,
      NEUTRAL: 0,
      CONCERNED: 0,
      CONFUSED: 0,
      FRUSTRATED: 0,
      URGENT: 0,
    };
    const intentBreakdown: Record<string, number> = {};
    const languageDistribution: Record<SupportedLanguage, number> = {
      English: 0,
      Hindi: 0,
      Marathi: 0,
      Gujarati: 0,
      Bengali: 0,
      Tamil: 0,
      Telugu: 0,
      Kannada: 0,
      Malayalam: 0,
      Punjabi: 0,
    };
    const outcomeBreakdown: Record<CallOutcome, number> = {
      INTERESTED: 0,
      NOT_INTERESTED: 0,
      CALLBACK_REQUESTED: 0,
      CAMPUS_VISIT_SCHEDULED: 0,
      COUNSELOR_ESCALATED: 0,
      APPLICATION_INITIATED: 0,
      NO_ANSWER: 0,
      BUSY: 0,
      FAILED: 0,
      WRONG_NUMBER: 0,
      LANGUAGE_BARRIER: 0,
      OPTED_OUT_DNC: 0,
    };

    const priorityBreakdown: Record<PriorityLevel, number> = {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    queueItems.forEach((q) => {
      if (q.priorityLevel && priorityBreakdown[q.priorityLevel] !== undefined) {
        priorityBreakdown[q.priorityLevel]++;
      }
    });

    records.forEach((r) => {
      if (r.sentiment && sentimentBreakdown[r.sentiment] !== undefined) {
        sentimentBreakdown[r.sentiment]++;
      }
      if (r.intent) {
        intentBreakdown[r.intent] = (intentBreakdown[r.intent] || 0) + 1;
      }
      if (r.preferredLanguage && languageDistribution[r.preferredLanguage] !== undefined) {
        languageDistribution[r.preferredLanguage]++;
      }
      if (r.outcome && outcomeBreakdown[r.outcome] !== undefined) {
        outcomeBreakdown[r.outcome]++;
      }
    });

    return {
      campaignId,
      totalLeads,
      callsAttempted,
      callsCompleted,
      pendingCalls,
      interestedCount,
      highIntentCount,
      callbacksScheduled,
      counselorEscalations,
      campusVisitsRequested,
      applicationsInitiated,
      notInterestedCount,
      dncCount,
      unreachableCount,
      averageDurationSeconds,
      interestRate,
      conversionFunnel: {
        contacted: callsAttempted,
        interested: interestedCount,
        counselling: counselorEscalations,
        campusVisit: campusVisitsRequested,
        applicationStarted: applicationsInitiated,
      },
      sentimentBreakdown,
      intentBreakdown,
      languageDistribution,
      outcomeBreakdown,
      priorityBreakdown,
    };
  }
}

export const callRecordRepository = new CallRecordRepository();

// ─── Do Not Call Repository ─────────────────────────────────────────────────

export class DoNotCallRepository extends BaseRepository<DoNotCallSchemaType> {
  constructor() {
    super(DoNotCallModel);
  }

  public async isPhoneDNC(phone: string): Promise<boolean> {
    const cleaned = phone.replace(/[^0-9]/g, '');
    const last10 = cleaned.slice(-10);
    const count = await this.model
      .countDocuments({
        $or: [{ phone: phone.trim() }, { phone: new RegExp(`${last10}$`) }],
      })
      .exec();
    return count > 0;
  }

  public async getDncPhones(phones: string[]): Promise<Set<string>> {
    const cleanNumbers = phones.map((p) => p.replace(/[^0-9]/g, '').slice(-10)).filter((p) => p.length >= 10);
    if (cleanNumbers.length === 0) return new Set();

    const regexArray = cleanNumbers.map((c) => new RegExp(`${c}$`));
    const records = await this.model.find({ phone: { $in: regexArray } }).exec();
    const dncSet = new Set<string>();
    records.forEach((r) => {
      const last10 = r.phone.replace(/[^0-9]/g, '').slice(-10);
      dncSet.add(last10);
    });
    return dncSet;
  }

  public async addToDnc(payload: {
    phone: string;
    studentId?: string;
    studentName?: string;
    reason?: string;
    campaignId?: string;
    recordedBy: string;
  }): Promise<DoNotCallDocument> {
    const existing = await this.model.findOne({ phone: payload.phone.trim() }).exec();
    if (existing) {
      existing.reason = payload.reason || existing.reason;
      existing.updatedAt = new Date();
      return existing.save();
    }
    return this.model.create({
      phone: payload.phone.trim(),
      studentId: payload.studentId,
      studentName: payload.studentName,
      reason: payload.reason || 'Student requested opt-out during call',
      requestedAt: new Date(),
      campaignId: payload.campaignId,
      recordedBy: payload.recordedBy,
    });
  }

  public async listDnc(page = 1, limit = 50): Promise<{ items: DoNotCallDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      this.model.find().sort({ requestedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments().exec(),
    ]);
    return { items, total };
  }
}

export const doNotCallRepository = new DoNotCallRepository();
