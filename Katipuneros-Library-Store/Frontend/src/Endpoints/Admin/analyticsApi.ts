// [Layer: Endpoints/Admin]
// analyticsApi.ts -- Typed API client stubs communicating with /api/analytics endpoints.
// Contains API request functions and TypeScript interfaces ONLY.
// DO NOT put business logic, validation rules, or UI rendering here.

import { apiRequest, ApiResponse } from '../apiClient';

export interface CirculationAnomalyData {
  anomalyDetected: boolean;
  percentageIncrease: number;
  discipline: string;
  keyTitlesWithZeroShelf: number;
  message: string;
}

export interface VelocityPointData {
  dateLabel: string;
  isoDate: string;
  borrowings: number;
  reservations: number;
  returns: number;
  overdue: number;
}

export interface CoreVelocityData {
  granularity: string;
  dateRangeLabel: string;
  points: VelocityPointData[];
  totalBorrowings: number;
  totalReservations: number;
  totalReturns: number;
  totalOverdue: number;
}

export interface InventoryDensityData {
  totalVolumes: number;
  availablePercent: number;
  availableCount: number;
  activeLoansPercent: number;
  activeLoansCount: number;
  stagedHoldsPercent: number;
  stagedHoldsCount: number;
  maintenancePercent: number;
  maintenanceCount: number;
  inventoryAuditActive: boolean;
  inventoryAuditStatusText: string;
  rfidSyncActive?: boolean;
  rfidStatusText?: string;
}

export interface HourlyFootfallPointData {
  hourLabel: string;
  heightPercent: number;
  count: number;
  isPeak: boolean;
}

export interface CommunityFlowData {
  digitalLogins: number;
  digitalLoginsVsLastMo: number;
  recordedVisits: number;
  turnstileCounterLabel: string;
  peakWindow: string;
  hourlyFootfall: HourlyFootfallPointData[];
  wifiConcurrences: number;
}

export interface RankedBookData {
  rank: number;
  bookId: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  checkouts: number;
  barPercent: number;
}

export interface CirculationDemandData {
  topTitles: RankedBookData[];
  showingCount: number;
  totalRanked: number;
}

export interface TelemetryFeedData {
  latestEventText: string;
  latestEventTime: string;
  nextSyncSecondsRemaining: number;
  nextSyncCountdownFormatted: string;
  isOnline: boolean;
}

export const getAnomalyAlert = async (): Promise<CirculationAnomalyData> => {
  const res = await apiRequest<CirculationAnomalyData>('/analytics/anomaly');
  return (
    res.data ?? {
      anomalyDetected: false,
      percentageIncrease: 0,
      discipline: '',
      keyTitlesWithZeroShelf: 0,
      message: 'No anomalous surge detected across catalog disciplines.',
    }
  );
};

export const getVelocityMetrics = async (
  granularity = '30D',
  startDate?: string,
  endDate?: string
): Promise<CoreVelocityData> => {
  const query = new URLSearchParams({ granularity });
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);

  const res = await apiRequest<CoreVelocityData>(`/analytics/velocity?${query.toString()}`);
  return (
    res.data ?? {
      granularity,
      dateRangeLabel: '',
      points: [],
      totalBorrowings: 0,
      totalReservations: 0,
      totalReturns: 0,
      totalOverdue: 0,
    }
  );
};

export const getInventoryDensity = async (): Promise<InventoryDensityData> => {
  const res = await apiRequest<InventoryDensityData>('/analytics/inventory-density');
  return (
    res.data ?? {
      totalVolumes: 0,
      availablePercent: 0,
      availableCount: 0,
      activeLoansPercent: 0,
      activeLoansCount: 0,
      stagedHoldsPercent: 0,
      stagedHoldsCount: 0,
      maintenancePercent: 0,
      maintenanceCount: 0,
      inventoryAuditActive: false,
      inventoryAuditStatusText: 'Stacks census idle',
      rfidSyncActive: false,
      rfidStatusText: 'Stacks census idle',
    }
  );
};

export const getCommunityFlow = async (): Promise<CommunityFlowData> => {
  const res = await apiRequest<CommunityFlowData>('/analytics/community-flow');
  return (
    res.data ?? {
      digitalLogins: 0,
      digitalLoginsVsLastMo: 0,
      recordedVisits: 0,
      turnstileCounterLabel: 'Circulation foot traffic (idle)',
      peakWindow: 'No activity recorded',
      wifiConcurrences: 0,
      hourlyFootfall: [],
    }
  );
};

export const getCirculationDemand = async (): Promise<CirculationDemandData> => {
  const res = await apiRequest<CirculationDemandData>('/analytics/demand');
  return (
    res.data ?? {
      showingCount: 0,
      totalRanked: 0,
      topTitles: [],
    }
  );
};

export const getTelemetryFeed = async (): Promise<TelemetryFeedData> => {
  const res = await apiRequest<TelemetryFeedData>('/analytics/telemetry');
  return (
    res.data ?? {
      latestEventText: 'Circulation operational telemetry online. Awaiting activity.',
      latestEventTime: new Date().toISOString(),
      nextSyncSecondsRemaining: 300,
      nextSyncCountdownFormatted: '05:00',
      isOnline: true,
    }
  );
};

export const refreshTelemetry = async (): Promise<TelemetryFeedData> => {
  const res = await apiRequest<TelemetryFeedData>('/analytics/refresh-telemetry', {
    method: 'POST',
  });
  return (
    res.data ?? {
      latestEventText: 'Telemetry refreshed. Awaiting activity.',
      latestEventTime: new Date().toISOString(),
      nextSyncSecondsRemaining: 300,
      nextSyncCountdownFormatted: '05:00',
      isOnline: true,
    }
  );
};

export const processBulkAction = async (
  selectedIds: string[],
  actionType: string,
  reason?: string
): Promise<ApiResponse<unknown>> => {
  return await apiRequest<unknown>('/analytics/bulk-action', {
    method: 'POST',
    body: JSON.stringify({ selectedIds, actionType, reason }),
  });
};
