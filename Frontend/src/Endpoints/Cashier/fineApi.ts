// [Layer: Endpoints/Cashier]
// fineApi.ts -- API client for circulation desk fine settlements and fee waivers.
// Dispatches requests to /api/fines on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface FineRecord {
  id: string;
  patronId: string;
  patron?: {
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

export async function getAllFines(status?: string): Promise<FineRecord[]> {
  const url = status ? `/fines?status=${encodeURIComponent(status)}` : '/fines';
  const res = await apiRequest<FineRecord[]>(url);
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function settleFine(req: FinePaymentRequest) {
  return apiRequest<object>(`/fines/${req.fineId}/settle`, {
    method: 'POST',
    body: JSON.stringify({
      amountPaid: req.amountPaid,
      paymentMethod: req.paymentMethod,
    }),
  });
}

export async function waiveFine(req: WaiveFineRequest) {
  return apiRequest<object>(`/fines/${req.fineId}/waive`, {
    method: 'PUT',
    body: JSON.stringify({
      reason: req.reason,
    }),
  });
}
