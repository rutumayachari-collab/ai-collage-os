export type BookStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';
export type BookCopyStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'WITHDRAWN';
export type BorrowingStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'LOST';
export type BorrowerType = 'STUDENT' | 'FACULTY' | 'STAFF';
export type FineStatus = 'PENDING' | 'PAID' | 'WAIVED';
export type FineType = 'OVERDUE' | 'LOST' | 'DAMAGE';
export type BookCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';

export interface BookSchemaType {
  isbn: string;
  title: string;
  author: string;
  categoryId: string;
  publisher: string;
  publishYear: number;
  edition?: string;
  pages: number;
  language: string;
  subjectId?: string;
  courseId?: string;
  totalCopies: number;
  availableCopies: number;
  shelfNumber: string;
  description?: string;
  status: BookStatus;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookCopySchemaType {
  bookId: string;
  copyNumber: string;
  status: BookCopyStatus;
  barcode: string;
  condition: BookCondition;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowingSchemaType {
  bookCopyId: string;
  studentId: string;
  borrowerType: BorrowerType;
  borrowedDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  status: BorrowingStatus;
  fineAmount: number;
  remarks?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FineSchemaType {
  borrowingId: string;
  studentId: string;
  amount: number;
  type: FineType;
  status: FineStatus;
  paidDate?: Date;
  waivedBy?: string;
  waivedAt?: Date;
  waiverReason?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategorySchemaType {
  name: string;
  code: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorSchemaType {
  name: string;
  nationality?: string;
  biography?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
