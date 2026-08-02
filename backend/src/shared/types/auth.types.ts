import type { Request } from 'express';
import type { UserRoleValue } from '../constants';

/** Identity attached to a request once a JWT has been verified. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRoleValue;
}

/** Payload embedded in issued access tokens. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRoleValue;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/** Express request enriched by the authentication middleware. */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
