import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { Payment, PaymentStatus, WebhookPayload } from './payment.types';

export interface PaymentProviderInterface {
  readonly provider: string;
  readonly isEnabled: boolean;

  createPayment(payment: Partial<Payment>): Promise<Payment>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
  refundPayment(transactionId: string, amount: number, reason: string): Promise<Payment>;
  generateReceipt(paymentId: string): Promise<Payment>;
  validateConfiguration(): Promise<boolean>;
  handleWebhook(payload: WebhookPayload): Promise<Payment>;
}

export interface PaymentGatewayConfig {
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  endpoint?: string;
}

export type PaymentSchemaType = Payment;
export type PaymentDocument = HydratedDocument<PaymentSchemaType>;

const paymentSchema = new Schema<PaymentSchemaType>(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    applicantId: { type: String, required: true, index: true },
    applicantName: { type: String, required: true, trim: true },
    courseId: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    method: { type: String, required: true, enum: ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'OTHER'] },
    provider: { type: String, required: true, enum: ['RAZORPAY', 'STRIPE', 'PAYU', 'MANUAL'] },
    providerTransactionId: { type: String, trim: true },
    currency: { type: String, required: true, default: 'INR', trim: true },
    description: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    paidAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
    createdBy: { type: String, required: true, trim: true },
    updatedBy: { type: String, required: true, trim: true },
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

paymentSchema.index({ applicantId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ provider: 1, providerTransactionId: 1 }, { sparse: true, unique: false });

export const PaymentModel: Model<PaymentSchemaType> = model<PaymentSchemaType>('Payment', paymentSchema);
