import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";

export class AdmissionIntelligenceService extends BaseService {
  async getWhatIfSimulation(params: {
    departmentId?: string;
    courseId?: string;
    currentIntake: number;
    proposedIntake: number;
    applicantVolume: number;
    expectedConversionRate: number;
    scholarshipBudget: number;
    processingCapacity: number;
    verificationDays: number;
    counselorCapacity: number;
  }): Promise<unknown> {
    return this.post(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/what-if`, params);
  }

  async getBottleneckAnalysis(): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/bottlenecks`);
  }
  async getOverview(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/overview`, { params: { campaignId } });
  }

  async getTopLeads(campaignId?: string, limit = 20): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/leads`, {
      params: { campaignId, limit },
    });
  }

  async getFollowUpQueue(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/follow-ups`, {
      params: { campaignId },
    });
  }

  async getCampaignInsights(campaignId: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/campaigns/${campaignId}/insights`);
  }

  async getCourseDemand(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/courses`, { params: { campaignId } });
  }

  async getCommonQuestions(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/questions`, { params: { campaignId } });
  }

  async getCommonObjections(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/objections`, {
      params: { campaignId },
    });
  }

  async getAICampaignSummary(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/ai-summary`, {
      params: { campaignId },
    });
  }

  async getActionRecommendations(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/recommendations`, {
      params: { campaignId },
    });
  }

  async getAdmissionFunnel(campaignId?: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/funnel`, { params: { campaignId } });
  }

  async globalSearch(query: string): Promise<unknown> {
    return this.post(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/search`, { query });
  }

  async getStudentIntelligence(studentId: string): Promise<unknown> {
    return this.get(`${API_ENDPOINTS.OUTREACH.INTELLIGENCE}/student/${studentId}`);
  }
}

export const admissionIntelligenceService = new AdmissionIntelligenceService();
