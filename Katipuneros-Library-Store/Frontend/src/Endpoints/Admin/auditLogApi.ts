// [Layer: Endpoints/Admin]
// auditLogApi.ts -- Typed API Client for Immutable System Audit Logs and Merkle Root Verification.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

import { apiRequest } from '../apiClient';

export interface AuditLogTableEntry {
  id: string;
  timestamp: string;
  formattedTimestamp: string;
  userIdentity: string;
  role: string;
  moduleScope: string;
  eventAction: string;
  recordRef: string;
  deltaModification: string;
  nodeIp: string;
  integritySeal: string;
  integritySealShort: string;
  severity: 'Info' | 'Warning' | 'Critical' | string;
  rawPayloadJson: string;
}

export interface AuditMetrics {
  totalEvents24h: number;
  eventsGrowthRate: number;
  securityAnomaliesCount: number;
  hashChainStatusPercent: number;
  lastValidatedBlock: number;
  activeSuperAdminSessions: number;
  superAdminLocations: string;
}

export interface MerkleRootStatus {
  merkleRoot: string;
  verifiedRecordsCount: number;
  isChainIntact: boolean;
  statusMessage: string;
  lastValidatedTimeAgo: string;
}

export interface PagedAuditLogs {
  items: AuditLogTableEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogQuery {
  searchTerm?: string;
  severity?: string;
  module?: string;
  timeframe?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface UserLoginAudit {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: 'LOGIN' | 'LOGOUT' | string;
  timestamp: string;
  formattedTimeAgo: string;
  twoFactorMethod: string;
  ipAddress: string;
  workstation: string;
  isSuccess: boolean;
}

export const getAuditLogs = async (query?: AuditLogQuery): Promise<PagedAuditLogs> => {
  const params = new URLSearchParams();
  if (query?.searchTerm) params.append('searchTerm', query.searchTerm);
  if (query?.severity) params.append('severity', query.severity);
  if (query?.module) params.append('module', query.module);
  if (query?.timeframe) params.append('timeframe', query.timeframe);
  if (query?.startDate) params.append('startDate', query.startDate);
  if (query?.endDate) params.append('endDate', query.endDate);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.pageSize) params.append('pageSize', query.pageSize.toString());

  const qs = params.toString();
  return (
    (await apiRequest<PagedAuditLogs>(`/admin/audit-logs${qs ? `?${qs}` : ''}`)).data ?? {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }
  );
};

export const getAuditMetrics = async (): Promise<AuditMetrics> =>
  (await apiRequest<AuditMetrics>('/admin/audit-logs/metrics')).data ?? {
    totalEvents24h: 0,
    eventsGrowthRate: 0.0,
    securityAnomaliesCount: 0,
    // On an unreachable/failed request nothing has been verified. Defaulting to
    // 100.0 told operators the audit hash chain was fully intact when the check
    // had not run at all -- the most dangerous possible failure direction.
    hashChainStatusPercent: 0.0,
    lastValidatedBlock: 0,
    activeSuperAdminSessions: 0,
    superAdminLocations: 'Telemetry unavailable',
  };

export const getMerkleRoot = async (): Promise<MerkleRootStatus> =>
  (await apiRequest<MerkleRootStatus>('/admin/audit-logs/merkle-root')).data ?? {
    merkleRoot: '',
    verifiedRecordsCount: 0,
    // Integrity cannot be asserted when the verification request failed.
    isChainIntact: false,
    statusMessage: 'Verification unavailable',
    lastValidatedTimeAgo: 'Never',
  };

export const forceReindexChain = async (): Promise<MerkleRootStatus> =>
  (
    await apiRequest<MerkleRootStatus>('/admin/audit-logs/force-reindex', {
      method: 'POST',
    })
  ).data ?? {
    merkleRoot: '',
    verifiedRecordsCount: 0,
    // A failed reindex verifies nothing -- reporting an intact chain here would
    // falsely reassure an operator that the audit log had been rebuilt.
    isChainIntact: false,
    statusMessage: 'Reindex unavailable',
    lastValidatedTimeAgo: 'Never',
  };

export const verifyAuditChain = async (): Promise<{
  isIntact: boolean;
  verifiedCount: number;
  brokenEntryId?: string;
  message: string;
}> => {
  const res = await apiRequest<{
    isIntact: boolean;
    verifiedCount: number;
    brokenEntryId?: string;
    message: string;
  }>('/admin/audit-logs/verify-chain');
  return (
    res.data ?? {
      isIntact: false,
      verifiedCount: 0,
      message: res.message || 'Chain verification failed or unreachable',
    }
  );
};

export const getAuthMonitorStream = async (): Promise<UserLoginAudit[]> => {
  const res = await apiRequest<UserLoginAudit[]>('/admin/audit-logs/auth-monitor');
  return Array.isArray(res.data) ? res.data : [];
};

export const bulkDeleteAuditLogs = async (ids: string[]): Promise<{ message: string }> => {
  const res = await apiRequest<{ message: string }>('/admin/audit-logs/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  return res.data ?? { message: res.message || (res.success ? 'Audit logs deleted' : 'Failed to delete audit logs') };
};
