import { FeeStructureRepository, StudentFeeAccountRepository, FeeInvoiceRepository } from './fees.repository';
import type { FeeStructure, StudentFeeAccount, FeeInvoice } from './fees.types';

export class FeeService {
  private feeStructureRepo = new FeeStructureRepository();
  private studentFeeAccountRepo = new StudentFeeAccountRepository();
  private feeInvoiceRepo = new FeeInvoiceRepository();

  async getFeeStructures(params?: Record<string, string | number | boolean | undefined>): Promise<FeeStructure[]> {
    const filter: Record<string, unknown> = { isActive: true, deletedAt: { $exists: false } };
    if (params?.courseId) filter.courseId = params.courseId;
    if (params?.departmentId) filter.departmentId = params.departmentId;
    if (params?.academicYear) filter.academicYear = params.academicYear;
    if (params?.semester) filter.semester = Number(params?.semester);
    const result = await this.feeStructureRepo.paginate(filter, Number(params?.page || 1), Number(params?.limit || 10), { academicYear: -1, semester: -1 });
    return result.items;
  }

  async getFeeStructureById(id: string): Promise<FeeStructure | null> {
    return this.feeStructureRepo.findById(id);
  }

  async createFeeStructure(data: Partial<FeeStructure>, createdBy: string): Promise<FeeStructure> {
    return this.feeStructureRepo.create({ ...data, createdBy, updatedBy: createdBy });
  }

  async updateFeeStructure(id: string, data: Partial<FeeStructure>, updatedBy: string): Promise<FeeStructure | null> {
    return this.feeStructureRepo.updateById(id, { ...data, updatedBy } as Partial<FeeStructure>);
  }

  async deleteFeeStructure(id: string, deletedBy: string): Promise<boolean> {
    return this.feeStructureRepo.softDelete(id, deletedBy);
  }

  async getStudentFeeAccount(studentId: string): Promise<StudentFeeAccount | null> {
    return this.studentFeeAccountRepo.findById(studentId);
  }

  async getStudentFeeAccounts(params?: Record<string, string | number | boolean | undefined>): Promise<StudentFeeAccount[]> {
    const filter: Record<string, unknown> = {};
    if (params?.courseId) filter.courseId = params.courseId;
    if (params?.academicYear) filter.academicYear = params.academicYear;
    if (params?.semester) filter.semester = Number(params?.semester);
    const result = await this.studentFeeAccountRepo.paginate(filter, Number(params?.page || 1), Number(params?.limit || 10));
    return result.items;
  }

  async createStudentFeeAccount(data: Partial<StudentFeeAccount>, createdBy: string): Promise<StudentFeeAccount> {
    return this.studentFeeAccountRepo.create({ ...data, createdBy, updatedBy: createdBy } as Partial<StudentFeeAccount>);
  }

  async updateStudentFeeAccount(id: string, data: Partial<StudentFeeAccount>, updatedBy: string): Promise<StudentFeeAccount | null> {
    return this.studentFeeAccountRepo.updateById(id, { ...data, updatedBy } as Partial<StudentFeeAccount>);
  }

  async generateInvoice(studentId: string, generatedBy: string): Promise<FeeInvoice> {
    const account = await this.studentFeeAccountRepo.findById(studentId);
    if (!account) throw new Error('Student fee account not found');
    const invoice = this.feeInvoiceRepo.create({
      invoiceId: `INV-${Date.now()}`,
      studentId: account.studentId,
      studentName: account.studentName,
      courseId: account.courseId,
      courseName: account.courseName,
      academicYear: account.academicYear,
      semester: account.semester,
      totalAmount: account.adjustedFee,
      paidAmount: account.paidAmount,
      pendingAmount: account.pendingAmount,
      dueDate: account.dueDate,
      status: account.status,
      items: [],
      generatedAt: new Date(),
      generatedBy,
      createdBy: generatedBy,
      updatedBy: generatedBy,
    } as Partial<FeeInvoice>);
    return invoice;
  }

  async getInvoices(studentId: string) {
    return this.feeInvoiceRepo.findByStudent(studentId);
  }

  async getPaymentHistory(studentId: string) {
    const account = await this.studentFeeAccountRepo.findById(studentId);
    return account?.payments || [];
  }
}

export const feeService = new FeeService();
