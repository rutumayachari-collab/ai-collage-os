import { z } from 'zod';

export const PaymentSchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  applicantName: z.string().min(1, 'Applicant name is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  courseName: z.string().min(1, 'Course name is required'),
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).default('PENDING'),
  method: z.enum(['CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'OTHER']),
  provider: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'MANUAL']),
  providerTransactionId: z.string().optional(),
  currency: z.string().default('INR'),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  paidAt: z.string().optional(),
  failedAt: z.string().optional(),
  refundedAt: z.string().optional(),
  createdBy: z.string().min(1, 'Created by is required'),
  updatedBy: z.string().min(1, 'Updated by is required'),
});

export const PaymentFilterSchema = z.object({
  applicantId: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  method: z.enum(['CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'OTHER']).optional(),
  provider: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'MANUAL']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
});

export const WebhookSchema = z.object({
  provider: z.enum(['RAZORPAY', 'STRIPE', 'PAYU', 'MANUAL']),
  event: z.string().min(1, 'Event is required'),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']),
  signature: z.string().min(1, 'Signature is required'),
  rawPayload: z.record(z.unknown()),
});
