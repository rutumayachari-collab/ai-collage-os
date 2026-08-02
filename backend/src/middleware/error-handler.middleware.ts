import type { ErrorRequestHandler } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { ErrorCode, HttpStatus, type ErrorCodeValue, type HttpStatusCode } from '../shared/constants';
import { ApiError } from '../shared/utils/api-error.util';
import { logger } from '../shared/utils/logger.util';
import { isProduction } from '../config/env.config';
import type { ApiErrorBody, ErrorDetail } from '../shared/types';

interface NormalizedError {
  statusCode: HttpStatusCode;
  message: string;
  code: ErrorCodeValue;
  details: ErrorDetail[];
}

const zodDetails = (error: ZodError): ErrorDetail[] =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));

/**
 * Translates any thrown value into a predictable API error shape.
 */
const normalize = (error: unknown): NormalizedError => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      code: ErrorCode.VALIDATION_ERROR,
      details: zodDetails(error),
    };
  }

  if (error instanceof MongooseError.ValidationError) {
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      code: ErrorCode.VALIDATION_ERROR,
      details: Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    };
  }

  if (error instanceof MongooseError.CastError) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Invalid value for field "${error.path}"`,
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: error.path, message: 'Invalid identifier format' }],
    };
  }

  if (error instanceof MongoServerError && error.code === 11000) {
    const fields = Object.keys((error.keyValue as Record<string, unknown>) ?? {});
    return {
      statusCode: HttpStatus.CONFLICT,
      message: 'A record with the same unique value already exists',
      code: ErrorCode.DUPLICATE_RESOURCE,
      details: fields.map((field) => ({ field, message: 'Must be unique' })),
    };
  }

  if (error instanceof multer.MulterError) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
      code: ErrorCode.UPLOAD_ERROR,
      details: error.field ? [{ field: error.field, message: error.code }] : [],
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred',
    code: ErrorCode.INTERNAL_ERROR,
    details: [],
  };
};

/**
 * Global error handler. Must be registered last in the middleware chain.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const normalized = normalize(error);
  const isServerError = normalized.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

  const logContext = {
    requestId: res.locals.requestId as string | undefined,
    method: req.method,
    url: req.originalUrl,
    statusCode: normalized.statusCode,
    error: error instanceof Error ? error.stack ?? error.message : error,
  };

  if (isServerError) {
    logger.error(normalized.message, logContext);
  } else {
    logger.warn(normalized.message, logContext);
  }

  const body: ApiErrorBody = {
    success: false,
    message: normalized.message,
    code: normalized.code,
    timestamp: new Date().toISOString(),
  };

  if (normalized.details.length > 0) {
    body.details = normalized.details;
  }

  if (!isProduction && error instanceof Error && error.stack) {
    body.stack = error.stack;
  }

  res.status(normalized.statusCode).json(body);
};
