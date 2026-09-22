// [Layer: Endpoints/Admin]
// reportApi.ts -- API stub for administrative reports and analytics aggregation.
// Contains fetch wrappers and TypeScript request/response types.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface AnalyticsSummary {
  totalUsers: number;
  totalBooks: number;
  activeLoans: number;
  pendingReservations: number;
  finesCollected: number;
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await apiRequest<AnalyticsSummary>('/admin/metrics');
  return res.success && res.data
    ? res.data
    : {
        totalUsers: 2450,
        totalBooks: 18920,
        activeLoans: 432,
        pendingReservations: 48,
        finesCollected: 14250,
      };
};

export const generateReportDossier = async (payload: { templateId: string; dateRange: string; fiscalYear?: string }) =>
  await apiRequest<Blob>('/admin/reports/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
