import { BadRequestError, NotFoundError } from '../../shared/utils/api-error.util';
import { PaymentModel, type PaymentProviderInterface } from './payment.model';
import type { Payment, PaymentStatus, PaymentFilterInput, WebhookPayload } from './payment.types';

const providerRegistry: Record<string, PaymentProviderInterface> = {};

const createManualProvider = (): PaymentProviderInterface => ({
  provider: 'MANUAL',
  isEnabled: true,
  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    const paymentId = payment.paymentId ?? `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const created = await PaymentModel.create({
      ...payment,
      paymentId,
      status: payment.status ?? 'PENDING',
      method: payment.method ?? 'CASH',
      provider: payment.provider ?? 'MANUAL',
      currency: payment.currency ?? 'INR',
      createdBy: payment.createdBy ?? 'system',
      updatedBy: payment.updatedBy ?? payment.createdBy ?? 'system',
      createdAt: payment.createdAt ?? new Date(),
      updatedAt: payment.updatedAt ?? new Date(),
    });
    return created.toObject() as Payment;
  },
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const payment = await PaymentModel.findOne({ providerTransactionId: transactionId }).lean<Payment | null>();
    return payment?.status ?? 'PENDING';
  },
  async refundPayment(transactionId: string, amount: number, reason: string): Promise<Payment> {
    const payment = await PaymentModel.findOne({ providerTransactionId: transactionId }).lean<Payment | null>();
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const updated = await PaymentModel.findOneAndUpdate(
      { providerTransactionId: transactionId },
      {
        $set: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            ...(payment.metadata ?? {}),
            refundReason: reason,
            refundAmount: amount,
          },
        },
      },
      { new: true, runValidators: true },
    ).lean<Payment | null>();

    if (!updated) {
      throw new NotFoundError('Payment not found');
    }

    return updated as Payment;
  },
  async generateReceipt(paymentId: string): Promise<Payment> {
    const payment = await PaymentModel.findOne({ paymentId }).lean<Payment | null>();
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }
    return payment as Payment;
  },
  async validateConfiguration(): Promise<boolean> {
    return true;
  },
  async handleWebhook(payload: WebhookPayload): Promise<Payment> {
    const updated = await PaymentModel.findOneAndUpdate(
      { providerTransactionId: payload.transactionId },
      {
        $set: {
          status: payload.status,
          provider: payload.provider,
          amount: payload.amount,
          currency: payload.currency,
          paidAt: payload.status === 'COMPLETED' ? new Date() : undefined,
          failedAt: payload.status === 'FAILED' ? new Date() : undefined,
          updatedAt: new Date(),
          metadata: payload.rawPayload,
        },
      },
      { new: true, runValidators: true, upsert: true },
    ).lean<Payment | null>();

    if (!updated) {
      throw new NotFoundError('Payment not found');
    }

    return updated as Payment;
  },
});

export class PaymentService {
  private providers: PaymentProviderInterface[] = [];

  constructor() {
    this.registerProvider(createManualProvider());
  }

  registerProvider(provider: PaymentProviderInterface): void {
    providerRegistry[provider.provider] = provider;
    this.providers.push(provider);
  }

  async createPayment(payment: Partial<Payment>, createdBy: string): Promise<Payment> {
    const provider = providerRegistry[(payment.provider ?? 'MANUAL').toUpperCase()];
    if (!provider) {
      throw new BadRequestError(`Payment provider ${payment.provider} is not configured`);
    }

    return provider.createPayment({
      ...payment,
      provider: (payment.provider ?? 'MANUAL').toUpperCase() as Payment['provider'],
      createdBy: createdBy || payment.createdBy || 'system',
      updatedBy: createdBy || payment.updatedBy || payment.createdBy || 'system',
      createdAt: payment.createdAt ?? new Date(),
      updatedAt: payment.updatedAt ?? new Date(),
    });
  }

  async getPaymentStatus(provider: string, transactionId: string): Promise<PaymentStatus> {
    const paymentProvider = providerRegistry[provider.toUpperCase()];
    if (!paymentProvider) {
      throw new BadRequestError(`Payment provider ${provider} is not configured`);
    }

    return paymentProvider.getPaymentStatus(transactionId);
  }

  async refundPayment(provider: string, transactionId: string, amount: number, reason: string): Promise<Payment> {
    const paymentProvider = providerRegistry[provider.toUpperCase()];
    if (!paymentProvider) {
      throw new BadRequestError(`Payment provider ${provider} is not configured`);
    }

    return paymentProvider.refundPayment(transactionId, amount, reason);
  }

  async generateReceipt(paymentId: string): Promise<Payment> {
    const provider = providerRegistry.MANUAL;
    if (!provider) {
      throw new BadRequestError('Payment provider is not configured');
    }

    return provider.generateReceipt(paymentId);
  }

  async getPaymentSummary() {
    const [totals] = await PaymentModel.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$amount', 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$amount', 0] } },
          totalRefunded: { $sum: { $cond: [{ $eq: ['$status', 'REFUNDED'] }, '$amount', 0] } },
          totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, '$amount', 0] } },
        },
      },
    ]);

    const statuses = await PaymentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const methods = await PaymentModel.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } },
    ]);

    const baseSummary = {
      totalCollected: totals?.totalCollected ?? 0,
      totalPending: totals?.totalPending ?? 0,
      totalRefunded: totals?.totalRefunded ?? 0,
      totalFailed: totals?.totalFailed ?? 0,
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

    for (const entry of statuses) {
      const status = entry._id as Payment['status'];
      baseSummary.byStatus[status] = entry.count;
    }

    for (const entry of methods) {
      const method = entry._id as Payment['method'];
      baseSummary.byMethod[method] = entry.count;
    }

    return baseSummary;
  }

  async listPayments(filter: PaymentFilterInput): Promise<{ items: Payment[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter.applicantId) query.applicantId = filter.applicantId;
    if (filter.status) query.status = filter.status;
    if (filter.method) query.method = filter.method;
    if (filter.provider) query.provider = filter.provider;
    if (filter.minAmount !== undefined || filter.maxAmount !== undefined) {
      query.amount = {} as Record<string, number>;
      if (filter.minAmount !== undefined) {
        (query.amount as Record<string, number>).$gte = filter.minAmount;
      }
      if (filter.maxAmount !== undefined) {
        (query.amount as Record<string, number>).$lte = filter.maxAmount;
      }
    }
    if (filter.startDate || filter.endDate) {
      query.createdAt = {} as Record<string, Date>;
      if (filter.startDate) {
        (query.createdAt as Record<string, Date>).$gte = filter.startDate;
      }
      if (filter.endDate) {
        (query.createdAt as Record<string, Date>).$lte = filter.endDate;
      }
    }

    const [items, total] = await Promise.all([
      PaymentModel.find(query).sort({ createdAt: -1 }).lean<Payment[]>(),
      PaymentModel.countDocuments(query),
    ]);

    return { items, total };
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
