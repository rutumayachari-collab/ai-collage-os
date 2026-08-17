import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { TransportService, transportService } from './transport.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createTransportSchema,
  updateTransportSchema,
  transportQuerySchema,
  assignStudentSchema,
  updateFeeSchema,
  addRouteSchema,
  addVehicleSchema,
  addDriverSchema,
  addStopSchema,
  addFeeSchema,
  type CreateTransportInput,
  type UpdateTransportInput,
  type TransportQueryInput,
  type AssignStudentInput,
  type UpdateFeeInput,
  type AddRouteInput,
  type AddVehicleInput,
  type AddDriverInput,
  type AddStopInput,
  type AddFeeInput,
} from './transport.validator';

export class TransportController {
  constructor(private readonly service: TransportService) {}

  public create = asyncHandler(async (req: Request, res: Response) => {
    const input = createTransportSchema.parse(req.body) as CreateTransportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.createTransport(input, user.id);
    sendSuccess(res, {
      message: 'Transport record created successfully',
      data: transport,
      statusCode: HttpStatus.CREATED,
    });
  });

  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateTransportSchema.parse(req.body) as UpdateTransportInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.updateTransport(id, input, user.id);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Transport record updated successfully', data: transport });
  });

  public findById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transport = await this.service.getTransport(id);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Transport record fetched successfully', data: transport });
  });

  public findByTransportId = asyncHandler(async (req: Request, res: Response) => {
    const { transportId } = req.params;
    const transport = await this.service.getTransportByTransportId(transportId);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Transport record fetched successfully', data: transport });
  });

  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteTransport(id, user.id);
    sendSuccess(res, { message: 'Transport record deleted successfully' });
  });

  public list = asyncHandler(async (req: Request, res: Response) => {
    const query = transportQuerySchema.parse(req.query) as TransportQueryInput;
    const { items, total } = await this.service.listTransports(query);
    sendSuccess(res, {
      message: 'Transport records fetched successfully',
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

  public search = asyncHandler(async (req: Request, res: Response) => {
    const query = transportQuerySchema.parse(req.query) as TransportQueryInput;
    const { items, total } = await this.service.searchTransports(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
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

  public filter = asyncHandler(async (req: Request, res: Response) => {
    const query = transportQuerySchema.parse(req.query) as TransportQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.routeId) filters.routeId = query.routeId;
    if (query.vehicleId) filters.vehicleId = query.vehicleId;
    if (query.driverId) filters.driverId = query.driverId;
    if (query.studentId) filters.studentId = query.studentId;
    if (query.shift) filters.shift = query.shift;
    if (query.paymentStatus) filters.paymentStatus = query.paymentStatus;
    if (query.assignmentStatus) filters.assignmentStatus = query.assignmentStatus;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    const { items, total } = await this.service.filterTransports(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered transport records fetched successfully',
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

  public addRoute = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = addRouteSchema.parse(req.body) as AddRouteInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.addRoute(id, input);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Route added successfully', data: transport });
  });

  public updateRoute = asyncHandler(async (req: Request, res: Response) => {
    const { id, routeId } = req.params;
    const input = addRouteSchema.parse(req.body) as AddRouteInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.updateRoute(id, routeId, input);
    if (!transport) {
      throw new NotFoundError('Transport record or route not found');
    }
    sendSuccess(res, { message: 'Route updated successfully', data: transport });
  });

  public removeRoute = asyncHandler(async (req: Request, res: Response) => {
    const { id, routeId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.removeRoute(id, routeId);
    if (!transport) {
      throw new NotFoundError('Transport record or route not found');
    }
    sendSuccess(res, { message: 'Route removed successfully', data: transport });
  });

  public addVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = addVehicleSchema.parse(req.body) as AddVehicleInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.addVehicle(id, input);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Vehicle added successfully', data: transport });
  });

  public updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id, vehicleId } = req.params;
    const input = addVehicleSchema.parse(req.body) as AddVehicleInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.updateVehicle(id, vehicleId, input);
    if (!transport) {
      throw new NotFoundError('Transport record or vehicle not found');
    }
    sendSuccess(res, { message: 'Vehicle updated successfully', data: transport });
  });

  public removeVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id, vehicleId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.removeVehicle(id, vehicleId);
    if (!transport) {
      throw new NotFoundError('Transport record or vehicle not found');
    }
    sendSuccess(res, { message: 'Vehicle removed successfully', data: transport });
  });

  public addDriver = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = addDriverSchema.parse(req.body) as AddDriverInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.addDriver(id, input);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Driver added successfully', data: transport });
  });

  public updateDriver = asyncHandler(async (req: Request, res: Response) => {
    const { id, driverId } = req.params;
    const input = addDriverSchema.parse(req.body) as AddDriverInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.updateDriver(id, driverId, input);
    if (!transport) {
      throw new NotFoundError('Transport record or driver not found');
    }
    sendSuccess(res, { message: 'Driver updated successfully', data: transport });
  });

  public removeDriver = asyncHandler(async (req: Request, res: Response) => {
    const { id, driverId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.removeDriver(id, driverId);
    if (!transport) {
      throw new NotFoundError('Transport record or driver not found');
    }
    sendSuccess(res, { message: 'Driver removed successfully', data: transport });
  });

  public addStop = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = addStopSchema.parse(req.body) as AddStopInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.addStop(id, input);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Stop added successfully', data: transport });
  });

  public updateStop = asyncHandler(async (req: Request, res: Response) => {
    const { id, stopId } = req.params;
    const input = addStopSchema.parse(req.body) as AddStopInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.updateStop(id, stopId, input);
    if (!transport) {
      throw new NotFoundError('Transport record or stop not found');
    }
    sendSuccess(res, { message: 'Stop updated successfully', data: transport });
  });

  public removeStop = asyncHandler(async (req: Request, res: Response) => {
    const { id, stopId } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.removeStop(id, stopId);
    if (!transport) {
      throw new NotFoundError('Transport record or stop not found');
    }
    sendSuccess(res, { message: 'Stop removed successfully', data: transport });
  });

  public assignStudent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = assignStudentSchema.parse(req.body) as AssignStudentInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.assignStudent(id, input);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Student assigned successfully', data: transport });
  });

  public updateAssignmentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id, assignmentId } = req.params;
    const { status } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.updateAssignmentStatus(id, assignmentId, status);
    if (!transport) {
      throw new NotFoundError('Transport record or assignment not found');
    }
    sendSuccess(res, { message: 'Assignment status updated successfully', data: transport });
  });

  public getStudentAssignment = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.getStudentAssignment(req.params.id, user.id);
    if (!transport) {
      throw new NotFoundError('No transport assignment found for this student');
    }
    sendSuccess(res, { message: 'Student assignment fetched successfully', data: transport.studentAssignments });
  });

  public addFee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = addFeeSchema.parse(req.body) as AddFeeInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.addFee(id, input);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Transport fee added successfully', data: transport });
  });

  public updateFee = asyncHandler(async (req: Request, res: Response) => {
    const { id, feeId } = req.params;
    const input = updateFeeSchema.parse(req.body) as UpdateFeeInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.updateFee(id, feeId, input);
    if (!transport) {
      throw new NotFoundError('Transport record or fee not found');
    }
    sendSuccess(res, { message: 'Transport fee updated successfully', data: transport });
  });

  public getStudentFee = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.getStudentFee(req.params.id, user.id);
    if (!transport) {
      throw new NotFoundError('No transport fee found for this student');
    }
    sendSuccess(res, { message: 'Student fee fetched successfully', data: transport.transportFees });
  });

  public getVehicleCapacity = asyncHandler(async (req: Request, res: Response) => {
    const { id, vehicleId } = req.params;
    const capacity = await this.service.getVehicleCapacity(id, vehicleId);
    if (!capacity) {
      throw new NotFoundError('Transport record or vehicle not found');
    }
    sendSuccess(res, { message: 'Vehicle capacity fetched successfully', data: capacity });
  });

  public restore = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const transport = await this.service.restoreTransport(id);
    if (!transport) {
      throw new NotFoundError('Transport record not found');
    }
    sendSuccess(res, { message: 'Transport record restored successfully', data: transport });
  });

  public bulkCreate = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as { transports: CreateTransportInput[] };
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkCreateTransports(input.transports, user.id);
    sendSuccess(res, {
      message: `Bulk create completed. Created: ${result.created}, Failed: ${result.failed}`,
      data: result,
    });
  });

  public bulkUpdate = asyncHandler(async (req: Request, res: Response) => {
    const { ids, updates } = req.body;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const result = await this.service.bulkUpdateTransports(ids, updates, user.id);
    sendSuccess(res, {
      message: `Bulk update completed. Updated: ${result.updated}, Failed: ${result.failed}`,
      data: result,
    });
  });
}

export const transportController = new TransportController(transportService);
