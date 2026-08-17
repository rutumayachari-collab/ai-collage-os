import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Payment, PaymentSummary, PaymentFilterInput } from "../types/payment";

export class PaymentService extends BaseService {
  async getSummary(): Promise<PaymentSummary> {
    return this.get<PaymentSummary>(`${API_ENDPOINTS.PAYMENTS}/summary`);
  }

  async getAll(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<{ items: Payment[]; total: number }> {
    return this.get<{ items: Payment[]; total: number }>(
      API_ENDPOINTS.PAYMENTS,
      params ? { params } : undefined,
    );
  }
}

export const paymentService = new PaymentService();
