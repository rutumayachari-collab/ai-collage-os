import type { AuthenticatedRequest } from '../../shared/types';
import type { Request, Response } from 'express';
import { HttpStatus } from '../../shared/constants';
import { asyncHandler, sendSuccess } from '../../shared/utils';
import { LibraryService, libraryService } from './library.service';
import { NotFoundError, UnauthorizedError } from '../../shared/utils/api-error.util';
import {
  createBookSchema,
  updateBookSchema,
  bookQuerySchema,
  createBookCopySchema,
  updateBookCopySchema,
  createBorrowingSchema,
  returnBookSchema,
  createFineSchema,
  payFineSchema,
  waiveFineSchema,
  createCategorySchema,
  updateCategorySchema,
  createAuthorSchema,
  updateAuthorSchema,
  type CreateBookInput,
  type UpdateBookInput,
  type BookQueryInput,
  type CreateBookCopyInput,
  type UpdateBookCopyInput,
  type CreateBorrowingInput,
  type ReturnBookInput,
  type CreateFineInput,
  type PayFineInput,
  type WaiveFineInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CreateAuthorInput,
  type UpdateAuthorInput,
} from './library.validator';

export class LibraryController {
  constructor(private readonly service: LibraryService) {}

  // ─── Books ──────────────────────────────────────────────────────────────────

  public createBook = asyncHandler(async (req: Request, res: Response) => {
    const input = createBookSchema.parse(req.body) as CreateBookInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const book = await this.service.createBook(input, user.id);
    sendSuccess(res, {
      message: 'Book created successfully',
      data: book,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateBook = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateBookSchema.parse(req.body) as UpdateBookInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const book = await this.service.updateBook(id, input, user.id);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    sendSuccess(res, { message: 'Book updated successfully', data: book });
  });

  public getBook = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const book = await this.service.getBook(id);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    sendSuccess(res, { message: 'Book fetched successfully', data: book });
  });

  public getBookByIsbn = asyncHandler(async (req: Request, res: Response) => {
    const { isbn } = req.params;
    const book = await this.service.getBookByIsbn(isbn);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    sendSuccess(res, { message: 'Book fetched successfully', data: book });
  });

