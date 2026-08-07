import { ApiError } from "../../types/api";
import { HTTP_STATUS } from "../../constants";

export class ApiClientError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.statusCode = error.statusCode;
    this.code = error.code;
    this.details = error.details;
  }
}

export function createApiError(error: ApiError): ApiClientError {
  return new ApiClientError(error);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

export function isApiError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function handleApiError(error: unknown): never {
  const apiError = isApiError(error)
    ? error
    : createApiError({
        message: getErrorMessage(error),
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
  throw apiError;
}
