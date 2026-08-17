import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryService } from "@/app/services/library.service";
import type { Book, Borrowing, LibraryStatistics } from "@/app/types/library";

export function useBooks(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["library-books", params],
    queryFn: () => libraryService.getBooks(params),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["library-books", id],
    queryFn: () => libraryService.getBook(id),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Book>) => libraryService.createBook(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library-books"] }),
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Book> }) =>
      libraryService.updateBook(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library-books"] }),
  });
}

export function useBorrowings(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["library-borrowings", params],
    queryFn: () => libraryService.getBorrowings(params),
  });
}

export function useBorrowBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookId: string; studentId: string; borrowerType?: string }) =>
      libraryService.borrowBook(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library-borrowings"] }),
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryService.returnBook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library-borrowings"] }),
  });
}
