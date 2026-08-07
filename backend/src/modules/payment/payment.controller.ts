import type { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { paymentService } from './payment.service';
import type { Payment, PaymentFilterInput, WebhookPayload } from './payment.types';

export class PaymentController {
  public createPayment = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as Partial<Payment>;
    const createdBy = req.body.createdBy as string;
    const result = await paymentService.createPayment(input, createdBy);
    sendSuccess(res, { message: 'Payment created', data: result });
  });

  public getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { transactionId } = req.query;
    const result = await paymentService.getPaymentStatus(provider as string, transactionId as string);
    sendSuccess(res, { message: 'Payment status retrieved', data: { status: result } });
  });

  public refundPayment = asyncHandler(async (req: Request, res: Response) => {
    const { provider, transactionId } = req.params;
    const { amount, reason } = req.body as { amount: number; reason: string };
    const result = await paymentService.refundPayment(provider as string, transactionId as string, amount, reason);
    sendSuccess(res, { message: 'Payment refunded', data: result });
  });

  public generateReceipt = asyncHandler(async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const result = await paymentService.generateReceipt(paymentId);
    sendSuccess(res, { message: 'Receipt generated', data: result });
  });

  public getPaymentSummary = asyncHandler(async (_req: Request, res: Response) => {
    const result = await paymentService.getPaymentSummary();
    sendSuccess(res, { message: 'Payment summary retrieved', data: result });
  });

  public listPayments = asyncHandler(async (req: Request, res: Response) => {
    const filter = req.query as unknown as PaymentFilterInput;
    const result = await paymentService.listPayments(filter);
    sendSuccess(res, { message: 'Payments retrieved', data: result.items, meta: { total: result.total, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPreviousPage: false } });
  });

  public handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as WebhookPayload;
    const result = await paymentService.handleWebhook(payload);
    sendSuccess(res, { message: 'Webhook processed', data: result });
  });
}

export const paymentController = new PaymentController();
