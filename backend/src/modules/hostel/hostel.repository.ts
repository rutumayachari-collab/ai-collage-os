import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  HostelModel,
  HostelRoomModel,
  HostelAllocationModel,
  HostelFeeModel,
  type HostelDocument,
  type HostelRoomDocument,
  type HostelAllocationDocument,
  type HostelFeeDocument,
  type HostelSchemaType,
  type HostelRoomSchemaType,
  type HostelAllocationSchemaType,
  type HostelFeeSchemaType,
} from './hostel.model';

export class HostelRepository extends BaseRepository<HostelSchemaType> {
  constructor() {
    super(HostelModel);
  }

  public async findByName(name: string): Promise<HostelDocument | null> {
    return this.model.findOne({ name: name.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async findByType(type: string): Promise<HostelDocument[]> {
    return this.model.find({ type, deletedAt: { $exists: false } }).exec();
  }

  public async listHostels(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelDocument[]; total: number }> {
    return this.paginate(filter, page, limit, sort);
  }

  public async searchHostels(searchQuery: string, page = 1, limit = 20): Promise<{ items: HostelDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterHostels(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.type) query.type = filters.type;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.status) query.status = filters.status;

    return this.paginate(query, page, limit, sort);
  }

  public async softDelete(hostelId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: hostelId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(hostelId: string): Promise<HostelDocument | null> {
    const result = await this.model.updateOne({ _id: hostelId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(hostelId).exec();
    }
    return null;
  }
}

export class HostelRoomRepository extends BaseRepository<HostelRoomSchemaType> {
  constructor() {
    super(HostelRoomModel);
  }

  public async findByBuilding(buildingId: string): Promise<HostelRoomDocument[]> {
    return this.model.find({ buildingId, deletedAt: { $exists: false } }).exec();
  }

  public async findByBuildingAndFloor(buildingId: string, floor: number): Promise<HostelRoomDocument[]> {
    return this.model.find({ buildingId, floor, deletedAt: { $exists: false } }).exec();
  }

  public async findByRoomType(buildingId: string, roomType: string): Promise<HostelRoomDocument[]> {
    return this.model.find({ buildingId, roomType, deletedAt: { $exists: false } }).exec();
  }

  public async findAvailableRooms(buildingId: string): Promise<HostelRoomDocument[]> {
    const rooms = await this.model.find({ buildingId, isActive: true, deletedAt: { $exists: false } }).exec();
    return rooms.filter(room => {
      const allocatedBeds = room.capacity;
      return allocatedBeds > 0;
    });
  }

  public async findRoomByNumber(buildingId: string, roomNumber: string): Promise<HostelRoomDocument | null> {
    return this.model.findOne({ buildingId, roomNumber: roomNumber.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async softDelete(roomId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: roomId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(roomId: string): Promise<HostelRoomDocument | null> {
    const result = await this.model.updateOne({ _id: roomId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(roomId).exec();
    }
    return null;
  }
}

export class HostelAllocationRepository extends BaseRepository<HostelAllocationSchemaType> {
  constructor() {
    super(HostelAllocationModel);
  }

  public async findByStudent(studentId: string): Promise<HostelAllocationDocument[]> {
    return this.model.find({ studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByRoom(roomId: string): Promise<HostelAllocationDocument[]> {
    return this.model.find({ roomId, deletedAt: { $exists: false } }).exec();
  }

  public async findActiveAllocation(studentId: string): Promise<HostelAllocationDocument | null> {
    return this.model
      .findOne({
        studentId,
        status: { $in: ['ALLOCATED', 'CHECKED_IN'] },
        deletedAt: { $exists: false },
      })
      .exec();
  }

  public async findByStatus(status: string): Promise<HostelAllocationDocument[]> {
    return this.model.find({ status, deletedAt: { $exists: false } }).exec();
  }

  public async findActiveByBuilding(buildingId: string): Promise<HostelAllocationDocument[]> {
    const rooms = await new HostelRoomRepository().findByBuilding(buildingId);
    const roomIds = rooms.map(r => r.id);
    return this.model.find({
      roomId: { $in: roomIds },
      status: { $in: ['ALLOCATED', 'CHECKED_IN'] },
      deletedAt: { $exists: false },
    }).exec();
  }

  public async listAllocations(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelAllocationDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchAllocations(searchQuery: string, page = 1, limit = 20): Promise<{ items: HostelAllocationDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterAllocations(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelAllocationDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.roomId) query.roomId = filters.roomId;
    if (filters.status) query.status = filters.status;
    if (filters.buildingId) {
      const rooms = await new HostelRoomRepository().findByBuilding(filters.buildingId as string);
      query.roomId = { $in: rooms.map(r => r.id) };
    }
    if (filters.allocationDateFrom) {
      query.allocationDate = { $gte: filters.allocationDateFrom };
    }
    if (filters.allocationDateTo) {
      query.allocationDate = { ...(query.allocationDate as Record<string, unknown>), $lte: filters.allocationDateTo } as Record<string, unknown>;
    }

    return this.paginate(query, page, limit, sort);
  }

  public async softDelete(allocationId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: allocationId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(allocationId: string): Promise<HostelAllocationDocument | null> {
    const result = await this.model.updateOne({ _id: allocationId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(allocationId).exec();
    }
    return null;
  }
}

export class HostelFeeRepository extends BaseRepository<HostelFeeSchemaType> {
  constructor() {
    super(HostelFeeModel);
  }

  public async findByStudent(studentId: string): Promise<HostelFeeDocument[]> {
    return this.model.find({ studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findByAllocation(allocationId: string): Promise<HostelFeeDocument[]> {
    return this.model.find({ allocationId, deletedAt: { $exists: false } }).exec();
  }

  public async findByPaymentStatus(paymentStatus: string): Promise<HostelFeeDocument[]> {
    return this.model.find({ paymentStatus, deletedAt: { $exists: false } }).exec();
  }

  public async findOverdueFees(): Promise<HostelFeeDocument[]> {
    const now = new Date();
    return this.model.find({
      paymentStatus: 'PENDING',
      dueDate: { $lt: now },
      deletedAt: { $exists: false },
    }).exec();
  }

  public async listFees(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelFeeDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchFees(searchQuery: string, page = 1, limit = 20): Promise<{ items: HostelFeeDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterFees(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: HostelFeeDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.allocationId) query.allocationId = filters.allocationId;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.dueDateFrom) query.dueDate = { $gte: filters.dueDateFrom };
    if (filters.dueDateTo) query.dueDate = { ...(query.dueDate as Record<string, unknown>), $lte: filters.dueDateTo } as Record<string, unknown>;
    if (filters.paidDateFrom) query.paidDate = { $gte: filters.paidDateFrom };
    if (filters.paidDateTo) query.paidDate = { ...(query.paidDate as Record<string, unknown>), $lte: filters.paidDateTo } as Record<string, unknown>;

    return this.paginate(query, page, limit, sort);
  }

  public async softDelete(feeId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: feeId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(feeId: string): Promise<HostelFeeDocument | null> {
    const result = await this.model.updateOne({ _id: feeId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(feeId).exec();
    }
    return null;
  }
}

export const hostelRepository = new HostelRepository();
export const hostelRoomRepository = new HostelRoomRepository();
export const hostelAllocationRepository = new HostelAllocationRepository();
export const hostelFeeRepository = new HostelFeeRepository();
