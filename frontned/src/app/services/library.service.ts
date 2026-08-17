import { BaseService } from "./base.service";
import { API_ENDPOINTS } from "../constants";
import type { Book, Borrowing, LibraryStatistics } from "../types/library";

export class LibraryService extends BaseService {
  async getBooks(params?: Record<string, string | number | boolean | undefined>): Promise<Book[]> {
    return this.get<Book[]>(`${API_ENDPOINTS.LIBRARY}/books`, params ? { params } : undefined);
  }

  async getBook(id: string): Promise<Book> {
    return this.get<Book>(`${API_ENDPOINTS.LIBRARY}/books/${id}`);
  }

  async createBook(data: Partial<Book>): Promise<Book> {
    return this.post<Book>(`${API_ENDPOINTS.LIBRARY}/books`, data);
  }

  async updateBook(id: string, data: Partial<Book>): Promise<Book> {
    return this.patch<Book>(`${API_ENDPOINTS.LIBRARY}/books/${id}`, data);
  }

  async getBorrowings(
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<Borrowing[]> {
    return this.get<Borrowing[]>(
      `${API_ENDPOINTS.LIBRARY}/borrowings`,
      params ? { params } : undefined,
    );
  }

  async borrowBook(data: {
    bookId: string;
    studentId: string;
    borrowerType?: string;
  }): Promise<Borrowing> {
    return this.post<Borrowing>(`${API_ENDPOINTS.LIBRARY}/borrowings`, data);
  }

  async returnBook(id: string): Promise<Borrowing> {
    return this.patch<Borrowing>(`${API_ENDPOINTS.LIBRARY}/borrowings/${id}/return`, {});
  }
}

export const libraryService = new LibraryService();
