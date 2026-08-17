import { Schema, model, type HydratedDocument } from 'mongoose';
import type { FeeStructure, StudentFeeAccount, FeeInvoice } from './fees.types';

export type FeeStructureSchemaType = FeeStructure;
export type StudentFeeAccountSchemaType = StudentFeeAccount;
export type FeeInvoiceSchemaType = FeeInvoice;

export type FeeStructureDocument = HydratedDocument<FeeStructureSchemaType>;
export type StudentFeeAccountDocument = HydratedDocument<StudentFeeAccountSchemaType>;
export type FeeInvoiceDocument = HydratedDocument<FeeInvoiceSchemaType>;

const feeStructureSchema = new Schema<FeeStructureSchemaType>({
  feeStructureId: { type: String, required: true, unique: true, index: true },
  courseId: { type: String, required: true, index: true },
  courseName: { type: String, required: true, trim: true, maxlength: 100 },
  departmentId: { type: String, required: true, index: true },
  academicYear: { type: String, required: true, trim: true, index: true },
  semester: { type: Number, required: true, min: 1, max: 12, index: true },
  components: [
    {
      type: { type: String, required: true, enum: ['TUITION', 'ADMISSION', 'EXAM', 'LIBRARY', 'HOSTEL', 'TRANSPORT', 'SCHOLARSHIP', 'OTHER'] },
      name: { type: String, required: true, trim: true, maxlength: 100 },
      amount: { type: Number, required: true, min: 0 },
      mandatory: { type: Boolean, default: true },
      description: { type: String, trim: true, maxlength: 500 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true, index: true },
  lateFeeAmount: { type: Number, required: true, min: 0, default: 0 },
  lateFeeGraceDays: { type: Number, required: true, min: 0, default: 0 },
  scholarshipPercentage: { type: Number, required: true, min: 0, max: 100, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: String, required: true, trim: true },
  updatedBy: { type: String, required: true, trim: true },
  deletedBy: { type: String, trim: true },
  deletedAt: { type: Date, index: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

const studentFeeAccountSchema = new Schema<StudentFeeAccountSchemaType>({
  studentId: { type: String, required: true, unique: true, index: true },
  studentName: { type: String, required: true, trim: true, maxlength: 100 },
  courseId: { type: String, required: true, index: true },
  courseName: { type: String, required: true, trim: true, maxlength: 100 },
  departmentId: { type: String, required: true, index: true },
  academicYear: { type: String, required: true, trim: true, index: true },
  semester: { type: Number, required: true, min: 1, max: 12, index: true },
  feeStructureId: { type: String, required: true, index: true },
  totalFee: { type: Number, required: true, min: 0 },
  scholarshipAmount: { type: Number, required: true, min: 0, default: 0 },
  adjustedFee: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: true, min: 0, default: 0 },
  pendingAmount: { type: Number, required: true, min: 0 },
  overdueAmount: { type: Number, required: true, min: 0, default: 0 },
  status: { type: String, required: true, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED'], default: 'PENDING', index: true },
  dueDate: { type: Date, required: true, index: true },
  lastPaymentDate: { type: Date },
  payments: [
    {
      paymentId: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      paymentDate: { type: Date, required: true },
      paymentMode: { type: String, required: true, enum: ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'OTHER'] },
      provider: { type: String, enum: ['RAZORPAY', 'STRIPE', 'PAYU', 'MANUAL'] },
      providerTransactionId: { type: String, trim: true },
      status: { type: String, required: true, enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'], default: 'PENDING' },
      receiptUrl: { type: String, trim: true },
      remarks: { type: String, trim: true, maxlength: 500 },
    },
  ],
  createdBy: { type: String, required: true, trim: true },
  updatedBy: { type: String, required: true, trim: true },
  deletedBy: { type: String, trim: true },
  deletedAt: { type: Date, index: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

const feeInvoiceSchema = new Schema<FeeInvoiceSchemaType>({
  invoiceId: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true, trim: true, maxlength: 100 },
  courseId: { type: String, required: true, index: true },
  courseName: { type: String, required: true, trim: true, maxlength: 100 },
  academicYear: { type: String, required: true, trim: true, index: true },
  semester: { type: Number, required: true, min: 1, max: 12, index: true },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: true, min: 0, default: 0 },
  pendingAmount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  status: { type: String, required: true, enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED'], default: 'PENDING', index: true },
  items: [
    {
      description: { type: String, required: true, trim: true },
      amount: { type: Number, required: true, min: 0 },
      paidAmount: { type: Number, required: true, min: 0, default: 0 },
      pendingAmount: { type: Number, required: true, min: 0 },
    },
  ],
  generatedAt: { type: Date, required: true, default: Date.now },
  generatedBy: { type: String, required: true, trim: true },
  createdBy: { type: String, required: true, trim: true },
  updatedBy: { type: String, required: true, trim: true },
  deletedBy: { type: String, trim: true },
  deletedAt: { type: Date, index: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

export const FeeStructureModel = model<FeeStructureSchemaType>('FeeStructure', feeStructureSchema);
export const StudentFeeAccountModel = model<StudentFeeAccountSchemaType>('StudentFeeAccount', studentFeeAccountSchema);
export const FeeInvoiceModel = model<FeeInvoiceSchemaType>('FeeInvoice', feeInvoiceSchema);
