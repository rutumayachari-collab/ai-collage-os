export type HostelType = "BOYS" | "GIRLS" | "MIXED";
export type RoomType = "SINGLE" | "DOUBLE" | "TRIPLE" | "DORMITORY";
export type AllocationStatus = "ALLOCATED" | "CHECKED_IN" | "CHECKED_OUT" | "TERMINATED";

export interface Hostel {
  id: string;
  hostelId: string;
  name: string;
  type: HostelType;
  address: string;
  warden: string;
  contactPhone: string;
  contactEmail?: string;
  facilities: string[];
  totalRooms: number;
  occupiedRooms: number;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  hostelId: string;
  hostelName?: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  occupied: number;
  monthlyRent: number;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HostelAllocation {
  id: string;
  allocationId: string;
  studentId: string;
  studentName?: string;
  hostelId: string;
  hostelName?: string;
  roomId: string;
  roomNumber?: string;
  bedNumber: string;
  allocationDate: string;
  checkInDate?: string;
  checkOutDate?: string;
  status: AllocationStatus;
  remarks?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
