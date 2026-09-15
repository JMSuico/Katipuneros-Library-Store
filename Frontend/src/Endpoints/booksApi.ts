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

export async function getPublicBooks(categoryId?: string, query?: string): Promise<StaticBook[]> {
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append('categoryId', categoryId);
  if (query) queryParams.append('query', query);

  const res = await apiRequest<BackendBook[]>(`/books?${queryParams.toString()}`);

  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map((b) => ({
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
    }));
  }

  // Fallback to static catalog if backend has no records yet
  return FEATURED_BOOKS;
}

export async function searchBooks(query: string): Promise<StaticBook[]> {
  return getPublicBooks(undefined, query);
}

export async function getBookDetails(id: string): Promise<BackendBook | null> {
  const res = await apiRequest<BackendBook>(`/books/${id}`);
  return res.success ? res.data : null;
}

export async function createCatalogBook(book: CreateBookDto) {
  return apiRequest<BackendBook>('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
}

export async function updateCatalogBook(id: string, book: CreateBookDto) {
  return apiRequest<BackendBook>(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  });
}

export async function deleteCatalogBook(id: string) {
  return apiRequest<object>(`/books/${id}`, {
    method: 'DELETE',
  });
}
