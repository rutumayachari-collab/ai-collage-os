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
