import { Router } from 'express';
import { healthController } from './health.controller';

const router: Router = Router();

router.get('/', healthController.getHealth);
router.get('/live', healthController.getLiveness);
router.get('/ready', healthController.getReadiness);

export const healthRoutes: Router = router;
