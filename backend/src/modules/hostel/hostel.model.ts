import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type {
  HostelSchemaType,
  HostelRoomSchemaType,
  HostelAllocationSchemaType,
  HostelFeeSchemaType,
} from './hostel.types';

export type HostelDocument = HydratedDocument<HostelSchemaType>;
export type HostelRoomDocument = HydratedDocument<HostelRoomSchemaType>;
export type HostelAllocationDocument = HydratedDocument<HostelAllocationSchemaType>;
export type HostelFeeDocument = HydratedDocument<HostelFeeSchemaType>;
export { HostelSchemaType, HostelRoomSchemaType, HostelAllocationSchemaType, HostelFeeSchemaType };

const hostelSchema = new Schema<HostelSchemaType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100, index: true },
    type: { type: String, required: true, enum: ['BOYS', 'GIRLS', 'CO_ED', 'STAFF'], index: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    warden: { type: String, required: true, trim: true, maxlength: 100 },
    contact: { type: String, required: true, trim: true, maxlength: 20 },
    facilities: [{ type: String, trim: true }],
    totalRooms: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    archivedAt: { type: Date },
    archivedBy: { type: String, trim: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    deletedAt: { type: Date, index: true },
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

hostelSchema.index({ type: 1, isActive: 1 });
hostelSchema.index({ status: 1, isActive: 1 });
hostelSchema.index({ createdAt: -1 });
hostelSchema.index({ deletedAt: 1 });
hostelSchema.index({ name: 'text', address: 'text', warden: 'text' });

const hostelRoomSchema = new Schema<HostelRoomSchemaType>(
  {
    roomNumber: { type: String, required: true, trim: true, maxlength: 20, index: true },
    buildingId: { type: String, required: true, index: true },
    floor: { type: Number, required: true, min: 0, max: 100, index: true },
    roomType: { type: String, required: true, enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'DORMITORY'], index: true },
    capacity: { type: Number, required: true, min: 1, max: 20 },
    monthlyRent: { type: Number, required: true, min: 0 },
    amenities: [{ type: String, trim: true }],
    isActive: { type: Boolean, required: true, default: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    deletedAt: { type: Date, index: true },
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

hostelRoomSchema.index({ buildingId: 1, roomNumber: 1 }, { unique: true });
hostelRoomSchema.index({ buildingId: 1, floor: 1 });
hostelRoomSchema.index({ buildingId: 1, roomType: 1 });
hostelRoomSchema.index({ buildingId: 1, isActive: 1 });
hostelRoomSchema.index({ createdAt: -1 });
hostelRoomSchema.index({ deletedAt: 1 });

const hostelAllocationSchema = new Schema<HostelAllocationSchemaType>(
  {
    studentId: { type: String, required: true, index: true },
    roomId: { type: String, required: true, index: true },
    bedNumber: { type: Number, required: true, min: 1 },
    allocationDate: { type: Date, required: true, index: true },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    status: { type: String, required: true, enum: ['ALLOCATED', 'CHECKED_IN', 'CHECKED_OUT', 'TERMINATED'], default: 'ALLOCATED', index: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    deletedAt: { type: Date, index: true },
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

hostelAllocationSchema.index({ studentId: 1, status: 1 });
hostelAllocationSchema.index({ roomId: 1, status: 1 });
hostelAllocationSchema.index({ studentId: 1, roomId: 1 });
hostelAllocationSchema.index({ status: 1, allocationDate: -1 });
hostelAllocationSchema.index({ createdAt: -1 });
hostelAllocationSchema.index({ deletedAt: 1 });

const hostelFeeSchema = new Schema<HostelFeeSchemaType>(
  {
    allocationId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true, index: true },
    paidDate: { type: Date },
    paymentStatus: { type: String, required: true, enum: ['PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'REFUNDED'], default: 'PENDING', index: true },
    transactionId: { type: String, trim: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    deletedAt: { type: Date, index: true },
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

hostelFeeSchema.index({ studentId: 1, paymentStatus: 1 });
hostelFeeSchema.index({ allocationId: 1, paymentStatus: 1 });
hostelFeeSchema.index({ paymentStatus: 1, dueDate: 1 });
hostelFeeSchema.index({ createdAt: -1 });
hostelFeeSchema.index({ deletedAt: 1 });

export const HostelModel: Model<HostelSchemaType> = model<HostelSchemaType>('Hostel', hostelSchema);
export const HostelRoomModel: Model<HostelRoomSchemaType> = model<HostelRoomSchemaType>('HostelRoom', hostelRoomSchema);
export const HostelAllocationModel: Model<HostelAllocationSchemaType> = model<HostelAllocationSchemaType>('HostelAllocation', hostelAllocationSchema);
export const HostelFeeModel: Model<HostelFeeSchemaType> = model<HostelFeeSchemaType>('HostelFee', hostelFeeSchema);
