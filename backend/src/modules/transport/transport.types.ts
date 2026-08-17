export type RouteShift = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
export type AssignmentStatus = 'ASSIGNED' | 'ACTIVE' | 'WITHDRAWN';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
export type VehicleType = 'BUS' | 'VAN' | 'CAR' | 'AUTO' | 'BIKE' | 'OTHER';

export interface ViaPoint {
  name: string;
  distance: number;
}

export interface TransportRoute {
  routeId: string;
  routeName: string;
  routeCode: string;
  startPoint: string;
  endPoint: string;
  viaPoints: ViaPoint[];
  distance: number;
  estimatedDuration: number;
  shift: RouteShift;
  isActive: boolean;
}

export interface Vehicle {
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  capacity: number;
  registrationExpiry: Date;
  insuranceExpiry: Date;
  fitnessExpiry: Date;
  isActive: boolean;
}

export interface Driver {
  driverId: string;
  name: string;
  licenseNumber: string;
  phone: string;
  experience: number;
  address: string;
  isActive: boolean;
}

export interface Stop {
  stopId: string;
  stopName: string;
  stopCode: string;
  routeId: string;
  sequence: number;
  timing: string;
  landmark: string;
  isActive: boolean;
}

export interface StudentAssignment {
  assignmentId: string;
  studentId: string;
  routeId: string;
  stopId: string;
  vehicleId: string;
  boardingPoint: string;
  feeAmount: number;
  status: AssignmentStatus;
  startDate: Date;
  endDate?: Date;
}

export interface TransportFee {
  feeId: string;
  studentId: string;
  routeId: string;
  vehicleId: string;
  amount: number;
  paidAmount: number;
  balance: number;
  paymentStatus: PaymentStatus;
  dueDate: Date;
  paidAt?: Date;
  paidBy?: string;
  remarks: string;
}

export interface TransportSchemaType {
  transportId: string;
  routes: TransportRoute[];
  vehicles: Vehicle[];
  drivers: Driver[];
  stops: Stop[];
  studentAssignments: StudentAssignment[];
  transportFees: TransportFee[];
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive: boolean;
}
