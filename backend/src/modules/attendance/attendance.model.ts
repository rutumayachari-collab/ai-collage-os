import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { AttendanceSchemaType } from './attendance.types';

export type AttendanceDocument = HydratedDocument<AttendanceSchemaType>;
export { AttendanceSchemaType };

const attendanceSchema = new Schema<AttendanceSchemaType>(
  {
    studentId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    facultyId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, required: true, enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], index: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    sessionType: { type: String, trim: true, maxlength: 50 },
    periodNumber: { type: Number, min: 1, max: 10, index: true },
    topicCovered: { type: String, trim: true, maxlength: 500 },
    isCompensated: { type: Boolean, default: false },
    compensationDate: { type: Date },
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

attendanceSchema.index({ studentId: 1, subjectId: 1, date: 1, periodNumber: 1 }, { unique: true });
attendanceSchema.index({ subjectId: 1, date: 1, status: 1 });
attendanceSchema.index({ facultyId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ subjectId: 1, isActive: 1 });
attendanceSchema.index({ studentId: 1, isActive: 1 });
attendanceSchema.index({ date: -1, isActive: 1 });
attendanceSchema.index({ status: 1, isActive: 1 });
attendanceSchema.index({ createdAt: -1 });
attendanceSchema.index({ deletedAt: 1 });
attendanceSchema.index({ isActive: 1, status: 1 });
attendanceSchema.index({ sessionType: 1, date: 1 });

export const AttendanceModel: Model<AttendanceSchemaType> = model<AttendanceSchemaType>('Attendance', attendanceSchema);
