import { env, isProduction } from './env.config';

/**
 * Central, immutable application configuration derived from the validated env.
 */
export const appConfig = {
  name: 'AICollegeOS',
  apiPrefix: '/api/v1',
  port: env.PORT,
  environment: env.NODE_ENV,
  clientUrls: env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean),
  requestBodyLimit: '5mb',
  shutdownTimeoutMs: 10_000,
  trustProxy: isProduction,
} as const;

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  issuer: 'aicollegeos',
  audience: 'aicollegeos-clients',
} as const;

export const uploadConfig = {
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
  ] as readonly string[],
} as const;

export const mailConfig = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  user: env.EMAIL_USER,
  password: env.EMAIL_PASS,
  from: env.EMAIL_USER ? `AICollegeOS <${env.EMAIL_USER}>` : undefined,
  get isConfigured(): boolean {
    return Boolean(env.EMAIL_HOST && env.EMAIL_PORT && env.EMAIL_USER && env.EMAIL_PASS);
  },
} as const;
