// [Layer: Endpoints/Admin]
// borrowingsApi.ts -- API client for circulation loans, extensions, overrides, and audit ledger.
// Dispatches typed HTTP requests to /api/borrow on .NET 10 Web API.
// Strictly adheres to real-time data mandate: if database is empty, returns empty array / empty metrics.
// DO NOT put UI rendering, business rules, or component state here.

import { apiRequest } from '../apiClient';

export interface BackendBorrowing {
  id: string;
  loanCode: string;
  patronId: string;
  patronName: string;
  patronLibraryId: string;
  patronRole: string;
  patronAvatar?: string;
  bookId: string;
  bookTitle: string;
  bookBarcode: string;
  bookCallNumber: string;
  bookCoverImage?: string;
  borrowDate: string;
  dueDate: string;
  daysRemaining: number;
  renewalCount: number;
  maxRenewals: number;
  status: 'Active' | 'Overdue' | 'Returned' | 'Renewed' | string;
  assessedFine: number;
  notes?: string;
}

export interface BorrowingMetrics {
  totalActiveBorrowings: number;
  trendingPercent: number;
  dueToday48h: number;
  undergradDueCount: number;
  graduateDueCount: number;
  approachingExpiry: number;
  overdueDelinquencies: number;
  cumulativeFines: number;
}

export const EMPTY_BORROWING_METRICS: BorrowingMetrics = {
  totalActiveBorrowings: 0,
  trendingPercent: 0.0,
  dueToday48h: 0,
  undergradDueCount: 0,
  graduateDueCount: 0,
  approachingExpiry: 0,
  overdueDelinquencies: 0,
  cumulativeFines: 0,
};

export interface LoanOverridePayload {
  patronLibraryId: string;
  volumeBarcode: string;
  extensionInterval: string;
  justification: string;
}

export interface ForceRenewPayload {
  extensionDays: number;
  specialApprovalNote?: string;
}

export interface ExportBorrowingsParams {
  startDate?: string;
  endDate?: string;
  alphabeticalFilter?: string;
  idFilter?: string;
  sortDirection?: 'asc' | 'desc';
  format?: 'csv' | 'excel';
}

export const getBorrowingMetrics = async (): Promise<BorrowingMetrics> => {
  const res = await apiRequest<BorrowingMetrics>('/borrow/metrics');
  return res.success && res.data ? res.data : EMPTY_BORROWING_METRICS;
};

export const getAdminBorrowings = async (
  status?: string,
  query?: string
): Promise<BackendBorrowing[]> => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (query && query.trim() !== '') params.append('query', query.trim());

  const res = await apiRequest<BackendBorrowing[]>(`/borrow/admin-ledger?${params.toString()}`);
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const submitLoanOverride = async (payload: LoanOverridePayload) =>
  await apiRequest<object>('/borrow/override', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const forceRenewLoan = async (id: string, payload: ForceRenewPayload) =>
  await apiRequest<object>(`/borrow/${id}/force-renew`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getExportBorrowingsUrl = (params: ExportBorrowingsParams): string => {
  const q = new URLSearchParams();
  if (params.startDate) q.append('startDate', params.startDate);
  if (params.endDate) q.append('endDate', params.endDate);
  if (params.alphabeticalFilter) q.append('alphabeticalFilter', params.alphabeticalFilter);
  if (params.idFilter) q.append('idFilter', params.idFilter);
  if (params.sortDirection) q.append('sortDirection', params.sortDirection);
  if (params.format) q.append('format', params.format);
  return `/api/borrow/export?${q.toString()}`;
};
