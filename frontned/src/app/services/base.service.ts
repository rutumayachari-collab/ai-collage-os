import { apiClient } from "./api/apiClient";
import type { ApiResponse, PaginatedResponse } from "../types/api";
import { API_ENDPOINTS } from "../constants";

export class BaseService {
  protected async get<T>(
    endpoint: string,
    config?: { params?: Record<string, string | number | boolean | undefined> },
  ): Promise<T> {
    return apiClient.get<T>(endpoint, config);
  }

  protected async getPaginated<T>(
    endpoint: string,
    config?: { params?: Record<string, string | number | boolean | undefined> },
  ): Promise<PaginatedResponse<T>> {
    return apiClient.getPaginated<T>(endpoint, config);
  }

  protected async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return apiClient.post<T>(endpoint, body);
  }

  protected async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return apiClient.put<T>(endpoint, body);
  }

  protected async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return apiClient.patch<T>(endpoint, body);
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return apiClient.delete<T>(endpoint);
  }
}
