import { isProduction } from '../../config/env.config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minimumLevel: LogLevel = isProduction ? 'info' : 'debug';

const shouldLog = (level: LogLevel): boolean =>
  LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[minimumLevel];

const write = (level: LogLevel, message: string, context?: unknown): void => {
  if (!shouldLog(level)) {
    return;
  }

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(context !== undefined ? { context } : {}),
  };

  const serialized = isProduction ? JSON.stringify(entry) : `[${entry.time}] ${level.toUpperCase()} ${message}`;

  if (level === 'error') {
    console.error(serialized, !isProduction && context !== undefined ? context : '');
    return;
  }
  if (level === 'warn') {
    console.warn(serialized, !isProduction && context !== undefined ? context : '');
    return;
  }
  console.log(serialized, !isProduction && context !== undefined ? context : '');
};

/** Minimal structured logger shared by every layer of the application. */
export const logger = {
  debug: (message: string, context?: unknown): void => write('debug', message, context),
  info: (message: string, context?: unknown): void => write('info', message, context),
  warn: (message: string, context?: unknown): void => write('warn', message, context),
  error: (message: string, context?: unknown): void => write('error', message, context),
  /** Morgan-compatible stream. */
  stream: {
    write: (message: string): void => write('info', message.trim()),
  },
};
