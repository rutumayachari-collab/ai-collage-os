import type { RequestHandler } from 'express';
import { NotFoundError } from '../shared/utils/api-error.util';

/**
 * Terminal middleware for unmatched routes; delegates to the global handler.
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} was not found`));
};
