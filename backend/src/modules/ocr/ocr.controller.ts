import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { ocrService } from './ocr.service';
import type { OCRProcessingRequest } from './ocr.types';

export class OCRController {
  public processDocument = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as OCRProcessingRequest;
    const result = await ocrService.processDocument(input);
    sendSuccess(res, { message: 'Document processed successfully', data: result });
  });

  public getProviderHealth = asyncHandler(async (_req: Request, res: Response) => {
    const health = await ocrService.getProviderHealth();
    sendSuccess(res, { message: 'Provider health retrieved', data: health });
  });

  public validateProviders = asyncHandler(async (_req: Request, res: Response) => {
    const isValid = await ocrService.validateProviders();
    sendSuccess(res, {
      message: isValid ? 'All providers are valid' : 'Some providers are not valid',
      data: { isValid },
      statusCode: isValid ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
    });
  });
}

export const ocrController = new OCRController();
