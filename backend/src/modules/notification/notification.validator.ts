import { z } from 'zod';

export const NotificationRecipientSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userRole: z.string().min(1, 'User role is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

export const NotificationPayloadSchema = z.object({
  channel: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  htmlBody: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export const SendNotificationSchema = z.object({
  recipient: NotificationRecipientSchema,
  payload: NotificationPayloadSchema,
  createdBy: z.string().min(1, 'Created by is required'),
});

export const NotificationFilterSchema = z.object({
  recipientId: z.string().optional(),
  channel: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']).optional(),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isRead: z.boolean().optional(),
});
