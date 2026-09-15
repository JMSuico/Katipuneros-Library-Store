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

export async function adminCreateBook(payload: CreateBookPayload): Promise<CMSApiResponse> {
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
}

export async function adminGetCategories() {
  return apiRequest<object[]>('/categories');
}

export async function adminCreateCategory(payload: CategoryPayload) {
  return apiRequest<object>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminGetPersonnel() {
  return apiRequest<object[]>('/personnel');
}
