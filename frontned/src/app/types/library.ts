export type BookStatus = "AVAILABLE" | "BORROWED" | "RESERVED" | "MAINTENANCE" | "LOST";
export type BorrowingStatus = "BORROWED" | "RETURNED" | "OVERDUE" | "LOST";
export type BorrowerType = "STUDENT" | "FACULTY" | "STAFF";

export interface Book {
  id: string;
  bookId: string;
  isbn: string;
  title: string;
  author: string;
  categoryId?: string;
  categoryName?: string;
  publisher?: string;
  publishYear?: number;
  edition?: string;
  pages?: number;
  language: string;
  subjectId?: string;
  courseId?: string;
  totalCopies: number;
  availableCopies: number;
  shelfNumber?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookCopy {
  copyId: string;
  bookId: string;
  barcode: string;
  status: BookStatus;
  location: string;
  createdAt: string;
}

export interface Borrowing {
  id: string;
  borrowingId: string;
  bookId: string;
  bookTitle?: string;
  studentId: string;
  studentName?: string;
  borrowerType: BorrowerType;
  borrowedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: BorrowingStatus;
  fineAmount: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryStatistics {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalBorrowings: number;
  activeBorrowings: number;
  totalFines: number;
  collectedFines: number;
  pendingFines: number;
}
