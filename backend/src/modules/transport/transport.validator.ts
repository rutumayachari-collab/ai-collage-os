import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

export const viaPointSchema = z.object({
  name: z.string().trim().min(1, 'Via point name is required'),
  distance: z.coerce.number().min(0, 'Distance must be non-negative'),
});

export const transportRouteSchema = z.object({
  routeId: z.string().trim().min(1, 'Route ID is required'),
  routeName: z.string().trim().min(1, 'Route name is required').max(100),
  routeCode: z.string().trim().min(1, 'Route code is required').max(20),
  startPoint: z.string().trim().min(1, 'Start point is required'),
  endPoint: z.string().trim().min(1, 'End point is required'),
  viaPoints: z.array(viaPointSchema).default([]),
  distance: z.coerce.number().min(0, 'Distance must be non-negative'),
  estimatedDuration: z.coerce.number().int().min(1, 'Estimated duration must be at least 1 minute'),
  shift: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']),
  isActive: z.boolean().default(true),
});

export const vehicleSchema = z.object({
  vehicleId: z.string().trim().min(1, 'Vehicle ID is required'),
  vehicleNumber: z.string().trim().min(1, 'Vehicle number is required').max(20),
  vehicleType: z.enum(['BUS', 'VAN', 'CAR', 'AUTO', 'BIKE', 'OTHER']),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  registrationExpiry: z.coerce.date(),
  insuranceExpiry: z.coerce.date(),
  fitnessExpiry: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const driverSchema = z.object({
  driverId: z.string().trim().min(1, 'Driver ID is required'),
  name: z.string().trim().min(1, 'Driver name is required').max(100),
  licenseNumber: z.string().trim().min(1, 'License number is required').max(50),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, 'A valid phone number is required'),
  experience: z.coerce.number().int().min(0, 'Experience must be non-negative'),
  address: z.string().trim().min(1, 'Address is required'),
  isActive: z.boolean().default(true),
});

export const stopSchema = z.object({
  stopId: z.string().trim().min(1, 'Stop ID is required'),
  stopName: z.string().trim().min(1, 'Stop name is required').max(100),
  stopCode: z.string().trim().min(1, 'Stop code is required').max(20),
  routeId: z.string().trim().min(1, 'Route ID is required'),
  sequence: z.coerce.number().int().min(1, 'Sequence must be at least 1'),
  timing: z.string().trim().min(1, 'Timing is required'),
  landmark: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const studentAssignmentSchema = z.object({
  assignmentId: z.string().trim().min(1, 'Assignment ID is required'),
  studentId: objectIdSchema,
  routeId: z.string().trim().min(1, 'Route ID is required'),
  stopId: z.string().trim().min(1, 'Stop ID is required'),
  vehicleId: z.string().trim().min(1, 'Vehicle ID is required'),
  boardingPoint: z.string().trim().min(1, 'Boarding point is required'),
  feeAmount: z.coerce.number().min(0, 'Fee amount must be non-negative'),
  status: z.enum(['ASSIGNED', 'ACTIVE', 'WITHDRAWN']).default('ASSIGNED'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().or(z.literal('')),
});

export const transportFeeSchema = z.object({
  feeId: z.string().trim().min(1, 'Fee ID is required'),
  studentId: objectIdSchema,
  routeId: z.string().trim().min(1, 'Route ID is required'),
  vehicleId: z.string().trim().min(1, 'Vehicle ID is required'),
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  paidAmount: z.coerce.number().min(0, 'Paid amount must be non-negative').default(0),
  balance: z.coerce.number().min(0, 'Balance must be non-negative').default(0),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']).default('PENDING'),
  dueDate: z.coerce.date(),
  paidAt: z.coerce.date().optional().or(z.literal('')),
  paidBy: z.string().trim().optional().or(z.literal('')),
  remarks: z.string().trim().optional().or(z.literal('')),
});

export const createTransportSchema = z.object({
  transportId: z.string().trim().regex(/^TRN\d{4,6}$/, 'Transport ID must be TRN followed by 4-6 digits'),
  routes: z.array(transportRouteSchema).default([]),
  vehicles: z.array(vehicleSchema).default([]),
  drivers: z.array(driverSchema).default([]),
  stops: z.array(stopSchema).default([]),
  studentAssignments: z.array(studentAssignmentSchema).default([]),
  transportFees: z.array(transportFeeSchema).default([]),
  isActive: z.boolean().default(true),
});

export const updateTransportSchema = createTransportSchema.partial().omit({
  transportId: true,
});

export const transportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  isActive: z.coerce.boolean().optional(),
  routeId: z.string().trim().optional(),
  vehicleId: z.string().trim().optional(),
  driverId: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  shift: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']).optional(),
  assignmentStatus: z.enum(['ASSIGNED', 'ACTIVE', 'WITHDRAWN']).optional(),
});

export const bulkImportSchema = z.object({
  transports: z.array(createTransportSchema).min(1).max(500),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(objectIdSchema).min(1).max(500),
  updates: updateTransportSchema,
});

export const assignStudentSchema = z.object({
  studentId: objectIdSchema,
  routeId: z.string().trim().min(1, 'Route ID is required'),
  stopId: z.string().trim().min(1, 'Stop ID is required'),
  vehicleId: z.string().trim().min(1, 'Vehicle ID is required'),
  boardingPoint: z.string().trim().min(1, 'Boarding point is required'),
  feeAmount: z.coerce.number().min(0, 'Fee amount must be non-negative'),
  startDate: z.coerce.date(),
});

export const updateFeeSchema = z.object({
  paidAmount: z.coerce.number().min(0, 'Paid amount must be non-negative'),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']).optional(),
  paidAt: z.coerce.date().optional().or(z.literal('')),
  paidBy: z.string().trim().optional().or(z.literal('')),
  remarks: z.string().trim().optional().or(z.literal('')),
});

export const addRouteSchema = transportRouteSchema.omit({ routeId: true });
export const addVehicleSchema = vehicleSchema.omit({ vehicleId: true });
export const addDriverSchema = driverSchema.omit({ driverId: true });
export const addStopSchema = stopSchema.omit({ stopId: true });
export const addFeeSchema = transportFeeSchema.omit({ feeId: true });

export type ViaPointInput = z.infer<typeof viaPointSchema>;
export type TransportRouteInput = z.infer<typeof transportRouteSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type DriverInput = z.infer<typeof driverSchema>;
export type StopInput = z.infer<typeof stopSchema>;
export type StudentAssignmentInput = z.infer<typeof studentAssignmentSchema>;
export type TransportFeeInput = z.infer<typeof transportFeeSchema>;
export type CreateTransportInput = z.infer<typeof createTransportSchema>;
export type UpdateTransportInput = z.infer<typeof updateTransportSchema>;
export type TransportQueryInput = z.infer<typeof transportQuerySchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type AssignStudentInput = z.infer<typeof assignStudentSchema>;
export type UpdateFeeInput = z.infer<typeof updateFeeSchema>;
export type AddRouteInput = z.infer<typeof addRouteSchema>;
export type AddVehicleInput = z.infer<typeof addVehicleSchema>;
export type AddDriverInput = z.infer<typeof addDriverSchema>;
export type AddStopInput = z.infer<typeof addStopSchema>;
export type AddFeeInput = z.infer<typeof addFeeSchema>;
