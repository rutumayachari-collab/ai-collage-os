import type { ErrorCodeValue } from '../constants';

/** Envelope for every successful API response. */
export interface ApiSuccessBody<TData> {
  success: true;
  message: string;
  data?: TData;
  meta?: PaginationMeta;
  timestamp: string;
}

/** Envelope for every failed API response. */
export interface ApiErrorBody {
  success: false;
  message: string;
  code: ErrorCodeValue;
  details?: ErrorDetail[];
  stack?: string;
  timestamp: string;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sort?: string;
}
