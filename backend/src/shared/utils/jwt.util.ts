import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '../../config/app.config';
import { ErrorCode } from '../constants';
import { UnauthorizedError } from './api-error.util';
import type { JwtPayload } from '../types';

type TokenSubject = Pick<JwtPayload, 'sub' | 'email' | 'role'>;

/**
 * Signs an access token for the given subject.
 */
export const signAccessToken = (subject: TokenSubject): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  };

  return jwt.sign(
    { sub: subject.sub, email: subject.email, role: subject.role },
    jwtConfig.secret as Secret,
    options,
  );
};

/**
 * Verifies a token and returns its payload, mapping library errors to ApiErrors.
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret as Secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    if (typeof decoded === 'string') {
      throw new UnauthorizedError('Malformed authentication token', ErrorCode.TOKEN_INVALID);
    }

    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Authentication token has expired', ErrorCode.TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid authentication token', ErrorCode.TOKEN_INVALID);
  }
};

/** Extracts a bearer token from an Authorization header value. */
export const extractBearerToken = (headerValue: string | undefined): string | null => {
  if (!headerValue) {
    return null;
  }
  const [scheme, token] = headerValue.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  return token.trim() || null;
};
