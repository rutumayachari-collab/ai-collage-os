import { Router, type NextFunction, type Request, type Response } from 'express';
import { libraryController } from './library.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate-request.middleware';
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
} from './library.validator';

const router: Router = Router();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const libraryRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMITED',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  entry.count += 1;
  next();
};

// ─── Books ───────────────────────────────────────────────────────────────────

router.get('/', libraryRateLimiter, validateRequest({ query: bookQuerySchema }), libraryController.listBooks);
router.get('/search', libraryRateLimiter, validateRequest({ query: bookQuerySchema }), libraryController.searchBooks);
router.get('/filter', libraryRateLimiter, validateRequest({ query: bookQuerySchema }), libraryController.filterBooks);
router.get('/isbn/:isbn', libraryRateLimiter, libraryController.getBookByIsbn);
router.get('/:id', libraryRateLimiter, libraryController.getBook);

router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: createBookSchema }), libraryController.createBook);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: updateBookSchema }), libraryController.updateBook);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, libraryController.deleteBook);

// ─── Book Copies ─────────────────────────────────────────────────────────────

router.get('/:bookId/copies', libraryRateLimiter, libraryController.listBookCopies);
router.get('/:bookId/copies/:copyId', libraryRateLimiter, libraryController.getBookCopy);

router.post('/:bookId/copies', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: createBookCopySchema }), libraryController.createBookCopy);
router.patch('/:bookId/copies/:copyId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: updateBookCopySchema }), libraryController.updateBookCopy);
router.delete('/:bookId/copies/:copyId', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, libraryController.deleteBookCopy);

// ─── Borrowings ──────────────────────────────────────────────────────────────

router.get('/borrowings', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ query: bookQuerySchema }), libraryController.listBorrowings);
router.get('/borrowings/student/:studentId', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, libraryController.getBorrowingsByStudent);
router.get('/borrowings/my', authenticate, libraryRateLimiter, libraryController.getMyBorrowings);
router.get('/borrowings/:id', authenticate, libraryRateLimiter, libraryController.getBorrowing);

router.post('/borrowings', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: createBorrowingSchema }), libraryController.createBorrowing);
router.patch('/borrowings/:id/return', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: returnBookSchema }), libraryController.returnBook);
router.patch('/borrowings/:id/lost', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, libraryController.markAsLost);
router.delete('/borrowings/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, libraryController.deleteBorrowing);

// ─── Fines ───────────────────────────────────────────────────────────────────

router.get('/fines', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ query: bookQuerySchema }), libraryController.listFines);
router.get('/fines/my', authenticate, libraryRateLimiter, libraryController.getMyFines);
router.get('/fines/:id', authenticate, libraryRateLimiter, libraryController.getFine);

router.post('/fines', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, validateRequest({ body: createFineSchema }), libraryController.createFine);
router.patch('/fines/:id/pay', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: payFineSchema }), libraryController.payFine);
router.patch('/fines/:id/waive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD'), libraryRateLimiter, validateRequest({ body: waiveFineSchema }), libraryController.waiveFine);
router.delete('/fines/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, libraryController.deleteFine);

// ─── Categories ──────────────────────────────────────────────────────────────

router.get('/categories', libraryRateLimiter, libraryController.listCategories);
router.get('/categories/code/:code', libraryRateLimiter, libraryController.getCategoryByCode);
router.get('/categories/:id', libraryRateLimiter, libraryController.getCategory);
router.get('/categories/:parentCategoryId/subcategories', libraryRateLimiter, libraryController.listSubCategories);

router.post('/categories', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: createCategorySchema }), libraryController.createCategory);
router.patch('/categories/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: updateCategorySchema }), libraryController.updateCategory);
router.delete('/categories/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, libraryController.deleteCategory);

// ─── Authors ─────────────────────────────────────────────────────────────────

router.get('/authors', libraryRateLimiter, validateRequest({ query: bookQuerySchema }), libraryController.listAuthors);
router.get('/authors/:id', libraryRateLimiter, libraryController.getAuthor);

router.post('/authors', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: createAuthorSchema }), libraryController.createAuthor);
router.patch('/authors/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY'), libraryRateLimiter, validateRequest({ body: updateAuthorSchema }), libraryController.updateAuthor);
router.delete('/authors/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), libraryRateLimiter, libraryController.deleteAuthor);

export const libraryRoutes: Router = router;
