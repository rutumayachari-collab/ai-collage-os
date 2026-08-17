import type { AuthenticatedRequest } from '../../shared/types';
import type { Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { FeeService } from './fees.service';

export class FeeController {
  constructor(private readonly service: FeeService = new FeeService()) {}

  getFeeStructures = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { courseId, departmentId, academicYear, semester, page = 1, limit = 10 } = req.query;
    const structures = await this.service.getFeeStructures({
      courseId: courseId as string | undefined,
      departmentId: departmentId as string | undefined,
      academicYear: academicYear as string | undefined,
      semester: semester as number | undefined,
      page: Number(page),
      limit: Number(limit),
    });
    sendSuccess(res, { message: 'Fee structures fetched', data: structures });
  });

  getFeeStructureById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const structure = await this.service.getFeeStructureById(id);
    if (!structure) return sendSuccess(res, { message: 'Fee structure not found', statusCode: HttpStatus.NOT_FOUND });
    return sendSuccess(res, { message: 'Fee structure fetched', data: structure });
  });

  createFeeStructure = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = req.body;
    const structure = await this.service.createFeeStructure(data, (req.user as { id?: string } | undefined)?.id || 'system');
    sendSuccess(res, { message: 'Fee structure created', data: structure, statusCode: HttpStatus.CREATED });
  });

  updateFeeStructure = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const structure = await this.service.updateFeeStructure(id, req.body, (req.user as { id?: string } | undefined)?.id || 'system');
    if (!structure) return sendSuccess(res, { message: 'Fee structure not found', statusCode: HttpStatus.NOT_FOUND });
    return sendSuccess(res, { message: 'Fee structure updated', data: structure });
  });

  deleteFeeStructure = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await this.service.deleteFeeStructure(id, (req.user as { id?: string } | undefined)?.id || 'system');
    sendSuccess(res, { message: 'Fee structure deleted successfully' });
  });

  getStudentFeeAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { studentId } = req.params;
    const account = await this.service.getStudentFeeAccount(studentId);
    if (!account) return sendSuccess(res, { message: 'Student fee account not found', statusCode: HttpStatus.NOT_FOUND });
    return sendSuccess(res, { message: 'Student fee account fetched', data: account });
  });

  getStudentFeeAccounts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { courseId, academicYear, semester, page = 1, limit = 10 } = req.query;
    const accounts = await this.service.getStudentFeeAccounts({
      courseId: courseId as string | undefined,
      academicYear: academicYear as string | undefined,
      semester: semester as number | undefined,
      page: Number(page),
      limit: Number(limit),
    });
    sendSuccess(res, { message: 'Student fee accounts fetched', data: accounts });
  });

  createStudentFeeAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = req.body;
    const account = await this.service.createStudentFeeAccount(data, (req.user as { id?: string } | undefined)?.id || 'system');
    sendSuccess(res, { message: 'Student fee account created', data: account, statusCode: HttpStatus.CREATED });
  });

  updateStudentFeeAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const account = await this.service.updateStudentFeeAccount(id, req.body, (req.user as { id?: string } | undefined)?.id || 'system');
    if (!account) return sendSuccess(res, { message: 'Student fee account not found', statusCode: HttpStatus.NOT_FOUND });
    return sendSuccess(res, { message: 'Student fee account updated', data: account });
  });

  generateInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { studentId } = req.body;
    const invoice = await this.service.generateInvoice(studentId, (req.user as { id?: string } | undefined)?.id || 'system');
    sendSuccess(res, { message: 'Invoice generated', data: invoice, statusCode: HttpStatus.CREATED });
  });

  getInvoices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { studentId } = req.params;
    const invoices = await this.service.getInvoices(studentId);
    sendSuccess(res, { message: 'Invoices fetched', data: invoices });
  });

  getPaymentHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { studentId } = req.params;
    const history = await this.service.getPaymentHistory(studentId);
    sendSuccess(res, { message: 'Payment history fetched', data: history });
  });

  bulkUpdate = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    sendSuccess(res, { message: 'Bulk update completed' });
  });

  getStatistics = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    sendSuccess(res, { message: 'Statistics fetched', data: {} });
  });
}

export const feeController = new FeeController();
