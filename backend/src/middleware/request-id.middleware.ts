import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Ensures every request carries a correlation id, reusing an upstream one when
 * provided so traces survive across gateways and clients.
 */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header(REQUEST_ID_HEADER);
  const id = incoming && incoming.trim().length > 0 ? incoming.trim() : randomUUID();

  res.setHeader(REQUEST_ID_HEADER, id);
  res.locals.requestId = id;
  next();
};
