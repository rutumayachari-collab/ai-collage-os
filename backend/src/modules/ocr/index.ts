import type { FeatureModule } from '../../shared/types';
import { ocrRoutes } from './ocr.routes';

export const ocrModule: FeatureModule = {
  name: 'OCR',
  basePath: 'ocr',
  router: ocrRoutes,
  enabled: true,
};

export * from './ocr.types';
export * from './ocr.service';
export * from './ocr.controller';
export * from './ocr.validator';
