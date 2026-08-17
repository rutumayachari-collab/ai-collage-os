import { z } from 'zod';
import { objectIdSchema } from '../../shared/validators';

export const createBookSchema = z.object({
  isbn: z.string().trim().min(1, 'ISBN is required').max(20),
  title: z.string().trim().min(1, 'Title is required').max(200),
  author: z.string().trim().min(1, 'Author is required').max(100),
  categoryId: objectIdSchema,
  publisher: z.string().trim().min(1, 'Publisher is required').max(100),
  publishYear: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1),
  edition: z.string().trim().max(50).optional().or(z.literal('')),
  pages: z.coerce.number().int().min(1),
  language: z.string().trim().min(1, 'Language is required').max(50),
  subjectId: z.string().trim().optional().or(z.literal('')),
  courseId: z.string().trim().optional().or(z.literal('')),
  totalCopies: z.coerce.number().int().min(1),
  shelfNumber: z.string().trim().min(1, 'Shelf number is required').max(50),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
  isActive: z.boolean().default(true),
});

export const updateBookSchema = createBookSchema.partial().omit({
  isbn: true,
  totalCopies: true,
});

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  subjectId: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  language: z.string().trim().optional(),
  publishYear: z.coerce.number().int().min(1000).optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
});

export const createBookCopySchema = z.object({
  bookId: objectIdSchema,
  copyNumber: z.string().trim().min(1, 'Copy number is required').max(50),
  barcode: z.string().trim().min(1, 'Barcode is required').max(50),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']).default('GOOD'),
  isActive: z.boolean().default(true),
});

export const updateBookCopySchema = z.object({
  status: z.enum(['AVAILABLE', 'BORROWED', 'RESERVED', 'LOST', 'DAMAGED', 'WITHDRAWN']).optional(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  isActive: z.boolean().optional(),
});

export const createBorrowingSchema = z.object({
  bookCopyId: objectIdSchema,
  studentId: objectIdSchema,
  borrowerType: z.enum(['STUDENT', 'FACULTY', 'STAFF']).default('STUDENT'),
  dueDate: z.coerce.date(),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const returnBookSchema = z.object({
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const createFineSchema = z.object({
  borrowingId: objectIdSchema,
  amount: z.coerce.number().min(0, 'Amount must be non-negative'),
  type: z.enum(['OVERDUE', 'LOST', 'DAMAGE']),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const payFineSchema = z.object({});

export const waiveFineSchema = z.object({
  waiverReason: z.string().trim().min(1, 'Waiver reason is required').max(500),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  code: z.string().trim().min(1, 'Code is required').max(20),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  parentCategoryId: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createAuthorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  nationality: z.string().trim().max(50).optional().or(z.literal('')),
  biography: z.string().trim().max(2000).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const updateAuthorSchema = createAuthorSchema.partial();

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQueryInput = z.infer<typeof bookQuerySchema>;
export type CreateBookCopyInput = z.infer<typeof createBookCopySchema>;
export type UpdateBookCopyInput = z.infer<typeof updateBookCopySchema>;
export type CreateBorrowingInput = z.infer<typeof createBorrowingSchema>;
export type ReturnBookInput = z.infer<typeof returnBookSchema>;
export type CreateFineInput = z.infer<typeof createFineSchema>;
export type PayFineInput = z.infer<typeof payFineSchema>;
export type WaiveFineInput = z.infer<typeof waiveFineSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
