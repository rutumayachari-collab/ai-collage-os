import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { TransportSchemaType } from './transport.types';

export type TransportDocument = HydratedDocument<TransportSchemaType>;
export { TransportSchemaType };

const transportSchema = new Schema<TransportSchemaType>(
  {
    transportId: { type: String, required: true, unique: true, index: true },
    routes: [
      {
        routeId: { type: String, required: true, index: true },
        routeName: { type: String, required: true, trim: true, maxlength: 100 },
        routeCode: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 20, index: true },
        startPoint: { type: String, required: true, trim: true },
        endPoint: { type: String, required: true, trim: true },
        viaPoints: [
          {
            name: { type: String, required: true, trim: true },
            distance: { type: Number, required: true, min: 0 },
          },
        ],
        distance: { type: Number, required: true, min: 0 },
        estimatedDuration: { type: Number, required: true, min: 1 },
        shift: { type: String, required: true, enum: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'], index: true },
        isActive: { type: Boolean, required: true, default: true, index: true },
      },
    ],
    vehicles: [
      {
        vehicleId: { type: String, required: true, index: true },
        vehicleNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 20, index: true },
        vehicleType: { type: String, required: true, enum: ['BUS', 'VAN', 'CAR', 'AUTO', 'BIKE', 'OTHER'], index: true },
        capacity: { type: Number, required: true, min: 1 },
        registrationExpiry: { type: Date, required: true },
        insuranceExpiry: { type: Date, required: true },
        fitnessExpiry: { type: Date, required: true },
        isActive: { type: Boolean, required: true, default: true, index: true },
      },
    ],
    drivers: [
      {
        driverId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        licenseNumber: { type: String, required: true, unique: true, trim: true, maxlength: 50, index: true },
        phone: { type: String, required: true, trim: true },
        experience: { type: Number, required: true, min: 0 },
        address: { type: String, required: true, trim: true },
        isActive: { type: Boolean, required: true, default: true, index: true },
      },
    ],
    stops: [
      {
        stopId: { type: String, required: true, index: true },
        stopName: { type: String, required: true, trim: true, maxlength: 100 },
        stopCode: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 20, index: true },
        routeId: { type: String, required: true, index: true },
        sequence: { type: Number, required: true, min: 1 },
        timing: { type: String, required: true, trim: true },
        landmark: { type: String, trim: true },
        isActive: { type: Boolean, required: true, default: true, index: true },
      },
    ],
    studentAssignments: [
      {
        assignmentId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        routeId: { type: String, required: true, index: true },
        stopId: { type: String, required: true, index: true },
        vehicleId: { type: String, required: true, index: true },
        boardingPoint: { type: String, required: true, trim: true },
        feeAmount: { type: Number, required: true, min: 0 },
        status: { type: String, required: true, enum: ['ASSIGNED', 'ACTIVE', 'WITHDRAWN'], default: 'ASSIGNED', index: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
      },
    ],
    transportFees: [
      {
        feeId: { type: String, required: true, index: true },
        studentId: { type: String, required: true, index: true },
        routeId: { type: String, required: true, index: true },
        vehicleId: { type: String, required: true, index: true },
        amount: { type: Number, required: true, min: 0 },
        paidAmount: { type: Number, required: true, min: 0, default: 0 },
        balance: { type: Number, required: true, min: 0, default: 0 },
        paymentStatus: { type: String, required: true, enum: ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'], default: 'PENDING', index: true },
        dueDate: { type: Date, required: true },
        paidAt: { type: Date },
        paidBy: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    ],
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    deletedAt: { type: Date, index: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

transportSchema.index({ 'routes.routeCode': 1 }, { unique: true, sparse: true });
transportSchema.index({ 'vehicles.vehicleNumber': 1 }, { unique: true, sparse: true });
transportSchema.index({ 'drivers.licenseNumber': 1 }, { unique: true, sparse: true });
transportSchema.index({ 'stops.stopCode': 1 }, { unique: true, sparse: true });
transportSchema.index({ 'studentAssignments.studentId': 1 });
transportSchema.index({ 'studentAssignments.routeId': 1 });
transportSchema.index({ 'studentAssignments.vehicleId': 1 });
transportSchema.index({ 'studentAssignments.status': 1 });
transportSchema.index({ 'transportFees.studentId': 1 });
transportSchema.index({ 'transportFees.paymentStatus': 1 });
transportSchema.index({ createdAt: -1 });
transportSchema.index({ deletedAt: 1 });
transportSchema.index({ isActive: 1, 'routes.isActive': 1 });
transportSchema.index({ isActive: 1, 'vehicles.isActive': 1 });

transportSchema.index({
  'routes.routeName': 'text',
  'routes.routeCode': 'text',
  'routes.startPoint': 'text',
  'routes.endPoint': 'text',
  'vehicles.vehicleNumber': 'text',
  'drivers.name': 'text',
  'stops.stopName': 'text',
});

export const TransportModel: Model<TransportSchemaType> = model<TransportSchemaType>('Transport', transportSchema);
