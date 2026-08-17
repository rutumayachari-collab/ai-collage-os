export type ShiftType = "MORNING" | "AFTERNOON" | "EVENING";
export type VehicleType = "BUS" | "VAN" | "CAR" | "AUTO";
export type AssignmentStatus = "ASSIGNED" | "ACTIVE" | "WITHDRAWN";
export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE";

export interface TransportRoute {
  id: string;
  routeId: string;
  routeName: string;
  routeCode: string;
  startPoint: string;
  endPoint: string;
  viaPoints: string[];
  distance: number;
  estimatedDuration: number;
  shift: ShiftType;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  capacity: number;
  assignedRouteId?: string;
  registrationExpiry: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  driverId: string;
  name: string;
  licenseNumber: string;
  phone: string;
  experience: number;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stop {
  id: string;
  stopId: string;
  stopName: string;
  stopCode: string;
  routeId: string;
  sequence: number;
  timing: string;
  landmark?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAssignment {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  routeId: string;
  routeName?: string;
  stopId: string;
  stopName?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  boardingPoint: string;
  feeAmount: number;
  paymentStatus: PaymentStatus;
  status: AssignmentStatus;
  startDate: string;
  endDate?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}
