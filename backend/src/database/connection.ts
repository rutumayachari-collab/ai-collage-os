import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.config';
import { logger } from '../shared/utils/logger.util';

let connectionPromise: Promise<typeof mongoose> | null = null;

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => logger.info('MongoDB connection established'));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB connection lost'));
mongoose.connection.on('error', (error) => logger.error('MongoDB connection error', error));

/**
 * Connects to MongoDB Atlas. Repeated calls reuse the in-flight connection so
 * the pool is created exactly once per process.
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(databaseConfig.uri, databaseConfig.options);

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};

/** Gracefully closes the connection during shutdown. */
export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.connection.close(false);
  connectionPromise = null;
  logger.info('MongoDB connection closed');
};

export type DatabaseStatus = 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown';

const STATE_MAP: Record<number, DatabaseStatus> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/** Current connection state, used by health checks. */
export const getDatabaseStatus = (): DatabaseStatus =>
  STATE_MAP[mongoose.connection.readyState] ?? 'unknown';

/** True when the driver can currently serve queries. */
export const isDatabaseHealthy = (): boolean => mongoose.connection.readyState === 1;
