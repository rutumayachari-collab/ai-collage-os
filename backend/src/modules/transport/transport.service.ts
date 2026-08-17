import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { transportRepository } from './transport.repository';
import type { TransportDocument, TransportSchemaType } from './transport.model';
import type {
  CreateTransportInput,
  UpdateTransportInput,
  TransportQueryInput,
  AssignStudentInput,
  UpdateFeeInput,
  AddRouteInput,
  AddVehicleInput,
  AddDriverInput,
  AddStopInput,
  AddFeeInput,
} from './transport.validator';

export class TransportService {
  public async createTransport(input: CreateTransportInput, createdBy: string): Promise<TransportDocument> {
    const normalizedTransportId = input.transportId.trim().toUpperCase();

    if (await transportRepository.existsByTransportId(normalizedTransportId)) {
      throw new ConflictError('A transport record with this transport ID already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return transportRepository.create({
      ...cleanedInput,
      transportId: normalizedTransportId,
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateTransport(id: string, input: UpdateTransportInput, updatedBy: string): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(id);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot update a deleted transport record');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    const updated = await transportRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });

    return updated;
  }

  public async getTransport(id: string): Promise<TransportDocument | null> {
    return transportRepository.findById(id);
  }

  public async getTransportByTransportId(transportId: string): Promise<TransportDocument | null> {
    return transportRepository.findByTransportId(transportId);
  }

  public async deleteTransport(id: string, deletedBy: string): Promise<void> {
    const transport = await transportRepository.findById(id);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Transport record is already deleted');
    }

    await transportRepository.softDelete(id, deletedBy);
  }

  public async listTransports(query: TransportQueryInput): Promise<{ items: TransportDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.routeId) filter['routes.routeId'] = query.routeId;
    if (query.vehicleId) filter['vehicles.vehicleId'] = query.vehicleId;
    if (query.driverId) filter['drivers.driverId'] = query.driverId;
    if (query.studentId) filter['studentAssignments.studentId'] = query.studentId;
    if (query.shift) filter['routes.shift'] = query.shift;
    if (query.paymentStatus) filter['transportFees.paymentStatus'] = query.paymentStatus;
    if (query.assignmentStatus) filter['studentAssignments.status'] = query.assignmentStatus;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return transportRepository.listTransports(filter, query.page, query.limit, sortOption);
  }

  public async searchTransports(searchQuery: string, page = 1, limit = 20): Promise<{ items: TransportDocument[]; total: number }> {
    return transportRepository.searchTransports(searchQuery, page, limit);
  }

  public async filterTransports(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: TransportDocument[]; total: number }> {
    return transportRepository.filterTransports(filters, page, limit, sort);
  }

