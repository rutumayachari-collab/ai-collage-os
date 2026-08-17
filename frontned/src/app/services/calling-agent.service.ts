import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type {
  CallingCampaign,
  CallQueueItem,
  CallOutcomeRecord,
  CallAnalytics,
  CampaignAIInsights,
  CSVValidationReport,
  StudentLeadInput,
  SupportedLanguage,
  DoNotCallItem,
  CallOutcome,
  CallSentiment,
  CallIntent,
  AdmissionInterestLevel,
  RecommendedActionType,
} from "../types/outreach";

export class CallingAgentService extends BaseService {
  async createCampaign(data: {
    name: string;
    collegeName: string;
    purpose: string;
    targetCourse?: string;
    defaultLanguage?: SupportedLanguage;
    maxAttempts?: number;
    studentLeads?: StudentLeadInput[];
  }): Promise<CallingCampaign> {
    return this.post<CallingCampaign>(API_ENDPOINTS.OUTREACH.CAMPAIGNS, data);
  }

  async listCampaigns(): Promise<CallingCampaign[]> {
    return this.get<CallingCampaign[]>(API_ENDPOINTS.OUTREACH.CAMPAIGNS);
  }

  async getCampaign(id: string): Promise<CallingCampaign> {
    return this.get<CallingCampaign>(`${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/${id}`);
  }

  async startCampaign(id: string): Promise<CallingCampaign> {
    return this.post<CallingCampaign>(`${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/${id}/start`, {});
  }

  async pauseCampaign(id: string): Promise<CallingCampaign> {
    return this.post<CallingCampaign>(`${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/${id}/pause`, {});
  }

  async validateCSV(
    rows: Record<string, string>[],
    campaignId?: string,
  ): Promise<CSVValidationReport> {
    return this.post<CSVValidationReport>(`${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/validate-csv`, {
      rows,
      campaignId,
    });
  }

  async importStudents(
    id: string,
    students: StudentLeadInput[],
  ): Promise<{ importedCount: number; suppressedDncCount: number }> {
    return this.post<{ importedCount: number; suppressedDncCount: number }>(
      `${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/${id}/import`,
      { students },
    );
  }

  async getQueue(
    id: string,
    status?: string,
    page = 1,
    limit = 50,
  ): Promise<{ items: CallQueueItem[]; total: number }> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return this.get<{ items: CallQueueItem[]; total: number }>(
      `${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/${id}/queue?${params.toString()}`,
    );
  }

  async getNextCall(campaignId: string): Promise<CallQueueItem | null> {
    return this.post<CallQueueItem | null>(API_ENDPOINTS.OUTREACH.CALLS_NEXT, { campaignId });
  }

  async startCallSession(data: {
    campaignId: string;
    queueItemId: string;
    language?: SupportedLanguage;
  }): Promise<{
    callId: string;
    sessionId: string;
    studentContext: Record<string, unknown>;
    initialGreeting: string;
    language: SupportedLanguage;
    callState: string;
    isSimulated: boolean;
    disclaimer: string;
  }> {
    return this.post(`${API_ENDPOINTS.OUTREACH.CALLS}/start`, data);
  }

  async interactTurn(data: {
    sessionId: string;
    queueItemId: string;
    campaignId: string;
    studentUtterance: string;
    currentLanguage: SupportedLanguage;
    transcriptHistory?: Record<string, unknown>[];
  }): Promise<{
    agentResponse: string;
    language: SupportedLanguage;
    detectedLanguage?: SupportedLanguage;
    languageChanged: boolean;
    sentiment: CallSentiment;
    intent: CallIntent;
    admissionInterest: AdmissionInterestLevel;
    primaryConcern?: string;
    recommendedAction: RecommendedActionType;
    actionReasoning: string;
    suggestedOutcome: CallOutcome;
    shouldEndCall: boolean;
    confidence: number;
  }> {
    return this.post(`${API_ENDPOINTS.OUTREACH.CALLS}/interact`, data);
  }

  async recordOutcome(
    queueItemId: string,
    data: {
      outcome: CallOutcome;
      sentiment: CallSentiment;
      intent: CallIntent;
      admissionInterest: AdmissionInterestLevel;
      primaryConcern?: string;
      notes?: string;
      recommendedAction: RecommendedActionType;
      actionReasoning?: string;
      callbackTime?: Date | string;
      durationSeconds: number;
      transcript: Record<string, unknown>[];
      preferredLanguage?: SupportedLanguage;
      detectedLanguage?: SupportedLanguage;
    },
  ): Promise<CallOutcomeRecord> {
    return this.post<CallOutcomeRecord>(
      `${API_ENDPOINTS.OUTREACH.CALLS}/${queueItemId}/outcome`,
      data,
    );
  }

  async approveAction(
    callId: string,
    data: {
      action: RecommendedActionType;
      approvalStatus: "APPROVED" | "REJECTED";
      counselorId?: string;
      scheduledTime?: Date | string;
      campusVisitDetails?: {
        date: Date | string;
        timeSlot: string;
        notes?: string;
      };
      overrideNotes?: string;
    },
  ): Promise<CallOutcomeRecord> {
    return this.post<CallOutcomeRecord>(
      `${API_ENDPOINTS.OUTREACH.CALLS}/${callId}/approve-action`,
      data,
    );
  }

  async getCallHistory(
    campaignId?: string,
    page = 1,
    limit = 50,
  ): Promise<{ items: CallOutcomeRecord[]; total: number }> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return this.get<{ items: CallOutcomeRecord[]; total: number }>(
      `${API_ENDPOINTS.OUTREACH.CALLS_HISTORY}?${params.toString()}`,
    );
  }

  async getAnalytics(id: string): Promise<CallAnalytics> {
    return this.get<CallAnalytics>(`${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/${id}/analytics`);
  }

  async getAIInsights(id: string): Promise<CampaignAIInsights> {
    return this.get<CampaignAIInsights>(`${API_ENDPOINTS.OUTREACH.CAMPAIGNS}/${id}/insights`);
  }

  async getDncList(page = 1, limit = 50): Promise<{ items: DoNotCallItem[]; total: number }> {
    return this.get<{ items: DoNotCallItem[]; total: number }>(
      `/outreach/dnc?page=${page}&limit=${limit}`,
    );
  }

  async addDnc(phone: string, reason?: string): Promise<DoNotCallItem> {
    return this.post<DoNotCallItem>("/outreach/dnc", { phone, reason });
  }
}

export const callingAgentService = new CallingAgentService();
