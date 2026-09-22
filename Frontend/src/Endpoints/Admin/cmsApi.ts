// [Layer: Endpoints/Admin]
// cmsApi.ts -- API client for administrative catalog, Dewey classification, and staff CMS.
// Dispatches requests to /api/categories, /api/books, and /api/personnel on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface CreateBookPayload {
  title: string;
  author: string;
  isbn: string;
  deweyCode?: string;
  categoryId?: string;
  publishedYear?: number;
  copies: number;
  bayLocation?: string;
  description?: string;
}

export interface CategoryPayload {
  deweyRange: string;
  name: string;
  shelfBay: string;
  description: string;
}

export interface CMSApiResponse {
  success: boolean;
  message: string;
  id?: string;
}

export const adminCreateBook = async (payload: CreateBookPayload): Promise<CMSApiResponse> => {
  const res = await apiRequest<{ id: string }>('/books', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title,
      author: payload.author,
      isbn: payload.isbn,
      deweyCode: payload.deweyCode ?? '000 GEN',
      categoryId: payload.categoryId ?? '831e8723-d0d3-450c-b26a-3e4ad3364135',
      publishedYear: payload.publishedYear ?? new Date().getFullYear(),
      totalCopies: payload.copies,
      bayLocation: payload.bayLocation ?? 'Bay A-01',
      description: payload.description,
    }),
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Book entry created in catalog ledger.' : 'Failed to create book.'),
    id: res.data?.id,
  };
};

export const adminGetCategories = async () =>
  await apiRequest<object[]>('/categories');

export const adminCreateCategory = async (payload: CategoryPayload) =>
  await apiRequest<object>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const adminUpdateCategory = async (id: string, payload: CategoryPayload) =>
  await apiRequest<object>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const adminDeleteCategory = async (id: string) =>
  await apiRequest<object>(`/categories/${id}`, {
    method: 'DELETE',
  });

export const adminGetPersonnel = async () =>
  await apiRequest<object[]>('/personnel');
