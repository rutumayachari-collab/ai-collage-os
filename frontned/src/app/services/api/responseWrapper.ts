import type { ApiResponse, ApiError, PaginatedResponse } from "../../types/api";

export function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    "data" in data &&
    "statusCode" in data
  );
}

export function isPaginatedResponse<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "items" in data &&
    "total" in data &&
    "page" in data &&
    "limit" in data
  );
}

export function unwrapApiResponse<T>(response: unknown): T {
  if (isApiResponse<T>(response)) {
    return response.data;
  }
  return response as T;
}

export function unwrapPaginatedResponse<T>(response: unknown): PaginatedResponse<T> {
  if (isPaginatedResponse<T>(response)) {
    return response;
  }
  if (isApiResponse<PaginatedResponse<T>>(response)) {
    return response.data;
  }
  throw new Error("Invalid paginated response format");
}

export function extractErrorMessage(response: ApiResponse | ApiError): string {
  if ("message" in response) {
    return response.message || "An error occurred";
  }
  return "An unexpected error occurred";
}
