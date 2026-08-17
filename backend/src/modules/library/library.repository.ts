import { BaseRepository } from '../../shared/repositories/base.repository';
import {
  BookModel,
  BookCopyModel,
  BorrowingModel,
  FineModel,
  CategoryModel,
  AuthorModel,
  type BookDocument,
  type BookCopyDocument,
  type BorrowingDocument,
  type FineDocument,
  type CategoryDocument,
  type AuthorDocument,
  type BookSchemaType,
  type BookCopySchemaType,
  type BorrowingSchemaType,
  type FineSchemaType,
  type CategorySchemaType,
  type AuthorSchemaType,
} from './library.model';

export class LibraryRepository extends BaseRepository<BookSchemaType> {
  constructor() {
    super(BookModel);
  }

  // ─── Books ──────────────────────────────────────────────────────────────────

  public async softDelete(id: string, deletedBy: string): Promise<boolean> {
    const result = await this.model.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  public async restore(id: string): Promise<BookDocument | null> {
    const result = await this.model.updateOne({ _id: id }, { $unset: { deletedAt: '', deletedBy: '' } }).exec();
    if (result.modifiedCount > 0) {
      return this.model.findById(id).exec();
    }
    return null;
  }

  public async findBookByIsbn(isbn: string): Promise<BookDocument | null> {
    return this.model.findOne({ isbn, deletedAt: { $exists: false } }).exec();
  }

  public async findBookById(id: string): Promise<BookDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  }

  public async listBooks(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: BookDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    return this.paginate(query, page, limit, sort);
  }

