import { BadRequestError } from '../../shared/utils/api-error.util';
import type { PaymentProviderInterface } from './payment.model';
import type { Payment, PaymentStatus, PaymentFilterInput, WebhookPayload } from './payment.types';

const providerRegistry: Record<string, PaymentProviderInterface> = {};

export class PaymentService {
  private providers: PaymentProviderInterface[] = [];

  registerProvider(provider: PaymentProviderInterface): void {
    providerRegistry[provider.provider] = provider;
    this.providers.push(provider);
  }

  async createPayment(payment: Partial<Payment>, createdBy: string): Promise<Payment> {
    const provider = providerRegistry[payment.provider || 'MANUAL'];
    if (!provider) {
      throw new BadRequestError(`Payment provider ${payment.provider} is not configured`);
    }

    const created = await provider.createPayment({ ...payment, createdBy, updatedBy: createdBy });
    return created;
  }

  async getPaymentStatus(provider: string, transactionId: string): Promise<PaymentStatus> {
    const paymentProvider = providerRegistry[provider];
    if (!paymentProvider) {
      throw new BadRequestError(`Payment provider ${provider} is not configured`);
    }

    return paymentProvider.getPaymentStatus(transactionId);
  }

  async refundPayment(provider: string, transactionId: string, amount: number, reason: string): Promise<Payment> {
    const paymentProvider = providerRegistry[provider];
    if (!paymentProvider) {
      throw new BadRequestError(`Payment provider ${provider} is not configured`);
    }

    return paymentProvider.refundPayment(transactionId, amount, reason);
  }

  async generateReceipt(paymentId: string): Promise<Payment> {
    const provider = providerRegistry['MANUAL'];
    if (!provider) {
      throw new BadRequestError('Payment provider is not configured');
    }

    return provider.generateReceipt(paymentId);
  }

  async getPaymentSummary() {
    return {
      totalCollected: 0,
      totalPending: 0,
      totalRefunded: 0,
      totalFailed: 0,
      byMethod: {
        CASH: 0,
        CARD: 0,
        UPI: 0,
        NET_BANKING: 0,
        CHEQUE: 0,
        OTHER: 0,
      },
      byStatus: {
        PENDING: 0,
        COMPLETED: 0,
        FAILED: 0,
        REFUNDED: 0,
        CANCELLED: 0,
      },
    };
  }

  async listPayments(_filter: PaymentFilterInput): Promise<{ items: Payment[]; total: number }> {
    const items: Payment[] = [];
    return { items, total: 0 };
  }

  async handleWebhook(payload: WebhookPayload): Promise<Payment> {
    const provider = providerRegistry[payload.provider];
    if (!provider) {
      throw new BadRequestError(`Payment provider ${payload.provider} is not configured`);
    }

    return provider.handleWebhook(payload);
  }
}

export const paymentService = new PaymentService();
