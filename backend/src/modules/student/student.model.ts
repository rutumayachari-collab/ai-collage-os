import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

export interface StudentSchemaType {
  userId: string;
  studentId: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup?: string;
  nationality: string;
  religion?: string;
  category?: string;
  aadharNumber?: string;
  photo?: string;
  signature?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  currentAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    type: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
    email?: string;
  };
  departmentId: string;
  courseId: string;
  batch: string;
  academicYear: string;
  semester: number;
  section?: string;
  admissionNumber: string;
  admissionDate: Date;
  admissionType: string;
  quota?: string;
  previousQualification?: {
    institution: string;
    board: string;
    year: number;
    percentage: number;
    marksObtained?: number;
    totalMarks?: number;
  };
  parentId?: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianOccupation?: string;
  guardianIncome?: number;
  status: string;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  remarks?: string;
  tags?: string[];
  documents: {
    name: string;
    type: string;
    url: string;
    fileSize: number;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
  profileCompletion: number;
  profileCompletedAt?: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}

export type StudentDocument = HydratedDocument<StudentSchemaType>;

const studentSchema = new Schema<StudentSchemaType>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, unique: true, index: true },
    rollNumber: { type: String, required: true, maxlength: 20 },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    nationality: { type: String, required: true, trim: true },
    religion: { type: String, trim: true },
    category: { type: String, enum: ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER'] },
    aadharNumber: { type: String, trim: true, unique: true, sparse: true },
    photo: { type: String, trim: true },
    signature: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    alternatePhone: { type: String, trim: true },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    currentAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      type: { type: String, enum: ['HOSTEL', 'PG', 'RENTED', 'FAMILY'] },
    },
    emergencyContact: {
      name: { type: String, required: true, trim: true },
      relation: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
    },
    departmentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    batch: { type: String, required: true, index: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    section: { type: String, maxlength: 5 },
    admissionNumber: { type: String, required: true, unique: true, index: true },
    admissionDate: { type: Date, required: true },
    admissionType: { type: String, required: true, enum: ['MERIT', 'MANAGEMENT', 'NRI', 'MANAGEMENT_QUOTA', 'OTHER'] },
    quota: { type: String, enum: ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'OTHER'] },
    previousQualification: {
      institution: { type: String, trim: true },
      board: { type: String, trim: true },
      year: { type: Number, min: 1950, max: new Date().getFullYear() },
      percentage: { type: Number, min: 0, max: 100 },
      marksObtained: { type: Number, min: 0 },
      totalMarks: { type: Number, min: 0 },
    },
    parentId: { type: String, index: true },
    guardianName: { type: String, required: true, trim: true },
    guardianRelation: { type: String, required: true, enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'] },
    guardianPhone: { type: String, required: true, trim: true },
    guardianEmail: { type: String, trim: true },
    guardianOccupation: { type: String, trim: true },
    guardianIncome: { type: Number, min: 0 },
    status: { type: String, required: true, enum: ['ACTIVE', 'ALUMNI', 'SUSPENDED', 'WITHDRAWN', 'GRADUATED'], default: 'ACTIVE', index: true },
    isActive: { type: Boolean, required: true, default: true, index: true },
    isVerified: { type: Boolean, required: true, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    remarks: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    documents: [
      {
        name: { type: String, required: true, trim: true },
        type: { type: String, required: true, enum: ['AADHAR', 'MARKSHEET', 'PHOTO', 'SIGNATURE', 'OTHER'] },
        url: { type: String, required: true, trim: true },
        fileSize: { type: Number, required: true, min: 0 },
        uploadedAt: { type: Date, required: true },
        uploadedBy: { type: String, required: true },
      },
    ],
    profileCompletion: { type: Number, required: true, min: 0, max: 100, default: 0 },
    profileCompletedAt: { type: Date },
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
        delete ret.aadharNumber;
        delete ret.guardianIncome;
        return ret;
      },
    },
  },
);

studentSchema.index({ rollNumber: 1, departmentId: 1, batch: 1, semester: 1, section: 1 }, { unique: true });
studentSchema.index({ firstName: 1, lastName: 1 });
studentSchema.index({ status: 1, isActive: 1 });
studentSchema.index({ createdAt: -1 });

export const StudentModel: Model<StudentSchemaType> = model<StudentSchemaType>('Student', studentSchema);
