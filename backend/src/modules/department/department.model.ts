import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { DepartmentAchievement, DepartmentStatus } from './department.types';

export interface DepartmentSchemaType {
  code: string;
  name: string;
  shortName: string;
  description?: string;
  hodId?: string;
  email: string;
  phone: string;
  officeLocation?: string;
  building?: string;
  establishedYear: number;
  intakeCapacity: number;
  currentStrength?: number;
  status: DepartmentStatus;
  accreditation?: string;
  website?: string;
  vision?: string;
  mission?: string;
  achievements: DepartmentAchievement[];
  logo?: string;
  tags?: string[];
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}

export type DepartmentDocument = HydratedDocument<DepartmentSchemaType>;

const departmentSchema = new Schema<DepartmentSchemaType>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, unique: true, trim: true, maxlength: 100, index: true },
    shortName: { type: String, required: true, trim: true, maxlength: 20 },
    description: { type: String, trim: true },
    hodId: { type: String, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    officeLocation: { type: String, trim: true },
    building: { type: String, trim: true, index: true },
    establishedYear: { type: Number, required: true, index: true },
    intakeCapacity: { type: Number, required: true, min: 1, max: 1000 },
    currentStrength: { type: Number, min: 0 },
    status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE', index: true },
    accreditation: { type: String, trim: true, maxlength: 200 },
    website: { type: String, trim: true },
    vision: { type: String, trim: true },
    mission: { type: String, trim: true },
    achievements: [
      {
        year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, trim: true, maxlength: 1000 },
        category: { type: String, required: true, enum: ['RESEARCH', 'AWARD', 'RANKING', 'INFRASTRUCTURE', 'OTHER'] },
      },
    ],
    logo: { type: String, trim: true },
    tags: [{ type: String, trim: true, index: true }],
    isActive: { type: Boolean, required: true, default: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedAt: { type: Date, index: true },
    deletedBy: { type: String },
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

departmentSchema.index({ status: 1, isActive: 1 });
departmentSchema.index({ code: 1, name: 1 });
departmentSchema.index({ name: 'text', code: 'text', description: 'text' });
departmentSchema.index({ createdAt: -1 });

export const DepartmentModel: Model<DepartmentSchemaType> = model<DepartmentSchemaType>('Department', departmentSchema);
