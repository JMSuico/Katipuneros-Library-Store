// [Layer: Endpoints/Admin]
// bookCopiesApi.ts -- API client for physical book copies, QR labels, and scanner resolution.
// Dispatches requests to /api/books/{id}/copies and /api/copies on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface ActiveBorrowerDto {
  transactionId: string;
  patronId: string;
  patronName: string;
  patronLibraryId: string;
  patronAvatar?: string;
  gatePassCode?: string;
  borrowDate: string;
  dueDate: string;
  isOverdue: boolean;
  overdueDays: number;
  estimatedOverdueFine: number;
}

export interface BookCopyDto {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  deweyCode: string;
  coverImage?: string;
  copyNumber: number;
  accessionNumber: string;
  qrCodeData: string;
  status: 'Available' | 'Borrowed' | 'InInspection' | 'Damaged' | 'Lost' | 'Archived' | string;
  condition: string;
  conditionNotes?: string;
  bayLocation?: string;
  acquiredDate: string;
  lastReturnedDate?: string;
  isBorrowed: boolean;
  currentBorrower?: ActiveBorrowerDto;
}

export interface BookCopyScanResultDto {
  copy: BookCopyDto;
  activeLoan?: ActiveBorrowerDto;
  dailyFineRate: number;
  maximumFineCap: number;
  defaultDamageFee: number;
}

export interface CreateBookCopyRequest {
  bayLocation?: string;
  condition?: string;
  conditionNotes?: string;
}

export interface UpdateBookCopyRequest {
  status?: string;
  condition?: string;
  conditionNotes?: string;
  bayLocation?: string;
}

export const getBookCopies = async (bookId: string) =>
  await apiRequest<BookCopyDto[]>(`/books/${bookId}/copies`);

export const getCopyById = async (copyId: string) =>
  await apiRequest<BookCopyDto>(`/copies/${copyId}`);

export const createBookCopy = async (bookId: string, req: CreateBookCopyRequest) =>
  await apiRequest<BookCopyDto>(`/books/${bookId}/copies`, {
    method: 'POST',
    body: JSON.stringify(req),
  });

export const updateBookCopy = async (copyId: string, req: UpdateBookCopyRequest) =>
  await apiRequest<BookCopyDto>(`/copies/${copyId}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });

export const deleteBookCopy = async (copyId: string) =>
  await apiRequest<object>(`/copies/${copyId}`, {
    method: 'DELETE',
  });

export const scanBookCopy = async (code: string) =>
  await apiRequest<BookCopyScanResultDto>(`/copies/scan?code=${encodeURIComponent(code)}`);

export const syncAllBookCopies = async () =>
  await apiRequest<{ seededCopies: number }>('/copies/sync-all', {
    method: 'POST',
  });