  public async searchBooks(searchQuery: string, page = 1, limit = 20): Promise<{ items: BookDocument[]; total: number }> {
    const filter = { $text: { $search: searchQuery }, deletedAt: { $exists: false } };
    const sort = { score: { $meta: 'textScore' } };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort as unknown as Record<string, 1 | -1>).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  public async filterBooks(filters: Record<string, unknown>, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: BookDocument[]; total: number }> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };

    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.courseId) query.courseId = filters.courseId;
    if (filters.publisher) query.publisher = filters.publisher;
    if (filters.language) query.language = filters.language;
    if (filters.publishYear) query.publishYear = filters.publishYear;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.status) query.status = filters.status;

    return this.paginate(query, page, limit, sort);
  }

  public async incrementAvailableCopies(bookId: string, count: number): Promise<BookDocument | null> {
    return this.model.findByIdAndUpdate(bookId, { $inc: { availableCopies: count }, updatedAt: new Date() }, { new: true }).exec();
  }

  public async decrementAvailableCopies(bookId: string): Promise<BookDocument | null> {
    return this.model.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 }, updatedAt: new Date() }, { new: true }).exec();
  }

  // ─── Book Copies ────────────────────────────────────────────────────────────

  public async findCopyById(id: string): Promise<BookCopyDocument | null> {
    return BookCopyModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  }

  public async findCopyByBarcode(barcode: string): Promise<BookCopyDocument | null> {
    return BookCopyModel.findOne({ barcode, deletedAt: { $exists: false } }).exec();
  }

  public async findCopiesByBook(bookId: string): Promise<BookCopyDocument[]> {
    return BookCopyModel.find({ bookId, deletedAt: { $exists: false } }).exec();
  }

  public async findAvailableCopiesByBook(bookId: string): Promise<BookCopyDocument[]> {
    return BookCopyModel.find({ bookId, status: 'AVAILABLE', deletedAt: { $exists: false } }).exec();
  }

  public async createCopy(payload: Partial<BookCopySchemaType>): Promise<BookCopyDocument> {
    return BookCopyModel.create(payload) as Promise<BookCopyDocument>;
  }

  public async updateCopyStatus(id: string, status: BookCopySchemaType['status']): Promise<BookCopyDocument | null> {
    return BookCopyModel.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true, runValidators: true }).exec();
  }

  public async updateCopy(id: string, update: Record<string, unknown>): Promise<BookCopyDocument | null> {
    return BookCopyModel.findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true, runValidators: true }).exec();
  }

  public async softDeleteCopy(id: string, deletedBy: string): Promise<boolean> {
    const result = await BookCopyModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  // ─── Borrowings ─────────────────────────────────────────────────────────────

  public async findBorrowingById(id: string): Promise<BorrowingDocument | null> {
    return BorrowingModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  }

  public async findActiveBorrowingByCopy(bookCopyId: string): Promise<BorrowingDocument | null> {
    return BorrowingModel.findOne({ bookCopyId, status: 'BORROWED', deletedAt: { $exists: false } }).exec();
  }

  public async findBorrowingsByStudent(studentId: string): Promise<BorrowingDocument[]> {
    return BorrowingModel.find({ studentId, deletedAt: { $exists: false } }).exec();
  }

  public async findActiveBorrowingsByStudent(studentId: string): Promise<BorrowingDocument[]> {
    return BorrowingModel.find({ studentId, status: 'BORROWED', deletedAt: { $exists: false } }).exec();
  }

  public async listBorrowings(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: BorrowingDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    const [items, total] = await Promise.all([
      BorrowingModel.find(query).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      BorrowingModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  public async createBorrowing(payload: Partial<BorrowingSchemaType>): Promise<BorrowingDocument> {
    return BorrowingModel.create(payload) as Promise<BorrowingDocument>;
  }

  public async updateBorrowingStatus(id: string, status: BorrowingSchemaType['status'], returnedDate?: Date): Promise<BorrowingDocument | null> {
    const update: Record<string, unknown> = { status, updatedAt: new Date() };
    if (returnedDate) update.returnedDate = returnedDate;
    return BorrowingModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  public async updateBorrowingFineAmount(id: string, fineAmount: number): Promise<BorrowingDocument | null> {
    return BorrowingModel.findByIdAndUpdate(id, { fineAmount, updatedAt: new Date() }, { new: true, runValidators: true }).exec();
  }

  public async softDeleteBorrowing(id: string, deletedBy: string): Promise<boolean> {
    const result = await BorrowingModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  // ─── Fines ──────────────────────────────────────────────────────────────────

  public async findFineById(id: string): Promise<FineDocument | null> {
    return FineModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  }

  public async findFineByBorrowing(borrowingId: string): Promise<FineDocument | null> {
    return FineModel.findOne({ borrowingId, deletedAt: { $exists: false } }).exec();
  }

  public async findPendingFinesByStudent(studentId: string): Promise<FineDocument[]> {
    return FineModel.find({ studentId, status: 'PENDING', deletedAt: { $exists: false } }).exec();
  }

  public async listFines(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: FineDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    const [items, total] = await Promise.all([
      FineModel.find(query).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      FineModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  public async createFine(payload: Partial<FineSchemaType>): Promise<FineDocument> {
    return FineModel.create(payload) as Promise<FineDocument>;
  }

  public async updateFineStatus(id: string, status: FineSchemaType['status'], paidDate?: Date, waivedBy?: string, waivedAt?: Date, waiverReason?: string): Promise<FineDocument | null> {
    const update: Record<string, unknown> = { status, updatedAt: new Date() };
    if (paidDate) update.paidDate = paidDate;
    if (waivedBy) update.waivedBy = waivedBy;
    if (waivedAt) update.waivedAt = waivedAt;
    if (waiverReason) update.waiverReason = waiverReason;
    return FineModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  public async softDeleteFine(id: string, deletedBy: string): Promise<boolean> {
    const result = await FineModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  // ─── Categories ─────────────────────────────────────────────────────────────

  public async findCategoryById(id: string): Promise<CategoryDocument | null> {
    return CategoryModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  }

  public async findCategoryByCode(code: string): Promise<CategoryDocument | null> {
    return CategoryModel.findOne({ code: code.toUpperCase(), deletedAt: { $exists: false } }).exec();
  }

  public async findCategoriesByParent(parentCategoryId?: string): Promise<CategoryDocument[]> {
    const query: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (parentCategoryId) {
      query.parentCategoryId = parentCategoryId;
    } else {
      query.parentCategoryId = { $exists: false };
    }
    return CategoryModel.find(query).exec();
  }

  public async listCategories(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: CategoryDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    const result = await this.paginate(query, page, limit, sort);
    return { items: result.items as unknown as CategoryDocument[], total: result.total };
  }

  public async createCategory(payload: Partial<CategorySchemaType>): Promise<CategoryDocument> {
    return CategoryModel.create(payload) as Promise<CategoryDocument>;
  }

  public async updateCategory(id: string, update: Record<string, unknown>): Promise<CategoryDocument | null> {
    return CategoryModel.findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true, runValidators: true }).exec();
  }

  public async softDeleteCategory(id: string, deletedBy: string): Promise<boolean> {
    const result = await CategoryModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  // ─── Authors ────────────────────────────────────────────────────────────────

  public async findAuthorById(id: string): Promise<AuthorDocument | null> {
    return AuthorModel.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  }

  public async findAuthorByName(name: string): Promise<AuthorDocument | null> {
    return AuthorModel.findOne({ name: name.trim(), deletedAt: { $exists: false } }).exec();
  }

  public async listAuthors(filter: Record<string, unknown> = {}, page = 1, limit = 20, sort: Record<string, 1 | -1> = { createdAt: -1 }): Promise<{ items: AuthorDocument[]; total: number }> {
    const query = { ...filter, deletedAt: { $exists: false } };
    const result = await this.paginate(query, page, limit, sort);
    return { items: result.items as unknown as AuthorDocument[], total: result.total };
  }

  public async createAuthor(payload: Partial<AuthorSchemaType>): Promise<AuthorDocument> {
    return AuthorModel.create(payload) as Promise<AuthorDocument>;
  }

  public async updateAuthor(id: string, update: Record<string, unknown>): Promise<AuthorDocument | null> {
    return AuthorModel.findByIdAndUpdate(id, { ...update, updatedAt: new Date() }, { new: true, runValidators: true }).exec();
  }

  public async softDeleteAuthor(id: string, deletedBy: string): Promise<boolean> {
    const result = await AuthorModel.updateOne({ _id: id }, { $set: { deletedAt: new Date(), deletedBy } }).exec();
    return result.modifiedCount > 0;
  }

  // ─── Existence ──────────────────────────────────────────────────────────────

  public async existsByIsbn(isbn: string): Promise<boolean> {
    return this.exists({ isbn, deletedAt: { $exists: false } });
  }

  public async existsByBarcode(barcode: string): Promise<boolean> {
    return BookCopyModel.exists({ barcode, deletedAt: { $exists: false } }) !== null;
  }

  public async existsByCategoryCode(code: string): Promise<boolean> {
    return CategoryModel.exists({ code: code.toUpperCase(), deletedAt: { $exists: false } }) !== null;
  }

  public async existsByAuthorName(name: string): Promise<boolean> {
    return AuthorModel.exists({ name: name.trim(), deletedAt: { $exists: false } }) !== null;
  }

  // ─── Bulk ───────────────────────────────────────────────────────────────────

  public async bulkCreateBooks(books: Partial<BookSchemaType>[]): Promise<BookDocument[]> {
    return BookModel.insertMany(books, { ordered: true }) as Promise<BookDocument[]>;
  }

  public async bulkCreateCopies(copies: Partial<BookCopySchemaType>[]): Promise<BookCopyDocument[]> {
    return BookCopyModel.insertMany(copies, { ordered: true }) as Promise<BookCopyDocument[]>;
  }
}

export const libraryRepository = new LibraryRepository();
