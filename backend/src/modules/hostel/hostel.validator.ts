import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

export const createHostelSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(['BOYS', 'GIRLS', 'CO_ED', 'STAFF']),
  address: z.string().trim().min(5, 'Address is required').max(500),
  warden: z.string().trim().min(2, 'Warden name is required').max(100),
  contact: z.string().trim().min(10, 'Contact is required').max(20),
  facilities: z.array(z.string().trim()).default([]),
  totalRooms: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateHostelSchema = createHostelSchema.partial().omit({});

export const hostelQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  type: z.enum(['BOYS', 'GIRLS', 'CO_ED', 'STAFF']).optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED']).optional(),
});

export const createRoomSchema = z.object({
  roomNumber: z.string().trim().min(1, 'Room number is required').max(20),
  buildingId: objectIdSchema,
  floor: z.coerce.number().int().min(0).max(100),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY']),
  capacity: z.coerce.number().int().min(1).max(20),
  monthlyRent: z.coerce.number().int().min(0),
  amenities: z.array(z.string().trim()).default([]),
  isActive: z.boolean().default(true),
});

export const updateRoomSchema = createRoomSchema.partial().omit({});

export const roomQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  buildingId: z.string().trim().optional(),
  floor: z.coerce.number().int().optional(),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY']).optional(),
  isActive: z.coerce.boolean().optional(),
  isAvailable: z.coerce.boolean().optional(),
});

export const createAllocationSchema = z.object({
  studentId: objectIdSchema,
  roomId: objectIdSchema,
  bedNumber: z.coerce.number().int().min(1),
  allocationDate: z.coerce.date(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const updateAllocationSchema = z.object({
  status: z.enum(['ALLOCATED', 'CHECKED_IN', 'CHECKED_OUT', 'TERMINATED']).optional(),
  checkInDate: z.coerce.date().optional(),
  checkOutDate: z.coerce.date().optional(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const allocationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  roomId: z.string().trim().optional(),
  buildingId: z.string().trim().optional(),
  status: z.enum(['ALLOCATED', 'CHECKED_IN', 'CHECKED_OUT', 'TERMINATED']).optional(),
});

export const checkInSchema = z.object({
  checkInDate: z.coerce.date().optional(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const checkOutSchema = z.object({
  checkOutDate: z.coerce.date().optional(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const createFeeSchema = z.object({
  allocationId: objectIdSchema,
  studentId: objectIdSchema,
  amount: z.coerce.number().int().min(0),
  dueDate: z.coerce.date(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'REFUNDED']).default('PENDING'),
  transactionId: z.string().trim().optional().or(z.literal('')),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const updateFeeSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'REFUNDED']).optional(),
  paidDate: z.coerce.date().optional(),
  transactionId: z.string().trim().optional().or(z.literal('')),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const feeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  allocationId: z.string().trim().optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'REFUNDED']).optional(),
});

export type CreateHostelInput = z.infer<typeof createHostelSchema>;
export type UpdateHostelInput = z.infer<typeof updateHostelSchema>;
export type HostelQueryInput = z.infer<typeof hostelQuerySchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomQueryInput = z.infer<typeof roomQuerySchema>;
export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
export type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;
export type AllocationQueryInput = z.infer<typeof allocationQuerySchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type CreateFeeInput = z.infer<typeof createFeeSchema>;
export type UpdateFeeInput = z.infer<typeof updateFeeSchema>;
export type FeeQueryInput = z.infer<typeof feeQuerySchema>;
