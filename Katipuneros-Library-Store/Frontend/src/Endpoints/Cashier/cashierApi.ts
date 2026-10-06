// [Layer: Endpoints/Cashier]
// cashierApi.ts -- Strongly-typed API client for Cashier dashboard telemetry, intake queues, shift status, and audit ledgers.
// Communicates with /api/cashier endpoints on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest, API_BASE_URL, getAuthToken } from '../apiClient';

export interface CashierDashboardKpis {
  pendingHoldsCount: number;
  urgentTodayHoldsCount: number;
  approvedTodayCount: number;
  toReleaseCount: number;
  activeLoansCount: number;
  dueTodayCount: number;
  overdueLoansCount: number;
  returnsTodayCount: number;
  finesDailyAmount: number;
  finesDailyReceiptsCount: number;
  totalRegisterCash: number;
  baseFloat: number;
}

export interface CashierIntakeQueueItem {
  id: string;
  referenceCode: string;
  patronId: string;
  patronName: string;
  libraryCardNumber: string;
  patronStanding: string;
  activeLoansCount: number;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  callNumber: string;
  bookCoverImage?: string;
  availableCopies: number;
  totalCopies: number;
  stacksLocation: string;
  requestedPickupDate: string;
  durationDays: number;
  isPriority: boolean;
}

export interface CashierOverdueQueueItem {
  id: string;
  transactionReference: string;
  patronName: string;
  libraryCardNumber: string;
  bookTitle: string;
  barcode: string;
  dueDate: string;
  daysOverdue: number;
  calculatedFine: number;
  status: string;
}

export interface CashierTransactionItem {
  id: string;
  transactionReference: string;
  transactionType: string;
  patronName: string;
  libraryCardNumber: string;
  bookTitle: string;
  barcode: string;
  amount: number;
  status: string;
  timestamp: string;
  cashierName: string;
}

export interface CashierShiftSummary {
  activeCashierName: string;
  stationName: string;
  shiftLabel: string;
  floatBase: number;
  finesCollectedToday: number;
  totalRegisterCash: number;
  isHardwareScannerActive: boolean;
  lastSyncedAt: string;
}

export interface CashierTransactionFilterParams {
  date?: string;
  type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getCashierDashboardKpis = async (): Promise<CashierDashboardKpis> => {
  const res = await apiRequest<CashierDashboardKpis>('/cashier/dashboard-kpis');
  return res.success && res.data
    ? res.data
    : {
        pendingHoldsCount: 0,
        urgentTodayHoldsCount: 0,
        approvedTodayCount: 0,
        toReleaseCount: 0,
        activeLoansCount: 0,
        dueTodayCount: 0,
        overdueLoansCount: 0,
        returnsTodayCount: 0,
        finesDailyAmount: 0,
        finesDailyReceiptsCount: 0,
        totalRegisterCash: 1000.0,
        baseFloat: 1000.0,
      };
};

export const getCashierIntakeQueue = async (): Promise<CashierIntakeQueueItem[]> => {
  const res = await apiRequest<CashierIntakeQueueItem[]>('/cashier/intake-queue');
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const getCashierOverdueQueue = async (): Promise<CashierOverdueQueueItem[]> => {
  const res = await apiRequest<CashierOverdueQueueItem[]>('/cashier/overdue-queue');
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const getCashierTransactions = async (
  params?: CashierTransactionFilterParams
): Promise<{ items: CashierTransactionItem[]; totalCount: number }> => {
  const query = new URLSearchParams();
  if (params?.date) query.append('date', params.date);
  if (params?.type) query.append('type', params.type);
  if (params?.search) query.append('search', params.search);
  if (params?.page) query.append('page', params.page.toString());
  if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

  const q = query.toString();
  const url = q ? `/cashier/transactions?${q}` : '/cashier/transactions';
  const res = await apiRequest<{ items: CashierTransactionItem[]; totalCount: number }>(url);
  return res.success && res.data ? res.data : { items: [], totalCount: 0 };
};

export const getCashierShiftStatus = async (): Promise<CashierShiftSummary> => {
  const res = await apiRequest<CashierShiftSummary>('/cashier/shift-status');
  return res.success && res.data
    ? res.data
    : {
        activeCashierName: 'Circulation Desk',
        stationName: 'Front Desk Bay 01',
        shiftLabel: 'Shift #01 (Regular)',
        floatBase: 1000.0,
        finesCollectedToday: 0.0,
        totalRegisterCash: 1000.0,
        isHardwareScannerActive: true,
        lastSyncedAt: new Date().toISOString(),
      };
};

export const downloadTransactionsCsv = async (date?: string): Promise<void> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}/cashier/transactions/export${date ? `?date=${encodeURIComponent(date)}` : ''}`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to download CSV');
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `cashier_transactions_${date || 'all'}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};
