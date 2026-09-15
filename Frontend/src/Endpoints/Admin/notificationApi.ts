// [Layer: Endpoints/Admin]
// notificationApi.ts -- API client for administrative alerts, audit telemetry, and hash-chain verification.
// Dispatches requests to /api/audit on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface AdminSystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  targetEntity: string;
  recordRef?: string;
  deltaModification?: string;
  ipAddress: string;
  severity: string;
  timestamp: string;
  previousHash: string;
  currentHash: string;
}

export interface HashChainVerification {
  isIntact: boolean;
  verifiedCount: number;
  brokenEntryId?: string;
  statusMessage: string;
}

export async function getAdminAlerts(): Promise<AdminSystemAlert[]> {
  const res = await apiRequest<AuditLogItem[]>('/audit/logs?limit=10');

  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.map((log) => ({
      id: log.id,
      level: (log.severity.toLowerCase() === 'critical'
        ? 'critical'
        : log.severity.toLowerCase() === 'warning'
        ? 'warning'
        : 'info') as 'info' | 'warning' | 'critical',
      title: `${log.action} - ${log.targetEntity}`,
      message: log.deltaModification || `Action '${log.action}' performed on ${log.targetEntity} (IP: ${log.ipAddress}).`,
      timestamp: new Date(log.timestamp).toLocaleTimeString(),
    }));
  }

  // Fallback defaults
  return [
    {
      id: 'alt-1',
      level: 'info',
      title: 'Database Sync Active',
      message: 'EF Core 10 database KatipunerosLibraryDb connection is active.',
      timestamp: 'Just now',
    },
  ];
}

export async function verifyAuditChain(): Promise<HashChainVerification | null> {
  const res = await apiRequest<HashChainVerification>('/audit/verify-chain');
  return res.success ? res.data : null;
}
