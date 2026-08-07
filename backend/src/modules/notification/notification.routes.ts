import { Router } from 'express';
import { notificationController } from './notification.controller';

const router: Router = Router();

router.post('/send', notificationController.sendNotification);
router.get('/:notificationId', notificationController.getNotification);
router.get('/', notificationController.listNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.patch('/:notificationId/delivered', notificationController.markAsDelivered);
router.patch('/:notificationId/failed', notificationController.markAsFailed);
router.get('/stats/summary', notificationController.getStats);

export const notificationRoutes: Router = router;
