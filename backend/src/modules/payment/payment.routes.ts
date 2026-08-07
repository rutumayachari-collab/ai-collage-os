import { Router } from 'express';
import { paymentController } from './payment.controller';

const router: Router = Router();

router.post('/', paymentController.createPayment);
router.get('/status/:provider', paymentController.getPaymentStatus);
router.post('/refund/:provider/:transactionId', paymentController.refundPayment);
router.post('/receipt/:paymentId', paymentController.generateReceipt);
router.get('/summary', paymentController.getPaymentSummary);
router.get('/', paymentController.listPayments);
router.post('/webhook', paymentController.handleWebhook);

export const paymentRoutes: Router = router;
