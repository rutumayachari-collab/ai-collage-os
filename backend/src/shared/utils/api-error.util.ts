import { ErrorCode, HttpStatus, type ErrorCodeValue, type HttpStatusCode } from '../constants';
import type { ErrorDetail } from '../types';

/**
 * Base class for all errors intentionally surfaced to API clients.
 * Anything that is not an ApiError is treated as an unexpected failure.
 */
export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCodeValue;
  public readonly details: ErrorDetail[];
  public readonly isOperational = true;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    code: ErrorCodeValue = ErrorCode.INTERNAL_ERROR,
    details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, new.target);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', details: ErrorDetail[] = []) {
    super(HttpStatus.BAD_REQUEST, message, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details: ErrorDetail[] = []) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required', code: ErrorCodeValue = ErrorCode.AUTHENTICATION_REQUIRED) {
    super(HttpStatus.UNAUTHORIZED, message, code);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action') {
    super(HttpStatus.FORBIDDEN, message, ErrorCode.FORBIDDEN);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(HttpStatus.NOT_FOUND, message, ErrorCode.NOT_FOUND);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', code: ErrorCodeValue = ErrorCode.CONFLICT) {
    super(HttpStatus.CONFLICT, message, code);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message, ErrorCode.INTERNAL_ERROR);
  }
}
