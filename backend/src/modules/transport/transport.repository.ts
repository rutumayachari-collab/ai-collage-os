import { BaseRepository } from '../../shared/repositories/base.repository';
import { TransportModel, type TransportDocument, type TransportSchemaType } from './transport.model';

export class TransportRepository extends BaseRepository<TransportSchemaType> {
  constructor() {
    super(TransportModel);
  }

  public async findByTransportId(transportId: string): Promise<TransportDocument | null> {
    return this.model.findOne({ transportId, deletedAt: { $exists: false } }).exec();
  }

  public async findRouteByRouteCode(routeCode: string): Promise<TransportDocument | null> {
    return this.model.findOne({ 'routes.routeCode': routeCode.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findVehicleByNumber(vehicleNumber: string): Promise<TransportDocument | null> {
    return this.model.findOne({ 'vehicles.vehicleNumber': vehicleNumber.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findDriverByLicense(licenseNumber: string): Promise<TransportDocument | null> {
    return this.model.findOne({ 'drivers.licenseNumber': licenseNumber.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findStopByCode(stopCode: string): Promise<TransportDocument | null> {
    return this.model.findOne({ 'stops.stopCode': stopCode.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findByStudent(studentId: string): Promise<TransportDocument | null> {
    return this.model.findOne({ 'studentAssignments.studentId': studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findAssignmentByStudent(studentId: string, status?: string): Promise<TransportDocument | null> {
    const query: Record<string, unknown> = { 'studentAssignments.studentId': studentId, deletedAt: { $exists: false } };
    if (status) query['studentAssignments.status'] = status;
    return this.model.findOne(query).exec();
  }

  public async findFeeByStudent(studentId: string): Promise<TransportDocument | null> {
    return this.model.findOne({ 'transportFees.studentId': studentId, deletedAt: { $exists: false } }).exec();
  }

  public async listTransports(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: TransportDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchTransports(searchQuery: string, page = 1, limit = 20): Promise<{ items: TransportDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterTransports(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: TransportDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.routeId) query['routes.routeId'] = filters.routeId;
    if (filters.vehicleId) query['vehicles.vehicleId'] = filters.vehicleId;
    if (filters.driverId) query['drivers.driverId'] = filters.driverId;
    if (filters.studentId) query['studentAssignments.studentId'] = filters.studentId;
    if (filters.shift) query['routes.shift'] = filters.shift;
    if (filters.paymentStatus) query['transportFees.paymentStatus'] = filters.paymentStatus;
    if (filters.assignmentStatus) query['studentAssignments.status'] = filters.assignmentStatus;

    return this.paginate(query, page, limit, sort);
  }

  public async addRoute(transportId: string, route: TransportSchemaType['routes'][0]): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $push: { routes: route }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateRoute(transportId: string, routeId: string, updates: Partial<TransportSchemaType['routes'][0]>): Promise<TransportDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: transportId, 'routes.routeId': routeId },
      { $set: { 'routes.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeRoute(transportId: string, routeId: string): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $pull: { routes: { routeId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addVehicle(transportId: string, vehicle: TransportSchemaType['vehicles'][0]): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $push: { vehicles: vehicle }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateVehicle(transportId: string, vehicleId: string, updates: Partial<TransportSchemaType['vehicles'][0]>): Promise<TransportDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: transportId, 'vehicles.vehicleId': vehicleId },
      { $set: { 'vehicles.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeVehicle(transportId: string, vehicleId: string): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $pull: { vehicles: { vehicleId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addDriver(transportId: string, driver: TransportSchemaType['drivers'][0]): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $push: { drivers: driver }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateDriver(transportId: string, driverId: string, updates: Partial<TransportSchemaType['drivers'][0]>): Promise<TransportDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: transportId, 'drivers.driverId': driverId },
      { $set: { 'drivers.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeDriver(transportId: string, driverId: string): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $pull: { drivers: { driverId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addStop(transportId: string, stop: TransportSchemaType['stops'][0]): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $push: { stops: stop }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateStop(transportId: string, stopId: string, updates: Partial<TransportSchemaType['stops'][0]>): Promise<TransportDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: transportId, 'stops.stopId': stopId },
      { $set: { 'stops.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeStop(transportId: string, stopId: string): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $pull: { stops: { stopId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addStudentAssignment(transportId: string, assignment: TransportSchemaType['studentAssignments'][0]): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $push: { studentAssignments: assignment }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateStudentAssignment(transportId: string, assignmentId: string, updates: Partial<TransportSchemaType['studentAssignments'][0]>): Promise<TransportDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: transportId, 'studentAssignments.assignmentId': assignmentId },
      { $set: { 'studentAssignments.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeStudentAssignment(transportId: string, assignmentId: string): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $pull: { studentAssignments: { assignmentId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async addTransportFee(transportId: string, fee: TransportSchemaType['transportFees'][0]): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $push: { transportFees: fee }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async updateTransportFee(transportId: string, feeId: string, updates: Partial<TransportSchemaType['transportFees'][0]>): Promise<TransportDocument | null> {
    const result = await this.model.findOneAndUpdate(
      { _id: transportId, 'transportFees.feeId': feeId },
      { $set: { 'transportFees.$': updates, updatedAt: new Date() } },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async removeTransportFee(transportId: string, feeId: string): Promise<TransportDocument | null> {
    const result = await this.model.findByIdAndUpdate(
      transportId,
      { $pull: { transportFees: { feeId } }, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).exec();
    return result;
  }

  public async getVehicleCapacity(transportId: string, vehicleId: string): Promise<{ capacity: number; assigned: number; available: number } | null> {
    const transport = await this.findById(transportId);
    if (!transport) return null;

    const vehicle = transport.vehicles.find(v => v.vehicleId === vehicleId);
    if (!vehicle) return null;

    const assigned = transport.studentAssignments.filter(
      a => a.vehicleId === vehicleId && (a.status === 'ASSIGNED' || a.status === 'ACTIVE')
    ).length;

    return {
      capacity: vehicle.capacity,
      assigned,
      available: vehicle.capacity - assigned,
    };
  }

  public async softDelete(transportId: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: transportId }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(transportId: string): Promise<TransportDocument | null> {
    const result = await this.model.updateOne({ _id: transportId }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(transportId).exec();
    }
    return null;
  }

  public async existsByTransportId(transportId: string): Promise<boolean> {
    return this.exists({ transportId, deletedAt: { $exists: false } });
  }

  public async existsByRouteCode(routeCode: string): Promise<boolean> {
    return this.exists({ 'routes.routeCode': routeCode.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByVehicleNumber(vehicleNumber: string): Promise<boolean> {
    return this.exists({ 'vehicles.vehicleNumber': vehicleNumber.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByLicenseNumber(licenseNumber: string): Promise<boolean> {
    return this.exists({ 'drivers.licenseNumber': licenseNumber.toUpperCase(), deletedAt: { $exists: false } });
  }

  public async existsByStopCode(stopCode: string): Promise<boolean> {
    return this.exists({ 'stops.stopCode': stopCode.toUpperCase(), deletedAt: { $exists: false } });
  }
}

export const transportRepository = new TransportRepository();
