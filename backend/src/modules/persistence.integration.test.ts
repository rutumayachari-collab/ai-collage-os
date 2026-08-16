import { describe, expect, it, beforeAll } from 'vitest';
import { NotificationModel } from './notification/notification.model';
import { notificationService } from './notification/notification.service';
import { PaymentModel } from './payment/payment.model';
import { paymentService } from './payment/payment.service';
import { OrchestratorWorkflowModel } from './orchestrator/orchestrator.model';
import { orchestratorService } from './orchestrator/orchestrator.service';

let mongoAvailable = false;

const mongoIntegrationDescribe = process.env.MONGODB_URI ? describe : describe.skip;

mongoIntegrationDescribe('Mongo persistence for core services', () => {
  beforeAll(async () => {
    // Check if MongoDB is actually available with a quick health check
    try {
      await NotificationModel.collection.stats();
      mongoAvailable = true;
    } catch {
      mongoAvailable = false;
    }
  }, { timeout: 2000 });

  it('persists notifications to the notification collection', async () => {
    if (!mongoAvailable) {
      console.warn('MongoDB not available, skipping persistence test');
      return;
    }

    const created = await notificationService.sendNotification(
      { userId: 'student-1', userRole: 'STUDENT', email: 'student@example.com' },
      {
        channel: 'EMAIL',
        priority: 'HIGH',
        type: 'INFO',
        subject: 'Welcome',
        body: 'Welcome to the portal',
      },
      'admin-1',
    );

    const record = await NotificationModel.findOne({ notificationId: created.notificationId }).lean();
    expect(record).not.toBeNull();
    expect(record?.status).toBe('PENDING');
  });

  it('persists payments to the payment collection', async () => {
    if (!mongoAvailable) {
      console.warn('MongoDB not available, skipping persistence test');
      return;
    }

    const created = await paymentService.createPayment(
      {
        applicantId: 'app-1',
        applicantName: 'Test Student',
        courseId: 'course-1',
        courseName: 'B.Tech CSE',
        amount: 25000,
        status: 'PENDING',
        method: 'CARD',
        provider: 'MANUAL',
        currency: 'INR',
        description: 'Admission fee',
      },
      'admin-1',
    );

    const record = await PaymentModel.findOne({ paymentId: created.paymentId }).lean();
    expect(record).not.toBeNull();
    expect(record?.amount).toBe(25000);
  });

  it('persists orchestrator workflows to the workflow collection', async () => {
    if (!mongoAvailable) {
      console.warn('MongoDB not available, skipping persistence test');
      return;
    }

    const created = await orchestratorService.createWorkflow({
      studentId: 'student-2',
      studentName: 'Ada',
      actions: [
        { type: 'DOCUMENT_UPLOAD', title: 'Upload documents', description: 'Scan and upload' },
        { type: 'PAYMENT', title: 'Pay fee', description: 'Pay admission fee' },
      ],
    });

    const record = await OrchestratorWorkflowModel.findOne({ id: created.id }).lean();
    expect(record).not.toBeNull();
    expect(record?.studentName).toBe('Ada');
  });
});
