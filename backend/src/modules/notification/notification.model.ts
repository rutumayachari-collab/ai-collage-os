import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type {
  Notification,
  NotificationHistory,
  NotificationPayload,
  NotificationRecipient,
} from './notification.types';

export type {
  NotificationChannel,
  NotificationPayload,
  NotificationRecipient,
  NotificationStatus,
  NotificationPriority,
  NotificationStats,
} from './notification.types';

export interface NotificationProviderInterface {
  readonly channel: string;
  readonly isEnabled: boolean;

  send(
    recipient: {
      userId: string;
      userRole: string;
      email?: string;
      phone?: string;
      whatsappNumber?: string;
    },
    payload: {
      channel: string;
      priority: string;
      type: string;
      subject: string;
      body: string;
      htmlBody?: string;
      data?: Record<string, unknown>;
    },
  ): Promise<{ status: string; messageId?: string; error?: string }>;
  validateConfiguration(): Promise<boolean>;
}

export interface NotificationTemplate {
  subject: string;
  body: string;
  htmlBody?: string;
}

export type NotificationTemplateMap = Record<string, NotificationTemplate>;

export type NotificationSchemaType = Notification;
export type NotificationDocument = HydratedDocument<NotificationSchemaType>;

const notificationRecipientSchema = new Schema<NotificationRecipient>(
  {
    userId: { type: String, required: true, trim: true },
    userRole: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
  },
  { _id: false },
);

const notificationPayloadSchema = new Schema<NotificationPayload>(
  {
    channel: { type: String, required: true, enum: ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'] },
    priority: { type: String, required: true, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
    type: { type: String, required: true, enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'] },
    subject: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    htmlBody: { type: String, trim: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const notificationSchema = new Schema<NotificationSchemaType>(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    recipient: { type: notificationRecipientSchema, required: true },
    payload: { type: notificationPayloadSchema, required: true },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    readAt: { type: Date },
    deliveredAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String, trim: true },
    retryCount: { type: Number, required: true, default: 0 },
    maxRetries: { type: Number, required: true, default: 3 },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    createdBy: { type: String, required: true, trim: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

notificationSchema.index({ 'recipient.userId': 1, createdAt: -1 });
notificationSchema.index({ 'payload.channel': 1, status: 1 });
notificationSchema.index({ 'payload.priority': 1 });

const notificationHistorySchema = new Schema<NotificationHistory>(
  {
    historyId: { type: String, required: true, unique: true, index: true },
    notificationId: { type: String, required: true, index: true },
    channel: { type: String, required: true, enum: ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'] },
    status: { type: String, required: true, enum: ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'] },
    recipient: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    sentAt: { type: Date, required: true, default: Date.now },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    failureReason: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

export const NotificationModel: Model<NotificationSchemaType> = model<NotificationSchemaType>('Notification', notificationSchema);
export const NotificationHistoryModel: Model<NotificationHistory> = model<NotificationHistory>('NotificationHistory', notificationHistorySchema);
