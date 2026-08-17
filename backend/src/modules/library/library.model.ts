import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type {
  BookSchemaType,
  BookCopySchemaType,
  BorrowingSchemaType,
  FineSchemaType,
  CategorySchemaType,
  AuthorSchemaType,
} from './library.types';

export type BookDocument = HydratedDocument<BookSchemaType>;
export type BookCopyDocument = HydratedDocument<BookCopySchemaType>;
export type BorrowingDocument = HydratedDocument<BorrowingSchemaType>;
export type FineDocument = HydratedDocument<FineSchemaType>;
export type CategoryDocument = HydratedDocument<CategorySchemaType>;
export type AuthorDocument = HydratedDocument<AuthorSchemaType>;

const bookSchema = new Schema<BookSchemaType>(
  {
    isbn: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200, index: true },
    author: { type: String, required: true, trim: true, maxlength: 100, index: true },
    categoryId: { type: String, required: true, index: true },
    publisher: { type: String, required: true, trim: true, maxlength: 100, index: true },
    publishYear: { type: Number, required: true, min: 1000, index: true },
    edition: { type: String, trim: true, maxlength: 50 },
    pages: { type: Number, required: true, min: 1 },
    language: { type: String, required: true, trim: true, maxlength: 50, index: true },
    subjectId: { type: String, trim: true, index: true },
    courseId: { type: String, trim: true, index: true },
    totalCopies: { type: Number, required: true, min: 1 },
    availableCopies: { type: Number, required: true, min: 0 },
    shelfNumber: { type: String, required: true, trim: true, maxlength: 50, index: true },
    description: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, required: true, enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], default: 'ACTIVE', index: true },
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

const bookCopySchema = new Schema<BookCopySchemaType>(
  {
    bookId: { type: String, required: true, index: true },
    copyNumber: { type: String, required: true, trim: true, maxlength: 50, index: true },
    status: { type: String, required: true, enum: ['AVAILABLE', 'BORROWED', 'RESERVED', 'LOST', 'DAMAGED', 'WITHDRAWN'], default: 'AVAILABLE', index: true },
    barcode: { type: String, required: true, unique: true, trim: true, maxlength: 50, index: true },
    condition: { type: String, required: true, enum: ['NEW', 'GOOD', 'FAIR', 'POOR'], default: 'GOOD' },
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

const borrowingSchema = new Schema<BorrowingSchemaType>(
  {
    bookCopyId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    borrowerType: { type: String, required: true, enum: ['STUDENT', 'FACULTY', 'STAFF'], default: 'STUDENT', index: true },
    borrowedDate: { type: Date, required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    returnedDate: { type: Date, index: true },
    status: { type: String, required: true, enum: ['BORROWED', 'RETURNED', 'OVERDUE', 'LOST'], default: 'BORROWED', index: true },
    fineAmount: { type: Number, required: true, min: 0, default: 0 },
    remarks: { type: String, trim: true, maxlength: 500 },
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

const fineSchema = new Schema<FineSchemaType>(
  {
    borrowingId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: ['OVERDUE', 'LOST', 'DAMAGE'], index: true },
    status: { type: String, required: true, enum: ['PENDING', 'PAID', 'WAIVED'], default: 'PENDING', index: true },
    paidDate: { type: Date },
    waivedBy: { type: String },
    waivedAt: { type: Date },
    waiverReason: { type: String, trim: true, maxlength: 500 },
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

const categorySchema = new Schema<CategorySchemaType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 20, index: true },
    description: { type: String, trim: true, maxlength: 500 },
    parentCategoryId: { type: String, trim: true, index: true },
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

const authorSchema = new Schema<AuthorSchemaType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100, index: true },
    nationality: { type: String, trim: true, maxlength: 50, index: true },
    biography: { type: String, trim: true, maxlength: 2000 },
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

bookSchema.index({ title: 'text', author: 'text', description: 'text', isbn: 'text' });
bookSchema.index({ categoryId: 1, isActive: 1 });
bookSchema.index({ subjectId: 1, courseId: 1, isActive: 1 });
bookSchema.index({ publishYear: -1 });
bookSchema.index({ publisher: 1, publishYear: -1 });
bookSchema.index({ status: 1, isActive: 1 });
bookSchema.index({ totalCopies: 1, availableCopies: 1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ deletedAt: 1 });
bookSchema.index({ isActive: 1, status: 1 });

bookCopySchema.index({ bookId: 1, status: 1, isActive: 1 });
bookCopySchema.index({ copyNumber: 1 });
bookCopySchema.index({ barcode: 1 });
bookCopySchema.index({ status: 1, isActive: 1 });
bookCopySchema.index({ createdAt: -1 });
bookCopySchema.index({ deletedAt: 1 });

borrowingSchema.index({ studentId: 1, status: 1, isActive: 1 });
borrowingSchema.index({ bookCopyId: 1, status: 1, isActive: 1 });
borrowingSchema.index({ dueDate: 1, status: 1 });
borrowingSchema.index({ borrowedDate: -1 });
borrowingSchema.index({ status: 1, isActive: 1 });
borrowingSchema.index({ createdAt: -1 });
borrowingSchema.index({ deletedAt: 1 });

fineSchema.index({ borrowingId: 1, status: 1 });
fineSchema.index({ studentId: 1, status: 1, isActive: 1 });
fineSchema.index({ status: 1, isActive: 1 });
fineSchema.index({ type: 1, status: 1 });
fineSchema.index({ createdAt: -1 });
fineSchema.index({ deletedAt: 1 });

categorySchema.index({ name: 'text', code: 'text', description: 'text' });
categorySchema.index({ parentCategoryId: 1, isActive: 1 });
categorySchema.index({ code: 1, isActive: 1 });
categorySchema.index({ createdAt: -1 });
categorySchema.index({ deletedAt: 1 });

authorSchema.index({ name: 'text', nationality: 'text', biography: 'text' });
authorSchema.index({ nationality: 1, isActive: 1 });
authorSchema.index({ createdAt: -1 });
authorSchema.index({ deletedAt: 1 });

export const BookModel: Model<BookSchemaType> = model<BookSchemaType>('Book', bookSchema);
export const BookCopyModel: Model<BookCopySchemaType> = model<BookCopySchemaType>('BookCopy', bookCopySchema);
export const BorrowingModel: Model<BorrowingSchemaType> = model<BorrowingSchemaType>('Borrowing', borrowingSchema);
export const FineModel: Model<FineSchemaType> = model<FineSchemaType>('Fine', fineSchema);
export const CategoryModel: Model<CategorySchemaType> = model<CategorySchemaType>('Category', categorySchema);
export const AuthorModel: Model<AuthorSchemaType> = model<AuthorSchemaType>('Author', authorSchema);

export { BookSchemaType, BookCopySchemaType, BorrowingSchemaType, FineSchemaType, CategorySchemaType, AuthorSchemaType };
