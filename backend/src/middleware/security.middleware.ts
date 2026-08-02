import helmet from 'helmet';
import type { RequestHandler } from 'express';

/**
 * Baseline security headers. The API serves JSON only, so a restrictive CSP
 * and cross-origin resource policy are safe defaults.
 */
export const securityMiddleware: RequestHandler[] = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
  }),
  (_req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
  },
];
