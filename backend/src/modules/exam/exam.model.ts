import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { ExamSchemaType } from './exam.types';

export type ExamDocument = HydratedDocument<ExamSchemaType>;
export { ExamSchemaType };

const examSchema = new Schema<ExamSchemaType>(
  {
    examId: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100, index: true },
    courseId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 12, index: true },
    academicYear: { type: String, required: true, trim: true, index: true },
    examType: { type: String, required: true, enum: ['THEORY', 'LAB', 'PRACTICAL', 'PROJECT', 'SEMINAR', 'VIVA'], index: true },
    maxMarks: { type: Number, required: true, min: 1, max: 1000 },
    passingMarks: { type: Number, required: true, min: 0, max: 1000 },
    durationMinutes: { type: Number, required: true, min: 1, max: 720 },
    status: { type: String, required: true, enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'RESULTS_PUBLISHED'], default: 'SCHEDULED', index: true },
    schedule: [
      {
        id: { type: String, required: true },
        date: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        room: { type: String, required: true, trim: true },
        invigilatorId: { type: String, required: true, index: true },
      },
    ],
    registrations: [
      {
        id: { type: String, required: true },
        studentId: { type: String, required: true, index: true },
        status: { type: String, required: true, enum: ['REGISTERED', 'ATTENDED', 'ABSENT', 'WITHDRAWN'], default: 'REGISTERED' },
        registeredAt: { type: Date, required: true },
      },
    ],
    results: [
      {
        id: { type: String, required: true },
        studentId: { type: String, required: true, index: true },
        marksObtained: { type: Number, required: true, min: 0 },
        grade: { type: String, required: true, trim: true },
        isPassed: { type: Boolean, required: true },
        remarks: { type: String, trim: true },
        publishedAt: { type: Date, required: true },
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

examSchema.index({ courseId: 1, code: 1 }, { unique: true });
examSchema.index({ courseId: 1, subjectId: 1 });
examSchema.index({ courseId: 1, semester: 1 });
examSchema.index({ courseId: 1, academicYear: 1 });
examSchema.index({ subjectId: 1, isActive: 1 });
examSchema.index({ examType: 1, isActive: 1 });
examSchema.index({ status: 1, isActive: 1 });
examSchema.index({ 'schedule.date': 1 });
examSchema.index({ 'schedule.room': 1 });
examSchema.index({ 'schedule.invigilatorId': 1 });
examSchema.index({ 'registrations.studentId': 1 });
examSchema.index({ 'results.studentId': 1 });
examSchema.index({ createdAt: -1 });
examSchema.index({ deletedAt: 1 });
examSchema.index({ isActive: 1, status: 1 });

examSchema.index({
  name: 'text',
  code: 'text',
  examId: 'text',
});

export const ExamModel: Model<ExamSchemaType> = model<ExamSchemaType>('Exam', examSchema);
