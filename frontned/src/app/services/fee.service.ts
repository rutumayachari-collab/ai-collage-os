import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { FeeStructure, StudentFeeAccount, FeeInvoice } from "../types/fee";

export class FeeService extends BaseService {
  async getFeeStructures(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<FeeStructure[]> {
    return this.get<FeeStructure[]>(
      `${API_ENDPOINTS.FEES}/structures`,
      params ? { params } : undefined,
    );
  }

  async getFeeStructureById(id: string): Promise<FeeStructure> {
    return this.get<FeeStructure>(`${API_ENDPOINTS.FEES}/structures/${id}`);
  }

  async createFeeStructure(data: Partial<FeeStructure>): Promise<FeeStructure> {
    return this.post<FeeStructure>(`${API_ENDPOINTS.FEES}/structures`, data);
  }

  async updateFeeStructure(id: string, data: Partial<FeeStructure>): Promise<FeeStructure> {
    return this.patch<FeeStructure>(`${API_ENDPOINTS.FEES}/structures/${id}`, data);
  }

  async deleteFeeStructure(id: string): Promise<void> {
    return this.delete(`${API_ENDPOINTS.FEES}/structures/${id}`);
  }

  async getStudentFeeAccount(studentId: string): Promise<StudentFeeAccount> {
    return this.get<StudentFeeAccount>(`${API_ENDPOINTS.FEES}/student/${studentId}`);
  }

  async getStudentFeeAccounts(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<StudentFeeAccount[]> {
    return this.get<StudentFeeAccount[]>(
      `${API_ENDPOINTS.FEES}/accounts`,
      params ? { params } : undefined,
    );
  }

  async createStudentFeeAccount(data: Partial<StudentFeeAccount>): Promise<StudentFeeAccount> {
    return this.post<StudentFeeAccount>(`${API_ENDPOINTS.FEES}/accounts`, data);
  }

  async updateStudentFeeAccount(
    id: string,
    data: Partial<StudentFeeAccount>,
  ): Promise<StudentFeeAccount> {
    return this.patch<StudentFeeAccount>(`${API_ENDPOINTS.FEES}/accounts/${id}`, data);
  }

  async generateInvoice(studentId: string): Promise<FeeInvoice> {
    return this.post<FeeInvoice>(`${API_ENDPOINTS.FEES}/invoices/generate`, { studentId });
  }

  async getInvoices(studentId: string): Promise<FeeInvoice[]> {
    return this.get<FeeInvoice[]>(`${API_ENDPOINTS.FEES}/invoices/${studentId}`);
  }

  async getPaymentHistory(studentId: string): Promise<unknown[]> {
    return this.get<unknown[]>(`${API_ENDPOINTS.FEES}/payments/${studentId}`);
  }
}

export const feeService = new FeeService();
