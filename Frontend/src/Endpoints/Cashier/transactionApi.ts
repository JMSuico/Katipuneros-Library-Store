// [Layer: Endpoints/Cashier]
// transactionApi.ts -- API client for circulation desk checkout, returns, and transaction ledger.
// Dispatches requests to /api/borrow on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface CashierCheckoutRequest {
  patronId: string;
  bookBarcodes: string[];
  dueDate?: string;
}

export interface ReturnBookRequest {
  barcode: string;
  conditionNotes?: string;
  damageFee?: number;
}

export const processCashierCheckout = async (req: CashierCheckoutRequest) =>
  await apiRequest<object>('/borrow/checkout', {
    method: 'POST',
    body: JSON.stringify({
      patronId: req.patronId,
      bookBarcodes: req.bookBarcodes,
      dueDate: req.dueDate ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  });

export const processBookReturn = async (req: ReturnBookRequest) =>
  await apiRequest<object>('/borrow/return', {
    method: 'POST',
    body: JSON.stringify(req),
  });

export const getCirculationLedger = async (status?: number) => {
  const url = status !== undefined ? `/borrow/ledger?status=${status}` : '/borrow/ledger';
  return await apiRequest<object[]>(url);
};

export const getDailyTransactions = async (date?: string) => {
  const url = date ? `/cashier/transactions?date=${encodeURIComponent(date)}` : '/cashier/transactions';
  return await apiRequest<object[]>(url);
};

export const exportTransactionsCsv = async () =>
  await apiRequest<Blob>('/cashier/transactions/export', {
    method: 'GET',
  });
