import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async controller so rejected promises reach the global error handler
 * instead of crashing the process with an unhandled rejection.
 */
export const asyncHandler = <TReq extends Request = Request>(
  handler: AsyncRequestHandler<TReq>,
): RequestHandler => {
  return (req, res, next) => {
    void Promise.resolve(handler(req as TReq, res, next)).catch(next);
  };
};
