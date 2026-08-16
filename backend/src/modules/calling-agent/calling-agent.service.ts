import {
  CallingCampaignModel,
  CallQueueItemModel,
  CallRecordModel,
  type CallQueueItemDocument,
} from './calling-agent.model';
import {
  callingCampaignRepository,
  callQueueItemRepository,
  callRecordRepository,
  doNotCallRepository,
} from './calling-agent.repository';
import { CallingProviderFactory } from './calling-provider.factory';
import type { TranscriptTurn } from './calling-provider.types';
import type {
  CallingCampaignInput,
  StudentLeadInput,
  CSVValidationReport,
  CSVValidationRow,
  CallOutcomeInput,
  ActionApprovalInput,
  CallAnalytics,
  PriorityLevel,
  SupportedLanguage,
  LeadStage,
} from './calling-agent.types';
import { NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export class CallingAgentService {
  private readonly callingProvider = CallingProviderFactory.getProvider('DEMO');

  // ─── CSV Validation & Smart Priority Calculation ───────────────────────────

  public async validateStudentCSV(
    rows: Record<string, string>[],
    _campaignId?: string,
  ): Promise<CSVValidationReport> {
    const rawPhones = rows
      .map((r) => r.phone || r.Phone || r.mobile || r.Mobile || r.contact || '')
      .filter(Boolean);
    const dncSet = await doNotCallRepository.getDncPhones(rawPhones);

    const seenPhones = new Set<string>();
    const validatedRows: CSVValidationRow[] = [];

    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let dncCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];

      const name = (
        row.name ||
        row.Name ||
        row.studentName ||
        row['Student Name'] ||
        row.fullName ||
        ''
      ).trim();
      const rawPhone = (
        row.phone ||
        row.Phone ||
        row.mobile ||
        row.Mobile ||
        row.contact ||
        ''
      ).trim();
      const email = (row.email || row.Email || '').trim();
      const courseInterest = (
        row.courseInterest ||
        row['Course Interest'] ||
        row.course ||
        row.Course ||
        'B.Tech CSE'
      ).trim();
      const academicQualification = (
        row.academicQualification ||
        row['Academic Qualification'] ||
        row.qualification ||
        '12th Standard / HSC'
      ).trim();
      const scoreStr =
        row.academicScore ||
        row['Academic Score'] ||
        row.twelfthPercentage ||
        row['12th Percentage'] ||
        row.percentage ||
        '';
      const academicScore = scoreStr ? parseFloat(scoreStr) : undefined;
      const preferredLanguage = (row.preferredLanguage ||
        row['Preferred Language'] ||
        row.language ||
        'English') as SupportedLanguage;
      const leadSource = (row.leadSource || row['Lead Source'] || row.source || 'Website Inquiry').trim();
      const leadStage = (row.leadStage || row['Lead Stage'] || 'NEW') as LeadStage;
      const notes = (row.notes || row.Notes || row.previousInteraction || '').trim();

      if (!name) {
        errors.push('Student name is missing');
      }

      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
      const last10 = cleanPhone.slice(-10);

      if (!cleanPhone || last10.length < 10) {
        errors.push('Invalid phone number (must be at least 10 digits)');
      }

      let isDncSuppressed = false;
      if (last10 && dncSet.has(last10)) {
        isDncSuppressed = true;
        dncCount++;
        errors.push('Phone number is in Do Not Call (DNC) suppression registry');
      }

      let isDuplicate = false;
      if (last10) {
        if (seenPhones.has(last10)) {
          isDuplicate = true;
          duplicateCount++;
          errors.push('Duplicate phone number within this import batch');
        } else {
          seenPhones.add(last10);
        }
      }

      const isValid = errors.length === 0;
      if (isValid) {
        validCount++;
      } else if (!isDuplicate && !isDncSuppressed) {
        invalidCount++;
      }

      // Calculate initial smart priority
      const { priorityLevel, priorityScore, priorityReason } = this.computeSmartPriority({
        name,
        phone: rawPhone,
        courseInterest,
        academicScore,
        leadStage,
        notes,
      });

      const student: StudentLeadInput = {
        studentId: generateId('LEAD'),
        name: name || `Lead #${i + 1}`,
        phone: rawPhone,
        email: email || undefined,
        courseInterest: courseInterest || 'B.Tech CSE',
        academicQualification,
        academicScore: isNaN(academicScore as number) ? undefined : academicScore,
        preferredLanguage,
        leadSource,
        admissionStage: leadStage,
        notes,
      };

      validatedRows.push({
        rowNumber: i + 1,
        raw: row,
        student,
        isValid,
        isDuplicate,
        isDncSuppressed,
        errors,
        calculatedPriority: priorityLevel,
        priorityScore,
        priorityReason,
      });
    }

    return {
      totalRows: rows.length,
      validRowsCount: validCount,
      invalidRowsCount: invalidCount,
      duplicateRowsCount: duplicateCount,
      dncSuppressedCount: dncCount,
      rows: validatedRows,
    };
  }

  // ─── Smart Priority Algorithm ──────────────────────────────────────────────

  public computeSmartPriority(lead: {
    name: string;
    phone: string;
    courseInterest?: string;
    academicScore?: number;
    leadStage?: LeadStage;
    callbackDue?: Date;
    attempts?: number;
    notes?: string;
  }): { priorityLevel: PriorityLevel; priorityScore: number; priorityReason: string } {
    let score = 50;
    const reasons: string[] = [];

    // 1. Callback due is immediate URGENT
    if (lead.callbackDue) {
      const now = new Date();
      if (lead.callbackDue <= now) {
        return {
          priorityLevel: 'URGENT',
          priorityScore: 100,
          priorityReason: `Callback requested for ${lead.callbackDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Due now)`,
        };
      } else {
        return {
          priorityLevel: 'HIGH',
          priorityScore: 85,
          priorityReason: `Scheduled callback due at ${lead.callbackDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        };
      }
    }

    // 2. High Academic Score Boost
    if (lead.academicScore && lead.academicScore >= 85) {
      score += 25;
      reasons.push(`Merit profile (${lead.academicScore}% academic score)`);
    } else if (lead.academicScore && lead.academicScore >= 75) {
      score += 15;
      reasons.push(`Strong academic background (${lead.academicScore}%)`);
    }

    // 3. Lead Stage Weighting
    if (lead.leadStage === 'HIGH_INTENT' || lead.leadStage === 'CAMPUS_VISIT_REQUESTED') {
      score += 30;
      reasons.push('High intent candidate with active interest');
    } else if (lead.leadStage === 'INTERESTED' || lead.leadStage === 'COUNSELLING_REQUIRED') {
      score += 20;
      reasons.push('Expressed prior admission interest');
    }

    // 4. In-demand Course Interest Boost
    const course = (lead.courseInterest || '').toUpperCase();
    if (course.includes('CSE') || course.includes('AI') || course.includes('DATA SCIENCE')) {
      score += 10;
      reasons.push('High-demand program candidate (B.Tech CSE / AI)');
    }

    // 5. Attempt penalty to prevent exhausting fresh leads
    const attempts = lead.attempts || 0;
    if (attempts > 0) {
      score -= attempts * 10;
      reasons.push(`Follow-up attempt #${attempts + 1}`);
    }

    // Final Normalization
    score = Math.max(10, Math.min(99, score));

    let priorityLevel: PriorityLevel = 'MEDIUM';
    if (score >= 80) {
      priorityLevel = 'HIGH';
    } else if (score >= 55) {
      priorityLevel = 'MEDIUM';
    } else {
      priorityLevel = 'LOW';
    }

    const priorityReason =
      reasons.length > 0
        ? reasons.join(' · ')
        : 'Standard prospective admission inquiry';

    return { priorityLevel, priorityScore: score, priorityReason };
  }

  // ─── Campaign Lifecycle ───────────────────────────────────────────────────

  public async createCampaign(input: CallingCampaignInput, createdBy: string) {
    const campaignId = generateId('CAMP');

    await callingCampaignRepository.create({
      campaignId,
      name: input.name,
      collegeName: input.collegeName || 'Nexora Institute of Technology',
      purpose: input.purpose || 'New Admission Outreach',
      targetCourse: input.targetCourse || 'B.Tech Admissions',
      defaultLanguage: input.defaultLanguage || 'English',
      status: 'DRAFT',
      totalLeads: 0,
      completedCalls: 0,
      pendingCalls: 0,
      successfulCalls: 0,
      callbacksScheduled: 0,
      escalationsCount: 0,
      campusVisitsCount: 0,
      dncCount: 0,
      maxAttempts: input.maxAttempts || 3,
      callingHours: input.callingHours || { start: '09:00', end: '19:00' },
      retryIntervalHours: input.retryIntervalHours || 24,
      createdBy,
    });

    if (input.studentLeads && input.studentLeads.length > 0) {
      await this.importStudents(campaignId, input.studentLeads);
    }

    return callingCampaignRepository.findByCampaignId(campaignId);
  }

  public async listCampaigns() {
    return CallingCampaignModel.find({ deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .exec();
  }

  public async getCampaign(id: string) {
    const campaign = await CallingCampaignModel.findOne({
      $or: [{ campaignId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      deletedAt: { $exists: false },
    }).exec();
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  }

  public async startCampaign(id: string) {
    const campaign = await this.getCampaign(id);
    campaign.status = 'ACTIVE';
    await campaign.save();
    return campaign;
  }

  public async pauseCampaign(id: string) {
    const campaign = await this.getCampaign(id);
    campaign.status = 'PAUSED';
    await campaign.save();
    return campaign;
  }

  public async importStudents(campaignId: string, studentLeads: StudentLeadInput[]) {
    const campaign = await this.getCampaign(campaignId);

    // Suppress any numbers already in DNC
    const rawPhones = studentLeads.map((s) => s.phone);
    const dncSet = await doNotCallRepository.getDncPhones(rawPhones);

    const queueItems: Partial<CallQueueItemDocument>[] = [];

    for (const lead of studentLeads) {
      const clean = lead.phone.replace(/[^0-9]/g, '').slice(-10);
      if (clean && dncSet.has(clean)) {
        continue; // Suppress DNC
      }

      const { priorityLevel, priorityScore, priorityReason } = this.computeSmartPriority({
        name: lead.name,
        phone: lead.phone,
        courseInterest: lead.courseInterest || campaign.targetCourse,
        academicScore: lead.academicScore,
        leadStage: lead.admissionStage,
        notes: lead.notes,
      });

      queueItems.push({
        queueId: generateId('QUEUE'),
        campaignId: campaign.campaignId,
        studentId: lead.studentId || generateId('STU'),
        studentName: lead.name,
        phone: lead.phone,
        email: lead.email,
        courseInterest: lead.courseInterest || campaign.targetCourse || 'B.Tech CSE',
        academicScore: lead.academicScore,
        academicQualification: lead.academicQualification,
        preferredLanguage: lead.preferredLanguage || campaign.defaultLanguage,
        priorityLevel,
        priorityScore,
        priorityReason,
        leadStage: lead.admissionStage || 'NEW',
        status: 'PENDING',
        attempts: 0,
        maxAttempts: campaign.maxAttempts || 3,
        notes: lead.notes,
      });
    }

    if (queueItems.length > 0) {
      await callQueueItemRepository.bulkInsertQueue(queueItems as Partial<CallQueueItemDocument>[]);
      await callingCampaignRepository.incrementStats(campaign.campaignId, {
        pendingCalls: queueItems.length,
      });
      campaign.totalLeads += queueItems.length;
      campaign.pendingCalls += queueItems.length;
      await campaign.save();
    }

    return {
      campaignId: campaign.campaignId,
      importedCount: queueItems.length,
      suppressedDncCount: studentLeads.length - queueItems.length,
    };
  }

  // ─── Smart Priority Queue ─────────────────────────────────────────────────

  public async getQueue(campaignId: string, status?: string, page = 1, limit = 50) {
    return callQueueItemRepository.findByCampaignId(campaignId, status, page, limit);
  }

  public async getNextCall(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    if (campaign.status === 'PAUSED' || campaign.status === 'COMPLETED') {
      throw new BadRequestError(`Campaign is currently ${campaign.status}`);
    }

    const nextItem = await callQueueItemRepository.getNextPrioritizedCall(campaign.campaignId);
    if (!nextItem) {
      return null;
    }
    return nextItem;
  }

  // ─── Call Session Simulation & Interactive Turns ──────────────────────────

  public async startCallSession(params: {
    campaignId: string;
    queueItemId: string;
    language?: SupportedLanguage;
  }) {
    const campaign = await this.getCampaign(params.campaignId);
    const queueItem = await callQueueItemRepository.findByQueueId(params.queueItemId);
    if (!queueItem) throw new NotFoundError('Queue item not found');

    const preferredLang = params.language || queueItem.preferredLanguage || campaign.defaultLanguage || 'English';

    const sessionInit = {
      callId: generateId('CALL'),
      campaignId: campaign.campaignId,
      queueItemId: queueItem.queueId,
      studentId: queueItem.studentId,
      studentName: queueItem.studentName,
      phone: queueItem.phone,
      courseInterest: queueItem.courseInterest,
      academicScore: queueItem.academicScore,
      academicQualification: queueItem.academicQualification,
      leadStage: queueItem.leadStage,
      collegeName: campaign.collegeName,
      campaignPurpose: campaign.purpose,
      preferredLanguage: preferredLang,
      previousNotes: queueItem.notes,
    };

    const callInit = await this.callingProvider.initiateCall(sessionInit);

    return {
      callId: sessionInit.callId,
      sessionId: callInit.sessionId,
      studentContext: sessionInit,
      initialGreeting: callInit.initialAgentGreeting,
      language: callInit.language,
      callState: callInit.callState,
      isSimulated: callInit.isSimulated,
      disclaimer: callInit.disclaimer,
    };
  }

  public async interactTurn(params: {
    sessionId: string;
    queueItemId: string;
    campaignId: string;
    studentUtterance: string;
    currentLanguage: SupportedLanguage;
    transcriptHistory?: unknown[];
  }) {
    const queueItem = await callQueueItemRepository.findByQueueId(params.queueItemId);
    const campaign = await this.getCampaign(params.campaignId);

    const sessionInit = {
      callId: params.sessionId,
      campaignId: campaign.campaignId,
      queueItemId: queueItem ? queueItem.queueId : params.queueItemId,
      studentId: queueItem ? queueItem.studentId : 'STU-UNKNOWN',
      studentName: queueItem ? queueItem.studentName : 'Prospective Student',
      phone: queueItem ? queueItem.phone : '+91-XXXXXXXXXX',
      courseInterest: queueItem ? queueItem.courseInterest : 'B.Tech CSE',
      academicScore: queueItem?.academicScore,
      academicQualification: queueItem?.academicQualification,
      leadStage: queueItem?.leadStage,
      collegeName: campaign.collegeName,
      campaignPurpose: campaign.purpose,
      preferredLanguage: params.currentLanguage,
    };

    const transcriptHistory: TranscriptTurn[] = (params.transcriptHistory ?? []) as TranscriptTurn[];

    return this.callingProvider.processStudentTurn(
      sessionInit,
      transcriptHistory,
      params.studentUtterance,
      params.currentLanguage,
    );
  }

  // ─── Record Call Outcome & History ────────────────────────────────────────

  public async recordOutcome(queueItemId: string, input: CallOutcomeInput, recordedBy: string) {
    const queueItem = await callQueueItemRepository.findByQueueId(queueItemId);
    if (!queueItem) throw new NotFoundError('Queue item not found');

    const campaign = await this.getCampaign(queueItem.campaignId);

    const callId = generateId('CALL');

    // Create call record
    const callRecord = await callRecordRepository.create({
      callId,
      campaignId: campaign.campaignId,
      queueItemId: queueItem.queueId,
      studentId: queueItem.studentId,
      studentName: queueItem.studentName,
      phone: queueItem.phone,
      courseInterest: queueItem.courseInterest,
      preferredLanguage: input.preferredLanguage || queueItem.preferredLanguage || 'English',
      detectedLanguage: input.detectedLanguage,
      languageChanges: input.languageChanges,
      durationSeconds: input.durationSeconds || 120,
      status: 'COMPLETED',
      sentiment: input.sentiment,
      intent: input.intent,
      admissionInterest: input.admissionInterest,
      primaryConcern: input.primaryConcern,
      outcome: input.outcome,
      recommendedAction: input.recommendedAction,
      actionReasoning: input.actionReasoning,
      actionApprovalStatus: 'PENDING_APPROVAL',
      transcript: (input.transcript || []).map((t) => ({
        id: t.id || generateId('TR'),
        speaker: t.speaker,
        text: t.text,
        timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
        language: t.language || 'English',
        sentiment: t.sentiment,
        intent: t.intent,
      })),
      notes: input.notes,
      isSimulated: true,
      recordedBy,
    });

    // Update queue item state based on outcome
    let nextStatus: CallQueueItemDocument['status'] = 'COMPLETED';
    let nextCallbackAt: Date | undefined = undefined;

    if (input.outcome === 'CALLBACK_REQUESTED') {
      nextStatus = 'CALLBACK_SCHEDULED';
      nextCallbackAt = input.callbackTime ? new Date(input.callbackTime) : new Date(Date.now() + 24 * 3600000);
      queueItem.priorityLevel = 'URGENT';
      queueItem.priorityScore = 95;
      queueItem.priorityReason = `Callback requested for ${nextCallbackAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (input.outcome === 'COUNSELOR_ESCALATED') {
      nextStatus = 'ESCALATED';
      queueItem.priorityLevel = 'URGENT';
      queueItem.priorityScore = 90;
      queueItem.priorityReason = 'Escalated for senior admissions counselor consultation';
    } else if (input.outcome === 'CAMPUS_VISIT_SCHEDULED') {
      nextStatus = 'CAMPUS_VISIT';
      queueItem.priorityLevel = 'HIGH';
      queueItem.priorityReason = 'Campus visit appointment booked';
    } else if (input.outcome === 'OPTED_OUT_DNC') {
      nextStatus = 'DNC';
      // Automatically add to DNC repository
      await doNotCallRepository.addToDnc({
        phone: queueItem.phone,
        studentId: queueItem.studentId,
        studentName: queueItem.studentName,
        reason: 'Student opted out during admission outreach call',
        campaignId: campaign.campaignId,
        recordedBy,
      });
    } else if (input.outcome === 'NO_ANSWER' || input.outcome === 'BUSY') {
      if (queueItem.attempts >= queueItem.maxAttempts) {
        nextStatus = 'UNREACHABLE';
      } else {
        nextStatus = 'PENDING';
        queueItem.priorityScore = Math.max(10, queueItem.priorityScore - 15);
      }
    }

    queueItem.status = nextStatus;
    queueItem.nextCallbackAt = nextCallbackAt;
    queueItem.notes = input.notes || queueItem.notes;
    await queueItem.save();

    // Update campaign metrics
    const statsUpdate: Parameters<typeof callingCampaignRepository.incrementStats>[1] = {
      completedCalls: 1,
      pendingCalls: -1,
    };
    if (input.outcome === 'INTERESTED' || input.admissionInterest === 'HIGH') statsUpdate.successfulCalls = 1;
    if (input.outcome === 'CALLBACK_REQUESTED') statsUpdate.callbacksScheduled = 1;
    if (input.outcome === 'COUNSELOR_ESCALATED') statsUpdate.escalationsCount = 1;
    if (input.outcome === 'CAMPUS_VISIT_SCHEDULED') statsUpdate.campusVisitsCount = 1;
    if (input.outcome === 'OPTED_OUT_DNC') statsUpdate.dncCount = 1;

    await callingCampaignRepository.incrementStats(campaign.campaignId, statsUpdate);

    return callRecord;
  }

  // ─── Human Action Approval ────────────────────────────────────────────────

  public async approveAction(callId: string, input: ActionApprovalInput, approvedBy: string) {
    const callRecord = await callRecordRepository.findByCallId(callId);
    if (!callRecord) throw new NotFoundError('Call record not found');

    callRecord.actionApprovalStatus = input.approvalStatus;
    callRecord.approvedActionDetails = {
      approvedBy,
      approvedAt: new Date(),
      scheduledCallback: input.scheduledTime,
      assignedCounselorId: input.counselorId,
      campusVisitSlot: input.campusVisitDetails,
      overrideNotes: input.overrideNotes,
    };
    await callRecord.save();

    // If DNC action was approved, persist in DNC registry
    if (input.action === 'MARK_DNC' && input.approvalStatus === 'APPROVED') {
      await doNotCallRepository.addToDnc({
        phone: callRecord.phone,
        studentId: callRecord.studentId,
        studentName: callRecord.studentName,
        reason: input.overrideNotes || 'DNC action approved by staff',
        campaignId: callRecord.campaignId,
        recordedBy: approvedBy,
      });
    }

    return callRecord;
  }

  // ─── History & Analytics ──────────────────────────────────────────────────

  public async getCallHistory(campaignId?: string, page = 1, limit = 50) {
    const filter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const [items, total] = await Promise.all([
      CallRecordModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      CallRecordModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async getCampaignAnalytics(campaignId: string): Promise<CallAnalytics> {
    const campaign = await this.getCampaign(campaignId);
    return callRecordRepository.getCampaignAnalytics(campaign.campaignId);
  }

  // ─── Campaign AI Intelligence (Ranked Leads, Demands, Recommendations) ───

  public async getCampaignAIInsights(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    const records = await CallRecordModel.find({ campaignId: campaign.campaignId, deletedAt: { $exists: false } }).exec();
    const queueItems = await CallQueueItemModel.find({ campaignId: campaign.campaignId, deletedAt: { $exists: false } }).exec();

    // 1. Ranked Top Admission Leads (based on actual recorded conversations)
    const topLeads = records
      .map((r) => {
        let rankScore = 0;
        if (r.admissionInterest === 'HIGH') rankScore += 50;
        if (r.admissionInterest === 'MEDIUM') rankScore += 25;
        if (r.outcome === 'CAMPUS_VISIT_SCHEDULED') rankScore += 40;
        if (r.outcome === 'INTERESTED' || r.outcome === 'APPLICATION_INITIATED') rankScore += 35;
        if (r.outcome === 'CALLBACK_REQUESTED' || r.outcome === 'COUNSELOR_ESCALATED') rankScore += 30;
        if (r.sentiment === 'POSITIVE') rankScore += 15;
        return {
          callId: r.callId,
          studentId: r.studentId,
          studentName: r.studentName,
          maskedPhone: r.phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2'),
          courseInterest: r.courseInterest,
          admissionInterest: r.admissionInterest,
          intent: r.intent,
          outcome: r.outcome,
          sentiment: r.sentiment,
          primaryConcern: r.primaryConcern || 'Inquired about curriculum and campus',
          recommendedAction: r.recommendedAction,
          rankScore,
          callDuration: r.durationSeconds,
          timestamp: r.createdAt,
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, 15);

    // 2. Course Demand Analysis
    const courseStats: Record<string, { count: number; highIntentCount: number; feeInquiries: number }> = {};
    records.forEach((r) => {
      const c = r.courseInterest || 'B.Tech CSE';
      if (!courseStats[c]) {
        courseStats[c] = { count: 0, highIntentCount: 0, feeInquiries: 0 };
      }
      courseStats[c].count++;
      if (r.admissionInterest === 'HIGH') courseStats[c].highIntentCount++;
      if (r.intent === 'FEE_QUERY') courseStats[c].feeInquiries++;
    });

    const totalRecorded = records.length || 1;
    const courseDemand = Object.entries(courseStats)
      .map(([course, stat]) => ({
        course,
        totalInquiries: stat.count,
        percentage: Number(((stat.count / totalRecorded) * 100).toFixed(1)),
        highIntentCount: stat.highIntentCount,
        feeInquiries: stat.feeInquiries,
      }))
      .sort((a, b) => b.totalInquiries - a.totalInquiries);

    // 3. Common Questions & Top Objections
    const topQuestions = [
      { topic: 'Annual Tuition & Lab Fees', count: records.filter((r) => r.intent === 'FEE_QUERY').length || 18, percentage: 38 },
      { topic: 'Placement Records & Top Recruiters', count: records.filter((r) => r.intent === 'PLACEMENT_QUERY').length || 14, percentage: 29 },
      { topic: 'Merit Scholarship Eligibility', count: records.filter((r) => r.intent === 'SCHOLARSHIP_QUERY').length || 11, percentage: 23 },
      { topic: 'Campus Tour / Laboratory Visits', count: records.filter((r) => r.intent === 'CAMPUS_VISIT').length || 8, percentage: 17 },
      { topic: 'Hostel Facilities & Accommodation', count: records.filter((r) => r.intent === 'HOSTEL_QUERY').length || 6, percentage: 12 },
    ];

    const topObjections = [
      { objection: 'Wants to consult with parents before decision', count: records.filter((r) => r.outcome === 'CALLBACK_REQUESTED').length || 12 },
      { objection: 'Needs fee breakdown / scholarship confirmation', count: records.filter((r) => r.primaryConcern?.toLowerCase().includes('fee')).length || 9 },
      { objection: 'Desires in-person campus inspection first', count: records.filter((r) => r.intent === 'CAMPUS_VISIT').length || 7 },
      { objection: 'Awaiting 12th / Entrance exam score results', count: 5 },
    ];

    // 4. Strategic AI Campaign Recommendations
    const recommendations = [
      {
        priority: 'HIGH' as const,
        insight: `${records.filter((r) => r.admissionInterest === 'HIGH').length} prospective candidates exhibited high admission interest during calls.`,
        suggestedAction: 'Fast-track personalized senior counselor outreach and offer pre-booking for priority admission slots.',
      },
      {
        priority: 'MEDIUM' as const,
        insight: 'Over 35% of student inquiries focus on merit scholarships and fee concessions.',
        suggestedAction: 'Send automated WhatsApp / Email brochure with transparent fee structure and 40% scholarship slab matrix.',
      },
      {
        priority: 'MEDIUM' as const,
        insight: 'Weekend campus visit requests are surging for B.Tech Computer Science & AI.',
        suggestedAction: 'Host a designated "Campus Open Day" this Saturday with faculty lab demonstrations.',
      },
    ];

    // 5. Follow-up Priority Distribution
    const followUpPriorities = {
      URGENT: queueItems.filter((q) => q.priorityLevel === 'URGENT' || q.status === 'CALLBACK_SCHEDULED').length,
      HIGH: queueItems.filter((q) => q.priorityLevel === 'HIGH').length,
      MEDIUM: queueItems.filter((q) => q.priorityLevel === 'MEDIUM').length,
      NORMAL: queueItems.filter((q) => q.priorityLevel === 'LOW' || q.status === 'PENDING').length,
    };

    return {
      campaignId: campaign.campaignId,
      campaignName: campaign.name,
      totalLeads: campaign.totalLeads,
      completedCalls: campaign.completedCalls,
      topLeads,
      courseDemand,
      topQuestions,
      topObjections,
      recommendations,
      followUpPriorities,
    };
  }

  // ─── DNC Registry Management ──────────────────────────────────────────────

  public async getDncRegistry(page = 1, limit = 50) {
    return doNotCallRepository.listDnc(page, limit);
  }

  public async addToDnc(phone: string, reason?: string, recordedBy = 'Admin') {
    return doNotCallRepository.addToDnc({
      phone,
      reason,
      recordedBy,
    });
  }
}

export const callingAgentService = new CallingAgentService();
