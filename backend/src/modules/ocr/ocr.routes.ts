import { Router } from 'express';
import { ocrController } from './ocr.controller';

const router: Router = Router();

router.post('/process', ocrController.processDocument);
router.get('/health', ocrController.getProviderHealth);
router.get('/validate', ocrController.validateProviders);

export const ocrRoutes: Router = router;
