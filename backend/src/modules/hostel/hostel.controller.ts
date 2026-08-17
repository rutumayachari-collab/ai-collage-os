import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import { hostelService } from './hostel.service';
import {
  createHostelSchema,
  updateHostelSchema,
  hostelQuerySchema,
  createRoomSchema,
  updateRoomSchema,
  roomQuerySchema,
  createAllocationSchema,
  updateAllocationSchema,
  allocationQuerySchema,
  checkInSchema,
  checkOutSchema,
  createFeeSchema,
  updateFeeSchema,
  feeQuerySchema,
  type CreateHostelInput,
  type UpdateHostelInput,
  type HostelQueryInput,
  type CreateRoomInput,
  type UpdateRoomInput,
  type RoomQueryInput,
  type CreateAllocationInput,
  type UpdateAllocationInput,
  type AllocationQueryInput,
  type CheckInInput,
  type CheckOutInput,
  type CreateFeeInput,
  type UpdateFeeInput,
  type FeeQueryInput,
} from './hostel.validator';

export class HostelController {
  constructor(private readonly service: typeof hostelService) {}

  // ─── HOSTEL CRUD ────────────────────────────────────────────────────────────

  public createHostel = asyncHandler(async (req: Request, res: Response) => {
    const input = createHostelSchema.parse(req.body) as CreateHostelInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const hostel = await this.service.createHostel(input, user.id);
    sendSuccess(res, {
      message: 'Hostel created successfully',
      data: hostel,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateHostel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateHostelSchema.parse(req.body) as UpdateHostelInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const hostel = await this.service.updateHostel(id, input, user.id);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }
    sendSuccess(res, { message: 'Hostel updated successfully', data: hostel });
  });

  public getHostel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const hostel = await this.service.getHostel(id);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }
    sendSuccess(res, { message: 'Hostel fetched successfully', data: hostel });
  });

  public listHostels = asyncHandler(async (req: Request, res: Response) => {
    const query = hostelQuerySchema.parse(req.query) as HostelQueryInput;
    const { items, total } = await this.service.listHostels(query);
    sendSuccess(res, {
      message: 'Hostels fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public deleteHostel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteHostel(id, user.id);
    sendSuccess(res, { message: 'Hostel deleted successfully' });
  });

  public restoreHostel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const hostel = await this.service.restoreHostel(id);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }
    sendSuccess(res, { message: 'Hostel restored successfully', data: hostel });
  });

  // ─── ROOM CRUD ─────────────────────────────────────────────────────────────

  public createRoom = asyncHandler(async (req: Request, res: Response) => {
    const input = createRoomSchema.parse(req.body) as CreateRoomInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const room = await this.service.createRoom(input, user.id);
    sendSuccess(res, {
      message: 'Room created successfully',
      data: room,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateRoom = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateRoomSchema.parse(req.body) as UpdateRoomInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const room = await this.service.updateRoom(id, input, user.id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }
    sendSuccess(res, { message: 'Room updated successfully', data: room });
  });

  public getRoom = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const room = await this.service.getRoom(id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }
    sendSuccess(res, { message: 'Room fetched successfully', data: room });
  });

  public listRooms = asyncHandler(async (req: Request, res: Response) => {
    const query = roomQuerySchema.parse(req.query) as RoomQueryInput;
    const { items, total } = await this.service.listRooms(query);
    sendSuccess(res, {
      message: 'Rooms fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public deleteRoom = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteRoom(id, user.id);
    sendSuccess(res, { message: 'Room deleted successfully' });
  });

  public restoreRoom = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const room = await this.service.restoreRoom(id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }
    sendSuccess(res, { message: 'Room restored successfully', data: room });
  });

  public getVacancy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const vacancy = await this.service.getVacancyByRoom(id);
    sendSuccess(res, { message: 'Vacancy fetched successfully', data: vacancy });
  });

  // ─── ALLOCATION CRUD ───────────────────────────────────────────────────────

  public createAllocation = asyncHandler(async (req: Request, res: Response) => {
    const input = createAllocationSchema.parse(req.body) as CreateAllocationInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const allocation = await this.service.createAllocation(input, user.id);
    sendSuccess(res, {
      message: 'Allocation created successfully',
      data: allocation,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateAllocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateAllocationSchema.parse(req.body) as UpdateAllocationInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const allocation = await this.service.updateAllocation(id, input, user.id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }
    sendSuccess(res, { message: 'Allocation updated successfully', data: allocation });
  });

  public getAllocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const allocation = await this.service.getAllocation(id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }
    sendSuccess(res, { message: 'Allocation fetched successfully', data: allocation });
  });

  public listAllocations = asyncHandler(async (req: Request, res: Response) => {
    const query = allocationQuerySchema.parse(req.query) as AllocationQueryInput;
    const { items, total } = await this.service.listAllocations(query);
    sendSuccess(res, {
      message: 'Allocations fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public deleteAllocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteAllocation(id, user.id);
    sendSuccess(res, { message: 'Allocation deleted successfully' });
  });

  public restoreAllocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const allocation = await this.service.restoreAllocation(id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }
    sendSuccess(res, { message: 'Allocation restored successfully', data: allocation });
  });

  // ─── CHECK-IN / CHECK-OUT ──────────────────────────────────────────────────

  public checkIn = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = checkInSchema.parse(req.body) as CheckInInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const allocation = await this.service.checkIn(id, input, user.id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }
    sendSuccess(res, { message: 'Student checked in successfully', data: allocation });
  });

  public checkOut = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = checkOutSchema.parse(req.body) as CheckOutInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const allocation = await this.service.checkOut(id, input, user.id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }
    sendSuccess(res, { message: 'Student checked out successfully', data: allocation });
  });

  // ─── FEE MANAGEMENT ────────────────────────────────────────────────────────

  public createFee = asyncHandler(async (req: Request, res: Response) => {
    const input = createFeeSchema.parse(req.body) as CreateFeeInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const fee = await this.service.createFee(input, user.id);
    sendSuccess(res, {
      message: 'Fee record created successfully',
      data: fee,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateFee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateFeeSchema.parse(req.body) as UpdateFeeInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const fee = await this.service.updateFee(id, input, user.id);
    if (!fee) {
      throw new NotFoundError('Fee record not found');
    }
    sendSuccess(res, { message: 'Fee record updated successfully', data: fee });
  });

  public getFee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const fee = await this.service.getFee(id);
    if (!fee) {
      throw new NotFoundError('Fee record not found');
    }
    sendSuccess(res, { message: 'Fee record fetched successfully', data: fee });
  });

  public listFees = asyncHandler(async (req: Request, res: Response) => {
    const query = feeQuerySchema.parse(req.query) as FeeQueryInput;
    const { items, total } = await this.service.listFees(query);
    sendSuccess(res, {
      message: 'Fees fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public deleteFee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteFee(id, user.id);
    sendSuccess(res, { message: 'Fee record deleted successfully' });
  });

  // ─── STATISTICS ────────────────────────────────────────────────────────────

  public countAllocationsByStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.params;
    const count = await this.service.countAllocationsByStatus(status);
    sendSuccess(res, { message: 'Count fetched successfully', data: { count } });
  });

  public countFeesByStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.params;
    const count = await this.service.countFeesByStatus(status);
    sendSuccess(res, { message: 'Count fetched successfully', data: { count } });
  });

  public countOverdueFees = asyncHandler(async (_req: Request, res: Response) => {
    const count = await this.service.countOverdueFees();
    sendSuccess(res, { message: 'Overdue fees count fetched successfully', data: { count } });
  });

  public getHostelStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stats = await this.service.getHostelStatistics(id);
    sendSuccess(res, { message: 'Hostel statistics fetched successfully', data: stats });
  });
}

export const hostelController = new HostelController(hostelService);
