import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import {
  hostelRepository,
  hostelRoomRepository,
  hostelAllocationRepository,
  hostelFeeRepository,
} from './hostel.repository';
import type {
  HostelDocument,
  HostelRoomDocument,
  HostelAllocationDocument,
  HostelFeeDocument,
  HostelSchemaType,
} from './hostel.model';
import type {
  CreateHostelInput,
  UpdateHostelInput,
  HostelQueryInput,
  CreateRoomInput,
  UpdateRoomInput,
  RoomQueryInput,
  CreateAllocationInput,
  UpdateAllocationInput,
  AllocationQueryInput,
  CheckInInput,
  CheckOutInput,
  CreateFeeInput,
  UpdateFeeInput,
  FeeQueryInput,
} from './hostel.validator';

export class HostelService {
  // ─── HOSTEL CRUD ────────────────────────────────────────────────────────────

  public async createHostel(input: CreateHostelInput, createdBy: string): Promise<HostelDocument> {
    const normalizedName = input.name.trim();
    const existing = await hostelRepository.findByName(normalizedName);
    if (existing) {
      throw new ConflictError('A hostel with this name already exists');
    }

    return hostelRepository.create({
      ...input,
      name: normalizedName,
      status: 'ACTIVE',
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateHostel(id: string, input: UpdateHostelInput, updatedBy: string): Promise<HostelDocument | null> {
    const hostel = await hostelRepository.findById(id);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }

    if (hostel.deletedAt) {
      throw new BadRequestError('Cannot update a deleted hostel');
    }

    if (hostel.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify an archived hostel');
    }

    if (input.name && input.name !== hostel.name) {
      const normalizedName = input.name.trim();
      const existing = await hostelRepository.findByName(normalizedName);
      if (existing && existing.id !== id) {
        throw new ConflictError('A hostel with this name already exists');
      }
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return hostelRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async getHostel(id: string): Promise<HostelDocument | null> {
    return hostelRepository.findById(id);
  }

  public async deleteHostel(id: string, deletedBy: string): Promise<void> {
    const hostel = await hostelRepository.findById(id);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }

    if (hostel.deletedAt) {
      throw new BadRequestError('Hostel is already deleted');
    }

    if (hostel.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot delete an archived hostel. Restore it first.');
    }

    await hostelRepository.softDelete(id, deletedBy);
  }

  public async restoreHostel(id: string): Promise<HostelDocument | null> {
    const hostel = await hostelRepository.findById(id);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }

    if (!hostel.deletedAt) {
      throw new BadRequestError('Hostel is not deleted');
    }

    return hostelRepository.restore(id);
  }

  // ─── ROOM CRUD ─────────────────────────────────────────────────────────────

  public async createRoom(input: CreateRoomInput, createdBy: string): Promise<HostelRoomDocument> {
    const hostel = await hostelRepository.findById(input.buildingId);
    if (!hostel) {
      throw new BadRequestError('Hostel not found');
    }

    if (hostel.deletedAt) {
      throw new BadRequestError('Cannot add room to a deleted hostel');
    }

    if (hostel.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot add room to an archived hostel');
    }

    const normalizedRoomNumber = input.roomNumber.trim().toUpperCase();
    const existing = await hostelRoomRepository.findRoomByNumber(input.buildingId, normalizedRoomNumber);
    if (existing) {
      throw new ConflictError('A room with this number already exists in this hostel');
    }

    const room = await hostelRoomRepository.create({
      ...input,
      roomNumber: normalizedRoomNumber,
      createdBy,
      updatedBy: createdBy,
    });

    await hostelRepository.updateById(input.buildingId, {
      totalRooms: (hostel.totalRooms || 0) + 1,
      updatedBy: createdBy,
      updatedAt: new Date(),
    } as Partial<HostelSchemaType>);

    return room;
  }

  public async updateRoom(id: string, input: UpdateRoomInput, updatedBy: string): Promise<HostelRoomDocument | null> {
    const room = await hostelRoomRepository.findById(id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (room.deletedAt) {
      throw new BadRequestError('Cannot update a deleted room');
    }

    const hostel = await hostelRepository.findById(room.buildingId);
    if (hostel?.status === 'ARCHIVED') {
      throw new BadRequestError('Cannot modify a room in an archived hostel');
    }

    if (input.buildingId && input.buildingId !== room.buildingId) {
      const newHostel = await hostelRepository.findById(input.buildingId);
      if (!newHostel || newHostel.deletedAt) {
        throw new BadRequestError('Target hostel not found or deleted');
      }
    }

    if (input.roomNumber && input.roomNumber !== room.roomNumber) {
      const normalizedRoomNumber = input.roomNumber.trim().toUpperCase();
      const targetBuildingId = input.buildingId || room.buildingId;
      const existing = await hostelRoomRepository.findRoomByNumber(targetBuildingId, normalizedRoomNumber);
      if (existing && existing.id !== id) {
        throw new ConflictError('A room with this number already exists in this hostel');
      }
      input.roomNumber = normalizedRoomNumber;
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return hostelRoomRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async getRoom(id: string): Promise<HostelRoomDocument | null> {
    return hostelRoomRepository.findById(id);
  }

  public async deleteRoom(id: string, deletedBy: string): Promise<void> {
    const room = await hostelRoomRepository.findById(id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (room.deletedAt) {
      throw new BadRequestError('Room is already deleted');
    }

    const activeAllocations = await hostelAllocationRepository.findByRoom(id);
    const hasActive = activeAllocations.some(a => ['ALLOCATED', 'CHECKED_IN'].includes(a.status));
    if (hasActive) {
      throw new BadRequestError('Cannot delete room with active allocations');
    }

    await hostelRoomRepository.softDelete(id, deletedBy);
  }

  public async restoreRoom(id: string): Promise<HostelRoomDocument | null> {
    const room = await hostelRoomRepository.findById(id);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    if (!room.deletedAt) {
      throw new BadRequestError('Room is not deleted');
    }

    return hostelRoomRepository.restore(id);
  }

  // ─── ALLOCATION CRUD ───────────────────────────────────────────────────────

  public async createAllocation(input: CreateAllocationInput, createdBy: string): Promise<HostelAllocationDocument> {
    const room = await hostelRoomRepository.findById(input.roomId);
    if (!room) {
      throw new BadRequestError('Room not found');
    }

    if (!room.isActive) {
      throw new BadRequestError('Room is not active');
    }

    const existingAllocation = await hostelAllocationRepository.findActiveAllocation(input.studentId);
    if (existingAllocation) {
      throw new ConflictError('Student already has an active allocation');
    }

    const currentAllocations = await hostelAllocationRepository.findByRoom(input.roomId);
    const activeInRoom = currentAllocations.filter(a => ['ALLOCATED', 'CHECKED_IN'].includes(a.status));
    if (activeInRoom.length >= room.capacity) {
      throw new BadRequestError('Room has no available beds');
    }

    if (activeInRoom.some(a => a.bedNumber === input.bedNumber)) {
      throw new ConflictError('Bed number is already occupied');
    }

    return hostelAllocationRepository.create({
      ...input,
      status: 'ALLOCATED',
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateAllocation(id: string, input: UpdateAllocationInput, updatedBy: string): Promise<HostelAllocationDocument | null> {
    const allocation = await hostelAllocationRepository.findById(id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }

    if (allocation.deletedAt) {
      throw new BadRequestError('Cannot update a deleted allocation');
    }

    const validTransitions: Record<string, string[]> = {
      ALLOCATED: ['CHECKED_IN', 'TERMINATED'],
      CHECKED_IN: ['CHECKED_OUT', 'TERMINATED'],
      CHECKED_OUT: ['TERMINATED'],
      TERMINATED: [],
    };

    if (input.status && input.status !== allocation.status) {
      const allowed = validTransitions[allocation.status] || [];
      if (!allowed.includes(input.status)) {
        throw new BadRequestError(`Invalid status transition from ${allocation.status} to ${input.status}`);
      }
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return hostelAllocationRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async getAllocation(id: string): Promise<HostelAllocationDocument | null> {
    return hostelAllocationRepository.findById(id);
  }

  public async deleteAllocation(id: string, deletedBy: string): Promise<void> {
    const allocation = await hostelAllocationRepository.findById(id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }

    if (allocation.deletedAt) {
      throw new BadRequestError('Allocation is already deleted');
    }

    await hostelAllocationRepository.softDelete(id, deletedBy);
  }

  public async restoreAllocation(id: string): Promise<HostelAllocationDocument | null> {
    const allocation = await hostelAllocationRepository.findById(id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }

    if (!allocation.deletedAt) {
      throw new BadRequestError('Allocation is not deleted');
    }

    return hostelAllocationRepository.restore(id);
  }

  // ─── CHECK-IN / CHECK-OUT ──────────────────────────────────────────────────

  public async checkIn(id: string, input: CheckInInput, updatedBy: string): Promise<HostelAllocationDocument | null> {
    const allocation = await hostelAllocationRepository.findById(id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }

    if (allocation.status !== 'ALLOCATED') {
      throw new BadRequestError('Only allocated students can check in');
    }

    return hostelAllocationRepository.updateById(id, {
      status: 'CHECKED_IN',
      checkInDate: input.checkInDate || new Date(),
      remarks: input.remarks || allocation.remarks,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async checkOut(id: string, input: CheckOutInput, updatedBy: string): Promise<HostelAllocationDocument | null> {
    const allocation = await hostelAllocationRepository.findById(id);
    if (!allocation) {
      throw new NotFoundError('Allocation not found');
    }

    if (allocation.status !== 'CHECKED_IN') {
      throw new BadRequestError('Only checked-in students can check out');
    }

    return hostelAllocationRepository.updateById(id, {
      status: 'CHECKED_OUT',
      checkOutDate: input.checkOutDate || new Date(),
      remarks: input.remarks || allocation.remarks,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  // ─── FEE MANAGEMENT ────────────────────────────────────────────────────────

  public async createFee(input: CreateFeeInput, createdBy: string): Promise<HostelFeeDocument> {
    const allocation = await hostelAllocationRepository.findById(input.allocationId);
    if (!allocation) {
      throw new BadRequestError('Allocation not found');
    }

    if (allocation.deletedAt) {
      throw new BadRequestError('Cannot create fee for a deleted allocation');
    }

    return hostelFeeRepository.create({
      ...input,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateFee(id: string, input: UpdateFeeInput, updatedBy: string): Promise<HostelFeeDocument | null> {
    const fee = await hostelFeeRepository.findById(id);
    if (!fee) {
      throw new NotFoundError('Fee record not found');
    }

    if (fee.deletedAt) {
      throw new BadRequestError('Cannot update a deleted fee record');
    }

    const updates: Record<string, unknown> = { ...input, updatedBy, updatedAt: new Date() };

    if (input.paymentStatus === 'PAID' && !input.paidDate) {
      updates.paidDate = new Date();
    }

    const cleanedInput = this.cleanEmptyStrings(updates);

    return hostelFeeRepository.updateById(id, cleanedInput);
  }

  public async getFee(id: string): Promise<HostelFeeDocument | null> {
    return hostelFeeRepository.findById(id);
  }

  public async deleteFee(id: string, deletedBy: string): Promise<void> {
    const fee = await hostelFeeRepository.findById(id);
    if (!fee) {
      throw new NotFoundError('Fee record not found');
    }

    if (fee.deletedAt) {
      throw new BadRequestError('Fee record is already deleted');
    }

    await hostelFeeRepository.softDelete(id, deletedBy);
  }

  // ─── SEARCH / FILTER / LIST ────────────────────────────────────────────────

  public async listHostels(query: HostelQueryInput): Promise<{ items: HostelDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.type) filter.type = query.type;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.status) filter.status = query.status;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return hostelRepository.listHostels(filter, query.page, query.limit, sortOption);
  }

  public async listRooms(query: RoomQueryInput): Promise<{ items: HostelRoomDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.buildingId) filter.buildingId = query.buildingId;
    if (query.floor !== undefined) filter.floor = query.floor;
    if (query.roomType) filter.roomType = query.roomType;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return hostelRoomRepository.paginate(filter, query.page, query.limit, sortOption);
  }

  public async listAllocations(query: AllocationQueryInput): Promise<{ items: HostelAllocationDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.studentId) filter.studentId = query.studentId;
    if (query.roomId) filter.roomId = query.roomId;
    if (query.status) filter.status = query.status;
    if (query.buildingId) {
      const rooms = await hostelRoomRepository.findByBuilding(query.buildingId);
      filter.roomId = { $in: rooms.map(r => r.id) };
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return hostelAllocationRepository.listAllocations(filter, query.page, query.limit, sortOption);
  }

  public async listFees(query: FeeQueryInput): Promise<{ items: HostelFeeDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.studentId) filter.studentId = query.studentId;
    if (query.allocationId) filter.allocationId = query.allocationId;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return hostelFeeRepository.listFees(filter, query.page, query.limit, sortOption);
  }

  public async searchAllocations(searchQuery: string, page = 1, limit = 20): Promise<{ items: HostelAllocationDocument[]; total: number }> {
    return hostelAllocationRepository.searchAllocations(searchQuery, page, limit);
  }

  public async searchFees(searchQuery: string, page = 1, limit = 20): Promise<{ items: HostelFeeDocument[]; total: number }> {
    return hostelFeeRepository.searchFees(searchQuery, page, limit);
  }

  public async filterAllocations(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelAllocationDocument[]; total: number }> {
    return hostelAllocationRepository.filterAllocations(filters, page, limit, sort);
  }

  public async filterFees(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelFeeDocument[]; total: number }> {
    return hostelFeeRepository.filterFees(filters, page, limit, sort);
  }

  // ─── VACANCY TRACKING ──────────────────────────────────────────────────────

  public async getVacancyByBuilding(buildingId: string): Promise<{ totalRooms: number; availableBeds: number; occupiedBeds: number; totalCapacity: number }> {
    const hostel = await hostelRepository.findById(buildingId);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }

    const rooms = await hostelRoomRepository.findByBuilding(buildingId);
    const activeRooms = rooms.filter(r => r.isActive && !r.deletedAt);
    const totalRooms = activeRooms.length;
    const totalCapacity = activeRooms.reduce((sum, r) => sum + r.capacity, 0);

    const allocations = await hostelAllocationRepository.findActiveByBuilding(buildingId);
    const occupiedBeds = allocations.length;

    return {
      totalRooms,
      availableBeds: totalCapacity - occupiedBeds,
      occupiedBeds,
      totalCapacity,
    };
  }

  public async getVacancyByRoom(roomId: string): Promise<{ roomId: string; capacity: number; occupiedBeds: number; availableBeds: number }> {
    const room = await hostelRoomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const allocations = await hostelAllocationRepository.findByRoom(roomId);
    const occupiedBeds = allocations.filter(a => ['ALLOCATED', 'CHECKED_IN'].includes(a.status)).length;

    return {
      roomId: room.id,
      capacity: room.capacity,
      occupiedBeds,
      availableBeds: room.capacity - occupiedBeds,
    };
  }

  // ─── STATISTICS ────────────────────────────────────────────────────────────

  public async countAllocationsByStatus(status: string): Promise<number> {
    return hostelAllocationRepository.count({ status, deletedAt: { $exists: false } });
  }

  public async countFeesByStatus(paymentStatus: string): Promise<number> {
    return hostelFeeRepository.count({ paymentStatus, deletedAt: { $exists: false } });
  }

  public async countOverdueFees(): Promise<number> {
    const now = new Date();
    return hostelFeeRepository.count({
      paymentStatus: 'PENDING',
      dueDate: { $lt: now },
      deletedAt: { $exists: false },
    });
  }

  public async getHostelStatistics(buildingId: string): Promise<HostelStatistics> {
    const hostel = await hostelRepository.findById(buildingId);
    if (!hostel) {
      throw new NotFoundError('Hostel not found');
    }

    const vacancy = await this.getVacancyByBuilding(buildingId);

    return { hostel, vacancy };
  }

  // ─── BULK OPERATIONS ───────────────────────────────────────────────────────

  public async bulkCreateHostels(input: { hostels: CreateHostelInput[] }, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const hostelData of input.hostels) {
      try {
        await this.createHostel(hostelData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${hostelData.name}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkCreateRooms(input: { rooms: CreateRoomInput[] }, createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const roomData of input.rooms) {
      try {
        await this.createRoom(roomData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${roomData.roomNumber}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  private cleanEmptyStrings(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      if (value instanceof Date) {
        cleaned[key] = value;
        continue;
      }
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => (typeof item === 'object' && item !== null && !(item instanceof Date) ? this.cleanEmptyStrings(item as Record<string, unknown>) : item));
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = this.cleanEmptyStrings(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}

export interface HostelVacancy {
  totalRooms: number;
  availableBeds: number;
  occupiedBeds: number;
  totalCapacity: number;
}

export interface HostelStatistics {
  hostel: HostelDocument;
  vacancy: HostelVacancy;
}

export const hostelService = new HostelService();
