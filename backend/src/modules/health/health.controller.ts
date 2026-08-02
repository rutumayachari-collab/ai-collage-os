import type { Request, Response } from 'express';
import { appConfig } from '../../config/app.config';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { healthService, type HealthService } from './health.service';

/**
 * Thin HTTP layer over the health service; contains no business logic.
 */
export class HealthController {
  constructor(private readonly service: HealthService) {}

  /** GET /api/v1/health */
  public getHealth = asyncHandler(async (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'AICollegeOS Backend Running',
      timestamp: new Date().toISOString(),
      environment: appConfig.environment,
      data: this.service.getLiveness(),
    });
  });

  /** GET /api/v1/health/live */
  public getLiveness = asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, { message: 'Service is live', data: this.service.getLiveness() });
  });

  /** GET /api/v1/health/ready */
  public getReadiness = asyncHandler(async (_req: Request, res: Response) => {
    const report = this.service.getReadiness();

    sendSuccess(res, {
      message: report.status === 'ready' ? 'Service is ready' : 'Service is degraded',
      data: report,
      statusCode: report.status === 'ready' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
    });
  });
}

export const healthController = new HealthController(healthService);
