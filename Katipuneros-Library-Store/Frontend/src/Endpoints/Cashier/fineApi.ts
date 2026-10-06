// [Layer: Endpoints/Cashier]
// fineApi.ts -- API client for circulation desk fine settlements and fee waivers.
// Dispatches requests to /api/fines on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface FineRecord {
  id: string;
  patronId: string;
  user?: {
    fullName: string;
    libraryCardNumber: string;
  };
  borrowTransactionId: string;
  amount: number;
  balanceRemaining: number;
  waivedAmount: number;
  status: string;
  reason: string;
  assessedAt: string;
  settledAt?: string;
}

export interface FinePaymentRequest {
  fineId: string;
  amountPaid: number;
  paymentMethod: string;
}

export interface WaiveFineRequest {
  fineId: string;
  reason: string;
}

export const getAllFines = async (status?: string): Promise<FineRecord[]> => {
  const url = status ? `/fines?status=${encodeURIComponent(status)}` : '/fines';
  const res = await apiRequest<FineRecord[]>(url);
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const settleFine = async (req: FinePaymentRequest) =>
  await apiRequest<object>(`/fines/${req.fineId}/settle`, {
    method: 'POST',
    body: JSON.stringify({
      amountPaid: req.amountPaid,
      paymentMethod: req.paymentMethod,
    }),
  });

export const waiveFine = async (req: WaiveFineRequest) =>
  await apiRequest<object>(`/fines/${req.fineId}/waive`, {
    method: 'PUT',
    body: JSON.stringify({
      reason: req.reason,
    }),
  });

export const notifyPatronFine = async (fineId: string) =>
  await apiRequest<object>(`/fines/${fineId}/notify`, {
    method: 'POST',
  });
