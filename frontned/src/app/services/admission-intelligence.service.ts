import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
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
} from "../types/admission-intelligence";

export class AdmissionIntelligenceService extends BaseService {
  async getOverview(campaignId?: string): Promise<AdmissionIntelligenceOverview> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<AdmissionIntelligenceOverview>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/overview${qs ? `?${qs}` : ""}`,
    );
  }

  async getTopLeads(campaignId?: string, limit = 20): Promise<AdmissionIntelligenceLead[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    params.append("limit", limit.toString());
    return this.get<AdmissionIntelligenceLead[]>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/leads?${params.toString()}`,
    );
  }

  async getFollowUpQueue(campaignId?: string): Promise<FollowUpItem[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<FollowUpItem[]>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/follow-ups${qs ? `?${qs}` : ""}`,
    );
  }

  async getStudentIntelligence(studentId: string): Promise<StudentIntelligence> {
    return this.get<StudentIntelligence>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/student/${encodeURIComponent(studentId)}`,
    );
  }

  async getCampaignInsights(campaignId: string): Promise<CampaignInsights> {
    return this.get<CampaignInsights>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/campaigns/${encodeURIComponent(campaignId)}/insights`,
    );
  }

  async getCourseDemand(campaignId?: string): Promise<CourseDemandStat[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<CourseDemandStat[]>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/courses${qs ? `?${qs}` : ""}`,
    );
  }

  async getCommonQuestions(campaignId?: string): Promise<CommonQuestion[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<CommonQuestion[]>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/questions${qs ? `?${qs}` : ""}`,
    );
  }

  async getCommonObjections(campaignId?: string): Promise<CommonObjection[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<CommonObjection[]>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/objections${qs ? `?${qs}` : ""}`,
    );
  }

  async getAICampaignSummary(campaignId?: string): Promise<AICampaignSummary> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<AICampaignSummary>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/ai-summary${qs ? `?${qs}` : ""}`,
    );
  }

  async getActionRecommendations(campaignId?: string): Promise<ActionRecommendation[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<ActionRecommendation[]>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/recommendations${qs ? `?${qs}` : ""}`,
    );
  }

  async getAdmissionFunnel(campaignId?: string): Promise<AdmissionFunnelStage[]> {
    const params = new URLSearchParams();
    if (campaignId) params.append("campaignId", campaignId);
    const qs = params.toString();
    return this.get<AdmissionFunnelStage[]>(
      `${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/funnel${qs ? `?${qs}` : ""}`,
    );
  }

  async globalSearch(
    query: string,
    filters?: AdmissionIntelligenceFilters,
  ): Promise<GlobalSearchResult[]> {
    return this.post<GlobalSearchResult[]>(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/search`, {
      q: query,
      ...filters,
    });
  }
}

export const admissionIntelligenceService = new AdmissionIntelligenceService();
