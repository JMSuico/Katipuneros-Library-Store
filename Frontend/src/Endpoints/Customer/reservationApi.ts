// [Layer: Endpoints/Customer]
// reservationApi.ts -- API client for customer hold requests and smart locker reservations.
// Dispatches requests to /api/reservations on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface CustomerReservationRecord {
  id: string;
  patronId: string;
  bookId: string;
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    deweyCode: string;
    coverImage?: string;
  };
  reservationDate: string;
  expiryDate: string;
  fulfilledDate?: string;
  status: number;
  lockerBay?: string;
  lockerPin?: string;
  pickupBranch?: string;
  queuePosition: number;
}

export interface CustomerReservationRequest {
  bookId: string;
  pickupBranch?: string;
}

export interface CustomerReservationResponse {
  success: boolean;
  message: string;
  holdCode?: string;
  queuePosition?: number;
}

export async function getCustomerReservations(): Promise<CustomerReservationRecord[]> {
  const res = await apiRequest<CustomerReservationRecord[]>('/reservations/my-reservations');
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function requestCustomerReservation(req: CustomerReservationRequest): Promise<CustomerReservationResponse> {
  const res = await apiRequest<CustomerReservationRecord>('/reservations', {
    method: 'POST',
    body: JSON.stringify({
      bookId: req.bookId,
      pickupBranch: req.pickupBranch ?? 'Main Circulation Desk',
    }),
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Reservation hold confirmed.' : 'Reservation failed.'),
    holdCode: res.data?.id ? `HLD-${res.data.id.slice(0, 8).toUpperCase()}` : undefined,
    queuePosition: res.data?.queuePosition,
  };
}

export async function cancelCustomerReservation(reservationId: string): Promise<{ success: boolean; message: string }> {
  const res = await apiRequest<object>(`/reservations/${reservationId}`, {
    method: 'DELETE',
  });

  return {
    success: res.success,
    message: res.message || (res.success ? 'Reservation cancelled.' : 'Cancellation failed.'),
  };
}
