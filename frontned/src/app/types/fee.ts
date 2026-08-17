export type FeeStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "WAIVED" | "CANCELLED";
export type FeeComponentType =
  "TUITION" | "ADMISSION" | "EXAM" | "LIBRARY" | "HOSTEL" | "TRANSPORT" | "SCHOLARSHIP" | "OTHER";
export type PaymentMode = "CASH" | "CARD" | "UPI" | "NET_BANKING" | "CHEQUE" | "OTHER";

export interface FeeComponent {
  type: FeeComponentType;
  name: string;
  amount: number;
  mandatory: boolean;
  description?: string;
}

export interface FeeStructure {
  id: string;
  feeStructureId: string;
  courseId: string;
  courseName?: string;
  departmentId: string;
  academicYear: string;
  semester: number;
  components: FeeComponent[];
  totalAmount: number;
  dueDate: string;
  lateFeeAmount: number;
  lateFeeGraceDays: number;
  scholarshipPercentage: number;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFeeAccount {
  id: string;
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
  dueDate: string;
  lastPaymentDate?: string;
  payments: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

export interface FeeInvoice {
  id: string;
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
  dueDate: string;
  status: FeeStatus;
  items: Array<{
    description: string;
    amount: number;
    paidAmount: number;
    pendingAmount: number;
  }>;
  generatedAt: string;
}
