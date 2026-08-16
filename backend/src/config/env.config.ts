import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const currentNodeEnv = (process.env.NODE_ENV ?? 'development') as 'development' | 'test' | 'production';
const isProductionEnv = currentNodeEnv === 'production';

/**
 * Schema describing every environment variable the application depends on.
 * Validation happens once at boot so the process fails fast on misconfiguration.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default(currentNodeEnv),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: isProductionEnv
    ? z.string().min(16, 'JWT_SECRET must be at least 16 characters')
    : z.string().min(16).default('development-jwt-secret-key-123'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  EMAIL_HOST: z.string().min(1).optional(),
  EMAIL_PORT: z.coerce.number().int().positive().optional(),
  EMAIL_USER: z.string().min(1).optional(),
  EMAIL_PASS: z.string().min(1).optional(),
  CLIENT_URL: z.string().min(1).default('http://localhost:8080'),
  AI_PROVIDER: z.enum(['OPENAI', 'ANTHROPIC', 'AZURE_OPENAI', 'MOCK']).default('MOCK'),
  AI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  AI_API_KEY: z.string().min(1).optional(),
  AI_BASE_URL: z.string().url().optional(),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  AI_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(2),
});

export type AppEnv = z.infer<typeof envSchema>;

/**
 * Parses and validates process.env, throwing a readable error when invalid.
 */
const parseEnv = (): AppEnv => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return parsed.data;
};

export const env: AppEnv = parseEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
