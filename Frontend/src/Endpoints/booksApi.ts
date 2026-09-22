// [Layer: Endpoints]
// booksApi.ts -- API client for catalog, inventory, and book showcase endpoints.
// Dispatches typed HTTP requests to /api/books on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from './apiClient';
import { FEATURED_BOOKS, StaticBook } from '../Libs/Assets/bookData';

export interface BackendBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  deweyCode: string;
  categoryId: string;
  category?: {
    id: string;
    deweyRange: string;
    name: string;
    description: string;
    shelfBayLocation: string;
  };
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  bayLocation: string;
  rfidTag?: string;
  isbnBarcode?: string;
  coverImage?: string;
  description?: string;
  isSpotlight: boolean;
  createdAt: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  deweyCode: string;
  categoryId: string;
  publishedYear: number;
  totalCopies: number;
  bayLocation: string;
  description?: string;
  rfidTag?: string;
}

export const getPublicBooks = async (categoryId?: string, query?: string): Promise<StaticBook[]> => {
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (query) queryParams.append('query', query);

  const res = await apiRequest<BackendBook[]>(`/books?${queryParams.toString()}`);

  return res.success && Array.isArray(res.data) && res.data.length > 0
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
    : FEATURED_BOOKS;
};

export const searchBooks = async (query: string): Promise<StaticBook[]> =>
  await getPublicBooks(undefined, query);

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

export const batchImportBooks = async (isbnList: string[]) =>
  await apiRequest<object>('/books/batch-import', {
    method: 'POST',
    body: JSON.stringify({ isbnList }),
  });
