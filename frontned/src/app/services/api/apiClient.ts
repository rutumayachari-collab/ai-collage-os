import { ApiClientError, createApiError, handleApiError } from "./errorHandler";
import { unwrapApiResponse, unwrapPaginatedResponse, extractErrorMessage } from "./responseWrapper";
import { refreshAccessToken, isTokenExpired } from "./tokenRefresh";
import {
  API_ENDPOINTS,
  HTTP_STATUS,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "../../constants";
import type { ApiRequestConfig, ApiResponse, PaginatedResponse, ApiError } from "../../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;
  private onTokenRefreshFailed: (() => void) | null = null;

  constructor() {
    this.token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    this.refreshToken =
      typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) : null;
  }

  setTokens(token: string | null, refreshToken: string | null) {
    this.token = token;
    this.refreshToken = refreshToken;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      }
    }
  }

  setOnTokenRefreshFailed(callback: () => void) {
    this.onTokenRefreshFailed = callback;
  }

  private async request<T>(config: ApiRequestConfig & { endpoint: string }): Promise<T> {
    const { endpoint, method = "GET", body, params, headers = {} } = config;

    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (this.token) {
      requestHeaders.Authorization = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== "GET") {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    let response = await fetch(url.toString(), options);
    let responseData = await response.json().catch(() => ({}));

    if (response.status === HTTP_STATUS.UNAUTHORIZED && this.refreshToken && !this.refreshPromise) {
      this.refreshPromise = refreshAccessToken(this.refreshToken)
        .then((newTokens) => {
          this.setTokens(newTokens.token, newTokens.refreshToken);
          return newTokens.token;
        })
        .catch(() => {
          this.setTokens(null, null);
          if (this.onTokenRefreshFailed) {
            this.onTokenRefreshFailed();
          }
          throw new Error("Session expired. Please log in again.");
        })
        .finally(() => {
          this.refreshPromise = null;
        });

      const newToken = await this.refreshPromise;
      requestHeaders.Authorization = `Bearer ${newToken}`;
      response = await fetch(url.toString(), { ...options, headers: requestHeaders });
      responseData = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      const apiError: ApiError = {
        message: extractErrorMessage(responseData as ApiResponse | ApiError),
        statusCode: response.status,
        code: (responseData as ApiError).code,
        details: (responseData as ApiError).details,
      };
      throw createApiError(apiError);
    }

    return responseData as T;
  }

  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, "method">): Promise<T> {
    return this.request<T>({ ...config, endpoint, method: "GET" });
  }

  async getPaginated<T>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, "method">,
  ): Promise<PaginatedResponse<T>> {
    return this.request<PaginatedResponse<T>>({ ...config, endpoint, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<ApiRequestConfig, "method" | "body">,
  ): Promise<T> {
    return this.request<T>({ ...config, endpoint, method: "POST", body });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<ApiRequestConfig, "method" | "body">,
  ): Promise<T> {
    return this.request<T>({ ...config, endpoint, method: "PUT", body });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    config?: Omit<ApiRequestConfig, "method" | "body">,
  ): Promise<T> {
    return this.request<T>({ ...config, endpoint, method: "PATCH", body });
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, "method">): Promise<T> {
    return this.request<T>({ ...config, endpoint, method: "DELETE" });
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  }
}

export const apiClient = new ApiClient();
