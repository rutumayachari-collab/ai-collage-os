import type { Response } from 'express';
import { HttpStatus, type HttpStatusCode } from '../constants';
import type { ApiSuccessBody, PaginationMeta } from '../types';

interface SendOptions<TData> {
  message: string;
  data?: TData;
  meta?: PaginationMeta;
  statusCode?: HttpStatusCode;
}

/**
 * Writes a consistent success envelope so every endpoint responds identically.
 */
export const sendSuccess = <TData>(res: Response, options: SendOptions<TData>): Response => {
  const { message, data, meta, statusCode = HttpStatus.OK } = options;

  const body: ApiSuccessBody<TData> = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== undefined) {
    body.data = data;
  }
  if (meta !== undefined) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};

/** Builds pagination metadata from raw paging inputs. */
export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
};
