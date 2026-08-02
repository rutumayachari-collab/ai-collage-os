import cors, { type CorsOptions } from 'cors';
import type { RequestHandler } from 'express';
import { appConfig } from '../config/app.config';
import { isProduction } from '../config/env.config';

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients (mobile apps, curl, server-to-server) send no origin.
    if (!origin || !isProduction || appConfig.clientUrls.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86_400,
};

/** Configured CORS middleware for the API. */
export const corsMiddleware: RequestHandler = cors(corsOptions);
