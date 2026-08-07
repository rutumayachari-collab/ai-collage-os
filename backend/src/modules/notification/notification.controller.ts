import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { NotFoundError } from '../../shared/utils/api-error.util';
import { notificationService } from './notification.service';
import type { NotificationRecipient, NotificationPayload, NotificationFilterInput } from './notification.types';

export class NotificationController {
  public sendNotification = asyncHandler(async (req: Request, res: Response) => {
    const { recipient, payload, createdBy } = req.body as { recipient: NotificationRecipient; payload: NotificationPayload; createdBy: string };
    const result = await notificationService.sendNotification(recipient, payload, createdBy);
    sendSuccess(res, { message: 'Notification sent', data: result });
  });

  public getNotification = asyncHandler(async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const result = await notificationService.getNotification(notificationId);
    if (!result) {
      throw new NotFoundError('Notification not found');
    }
    sendSuccess(res, { message: 'Notification retrieved', data: result });
  });

  public listNotifications = asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query as unknown as NotificationFilterInput;
    const result = await notificationService.listNotifications(filter);
    sendSuccess(res, { message: 'Notifications retrieved', data: result.items, meta: { total: result.total, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPreviousPage: false } });
  });

  public markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const result = await notificationService.markAsRead(notificationId);
    sendSuccess(res, { message: 'Notification marked as read', data: result });
  });

  public markAsDelivered = asyncHandler(async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const result = await notificationService.markAsDelivered(notificationId);
    sendSuccess(res, { message: 'Notification marked as delivered', data: result });
  });

  public markAsFailed = asyncHandler(async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const { reason } = req.body as { reason: string };
    const result = await notificationService.markAsFailed(notificationId, reason);
    sendSuccess(res, { message: 'Notification marked as failed', data: result });
  });

  public getStats = asyncHandler(async (req: Request, res: Response) => {
    const { recipientId } = req.query;
    const result = await notificationService.getStats(recipientId as string | undefined);
    sendSuccess(res, { message: 'Notification stats retrieved', data: result });
  });
}

export const notificationController = new NotificationController();
