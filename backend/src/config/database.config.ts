import { env } from './env.config';

/**
 * Mongoose connection options tuned for MongoDB Atlas in a serverful deployment.
 */
export const databaseConfig = {
  uri: env.MONGODB_URI,
  options: {
    autoIndex: env.NODE_ENV !== 'production',
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  },
} as const;
