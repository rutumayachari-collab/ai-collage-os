import { appConfig } from '../../config/app.config';
import { getDatabaseStatus, isDatabaseHealthy, type DatabaseStatus } from '../../database/connection';

export interface HealthReport {
  service: string;
  status: 'ok';
  environment: string;
  uptimeSeconds: number;
}

export interface ReadinessReport {
  service: string;
  status: 'ready' | 'degraded';
  environment: string;
  dependencies: {
    database: DatabaseStatus;
  };
}

/**
 * Liveness/readiness data collection. Kept free of Express types so it can be
 * reused by schedulers, CLI diagnostics, or future gRPC transports.
 */
export class HealthService {
  public getLiveness(): HealthReport {
    return {
      service: appConfig.name,
      status: 'ok',
      environment: appConfig.environment,
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  public getReadiness(): ReadinessReport {
    return {
      service: appConfig.name,
      status: isDatabaseHealthy() ? 'ready' : 'degraded',
      environment: appConfig.environment,
      dependencies: {
        database: getDatabaseStatus(),
      },
    };
  }
}

export const healthService = new HealthService();
