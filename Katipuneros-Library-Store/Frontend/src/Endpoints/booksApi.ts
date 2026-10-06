// [Layer: Endpoints]
// booksApi.ts -- API client for catalog, inventory, and book showcase endpoints.
// Dispatches typed HTTP requests to /api/books and /api/categories on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from './apiClient';
import { FEATURED_BOOKS, StaticBook } from '../Libs/Assets/bookData';

export interface BackendCategory {
  id: string;
  // Unique ascending category code (CAT-####). Column name kept for DB compatibility.
  deweyRange: string;
  name: string;
  description: string;
  shelfBayLocation?: string;
  createdAt?: string;
}

export interface BackendBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  deweyCode?: string;
  categoryId: string;
  category?: BackendCategory;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  bayLocation: string;
  rfidTag?: string;
  isbnBarcode?: string;
  coverImage?: string;
  description?: string;
  isSpotlight: boolean;
  isArchived?: boolean;
  createdAt: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  // Optional legacy field -- no longer collected by the Books Manager UI.
  deweyCode?: string;
  categoryId: string;
  publishedYear: number;
  totalCopies: number;
  bayLocation: string;
  description?: string;
  rfidTag?: string;
}

export interface CatalogMetrics {
  totalTitles: number;
  physicalCopies: number;
  inCirculation: number;
  activeDisciplines: number;
}

export interface ExportFilterParams {
  startDate?: string;
  endDate?: string;
  titleStartsWith?: string;
  titleEndsWith?: string;
  titleContains?: string;
  idStartsWith?: string;
  idEndsWith?: string;
  idContains?: string;
  sortDirection?: 'asc' | 'desc';
  format?: 'csv' | 'excel';
}

export const getPublicBooks = async (categoryId?: string, query?: string): Promise<StaticBook[]> => {
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (query) queryParams.append('query', query);

  const res = await apiRequest<BackendBook[]>(`/books?${queryParams.toString()}`);

  return res.success && Array.isArray(res.data)
    ? res.data.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category?.name ?? 'General',
        coverImage: b.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
        status: (b.availableCopies > 0 ? 'available' : 'borrowed') as 'available' | 'borrowed' | 'reserved',
        rating: 4.8,
        availableCopies: b.availableCopies,
        totalCopies: b.totalCopies,
        summary: b.description ?? 'A featured catalog title in the Katipuneros Library collections.',
        location: b.bayLocation,
      }))
    : [];
};

export const searchBooks = async (query: string): Promise<StaticBook[]> =>
  await getPublicBooks(undefined, query);

export const getCatalogBooks = async (categoryId?: string, query?: string): Promise<BackendBook[]> => {
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (query) queryParams.append('query', query);

  const res = await apiRequest<BackendBook[]>(`/books?${queryParams.toString()}`);
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const getBooks = getCatalogBooks;

export const getBookDetails = async (id: string): Promise<BackendBook | null> =>
  (await apiRequest<BackendBook>(`/books/${id}`)).data ?? null;

export const createCatalogBook = async (book: CreateBookDto) =>
  await apiRequest<BackendBook>('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });

export const updateCatalogBook = async (id: string, book: CreateBookDto) =>
  await apiRequest<BackendBook>(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  });

export const deleteCatalogBook = async (id: string) =>
  await apiRequest<object>(`/books/${id}`, {
    method: 'DELETE',
  });

export const getCatalogMetrics = async (): Promise<CatalogMetrics | null> => {
  const res = await apiRequest<CatalogMetrics>('/books/metrics');
  return res.success && res.data ? res.data : null;
};

export const bulkDeleteCatalogBooks = async (bookIds: string[]) =>
  await apiRequest<{ deletedCount: number }>('/books/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ bookIds }),
  });

export const toggleArchiveCatalogBook = async (id: string, isArchived: boolean) =>
  await apiRequest<{ id: string; isArchived: boolean }>(`/books/${id}/archive`, {
    method: 'PUT',
    body: JSON.stringify({ isArchived }),
  });

export const batchIngestIsbns = async (isbns: string[], categoryId?: string) =>
  await apiRequest<{ ingestedCount: number; errors: string[] }>('/books/batch-isbn', {
    method: 'POST',
    body: JSON.stringify({ isbns, categoryId }),
  });

export const getCategories = async (): Promise<BackendCategory[]> => {
  const res = await apiRequest<BackendCategory[]>('/categories');
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const getExportBooksUrl = (params: ExportFilterParams): string => {
  const q = new URLSearchParams();
  if (params.startDate) q.append('startDate', params.startDate);
  if (params.endDate) q.append('endDate', params.endDate);
  if (params.titleStartsWith) q.append('titleStartsWith', params.titleStartsWith);
  if (params.titleEndsWith) q.append('titleEndsWith', params.titleEndsWith);
  if (params.titleContains) q.append('titleContains', params.titleContains);
  if (params.idStartsWith) q.append('idStartsWith', params.idStartsWith);
  if (params.idEndsWith) q.append('idEndsWith', params.idEndsWith);
  if (params.idContains) q.append('idContains', params.idContains);
  if (params.sortDirection) q.append('sortDirection', params.sortDirection);
  if (params.format) q.append('format', params.format);
  return `/api/books/export?${q.toString()}`;
};
