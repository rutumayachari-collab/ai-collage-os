export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'CHEQUE' | 'OTHER';

export type PaymentProvider = 'RAZORPAY' | 'STRIPE' | 'PAYU' | 'MANUAL';

export type ReceiptStatus = 'GENERATED' | 'SENT' | 'DOWNLOADED' | 'FAILED';

export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalRefunded: number;
  totalFailed: number;
  byMethod: Record<PaymentMethod, number>;
  byStatus: Record<PaymentStatus, number>;
}

export interface PaymentHistoryEntry {
  paymentId: string;
  applicantId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: PaymentProvider;
  providerTransactionId?: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface Payment {
  paymentId: string;
  applicantId: string;
  applicantName: string;
  courseId: string;
  courseName: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: PaymentProvider;
  providerTransactionId?: string;
  currency: string;
  description?: string;
  metadata?: Record<string, unknown>;
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentFilterInput {
  applicantId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  provider?: PaymentProvider;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface Receipt {
  receiptId: string;
  paymentId: string;
  applicantId: string;
  amount: number;
  currency: string;
  generatedAt: Date;
  sentAt?: Date;
  downloadedAt?: Date;
  status: ReceiptStatus;
  fileUrl?: string;
  template?: string;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  event: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  signature: string;
  rawPayload: Record<string, unknown>;
}
