import { ConflictError, NotFoundError, BadRequestError } from '../../shared/utils/api-error.util';
import { libraryRepository } from './library.repository';
import type {
  BookDocument,
  BookCopyDocument,
  BorrowingDocument,
  FineDocument,
  CategoryDocument,
  AuthorDocument,
  BorrowingSchemaType,
} from './library.model';
import type {
  CreateBookInput,
  UpdateBookInput,
  BookQueryInput,
  CreateBookCopyInput,
  UpdateBookCopyInput,
  CreateBorrowingInput,
  ReturnBookInput,
  CreateFineInput,
  PayFineInput,
  WaiveFineInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateAuthorInput,
  UpdateAuthorInput,
} from './library.validator';

export class LibraryService {
  public readonly OVERDUE_FINE_PER_DAY = 5;
  public readonly LOST_BOOK_FINE_MULTIPLIER = 2;

  // ─── Books ──────────────────────────────────────────────────────────────────

  public async createBook(input: CreateBookInput, createdBy: string): Promise<BookDocument> {
    const normalizedIsbn = input.isbn.trim();

    if (await libraryRepository.existsByIsbn(normalizedIsbn)) {
      throw new ConflictError('A book with this ISBN already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return libraryRepository.create({
      ...cleanedInput,
      isbn: normalizedIsbn,
      totalCopies: input.totalCopies,
      availableCopies: input.totalCopies,
      status: input.status || 'ACTIVE',
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateBook(id: string, input: UpdateBookInput, updatedBy: string): Promise<BookDocument | null> {
    const book = await libraryRepository.findBookById(id);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    if (book.deletedAt) {
      throw new BadRequestError('Cannot update a deleted book');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return libraryRepository.updateById(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async getBook(id: string): Promise<BookDocument | null> {
    return libraryRepository.findBookById(id);
  }

  public async getBookByIsbn(isbn: string): Promise<BookDocument | null> {
    return libraryRepository.findBookByIsbn(isbn);
  }

  public async deleteBook(id: string, deletedBy: string): Promise<void> {
    const book = await libraryRepository.findBookById(id);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    if (book.deletedAt) {
      throw new BadRequestError('Book is already deleted');
    }

    await libraryRepository.softDelete(id, deletedBy);
  }

  public async listBooks(query: BookQueryInput): Promise<{ items: BookDocument[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.courseId) filter.courseId = query.courseId;
    if (query.publisher) filter.publisher = query.publisher;
    if (query.language) filter.language = query.language;
    if (query.publishYear) filter.publishYear = query.publishYear;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.status) filter.status = query.status;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    return libraryRepository.listBooks(filter, query.page, query.limit, sortOption);
  }

  public async searchBooks(searchQuery: string, page = 1, limit = 20): Promise<{ items: BookDocument[]; total: number }> {
    return libraryRepository.searchBooks(searchQuery, page, limit);
  }

  public async filterBooks(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: BookDocument[]; total: number }> {
    return libraryRepository.filterBooks(filters, page, limit, sort);
  }

  // ─── Book Copies ────────────────────────────────────────────────────────────

  public async createBookCopy(input: CreateBookCopyInput, createdBy: string): Promise<BookCopyDocument> {
    const book = await libraryRepository.findBookById(input.bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    if (book.deletedAt) {
      throw new BadRequestError('Cannot add copy to a deleted book');
    }

    if (await libraryRepository.existsByBarcode(input.barcode)) {
      throw new ConflictError('A book copy with this barcode already exists');
    }

    const copy = await libraryRepository.createCopy({
      ...input,
      bookId: input.bookId,
      status: 'AVAILABLE',
      createdBy,
      updatedBy: createdBy,
    });

    await libraryRepository.incrementAvailableCopies(input.bookId, 1);
    await libraryRepository.updateById(input.bookId, { totalCopies: book.totalCopies + 1, updatedBy: createdBy, updatedAt: new Date() });

    return copy;
  }

  public async updateBookCopy(id: string, input: UpdateBookCopyInput, updatedBy: string): Promise<BookCopyDocument | null> {
    const copy = await libraryRepository.findCopyById(id);
    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }

    if (copy.deletedAt) {
      throw new BadRequestError('Cannot update a deleted book copy');
    }

    return libraryRepository.updateCopy(id, {
      ...input,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async getBookCopy(id: string): Promise<BookCopyDocument | null> {
    return libraryRepository.findCopyById(id);
  }

  public async deleteBookCopy(id: string, deletedBy: string): Promise<void> {
    const copy = await libraryRepository.findCopyById(id);
    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }

    if (copy.deletedAt) {
      throw new BadRequestError('Book copy is already deleted');
    }

    if (copy.status === 'BORROWED') {
      throw new BadRequestError('Cannot delete a borrowed book copy');
    }

    await libraryRepository.softDeleteCopy(id, deletedBy);
  }

  public async listBookCopies(bookId: string): Promise<BookCopyDocument[]> {
    return libraryRepository.findCopiesByBook(bookId);
  }

  // ─── Borrowings ─────────────────────────────────────────────────────────────

  public async createBorrowing(input: CreateBorrowingInput, createdBy: string): Promise<BorrowingDocument> {
    const copy = await libraryRepository.findCopyById(input.bookCopyId);
    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }

    if (copy.status !== 'AVAILABLE') {
      throw new BadRequestError('Book copy is not available for borrowing');
    }

    const activeBorrowing = await libraryRepository.findActiveBorrowingByCopy(input.bookCopyId);
    if (activeBorrowing) {
      throw new BadRequestError('This book copy is already borrowed');
    }

    const book = await libraryRepository.findBookById(copy.bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    const now = new Date();
    const dueDate = input.dueDate instanceof Date ? input.dueDate : new Date(input.dueDate);

    const borrowing = await libraryRepository.createBorrowing({
      bookCopyId: input.bookCopyId,
      studentId: input.studentId,
      borrowerType: input.borrowerType,
      borrowedDate: now,
      dueDate,
      status: 'BORROWED',
      fineAmount: 0,
      remarks: input.remarks,
      isActive: true,
      createdBy,
      updatedBy: createdBy,
    });

    await libraryRepository.updateCopyStatus(input.bookCopyId, 'BORROWED');
    await libraryRepository.decrementAvailableCopies(copy.bookId);

    return borrowing;
  }

  public async returnBook(id: string, _input: ReturnBookInput, updatedBy: string): Promise<BorrowingDocument> {
    const borrowing = await libraryRepository.findBorrowingById(id);
    if (!borrowing) {
      throw new NotFoundError('Borrowing record not found');
    }

    if (borrowing.status === 'RETURNED') {
      throw new BadRequestError('Book is already returned');
    }

    if (borrowing.status === 'LOST') {
      throw new BadRequestError('Lost book cannot be returned through this endpoint');
    }

    const now = new Date();
    const dueDate = borrowing.dueDate instanceof Date ? borrowing.dueDate : new Date(borrowing.dueDate);
    const isOverdue = now > dueDate;
    const newStatus: BorrowingSchemaType['status'] = isOverdue ? 'OVERDUE' : 'RETURNED';
    const overdueDays = isOverdue ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const updatedBorrowing = await libraryRepository.updateBorrowingStatus(id, newStatus, now);
    if (!updatedBorrowing) {
      throw new NotFoundError('Borrowing record not found');
    }

    const copy = await libraryRepository.findCopyById(borrowing.bookCopyId);
    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }

    await libraryRepository.updateCopyStatus(borrowing.bookCopyId, 'AVAILABLE');
    await libraryRepository.incrementAvailableCopies(copy.bookId, 1);

    if (isOverdue && overdueDays > 0) {
      const overdueFine = overdueDays * this.OVERDUE_FINE_PER_DAY;
      await libraryRepository.createFine({
        borrowingId: id,
        studentId: borrowing.studentId,
        amount: overdueFine,
        type: 'OVERDUE',
        status: 'PENDING',
        isActive: true,
        createdBy: updatedBy,
        updatedBy: updatedBy,
      });
      await libraryRepository.updateBorrowingFineAmount(id, overdueFine);
    }

    return updatedBorrowing;
  }

  public async markAsLost(id: string, updatedBy: string): Promise<BorrowingDocument> {
    const borrowing = await libraryRepository.findBorrowingById(id);
    if (!borrowing) {
      throw new NotFoundError('Borrowing record not found');
    }

    if (borrowing.status === 'RETURNED' || borrowing.status === 'LOST') {
      throw new BadRequestError('Cannot mark this borrowing as lost');
    }

    const copy = await libraryRepository.findCopyById(borrowing.bookCopyId);
    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }

    const updatedBorrowing = await libraryRepository.updateBorrowingStatus(id, 'LOST');
    if (!updatedBorrowing) {
      throw new NotFoundError('Borrowing record not found');
    }

    await libraryRepository.updateCopyStatus(borrowing.bookCopyId, 'LOST');
    await libraryRepository.decrementAvailableCopies(copy.bookId);

    const book = await libraryRepository.findBookById(copy.bookId);
    if (book) {
      const lostFine = book.pages * this.LOST_BOOK_FINE_MULTIPLIER;
      await libraryRepository.createFine({
        borrowingId: id,
        studentId: borrowing.studentId,
        amount: lostFine,
        type: 'LOST',
        status: 'PENDING',
        isActive: true,
        createdBy: updatedBy,
        updatedBy: updatedBy,
      });
      await libraryRepository.updateBorrowingFineAmount(id, lostFine);
    }

    return updatedBorrowing;
  }

  public async getBorrowing(id: string): Promise<BorrowingDocument | null> {
    return libraryRepository.findBorrowingById(id);
  }

  public async getBorrowingsByStudent(studentId: string): Promise<BorrowingDocument[]> {
    return libraryRepository.findBorrowingsByStudent(studentId);
  }

  public async getActiveBorrowingsByStudent(studentId: string): Promise<BorrowingDocument[]> {
    return libraryRepository.findActiveBorrowingsByStudent(studentId);
  }

  public async listBorrowings(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: BorrowingDocument[]; total: number }> {
    return libraryRepository.listBorrowings(filter, page, limit, sort);
  }

  public async deleteBorrowing(id: string, deletedBy: string): Promise<void> {
    const borrowing = await libraryRepository.findBorrowingById(id);
    if (!borrowing) {
      throw new NotFoundError('Borrowing record not found');
    }

    if (borrowing.deletedAt) {
      throw new BadRequestError('Borrowing record is already deleted');
    }

    await libraryRepository.softDeleteBorrowing(id, deletedBy);
  }

  // ─── Fines ──────────────────────────────────────────────────────────────────

  public async createFine(input: CreateFineInput, createdBy: string): Promise<FineDocument> {
    const borrowing = await libraryRepository.findBorrowingById(input.borrowingId);
    if (!borrowing) {
      throw new NotFoundError('Borrowing record not found');
    }

    const existingFine = await libraryRepository.findFineByBorrowing(input.borrowingId);
    if (existingFine) {
      throw new ConflictError('A fine already exists for this borrowing');
    }

    return libraryRepository.createFine({
      ...input,
      studentId: borrowing.studentId,
      status: 'PENDING',
      isActive: true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async payFine(id: string, _input: PayFineInput, _updatedBy: string): Promise<FineDocument> {
    const fine = await libraryRepository.findFineById(id);
    if (!fine) {
      throw new NotFoundError('Fine not found');
    }

    if (fine.status === 'PAID') {
      throw new BadRequestError('Fine is already paid');
    }

    if (fine.status === 'WAIVED') {
      throw new BadRequestError('Waived fine cannot be paid');
    }

    return libraryRepository.updateFineStatus(id, 'PAID', new Date(), undefined, undefined, undefined) as Promise<FineDocument>;
  }

  public async waiveFine(id: string, input: WaiveFineInput, updatedBy: string): Promise<FineDocument> {
    const fine = await libraryRepository.findFineById(id);
    if (!fine) {
      throw new NotFoundError('Fine not found');
    }

    if (fine.status === 'PAID') {
      throw new BadRequestError('Paid fine cannot be waived');
    }

    if (fine.status === 'WAIVED') {
      throw new BadRequestError('Fine is already waived');
    }

    return libraryRepository.updateFineStatus(id, 'WAIVED', undefined, updatedBy, new Date(), input.waiverReason) as Promise<FineDocument>;
  }

  public async getFine(id: string): Promise<FineDocument | null> {
    return libraryRepository.findFineById(id);
  }

  public async getPendingFinesByStudent(studentId: string): Promise<FineDocument[]> {
    return libraryRepository.findPendingFinesByStudent(studentId);
  }

  public async listFines(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: FineDocument[]; total: number }> {
    return libraryRepository.listFines(filter, page, limit, sort);
  }

  public async deleteFine(id: string, deletedBy: string): Promise<void> {
    const fine = await libraryRepository.findFineById(id);
    if (!fine) {
      throw new NotFoundError('Fine not found');
    }

    if (fine.deletedAt) {
      throw new BadRequestError('Fine is already deleted');
    }

    await libraryRepository.softDeleteFine(id, deletedBy);
  }

  // ─── Categories ─────────────────────────────────────────────────────────────

  public async createCategory(input: CreateCategoryInput, createdBy: string): Promise<CategoryDocument> {
    const normalizedCode = input.code.trim().toUpperCase();

    if (await libraryRepository.existsByCategoryCode(normalizedCode)) {
      throw new ConflictError('A category with this code already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return libraryRepository.createCategory({
      ...cleanedInput,
      code: normalizedCode,
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateCategory(id: string, input: UpdateCategoryInput, updatedBy: string): Promise<CategoryDocument | null> {
    const category = await libraryRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category.deletedAt) {
      throw new BadRequestError('Cannot update a deleted category');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return libraryRepository.updateCategory(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async getCategory(id: string): Promise<CategoryDocument | null> {
    return libraryRepository.findCategoryById(id);
  }

  public async getCategoryByCode(code: string): Promise<CategoryDocument | null> {
    return libraryRepository.findCategoryByCode(code);
  }

  public async listCategories(): Promise<CategoryDocument[]> {
    return libraryRepository.listCategories({}, 1, 1000).then(r => r.items);
  }

  public async listSubCategories(parentCategoryId?: string): Promise<CategoryDocument[]> {
    return libraryRepository.findCategoriesByParent(parentCategoryId);
  }

  public async deleteCategory(id: string, deletedBy: string): Promise<void> {
    const category = await libraryRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (category.deletedAt) {
      throw new BadRequestError('Category is already deleted');
    }

    await libraryRepository.softDeleteCategory(id, deletedBy);
  }

  // ─── Authors ────────────────────────────────────────────────────────────────

  public async createAuthor(input: CreateAuthorInput, createdBy: string): Promise<AuthorDocument> {
    const normalizedName = input.name.trim();

    if (await libraryRepository.existsByAuthorName(normalizedName)) {
      throw new ConflictError('An author with this name already exists');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return libraryRepository.createAuthor({
      ...cleanedInput,
      name: normalizedName,
      isActive: input.isActive ?? true,
      createdBy,
      updatedBy: createdBy,
    });
  }

  public async updateAuthor(id: string, input: UpdateAuthorInput, updatedBy: string): Promise<AuthorDocument | null> {
    const author = await libraryRepository.findAuthorById(id);
    if (!author) {
      throw new NotFoundError('Author not found');
    }

    if (author.deletedAt) {
      throw new BadRequestError('Cannot update a deleted author');
    }

    const cleanedInput = this.cleanEmptyStrings(input);

    return libraryRepository.updateAuthor(id, {
      ...cleanedInput,
      updatedBy,
      updatedAt: new Date(),
    });
  }

  public async getAuthor(id: string): Promise<AuthorDocument | null> {
    return libraryRepository.findAuthorById(id);
  }

  public async listAuthors(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: AuthorDocument[]; total: number }> {
    return libraryRepository.listAuthors(filter, page, limit, sort);
  }

  public async deleteAuthor(id: string, deletedBy: string): Promise<void> {
    const author = await libraryRepository.findAuthorById(id);
    if (!author) {
      throw new NotFoundError('Author not found');
    }

    if (author.deletedAt) {
      throw new BadRequestError('Author is already deleted');
    }

    await libraryRepository.softDeleteAuthor(id, deletedBy);
  }

  // ─── Bulk ───────────────────────────────────────────────────────────────────

  public async bulkCreateBooks(books: CreateBookInput[], createdBy: string): Promise<{ created: number; failed: number; errors: string[] }> {
    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const bookData of books) {
      try {
        await this.createBook(bookData, createdBy);
        created++;
      } catch (error) {
        failed++;
        errors.push(`${bookData.isbn || 'unknown'}: ${(error as Error).message}`);
      }
    }

    return { created, failed, errors };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private cleanEmptyStrings(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === '' || value === null || value === undefined) {
        continue;
      }
      if (value instanceof Date) {
        cleaned[key] = value;
        continue;
      }
      if (Array.isArray(value)) {
        cleaned[key] = value.map((item) => (typeof item === 'object' && item !== null && !(item instanceof Date) ? this.cleanEmptyStrings(item as Record<string, unknown>) : item));
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        cleaned[key] = this.cleanEmptyStrings(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
}

export const libraryService = new LibraryService();
