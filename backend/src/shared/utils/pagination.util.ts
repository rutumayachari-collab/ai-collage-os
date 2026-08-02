import { z } from 'zod';
import type { PaginationQuery } from '../types';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().min(1).optional(),
});

/**
 * Normalizes arbitrary query input into safe pagination parameters.
 */
export const parsePagination = (query: unknown): PaginationQuery => paginationSchema.parse(query);

/** Converts a page/limit pair into a Mongo skip value. */
export const toSkip = (page: number, limit: number): number => (page - 1) * limit;
