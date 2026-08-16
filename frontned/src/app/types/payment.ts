export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "REFUNDED" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "NET_BANKING" | "CHEQUE" | "OTHER";
export type PaymentProvider = "RAZORPAY" | "STRIPE" | "PAYU" | "MANUAL";

export interface Payment {
  paymentId: string;
  applicantId?: string;
  applicantName?: string;
  courseId?: string;
  courseName?: string;
  amount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  provider?: PaymentProvider;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentSummary {
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate?: string;
  paymentStatus: PaymentStatus;
}

export interface PaymentFilterInput {
  applicantId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  provider?: PaymentProvider;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}
