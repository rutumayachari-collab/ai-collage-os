import {
  CallingCampaignModel,
  CallQueueItemModel,
  CallRecordModel,
} from '../calling-agent/calling-agent.model';
import {
  callingCampaignRepository,
} from '../calling-agent/calling-agent.repository';
import { aiService } from '../ai/ai.service';
import type {
  AdmissionIntelligenceOverview,
  AdmissionIntelligenceLead,
  FollowUpItem,
  StudentIntelligence,
  CampaignInsights,
  CourseDemandStat,
  CommonQuestion,
  CommonObjection,
  AICampaignSummary,
  ActionRecommendation,
  AdmissionFunnelStage,
  GlobalSearchResult,
  AdmissionIntelligenceFilters,
  PriorityLevel,
} from './admission-intelligence.types';
import { NotFoundError } from '../../shared/utils/api-error.util';
import { logger } from '../../shared/utils/logger.util';

const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2');
  }
  return cleaned.slice(0, 2) + '****' + cleaned.slice(-2);
};

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export class AdmissionIntelligenceService {
  // ─── Overview ──────────────────────────────────────────────────────────────

  public async getOverview(campaignId?: string): Promise<AdmissionIntelligenceOverview> {
    const campaignFilter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const [campaigns, queueItems, records] = await Promise.all([
      CallingCampaignModel.find({ deletedAt: { $exists: false } }).exec(),
      CallQueueItemModel.find(campaignFilter).exec(),
      CallRecordModel.find(campaignFilter).exec(),
    ]);

    const totalProspects = campaigns.reduce((sum, c) => sum + c.totalLeads, 0) || queueItems.length;
    const contacted = queueItems.filter((q) => q.attempts > 0).length;
    const interested = records.filter((r) => r.outcome === 'INTERESTED' || r.admissionInterest === 'HIGH').length;
    const highIntent = records.filter((r) => r.admissionInterest === 'HIGH').length;
    const callbacks = records.filter((r) => r.outcome === 'CALLBACK_REQUESTED').length;
    const counselorRequests = records.filter((r) => r.outcome === 'COUNSELOR_ESCALATED').length;
    const campusVisits = records.filter((r) => r.outcome === 'CAMPUS_VISIT_SCHEDULED').length;
    const applicationInterest = records.filter((r) => r.outcome === 'APPLICATION_INITIATED').length;
    const notInterested = records.filter((r) => r.outcome === 'NOT_INTERESTED').length;
    const dnc = records.filter((r) => r.outcome === 'OPTED_OUT_DNC').length;

    const contactRate = totalProspects > 0 ? Number(((contacted / totalProspects) * 100).toFixed(1)) : 0;
    const interestRate = contacted > 0 ? Number(((interested / contacted) * 100).toFixed(1)) : 0;
    const highIntentRate = contacted > 0 ? Number(((highIntent / contacted) * 100).toFixed(1)) : 0;
    const callbackRate = contacted > 0 ? Number(((callbacks / contacted) * 100).toFixed(1)) : 0;
    const counselorEscalationRate = contacted > 0 ? Number(((counselorRequests / contacted) * 100).toFixed(1)) : 0;

    return {
      totalProspects,
      contacted,
      interested,
      highIntent,
      callbacks,
      counselorRequests,
      campusVisits,
      applicationInterest,
      notInterested,
      dnc,
      contactRate,
      interestRate,
      highIntentRate,
      callbackRate,
      counselorEscalationRate,
    };
  }

  // ─── Top Admission Leads ───────────────────────────────────────────────────

  public async getTopLeads(campaignId?: string, limit = 20): Promise<AdmissionIntelligenceLead[]> {
    const filter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const records = await CallRecordModel.find(filter).sort({ createdAt: -1 }).exec();

    const queueItemIds = records.map((r) => r.queueItemId).filter(Boolean) as string[];
    const queueItems = queueItemIds.length > 0 ? await CallQueueItemModel.find({ queueId: { $in: queueItemIds } }).lean() : [];
    const queueItemMap = new Map(queueItems.map((q) => [q.queueId, q]));

    const leads = records
      .map((r) => {
        let rankScore = 0;
        if (r.admissionInterest === 'HIGH') rankScore += 50;
        if (r.admissionInterest === 'MEDIUM') rankScore += 25;
        if (r.outcome === 'CAMPUS_VISIT_SCHEDULED') rankScore += 40;
        if (r.outcome === 'INTERESTED' || r.outcome === 'APPLICATION_INITIATED') rankScore += 35;
        if (r.outcome === 'CALLBACK_REQUESTED' || r.outcome === 'COUNSELOR_ESCALATED') rankScore += 30;
        if (r.sentiment === 'POSITIVE') rankScore += 15;

        const queueItem = r.queueItemId ? queueItemMap.get(r.queueItemId) : null;

        return {
          callId: r.callId,
          studentId: r.studentId,
          studentName: r.studentName,
          maskedPhone: maskPhone(r.phone),
          courseInterest: r.courseInterest,
          admissionInterest: r.admissionInterest,
          intent: r.intent,
          sentiment: r.sentiment,
          outcome: r.outcome,
          lastCall: formatDate(r.createdAt),
          attemptCount: queueItem?.attempts || 0,
          nextAction: r.recommendedAction,
          callbackTime: r.approvedActionDetails?.scheduledCallback ? formatDate(r.approvedActionDetails.scheduledCallback) : undefined,
          priority: queueItem?.priorityLevel || 'MEDIUM',
          primaryConcern: r.primaryConcern || 'Inquired about curriculum and campus',
          recommendedAction: r.recommendedAction,
          rankScore,
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, limit);

    return leads;
  }

  // ─── Follow-Up Queue ───────────────────────────────────────────────────────

  public async getFollowUpQueue(campaignId?: string): Promise<FollowUpItem[]> {
    const campaignFilter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const queueItems = await CallQueueItemModel.find(campaignFilter).exec();
    const records = await CallRecordModel.find(campaignFilter).exec();

    const recordMap = new Map<string, typeof records[number]>();
    records.forEach((r) => {
      if (!recordMap.has(r.studentId) || new Date(r.createdAt) > new Date(recordMap.get(r.studentId)!.createdAt)) {
        recordMap.set(r.studentId, r);
      }
    });

    const followUps: FollowUpItem[] = [];

    for (const q of queueItems) {
      const latestRecord = recordMap.get(q.studentId);
      if (!latestRecord) continue;

      const now = new Date();
      const isCallbackDue = q.nextCallbackAt && new Date(q.nextCallbackAt) <= now;
      const isHighIntent = latestRecord.admissionInterest === 'HIGH';
      const isCounselorRequested = latestRecord.outcome === 'COUNSELOR_ESCALATED';
      const isCampusVisit = latestRecord.outcome === 'CAMPUS_VISIT_SCHEDULED';
      const isApplicationAssistance = latestRecord.intent === 'APPLICATION_ASSISTANCE';

      let priority: PriorityLevel = 'LOW';
      let reason = 'Newly imported lead';

      if (isCallbackDue || isCounselorRequested || isCampusVisit || isApplicationAssistance) {
        priority = 'URGENT';
        if (isCallbackDue) reason = 'Callback requested — due now or overdue.';
        else if (isCounselorRequested) reason = 'Senior counselor consultation requested.';
        else if (isCampusVisit) reason = 'Campus visit appointment requested.';
        else if (isApplicationAssistance) reason = 'Application assistance requested.';
      } else if (isHighIntent || latestRecord.outcome === 'INTERESTED' || q.leadStage === 'INTERESTED') {
        priority = 'HIGH';
        reason = 'Strong admission interest expressed during call.';
      } else if (latestRecord.intent === 'COURSE_ENQUIRY' || latestRecord.intent === 'FEE_QUERY' || latestRecord.intent === 'SCHOLARSHIP_QUERY') {
        priority = 'MEDIUM';
        reason = `${latestRecord.intent.replace(/_/g, ' ')} — active course engagement.`;
      } else if (q.leadStage === 'NEW' || q.leadStage === 'CONTACTED') {
        priority = 'LOW';
        reason = 'Newly imported or minimally contacted lead.';
      }

      followUps.push({
        studentId: q.studentId,
        studentName: q.studentName,
        maskedPhone: maskPhone(q.phone),
        courseInterest: q.courseInterest,
        priority,
        reason,
        callbackTime: q.nextCallbackAt ? formatDate(q.nextCallbackAt) : undefined,
        leadStage: q.leadStage,
        lastCall: q.lastCalledAt ? formatDate(q.lastCalledAt) : undefined,
        attemptCount: q.attempts,
        outcome: latestRecord.outcome,
        recommendedAction: latestRecord.recommendedAction,
      });
    }

    const priorityOrder: Record<PriorityLevel, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    followUps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return followUps;
  }

  // ─── Student Intelligence ──────────────────────────────────────────────────

  public async getStudentIntelligence(studentId: string): Promise<StudentIntelligence> {
    const records = await CallRecordModel.find({ studentId, deletedAt: { $exists: false } }).sort({ createdAt: -1 }).exec();
    const queueItems = await CallQueueItemModel.find({ studentId, deletedAt: { $exists: false } }).exec();

    if (records.length === 0 && queueItems.length === 0) {
      throw new NotFoundError('No intelligence data found for this student');
    }

    const latestQueueItem = queueItems[0];
    const latestRecord = records[0];

    const callHistory = records.map((r) => ({
      callId: r.callId,
      campaignId: r.campaignId,
      timestamp: formatDate(r.createdAt),
      durationSeconds: r.durationSeconds,
      outcome: r.outcome,
      sentiment: r.sentiment,
      intent: r.intent,
      admissionInterest: r.admissionInterest,
      primaryConcern: r.primaryConcern,
      recommendedAction: r.recommendedAction,
      actionApprovalStatus: r.actionApprovalStatus,
      transcript: r.transcript.map((t) => ({
        speaker: t.speaker,
        text: t.text,
        timestamp: formatDate(t.timestamp),
        language: t.language,
        sentiment: t.sentiment,
        intent: t.intent,
      })),
    }));

    let latestCall: StudentIntelligence['latestCall'] | undefined;
    if (latestRecord) {
      latestCall = {
        callId: latestRecord.callId,
        campaignId: latestRecord.campaignId,
        timestamp: formatDate(latestRecord.createdAt),
        durationSeconds: latestRecord.durationSeconds,
        sentiment: latestRecord.sentiment,
        intent: latestRecord.intent,
        admissionInterest: latestRecord.admissionInterest,
        outcome: latestRecord.outcome,
        primaryConcern: latestRecord.primaryConcern,
        recommendedAction: latestRecord.recommendedAction,
        actionApprovalStatus: latestRecord.actionApprovalStatus,
        notes: latestRecord.notes,
        transcript: latestRecord.transcript.map((t) => ({
          speaker: t.speaker,
          text: t.text,
          timestamp: formatDate(t.timestamp),
          language: t.language,
          sentiment: t.sentiment,
          intent: t.intent,
        })),
      };
    }

    const stages: Array<{ stage: string; timestamp?: string; details: string }> = [];
    if (latestQueueItem) {
      stages.push({ stage: 'Inquiry', timestamp: latestQueueItem.createdAt ? formatDate(latestQueueItem.createdAt) : undefined, details: 'Lead imported into campaign queue' });
    }
    if (latestQueueItem && latestQueueItem.attempts > 0) {
      stages.push({ stage: 'Contacted', timestamp: latestQueueItem.lastCalledAt ? formatDate(latestQueueItem.lastCalledAt) : undefined, details: `${latestQueueItem.attempts} call attempt(s) made` });
    }
    records.forEach((r) => {
      if (r.outcome === 'INTERESTED' || r.admissionInterest === 'HIGH') {
        stages.push({ stage: 'Interested', timestamp: formatDate(r.createdAt), details: `Expressed ${r.admissionInterest} admission interest` });
      }
      if (r.outcome === 'COUNSELOR_ESCALATED') {
        stages.push({ stage: 'Counselling', timestamp: formatDate(r.createdAt), details: 'Requested senior counselor consultation' });
      }
      if (r.outcome === 'CAMPUS_VISIT_SCHEDULED') {
        stages.push({ stage: 'Campus Visit', timestamp: formatDate(r.createdAt), details: 'Campus visit appointment scheduled' });
      }
      if (r.outcome === 'APPLICATION_INITIATED') {
        stages.push({ stage: 'Application', timestamp: formatDate(r.createdAt), details: 'Application process initiated' });
      }
    });

    return {
      studentId: latestQueueItem?.studentId || studentId,
      studentName: latestRecord?.studentName || latestQueueItem?.studentName || 'Unknown Student',
      phone: latestRecord?.phone || latestQueueItem?.phone || '',
      email: latestQueueItem?.email,
      courseInterest: latestRecord?.courseInterest || latestQueueItem?.courseInterest || '',
      preferredLanguage: latestRecord?.preferredLanguage || latestQueueItem?.preferredLanguage || 'English',
      leadSource: latestQueueItem?.notes || undefined,
      academicQualification: latestQueueItem?.academicQualification,
      academicScore: latestQueueItem?.academicScore,
      callHistory,
      latestCall,
      timeline: stages,
    };
  }

  // ─── Campaign Insights ─────────────────────────────────────────────────────

  public async getCampaignInsights(campaignId: string): Promise<CampaignInsights> {
    const campaign = await callingCampaignRepository.findByCampaignId(campaignId);
    if (!campaign) throw new NotFoundError('Campaign not found');

    const records = await CallRecordModel.find({ campaignId: campaign.campaignId, deletedAt: { $exists: false } }).exec();
    const queueItems = await CallQueueItemModel.find({ campaignId: campaign.campaignId, deletedAt: { $exists: false } }).exec();

    const students = campaign.totalLeads;
    const calls = queueItems.filter((q) => q.attempts > 0).length;
    const successfulCalls = records.filter((r) => r.status === 'COMPLETED').length;
    const noAnswer = records.filter((r) => r.outcome === 'NO_ANSWER' || r.outcome === 'BUSY').length;
    const interested = records.filter((r) => r.outcome === 'INTERESTED').length;
    const highIntent = records.filter((r) => r.admissionInterest === 'HIGH').length;
    const callbacks = records.filter((r) => r.outcome === 'CALLBACK_REQUESTED').length;
    const counselorRequests = records.filter((r) => r.outcome === 'COUNSELOR_ESCALATED').length;
    const campusVisits = records.filter((r) => r.outcome === 'CAMPUS_VISIT_SCHEDULED').length;
    const applicationsInterest = records.filter((r) => r.outcome === 'APPLICATION_INITIATED').length;
    const notInterested = records.filter((r) => r.outcome === 'NOT_INTERESTED').length;
    const dnc = records.filter((r) => r.outcome === 'OPTED_OUT_DNC').length;

    const contactRate = students > 0 ? Number(((calls / students) * 100).toFixed(1)) : 0;
    const interestRate = calls > 0 ? Number(((interested / calls) * 100).toFixed(1)) : 0;
    const highIntentRate = calls > 0 ? Number(((highIntent / calls) * 100).toFixed(1)) : 0;
    const callbackRate = calls > 0 ? Number(((callbacks / calls) * 100).toFixed(1)) : 0;
    const counselorEscalationRate = calls > 0 ? Number(((counselorRequests / calls) * 100).toFixed(1)) : 0;

    return {
      campaignId: campaign.campaignId,
      campaignName: campaign.name,
      students,
      calls,
      successfulCalls,
      noAnswer,
      interested,
      highIntent,
      callbacks,
      counselorRequests,
      campusVisits,
      applicationsInterest,
      notInterested,
      dnc,
      contactRate,
      interestRate,
      highIntentRate,
      callbackRate,
      counselorEscalationRate,
    };
  }

  // ─── Course Demand ─────────────────────────────────────────────────────────

  public async getCourseDemand(campaignId?: string): Promise<CourseDemandStat[]> {
    const filter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const records = await CallRecordModel.find(filter).exec();

    const courseStats: Record<string, { count: number; highIntentCount: number }> = {};
    records.forEach((r) => {
      const c = r.courseInterest || 'Unknown';
      if (!courseStats[c]) courseStats[c] = { count: 0, highIntentCount: 0 };
      courseStats[c].count++;
      if (r.admissionInterest === 'HIGH') courseStats[c].highIntentCount++;
    });

    const total = records.length || 1;
    return Object.entries(courseStats)
      .map(([course, stat]) => ({
        course,
        interested: stat.count,
        highIntent: stat.highIntentCount,
        percentage: Number(((stat.count / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.interested - a.interested);
  }

  // ─── Common Questions ──────────────────────────────────────────────────────

  public async getCommonQuestions(campaignId?: string): Promise<CommonQuestion[]> {
    const filter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const records = await CallRecordModel.find(filter).exec();

    const intentMap: Record<string, string> = {
      FEE_QUERY: 'Annual Tuition & Lab Fees',
      PLACEMENT_QUERY: 'Placement Records & Top Recruiters',
      SCHOLARSHIP_QUERY: 'Merit Scholarship Eligibility',
      CAMPUS_VISIT: 'Campus Tour / Laboratory Visits',
      HOSTEL_QUERY: 'Hostel Facilities & Accommodation',
      ELIGIBILITY_QUERY: 'Admission Eligibility Criteria',
      COURSE_ENQUIRY: 'Course Curriculum & Specializations',
      APPLICATION_ASSISTANCE: 'Application Process & Deadlines',
      DOCUMENT_ASSISTANCE: 'Required Documents & Verification',
      COUNSELOR_REQUEST: 'Counselling Session Request',
      CALLBACK_REQUEST: 'Callback Request',
      NOT_INTERESTED: 'Not Interested',
      OPT_OUT_DNC: 'Opted Out / Do Not Call',
      ALREADY_APPLIED: 'Already Applied',
      CALL_LATER: 'Call Later',
      WRONG_NUMBER: 'Wrong Number',
      OTHER: 'Other',
      ADMISSION_INTEREST: 'General Admission Interest',
    };

    const counts: Record<string, number> = {};
    records.forEach((r) => {
      const topic = intentMap[r.intent] || r.intent.replace(/_/g, ' ');
      counts[topic] = (counts[topic] || 0) + 1;
    });

    const total = records.length || 1;
    return Object.entries(counts)
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: Number(((count / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // ─── Common Objections ─────────────────────────────────────────────────────

  public async getCommonObjections(campaignId?: string): Promise<CommonObjection[]> {
    const filter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const records = await CallRecordModel.find(filter).exec();

    const objections: Array<{ objection: string; count: number }> = [];
    const callbackCount = records.filter((r) => r.outcome === 'CALLBACK_REQUESTED').length;
    if (callbackCount > 0) {
      objections.push({ objection: 'Needs to discuss with parents / family', count: callbackCount });
    }

    const feeConcernCount = records.filter((r) => r.primaryConcern?.toLowerCase().includes('fee') || r.intent === 'FEE_QUERY').length;
    if (feeConcernCount > 0) {
      objections.push({ objection: 'Concerned about fees / needs scholarship info', count: feeConcernCount });
    }

    const campusVisitCount = records.filter((r) => r.intent === 'CAMPUS_VISIT').length;
    if (campusVisitCount > 0) {
      objections.push({ objection: 'Wants to visit campus before deciding', count: campusVisitCount });
    }

    const noAnswerCount = records.filter((r) => r.outcome === 'NO_ANSWER' || r.outcome === 'BUSY').length;
    if (noAnswerCount > 0) {
      objections.push({ objection: 'Could not reach / unavailable', count: noAnswerCount });
    }

    const notInterestedCount = records.filter((r) => r.outcome === 'NOT_INTERESTED').length;
    if (notInterestedCount > 0) {
      objections.push({ objection: 'Not interested in this program', count: notInterestedCount });
    }

    const comparingCount = records.filter((r) => r.notes?.toLowerCase().includes('compare') || r.notes?.toLowerCase().includes('another')).length;
    if (comparingCount > 0) {
      objections.push({ objection: 'Wants to compare with other colleges', count: comparingCount });
    }

    return objections.sort((a, b) => b.count - a.count);
  }

  // ─── AI Campaign Summary ───────────────────────────────────────────────────

  public async getAICampaignSummary(campaignId?: string): Promise<AICampaignSummary> {
    try {
      const overview = await this.getOverview(campaignId);
      const insights = await this.getTopLeads(campaignId, 5);
      const courseDemand = await this.getCourseDemand(campaignId);
      const questions = await this.getCommonQuestions(campaignId);
      const objections = await this.getCommonObjections(campaignId);

      const contextText = [
        `Campaign Overview:`,
        `- Total Prospects: ${overview.totalProspects}`,
        `- Contacted: ${overview.contacted} (${overview.contactRate}%)`,
        `- Interested: ${overview.interested} (${overview.interestRate}%)`,
        `- High Intent: ${overview.highIntent} (${overview.highIntentRate}%)`,
        `- Callbacks: ${overview.callbacks} (${overview.callbackRate}%)`,
        `- Counselor Requests: ${overview.counselorRequests}`,
        `- Campus Visits: ${overview.campusVisits}`,
        `- Application Interest: ${overview.applicationInterest}`,
        `- Not Interested: ${overview.notInterested}`,
        `- DNC: ${overview.dnc}`,
        ``,
        `Top Courses:`,
        ...courseDemand.slice(0, 5).map((c) => `- ${c.course}: ${c.interested} interested, ${c.highIntent} high intent`),
        ``,
        `Top Questions:`,
        ...questions.slice(0, 5).map((q) => `- ${q.topic}: ${q.count} inquiries`),
        ``,
        `Top Objections:`,
        ...objections.slice(0, 5).map((o) => `- ${o.objection}: ${o.count} occurrences`),
        ``,
        `Top Leads:`,
        ...insights.slice(0, 5).map((l, i) => `- #${i + 1} ${l.studentName} (${l.courseInterest}) — ${l.admissionInterest} intent, ${l.outcome.replace(/_/g, ' ')}`),
      ].join('\n');

      const result = await aiService.generateCounselingNotes({
        applicantId: campaignId || 'campaign-global',
        counselingNotes: contextText,
        previousInteractions: [],
      });

      return {
        summary: result.structuredNotes,
        generatedAt: new Date().toISOString(),
        available: true,
      };
    } catch (error) {
      logger.warn('AI campaign summary generation failed', error as Error);
      return {
        summary: '',
        generatedAt: new Date().toISOString(),
        available: false,
      };
    }
  }

  // ─── Action Recommendations ────────────────────────────────────────────────

  public async getActionRecommendations(campaignId?: string): Promise<ActionRecommendation[]> {
    const overview = await this.getOverview(campaignId);
    const objections = await this.getCommonObjections(campaignId);
    const courseDemand = await this.getCourseDemand(campaignId);

    const recommendations: ActionRecommendation[] = [];

    if (overview.counselorRequests > 0) {
      recommendations.push({
        priority: 'HIGH',
        insight: `${overview.counselorRequests} student(s) requested counselling during outreach calls.`,
        suggestedAction: 'Contact all students who requested counselling and schedule senior counselor sessions.',
      });
    }

    if (overview.campusVisits > 0) {
      recommendations.push({
        priority: 'HIGH',
        insight: `${overview.campusVisits} student(s) requested campus visits.`,
        suggestedAction: 'Follow up with campus visit requests and confirm appointments.',
      });
    }

    if (overview.callbacks > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        insight: `${overview.callbacks} callback request(s) are pending.`,
        suggestedAction: 'Prioritize today\'s callback requests and assign to available counselors.',
      });
    }

    if (overview.applicationInterest > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        insight: `${overview.applicationInterest} student(s) showed application interest.`,
        suggestedAction: 'Send application forms and assist with document submission for interested students.',
      });
    }

    if (overview.highIntent > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        insight: `${overview.highIntent} student(s) showed high admission intent.`,
        suggestedAction: 'Fast-track high-intent students through the admission pipeline.',
      });
    }

    const feeObjection = objections.find((o) => o.objection.toLowerCase().includes('fee'));
    if (feeObjection && feeObjection.count > 0) {
      recommendations.push({
        priority: 'LOW',
        insight: `${feeObjection.count} student(s) expressed concern about fees.`,
        suggestedAction: 'Send approved fee structure and scholarship information to concerned students.',
      });
    }

    if (courseDemand.length > 0) {
      const topCourse = courseDemand[0];
      recommendations.push({
        priority: 'LOW',
        insight: `${topCourse.course} has the highest demand (${topCourse.interested} interested, ${topCourse.highIntent} high intent).`,
        suggestedAction: 'Ensure adequate seat allocation and counselling capacity for the top-demand course.',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        insight: 'No significant actionable insights at this time.',
        suggestedAction: 'Continue monitoring campaign progress.',
      });
    }

    return recommendations;
  }

  // ─── Admission Funnel ──────────────────────────────────────────────────────

  public async getAdmissionFunnel(campaignId?: string): Promise<AdmissionFunnelStage[]> {
    const filter = campaignId ? { campaignId, deletedAt: { $exists: false } } : { deletedAt: { $exists: false } };
    const queueItems = await CallQueueItemModel.find(filter).exec();
    const records = await CallRecordModel.find(filter).exec();

    const prospects = queueItems.length;
    const contacted = queueItems.filter((q) => q.attempts > 0).length;
    const interested = records.filter((r) => r.outcome === 'INTERESTED').length;
    const highIntent = records.filter((r) => r.admissionInterest === 'HIGH').length;
    const counselling = records.filter((r) => r.outcome === 'COUNSELOR_ESCALATED').length;
    const campusVisit = records.filter((r) => r.outcome === 'CAMPUS_VISIT_SCHEDULED').length;
    const applicationInterest = records.filter((r) => r.outcome === 'APPLICATION_INITIATED').length;

    const stages: AdmissionFunnelStage[] = [
      { stage: 'Prospects', count: prospects, percentage: 100, color: 'bg-primary/20 text-primary' },
      { stage: 'Contacted', count: contacted, percentage: prospects > 0 ? Number(((contacted / prospects) * 100).toFixed(1)) : 0, color: 'bg-sky/20 text-sky' },
      { stage: 'Interested', count: interested, percentage: prospects > 0 ? Number(((interested / prospects) * 100).toFixed(1)) : 0, color: 'bg-purple-500/20 text-purple-400' },
      { stage: 'High Intent', count: highIntent, percentage: prospects > 0 ? Number(((highIntent / prospects) * 100).toFixed(1)) : 0, color: 'bg-amber-500/20 text-amber-500' },
      { stage: 'Counselling', count: counselling, percentage: prospects > 0 ? Number(((counselling / prospects) * 100).toFixed(1)) : 0, color: 'bg-emerald-500/20 text-emerald-400' },
      { stage: 'Campus Visit', count: campusVisit, percentage: prospects > 0 ? Number(((campusVisit / prospects) * 100).toFixed(1)) : 0, color: 'bg-pink-500/20 text-pink-400' },
      { stage: 'Application Interest', count: applicationInterest, percentage: prospects > 0 ? Number(((applicationInterest / prospects) * 100).toFixed(1)) : 0, color: 'bg-success/20 text-success' },
    ];

    return stages;
  }

  // ─── Global Search ─────────────────────────────────────────────────────────

  public async globalSearch(query: string, filters?: AdmissionIntelligenceFilters): Promise<GlobalSearchResult[]> {
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const records = await CallRecordModel.find({ deletedAt: { $exists: false } }).exec();

    const results: GlobalSearchResult[] = [];

    for (const r of records) {
      if (!searchRegex.test(r.studentName) && !searchRegex.test(r.phone) && !searchRegex.test(r.courseInterest)) {
        continue;
      }

      if (filters?.campaignId && r.campaignId !== filters.campaignId) continue;
      if (filters?.course && r.courseInterest !== filters.course) continue;
      if (filters?.interest && r.admissionInterest !== filters.interest) continue;
      if (filters?.intent && r.intent !== filters.intent) continue;
      if (filters?.outcome && r.outcome !== filters.outcome) continue;

      const queueItem = await CallQueueItemModel.findOne({ studentId: r.studentId, campaignId: r.campaignId }).lean();
      if (filters?.priority && queueItem?.priorityLevel !== filters.priority) continue;
      if (filters?.language && r.preferredLanguage !== filters.language) continue;
      if (filters?.callback && r.outcome !== 'CALLBACK_REQUESTED') continue;
      if (filters?.dateFrom && new Date(r.createdAt) < new Date(filters.dateFrom)) continue;
      if (filters?.dateTo && new Date(r.createdAt) > new Date(filters.dateTo)) continue;

      const campaign = await CallingCampaignModel.findOne({ campaignId: r.campaignId }).lean();

      results.push({
        studentId: r.studentId,
        studentName: r.studentName,
        maskedPhone: maskPhone(r.phone),
        courseInterest: r.courseInterest,
        intent: r.intent,
        outcome: r.outcome,
        admissionInterest: r.admissionInterest,
        priority: queueItem?.priorityLevel || 'MEDIUM',
        campaignId: r.campaignId,
        campaignName: campaign?.name || 'Unknown Campaign',
      });
    }

    return results.slice(0, 50);
  }
}

export const admissionIntelligenceService = new AdmissionIntelligenceService();