  public deleteBook = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteBook(id, user.id);
    sendSuccess(res, { message: 'Book deleted successfully' });
  });

  public listBooks = asyncHandler(async (req: Request, res: Response) => {
    const query = bookQuerySchema.parse(req.query) as BookQueryInput;
    const { items, total } = await this.service.listBooks(query);
    sendSuccess(res, {
      message: 'Books fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public searchBooks = asyncHandler(async (req: Request, res: Response) => {
    const query = bookQuerySchema.parse(req.query) as BookQueryInput;
    const { items, total } = await this.service.searchBooks(query.search || '', query.page, query.limit);
    sendSuccess(res, {
      message: 'Search results fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public filterBooks = asyncHandler(async (req: Request, res: Response) => {
    const query = bookQuerySchema.parse(req.query) as BookQueryInput;
    const filters: Record<string, unknown> = {};
    if (query.categoryId) filters.categoryId = query.categoryId;
    if (query.subjectId) filters.subjectId = query.subjectId;
    if (query.courseId) filters.courseId = query.courseId;
    if (query.publisher) filters.publisher = query.publisher;
    if (query.language) filters.language = query.language;
    if (query.publishYear) filters.publishYear = query.publishYear;
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.status) filters.status = query.status;

    const sortOption: Record<string, 1 | -1> = {};
    if (query.sort) {
      sortOption[query.sort] = query.order === 'asc' ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }

    const { items, total } = await this.service.filterBooks(filters, query.page, query.limit, sortOption);
    sendSuccess(res, {
      message: 'Filtered books fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  // ─── Book Copies ────────────────────────────────────────────────────────────

  public createBookCopy = asyncHandler(async (req: Request, res: Response) => {
    const input = createBookCopySchema.parse(req.body) as CreateBookCopyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const copy = await this.service.createBookCopy(input, user.id);
    sendSuccess(res, {
      message: 'Book copy created successfully',
      data: copy,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateBookCopy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateBookCopySchema.parse(req.body) as UpdateBookCopyInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const copy = await this.service.updateBookCopy(id, input, user.id);
    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }
    sendSuccess(res, { message: 'Book copy updated successfully', data: copy });
  });

  public getBookCopy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const copy = await this.service.getBookCopy(id);
    if (!copy) {
      throw new NotFoundError('Book copy not found');
    }
    sendSuccess(res, { message: 'Book copy fetched successfully', data: copy });
  });

  public deleteBookCopy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteBookCopy(id, user.id);
    sendSuccess(res, { message: 'Book copy deleted successfully' });
  });

  public listBookCopies = asyncHandler(async (req: Request, res: Response) => {
    const { bookId } = req.params;
    const copies = await this.service.listBookCopies(bookId);
    sendSuccess(res, { message: 'Book copies fetched successfully', data: copies });
  });

  // ─── Borrowings ─────────────────────────────────────────────────────────────

  public createBorrowing = asyncHandler(async (req: Request, res: Response) => {
    const input = createBorrowingSchema.parse(req.body) as CreateBorrowingInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const borrowing = await this.service.createBorrowing(input, user.id);
    sendSuccess(res, {
      message: 'Book borrowed successfully',
      data: borrowing,
      statusCode: HttpStatus.CREATED,
    });
  });

  public returnBook = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = returnBookSchema.parse(req.body) as ReturnBookInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const borrowing = await this.service.returnBook(id, input, user.id);
    sendSuccess(res, { message: 'Book returned successfully', data: borrowing });
  });

  public markAsLost = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const borrowing = await this.service.markAsLost(id, user.id);
    sendSuccess(res, { message: 'Book marked as lost successfully', data: borrowing });
  });

  public getBorrowing = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const borrowing = await this.service.getBorrowing(id);
    if (!borrowing) {
      throw new NotFoundError('Borrowing record not found');
    }
    sendSuccess(res, { message: 'Borrowing record fetched successfully', data: borrowing });
  });

  public getBorrowingsByStudent = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const borrowings = await this.service.getBorrowingsByStudent(studentId);
    sendSuccess(res, { message: 'Borrowings fetched successfully', data: borrowings });
  });

  public getMyBorrowings = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const borrowings = await this.service.getBorrowingsByStudent(user.id);
    sendSuccess(res, { message: 'Your borrowings fetched successfully', data: borrowings });
  });

  public listBorrowings = asyncHandler(async (req: Request, res: Response) => {
    const query = bookQuerySchema.parse(req.query) as BookQueryInput;
    const { items, total } = await this.service.listBorrowings({}, query.page, query.limit);
    sendSuccess(res, {
      message: 'Borrowings fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public deleteBorrowing = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteBorrowing(id, user.id);
    sendSuccess(res, { message: 'Borrowing record deleted successfully' });
  });

  // ─── Fines ──────────────────────────────────────────────────────────────────

  public createFine = asyncHandler(async (req: Request, res: Response) => {
    const input = createFineSchema.parse(req.body) as CreateFineInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const fine = await this.service.createFine(input, user.id);
    sendSuccess(res, {
      message: 'Fine created successfully',
      data: fine,
      statusCode: HttpStatus.CREATED,
    });
  });

  public payFine = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = payFineSchema.parse(req.body) as PayFineInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const fine = await this.service.payFine(id, input, user.id);
    sendSuccess(res, { message: 'Fine paid successfully', data: fine });
  });

  public waiveFine = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = waiveFineSchema.parse(req.body) as WaiveFineInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const fine = await this.service.waiveFine(id, input, user.id);
    sendSuccess(res, { message: 'Fine waived successfully', data: fine });
  });

  public getFine = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const fine = await this.service.getFine(id);
    if (!fine) {
      throw new NotFoundError('Fine not found');
    }
    sendSuccess(res, { message: 'Fine fetched successfully', data: fine });
  });

  public getMyFines = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const fines = await this.service.getPendingFinesByStudent(user.id);
    sendSuccess(res, { message: 'Your fines fetched successfully', data: fines });
  });

  public listFines = asyncHandler(async (req: Request, res: Response) => {
    const query = bookQuerySchema.parse(req.query) as BookQueryInput;
    const { items, total } = await this.service.listFines({}, query.page, query.limit);
    sendSuccess(res, {
      message: 'Fines fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public deleteFine = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteFine(id, user.id);
    sendSuccess(res, { message: 'Fine deleted successfully' });
  });

  // ─── Categories ─────────────────────────────────────────────────────────────

  public createCategory = asyncHandler(async (req: Request, res: Response) => {
    const input = createCategorySchema.parse(req.body) as CreateCategoryInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const category = await this.service.createCategory(input, user.id);
    sendSuccess(res, {
      message: 'Category created successfully',
      data: category,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateCategorySchema.parse(req.body) as UpdateCategoryInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const category = await this.service.updateCategory(id, input, user.id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    sendSuccess(res, { message: 'Category updated successfully', data: category });
  });

  public getCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const category = await this.service.getCategory(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    sendSuccess(res, { message: 'Category fetched successfully', data: category });
  });

  public getCategoryByCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const category = await this.service.getCategoryByCode(code);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    sendSuccess(res, { message: 'Category fetched successfully', data: category });
  });

  public listCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await this.service.listCategories();
    sendSuccess(res, { message: 'Categories fetched successfully', data: categories });
  });

  public listSubCategories = asyncHandler(async (req: Request, res: Response) => {
    const { parentCategoryId } = req.params;
    const categories = await this.service.listSubCategories(parentCategoryId || undefined);
    sendSuccess(res, { message: 'Sub-categories fetched successfully', data: categories });
  });

  public deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteCategory(id, user.id);
    sendSuccess(res, { message: 'Category deleted successfully' });
  });

  // ─── Authors ────────────────────────────────────────────────────────────────

  public createAuthor = asyncHandler(async (req: Request, res: Response) => {
    const input = createAuthorSchema.parse(req.body) as CreateAuthorInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const author = await this.service.createAuthor(input, user.id);
    sendSuccess(res, {
      message: 'Author created successfully',
      data: author,
      statusCode: HttpStatus.CREATED,
    });
  });

  public updateAuthor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const input = updateAuthorSchema.parse(req.body) as UpdateAuthorInput;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    const author = await this.service.updateAuthor(id, input, user.id);
    if (!author) {
      throw new NotFoundError('Author not found');
    }
    sendSuccess(res, { message: 'Author updated successfully', data: author });
  });

  public getAuthor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const author = await this.service.getAuthor(id);
    if (!author) {
      throw new NotFoundError('Author not found');
    }
    sendSuccess(res, { message: 'Author fetched successfully', data: author });
  });

  public listAuthors = asyncHandler(async (req: Request, res: Response) => {
    const query = bookQuerySchema.parse(req.query) as BookQueryInput;
    const { items, total } = await this.service.listAuthors({}, query.page, query.limit);
    sendSuccess(res, {
      message: 'Authors fetched successfully',
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
    });
  });

  public deleteAuthor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }
    await this.service.deleteAuthor(id, user.id);
    sendSuccess(res, { message: 'Author deleted successfully' });
  });
}

export const libraryController = new LibraryController(libraryService);
