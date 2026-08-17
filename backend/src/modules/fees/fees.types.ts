export type FeeStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "WAIVED" | "CANCELLED";
export type FeeComponentType = "TUITION" | "ADMISSION" | "EXAM" | "LIBRARY" | "HOSTEL" | "TRANSPORT" | "SCHOLARSHIP" | "OTHER";
export type PaymentMode = "CASH" | "CARD" | "UPI" | "NET_BANKING" | "CHEQUE" | "OTHER";
export type PaymentProvider = "RAZORPAY" | "STRIPE" | "PAYU" | "MANUAL";

export interface FeeComponent {
  type: FeeComponentType;
  name: string;
  amount: number;
  mandatory: boolean;
  description?: string;
}

export interface FeeStructure {
  _id?: string;
  feeStructureId: string;
  courseId: string;
  courseName?: string;
  departmentId: string;
  academicYear: string;
  semester: number;
  components: FeeComponent[];
  totalAmount: number;
  dueDate: Date;
  lateFeeAmount: number;
  lateFeeGraceDays: number;
  scholarshipPercentage: number;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFeeAccount {
  _id?: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  departmentId: string;
  academicYear: string;
  semester: number;
  feeStructureId: string;
  totalFee: number;
  scholarshipAmount: number;
  adjustedFee: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  status: FeeStatus;
  dueDate: Date;
  lastPaymentDate?: Date;
  payments: FeePayment[];
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeePayment {
  paymentId: string;
  amount: number;
  paymentDate: Date;
  paymentMode: PaymentMode;
  provider?: PaymentProvider;
  providerTransactionId?: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";
  receiptUrl?: string;
  remarks?: string;
}

export interface FeeInvoice {
  invoiceId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  academicYear: string;
  semester: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: Date;
  status: FeeStatus;
  items: InvoiceItem[];
  generatedAt: Date;
  generatedBy: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
}
