export type HostelStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ARCHIVED';
export type HostelType = 'BOYS' | 'GIRLS' | 'CO_ED' | 'STAFF';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'DORMITORY';
export type AllocationStatus = 'ALLOCATED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'TERMINATED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED' | 'REFUNDED';

export interface Hostel {
  name: string;
  type: HostelType;
  address: string;
  warden: string;
  contact: string;
  facilities: string[];
  totalRooms: number;
  isActive: boolean;
}

export interface HostelRoom {
  roomNumber: string;
  buildingId: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  monthlyRent: number;
  amenities: string[];
  isActive: boolean;
}

export interface HostelAllocation {
  studentId: string;
  roomId: string;
  bedNumber: number;
  allocationDate: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  status: AllocationStatus;
  remarks: string;
}

export interface HostelFee {
  allocationId: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  remarks: string;
}

export interface HostelSchemaType {
  name: string;
  type: HostelType;
  address: string;
  warden: string;
  contact: string;
  facilities: string[];
  totalRooms: number;
  status: HostelStatus;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HostelRoomSchemaType {
  roomNumber: string;
  buildingId: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  monthlyRent: number;
  amenities: string[];
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HostelAllocationSchemaType {
  studentId: string;
  roomId: string;
  bedNumber: number;
  allocationDate: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  status: AllocationStatus;
  remarks: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HostelFeeSchemaType {
  allocationId: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  remarks: string;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
