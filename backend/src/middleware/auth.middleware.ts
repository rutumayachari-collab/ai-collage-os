import type { RequestHandler } from 'express';
import { extractBearerToken, verifyAccessToken } from '../shared/utils/jwt.util';
import { ForbiddenError, UnauthorizedError } from '../shared/utils/api-error.util';
import type { AuthenticatedRequest } from '../shared/types';
import type { UserRoleValue } from '../shared/constants';

/**
 * Verifies the bearer token (or auth cookie) and attaches the identity to the request.
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const cookieToken = (req.cookies as Record<string, string> | undefined)?.access_token;
    const token = extractBearerToken(req.header('authorization')) ?? cookieToken ?? null;

    if (!token) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restricts a route to the given roles. Must run after `authenticate`.
 */
export const authorize = (...roles: UserRoleValue[]): RequestHandler => {
  return (req, _res, next) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      next(new ForbiddenError('Your role does not allow this operation'));
      return;
    }

    next();
  };
};
