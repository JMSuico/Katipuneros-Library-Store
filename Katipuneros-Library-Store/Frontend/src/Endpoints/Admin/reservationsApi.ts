// [Layer: Endpoints/Admin]
// reservationsApi.ts -- API client for user holds, waitlist queue, smart locker staging, and triage.
// Dispatches typed HTTP requests to /api/reservations on .NET 10 Web API.
// Strictly adheres to real-time data mandate: if database is empty, returns empty array / empty metrics.
// DO NOT put UI rendering, business rules, or component state here.

import { apiRequest } from '../apiClient';

export interface BackendReservation {
  id: string;
  patronId: string;
  patronName: string;
  patronLibraryId: string;
  patronDepartment: string;
  patronYearLevel: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCallNumber: string;
  bookCoverImage?: string;
  reservationDate: string;
  expiryDate: string;
  fulfilledDate?: string;
  status: 'Pending' | 'StagedInLocker' | 'Fulfilled' | 'Cancelled' | 'Expired' | string;
  lockerBay?: string;
  lockerPin?: string;
  pickupBranch?: string;
  queuePosition: number;
  priorityLabel: string;
}

export interface ReservationMetrics {
  activeHoldQueue: number;
  pendingReview: number;
  stagedReady: number;
  fulfillmentVelocity: number;
  totalLockerSlots: number;
  occupiedLockers: number;
  lockerCapacityPercent: number;
}

export const EMPTY_RESERVATION_METRICS: ReservationMetrics = {
  activeHoldQueue: 0,
  pendingReview: 0,
  stagedReady: 0,
  fulfillmentVelocity: 0.0,
  totalLockerSlots: 12,
  occupiedLockers: 0,
  lockerCapacityPercent: 0.0,
};

export interface LockerSlotTelemetry {
  bayCode: string;
  status: 'READY' | 'COUNTDOWN' | 'EMPTY' | 'ASSIGN' | 'OVERDUE' | string;
  remainingHours?: number;
  reservationId?: string;
  patronName?: string;
  bookTitle?: string;
}

export interface LockerDiagnosticsResponse {
  clusterOnline: boolean;
  clusterLocation: string;
  totalSlots: number;
  vacantSlots: number;
  overdueSlots: number;
  slots: LockerSlotTelemetry[];
}

export interface ExportRosterParams {
  startDate?: string;
  endDate?: string;
  alphabeticalFilter?: string;
  idFilter?: string;
  sortDirection?: 'asc' | 'desc';
  format?: 'csv' | 'excel';
}

export interface TriagePayload {
  approved: boolean;
  reason?: string;
  priority?: boolean;
}

export interface BatchClearancePayload {
  holdIds: string[];
  action: 'Stage' | 'Cancel' | 'Approve' | 'Release' | string;
  lockerBay?: string;
}

export interface NotifyPatronPayload {
  channel: 'SMS' | 'Email' | 'Push' | 'All' | string;
  customMessage?: string;
}

export const getReservationMetrics = async (): Promise<ReservationMetrics> => {
  const res = await apiRequest<ReservationMetrics>('/reservations/metrics');
  return res.success && res.data ? res.data : EMPTY_RESERVATION_METRICS;
};

export const getAdminReservations = async (status?: string, query?: string): Promise<BackendReservation[]> => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (query && query.trim() !== '') params.append('query', query.trim());

  const res = await apiRequest<BackendReservation[]>(`/reservations?${params.toString()}`);
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const triageReservation = async (id: string, payload: TriagePayload) =>
  await apiRequest<object>(`/reservations/${id}/triage`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const updateReservationStatus = async (id: string, status: string, notes?: string) =>
  await apiRequest<object>(`/reservations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, notes }),
  });

export const assignReservationLocker = async (id: string, lockerBay: string, pin: string) =>
  await apiRequest<object>(`/reservations/${id}/assign-locker`, {
    method: 'POST',
    body: JSON.stringify({ lockerBay, pin }),
  });

export const fulfillReservationHold = async (id: string) =>
  await apiRequest<object>(`/reservations/${id}/fulfill`, {
    method: 'PUT',
  });

export const batchClearanceReservations = async (payload: BatchClearancePayload) =>
  await apiRequest<{ count: number; action: string }>('/reservations/batch-clearance', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const notifyReservationPatron = async (id: string, payload: NotifyPatronPayload) =>
  await apiRequest<{ id: string; channel: string }>(`/reservations/${id}/notify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getLockerDiagnostics = async (): Promise<LockerDiagnosticsResponse | null> => {
  const res = await apiRequest<LockerDiagnosticsResponse>('/reservations/diagnostics');
  return res.success && res.data ? res.data : null;
};

export const getExportReservationsUrl = (params: ExportRosterParams): string => {
  const q = new URLSearchParams();
  if (params.startDate) q.append('startDate', params.startDate);
  if (params.endDate) q.append('endDate', params.endDate);
  if (params.alphabeticalFilter) q.append('alphabeticalFilter', params.alphabeticalFilter);
  if (params.idFilter) q.append('idFilter', params.idFilter);
  if (params.sortDirection) q.append('sortDirection', params.sortDirection);
  if (params.format) q.append('format', params.format);
  return `/api/reservations/export?${q.toString()}`;
};