  public async addRoute(transportId: string, input: AddRouteInput): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot add route to a deleted transport record');
    }

    const routeCode = input.routeCode.trim().toUpperCase();
    if (await transportRepository.existsByRouteCode(routeCode)) {
      throw new ConflictError('A route with this code already exists');
    }

    const routeId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const route: TransportSchemaType['routes'][0] = {
      routeId,
      ...input,
      routeCode,
      viaPoints: input.viaPoints || [],
      isActive: input.isActive ?? true,
    };

    return transportRepository.addRoute(transportId, route);
  }

  public async updateRoute(transportId: string, routeId: string, updates: Partial<TransportSchemaType['routes'][0]>): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot update route on a deleted transport record');
    }

    const route = transport.routes.find(r => r.routeId === routeId);
    if (!route) {
      throw new NotFoundError('Route not found');
    }

    const cleanedUpdates = this.cleanEmptyStrings(updates);
    if (cleanedUpdates.routeCode) {
      cleanedUpdates.routeCode = (cleanedUpdates.routeCode as string).toUpperCase();
    }

    return transportRepository.updateRoute(transportId, routeId, cleanedUpdates);
  }

  public async removeRoute(transportId: string, routeId: string): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    const route = transport.routes.find(r => r.routeId === routeId);
    if (!route) {
      throw new NotFoundError('Route not found');
    }

    return transportRepository.removeRoute(transportId, routeId);
  }

  public async addVehicle(transportId: string, input: AddVehicleInput): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot add vehicle to a deleted transport record');
    }

    const vehicleNumber = input.vehicleNumber.trim().toUpperCase();
    if (await transportRepository.existsByVehicleNumber(vehicleNumber)) {
      throw new ConflictError('A vehicle with this number already exists');
    }

    const vehicleId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const vehicle: TransportSchemaType['vehicles'][0] = {
      vehicleId,
      ...input,
      vehicleNumber,
      isActive: input.isActive ?? true,
    };

    return transportRepository.addVehicle(transportId, vehicle);
  }

  public async updateVehicle(transportId: string, vehicleId: string, updates: Partial<TransportSchemaType['vehicles'][0]>): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot update vehicle on a deleted transport record');
    }

    const vehicle = transport.vehicles.find(v => v.vehicleId === vehicleId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const cleanedUpdates = this.cleanEmptyStrings(updates);
    if (cleanedUpdates.vehicleNumber) {
      cleanedUpdates.vehicleNumber = (cleanedUpdates.vehicleNumber as string).toUpperCase();
    }

    return transportRepository.updateVehicle(transportId, vehicleId, cleanedUpdates);
  }

  public async removeVehicle(transportId: string, vehicleId: string): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    const vehicle = transport.vehicles.find(v => v.vehicleId === vehicleId);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return transportRepository.removeVehicle(transportId, vehicleId);
  }

  public async addDriver(transportId: string, input: AddDriverInput): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot add driver to a deleted transport record');
    }

    const licenseNumber = input.licenseNumber.trim().toUpperCase();
    if (await transportRepository.existsByLicenseNumber(licenseNumber)) {
      throw new ConflictError('A driver with this license number already exists');
    }

    const driverId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const driver: TransportSchemaType['drivers'][0] = {
      driverId,
      ...input,
      licenseNumber,
      phone: input.phone.trim(),
      isActive: input.isActive ?? true,
    };

    return transportRepository.addDriver(transportId, driver);
  }

  public async updateDriver(transportId: string, driverId: string, updates: Partial<TransportSchemaType['drivers'][0]>): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot update driver on a deleted transport record');
    }

    const driver = transport.drivers.find(d => d.driverId === driverId);
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    const cleanedUpdates = this.cleanEmptyStrings(updates);
    if (cleanedUpdates.licenseNumber) {
      cleanedUpdates.licenseNumber = (cleanedUpdates.licenseNumber as string).toUpperCase();
    }
    if (cleanedUpdates.phone) {
      cleanedUpdates.phone = (cleanedUpdates.phone as string).trim();
    }

    return transportRepository.updateDriver(transportId, driverId, cleanedUpdates);
  }

  public async removeDriver(transportId: string, driverId: string): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    const driver = transport.drivers.find(d => d.driverId === driverId);
    if (!driver) {
      throw new NotFoundError('Driver not found');
    }

    return transportRepository.removeDriver(transportId, driverId);
  }

  public async addStop(transportId: string, input: AddStopInput): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot add stop to a deleted transport record');
    }

    const stopCode = input.stopCode.trim().toUpperCase();
    if (await transportRepository.existsByStopCode(stopCode)) {
      throw new ConflictError('A stop with this code already exists');
    }

    const routeExists = transport.routes.some(r => r.routeId === input.routeId);
    if (!routeExists) {
      throw new BadRequestError('Route not found');
    }

    const stopId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const stop: TransportSchemaType['stops'][0] = {
      stopId,
      ...input,
      stopCode,
      landmark: input.landmark || '',
      isActive: input.isActive ?? true,
    };

    return transportRepository.addStop(transportId, stop);
  }

  public async updateStop(transportId: string, stopId: string, updates: Partial<TransportSchemaType['stops'][0]>): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot update stop on a deleted transport record');
    }

    const stop = transport.stops.find(s => s.stopId === stopId);
    if (!stop) {
      throw new NotFoundError('Stop not found');
    }

    const cleanedUpdates = this.cleanEmptyStrings(updates);
    if (cleanedUpdates.stopCode) {
      cleanedUpdates.stopCode = (cleanedUpdates.stopCode as string).toUpperCase();
    }

    return transportRepository.updateStop(transportId, stopId, cleanedUpdates);
  }

  public async removeStop(transportId: string, stopId: string): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    const stop = transport.stops.find(s => s.stopId === stopId);
    if (!stop) {
      throw new NotFoundError('Stop not found');
    }

    return transportRepository.removeStop(transportId, stopId);
  }

  public async assignStudent(transportId: string, input: AssignStudentInput): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot assign student to a deleted transport record');
    }

    const routeExists = transport.routes.some(r => r.routeId === input.routeId && r.isActive);
    if (!routeExists) {
      throw new BadRequestError('Route not found or inactive');
    }

    const vehicleExists = transport.vehicles.some(v => v.vehicleId === input.vehicleId && v.isActive);
    if (!vehicleExists) {
      throw new BadRequestError('Vehicle not found or inactive');
    }

    const stopExists = transport.stops.some(s => s.stopId === input.stopId && s.isActive);
    if (!stopExists) {
      throw new BadRequestError('Stop not found or inactive');
    }

    const existingAssignment = transport.studentAssignments.find(
      a => a.studentId === input.studentId && a.status !== 'WITHDRAWN'
    );
    if (existingAssignment) {
      throw new BadRequestError('Student already has an active transport assignment');
    }

    const assignmentId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const assignment: TransportSchemaType['studentAssignments'][0] = {
      assignmentId,
      ...input,
      status: 'ASSIGNED',
      endDate: undefined,
    };

    return transportRepository.addStudentAssignment(transportId, assignment);
  }

  public async updateAssignmentStatus(transportId: string, assignmentId: string, status: 'ASSIGNED' | 'ACTIVE' | 'WITHDRAWN'): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot update assignment on a deleted transport record');
    }

    const assignment = transport.studentAssignments.find(a => a.assignmentId === assignmentId);
    if (!assignment) {
      throw new NotFoundError('Assignment not found');
    }

    const updates: Partial<TransportSchemaType['studentAssignments'][0]> = {
      status,
    };

    if (status === 'WITHDRAWN') {
      updates.endDate = new Date();
    }

    return transportRepository.updateStudentAssignment(transportId, assignmentId, updates);
  }

  public async getStudentAssignment(_transportId: string, studentId: string): Promise<TransportDocument | null> {
    return transportRepository.findAssignmentByStudent(studentId);
  }

  public async addFee(transportId: string, input: AddFeeInput): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot add fee to a deleted transport record');
    }

    const feeId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const paidAmount = input.paidAmount ?? 0;
    const fee: TransportSchemaType['transportFees'][0] = {
      feeId,
      ...input,
      paidAmount,
      balance: input.amount - paidAmount,
      paymentStatus: input.paymentStatus || 'PENDING',
      paidAt: input.paidAt instanceof Date ? input.paidAt : undefined,
      paidBy: input.paidBy || '',
      remarks: input.remarks || '',
    };

    return transportRepository.addTransportFee(transportId, fee);
  }

  public async updateFee(transportId: string, feeId: string, input: UpdateFeeInput): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (transport.deletedAt) {
      throw new BadRequestError('Cannot update fee on a deleted transport record');
    }

    const fee = transport.transportFees.find(f => f.feeId === feeId);
    if (!fee) {
      throw new NotFoundError('Fee not found');
    }

    const updates: Partial<TransportSchemaType['transportFees'][0]> = {};

    if (input.paidAmount !== undefined && input.paidAmount !== null) {
      updates.paidAmount = input.paidAmount;
      updates.balance = fee.amount - input.paidAmount;
      if (input.paidAmount >= fee.amount) {
        updates.paymentStatus = 'PAID';
        updates.balance = 0;
      } else if (input.paidAmount > 0) {
        updates.paymentStatus = 'PARTIAL';
      }
    }

    if (input.paymentStatus) {
      updates.paymentStatus = input.paymentStatus;
    }

    if (input.paidAt instanceof Date) {
      updates.paidAt = input.paidAt;
    }

    if (input.paidBy) {
      updates.paidBy = input.paidBy;
    }

    if (input.remarks !== undefined && input.remarks !== null) {
      updates.remarks = input.remarks;
    }

    return transportRepository.updateTransportFee(transportId, feeId, updates);
  }

  public async getStudentFee(_transportId: string, studentId: string): Promise<TransportDocument | null> {
    return transportRepository.findFeeByStudent(studentId);
  }

  public async getVehicleCapacity(transportId: string, vehicleId: string): Promise<{ capacity: number; assigned: number; available: number } | null> {
    return transportRepository.getVehicleCapacity(transportId, vehicleId);
  }

  public async restoreTransport(id: string): Promise<TransportDocument | null> {
    const transport = await transportRepository.findById(id);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }

    if (!transport.deletedAt) {
      throw new BadRequestError('Transport record is not deleted');
    }

    return transportRepository.restore(id);
  }

  public async bulkCreateTransports(input: CreateTransportInput[], createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const transportData of input) {
      try {
        await this.createTransport(transportData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${transportData.transportId || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  public async bulkUpdateTransports(ids: string[], updates: UpdateTransportInput, updatedBy: string): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const result = await this.updateTransport(id, updates, updatedBy);
        if (result) {
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { updated, failed };
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

export const transportService = new TransportService();
