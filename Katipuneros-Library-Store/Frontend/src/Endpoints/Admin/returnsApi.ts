// [Layer: Endpoints/Admin]
// returnsApi.ts -- Typed API endpoint stubs for Admin Circulation Returns and QA Inspection.
// Bridges frontend React UI to ASP.NET Core 10 Web API (/api/returns).
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface ReturnsMetrics {
  volumesCheckedIn: number;
  capacityPercent: number;
  trendingVsAvg: number;
  onTimeReturnRate: number;
  rateDelta: number;
  onTimeCount: number;
  lateCount: number;
  slaStatus: string;
  delinquencyFinesTally: number;
  pendingLedgerAmount: number;
  unsettledCount: number;
  collectionRate: number;
  flaggedForBinderyCount: number;
  spineDamageCount: number;
  waterWarpCount: number;
}

export interface ReturnJournalItem {
  id: string;
  returnCode: string;
  returnTimestamp: string;
  patronName: string;
  patronLibraryId: string;
  patronProgram: string;
  bookTitle: string;
  bookBarcode: string;
  dueDate: string;
  overdueDays: number;
  assessedFine: number;
  fineNote: string;
  conditionGrade: string;
  clearanceStatus: string;
  stationDesk: string;
  terminalId: string;
  conditionNotes?: string;
}

export interface DamagedAssessmentCase {
  id: string;
  caseReference: string;
  severity: string;
  bookTitle: string;
  bookBarcode: string;
  bookCoverImage?: string;
  reportedBy: string;
  damageType: string;
  assessedPenalty: number;
  patronResponsible: string;
  patronLibraryId: string;
  patronStatus: string;
  estRepairTime: string;
  status: string;
  routingDestination?: string;
  flaggedDate: string;
}

export interface RoutingActionPayload {
  caseId?: string;
  barcode: string;
  action: 'RouteBindery' | 'OrderReplacement' | 'DeaccessionSalvage' | 'AuthorizeRouting' | 'Hold';
  notes?: string;
  costOverride?: number;
  technicianOrVendor?: string;
}

export interface BulkCheckinPayload {
  barcodes: string[];
  stationDesk?: string;
  conditionGrade?: string;
}

export interface ExportReturnsFilterQuery {
  startDate?: string;
  endDate?: string;
  alphabeticalFilter?: string;
  idFilter?: string;
  sortDirection?: 'asc' | 'desc';
  format?: 'csv' | 'xlsx';
}

export const getReturnsMetrics = async (): Promise<ReturnsMetrics> =>
  (await apiRequest<ReturnsMetrics>('/api/returns/metrics')).data ?? {
    volumesCheckedIn: 0,
    capacityPercent: 0,
    trendingVsAvg: 0,
    onTimeReturnRate: 0,
    rateDelta: 0,
    onTimeCount: 0,
    lateCount: 0,
    slaStatus: 'Within SLA',
    delinquencyFinesTally: 0,
    pendingLedgerAmount: 0,
    unsettledCount: 0,
    collectionRate: 0,
    flaggedForBinderyCount: 0,
    spineDamageCount: 0,
    waterWarpCount: 0,
  };

export const getReturnsJournal = async (params?: { status?: string; query?: string }): Promise<ReturnJournalItem[]> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.query) queryParams.set('query', params.query);
  const qs = queryParams.toString();
  const url = qs ? `/api/returns/journal?${qs}` : '/api/returns/journal';
  return (await apiRequest<ReturnJournalItem[]>(url)).data ?? [];
};

export const getActiveDamagedCase = async (): Promise<DamagedAssessmentCase | null> =>
  (await apiRequest<DamagedAssessmentCase>('/api/returns/active-damaged-case')).data ?? null;

export const submitRoutingAction = async (payload: RoutingActionPayload): Promise<{ success: boolean; message: string }> => {
  const endpointMap: Record<string, string> = {
    RouteBindery: '/api/returns/route-bindery',
    OrderReplacement: '/api/returns/order-replacement',
    DeaccessionSalvage: '/api/returns/deaccession-salvage',
    AuthorizeRouting: '/api/returns/authorize-routing',
    Hold: '/api/returns/hold',
  };
  const url = endpointMap[payload.action] || '/api/returns/route-bindery';
  const response = await apiRequest<{ status: string }>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { success: response.success, message: response.message || 'Action executed successfully.' };
};

export const processBulkCheckin = async (payload: BulkCheckinPayload): Promise<{ success: boolean; count: number; message: string }> => {
  const response = await apiRequest<{ count: number }>('/api/returns/bulk-checkin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return {
    success: response.success,
    count: response.data?.count ?? 0,
    message: response.message || 'Bulk check-in completed.',
  };
};

export const getExportReturnsUrl = (query: ExportReturnsFilterQuery): string => {
  const params = new URLSearchParams();
  if (query.startDate) params.append('startDate', query.startDate);
  if (query.endDate) params.append('endDate', query.endDate);
  if (query.alphabeticalFilter) params.append('alphabeticalFilter', query.alphabeticalFilter);
  if (query.idFilter) params.append('idFilter', query.idFilter);
  if (query.sortDirection) params.append('sortDirection', query.sortDirection);
  if (query.format) params.append('format', query.format);
  return `/api/returns/export?${params.toString()}`;
};
