// [Layer: Endpoints/Admin]
// notificationApi.ts -- Typed API client for administrative communications, campus bulletins, automated dispatch queue, and system alerts.
// Connects strictly to /api/notifications endpoints on .NET 10 Web API.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface AdminSystemAlert {
  id: string;
  type: 'deficit' | 'delinquency' | 'hardware' | 'system';
  title: string;
  category: string;
  tag: string;
  triggeredAgo: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  isResolved: boolean;
  activeReservations?: number;
  availableCopies?: number;
  shelfBay?: string | null;
  delinquentPatronCount?: number;
  hardwareIp?: string | null;
}

export interface TopBentoMetrics {
  todayDispatchedTotal: number;
  todayEmail: number;
  todaySms: number;
  todayPush: number;
  deliveryReliability: number;
  deliveryFailRate: number;
  urgentAlertsCount: number;
  activeBulletinsCount: number;
  portalViewsToday: number;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  audience: string;
  channels: string[];
  status: string;
  priority: string;
  activeRange: string;
  createdAt: string;
  viewsCount: number;
  readsCount: number;
  openRate: number;
  isDraft: boolean;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  audience: string;
  channels: string[];
  priority: string;
  displayDuration: string;
  isDraft: boolean;
}

export interface UpdateAnnouncementPayload extends CreateAnnouncementPayload {
  status?: string;
}

export interface AnnouncementAnalytics {
  id: string;
  title: string;
  totalPortalViews: number;
  mobilePushReads: number;
  kioskImpressions: number;
  overallOpenRate: number;
  primaryAudience: string;
  activeChannels: string[];
  performanceSummary: string;
}

export interface AnnouncementsPagedResponse {
  items: CampusAnnouncement[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HashChainVerification {
  isIntact: boolean;
  verifiedCount: number;
  brokenEntryId?: string;
  statusMessage: string;
}

export const verifyAuditChain = async (): Promise<HashChainVerification | null> =>
  (await apiRequest<HashChainVerification>('/audit/verify-chain')).data ?? null;

export interface DispatchQueueTelemetry {
  nextBatchRunSeconds: number;
  nextBatchRunFormatted: string;
  batchWindowSeconds: number;
  daemonRunning: boolean;
  retryFailureRate: number;
  bouncedCount: number;
  totalSmsCount: number;
  queueDepth: number;
  pendingEmailCount: number;
  pendingSmsCount: number;
  queueStatus: string;
  twilioLimit: string;
  sendGridLimit: string;
  sesLimit: string;
  gatewayStatus: string;
}

export interface DispatchTransactionItem {
  dispatchId: string;
  recipientName: string;
  recipientId: string;
  recipientContact: string;
  triggerEvent: string;
  channel: string;
  deliveryStatus: string;
  statusSeverity: 'success' | 'inflight' | 'retrying' | 'queued';
  timestampFormatted: string;
  rawPayload: string;
}

export interface DispatchTemplateItem {
  id: string;
  category: string;
  name: string;
  channels: string;
  description: string;
  placeholders: string[];
  dispatchedToday: number;
  smsPreview: string;
  gsmCharacters: number;
  gsmLimit: number;
}

// -------------------------------------------------------------
// Top Bento Mosaic Metrics & Alerts API
// -------------------------------------------------------------

export const getTopBentoMetrics = async (): Promise<TopBentoMetrics> =>
  (await apiRequest<TopBentoMetrics>('/notifications/top-metrics')).data ?? {
    todayDispatchedTotal: 0,
    todayEmail: 0,
    todaySms: 0,
    todayPush: 0,
    deliveryReliability: 0.0,
    deliveryFailRate: 0.0,
    urgentAlertsCount: 0,
    activeBulletinsCount: 0,
    portalViewsToday: 0,
  };

export const getAdminAlerts = async (): Promise<AdminSystemAlert[]> =>
  (await apiRequest<AdminSystemAlert[]>('/notifications/alerts')).data ?? [];

export const resolveAllSystemAlerts = async (): Promise<boolean> =>
  (await apiRequest<boolean>('/notifications/alerts/resolve-all', { method: 'POST' })).data ?? false;

export const triggerAcquisitionOrder = async (payload: {
  monographTitle: string;
  copiesRequested: number;
  notes?: string;
}): Promise<boolean> =>
  (
    await apiRequest<boolean>('/notifications/alerts/trigger-acquisition', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  ).data ?? false;

export const sendRegistrarNotice = async (payload: {
  subject: string;
  memoNotes?: string;
  affectedPatronsCount: number;
}): Promise<boolean> =>
  (
    await apiRequest<boolean>('/notifications/alerts/send-registrar-notice', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  ).data ?? false;

export const pingHardwareTeam = async (payload: {
  deviceName: string;
  ipAddress: string;
  urgency: string;
}): Promise<boolean> =>
  (
    await apiRequest<boolean>('/notifications/alerts/ping-hardware', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  ).data ?? false;

export const repollHardwareSocket = async (): Promise<boolean> =>
  (await apiRequest<boolean>('/notifications/alerts/repoll-hardware', { method: 'POST' })).data ?? false;

// -------------------------------------------------------------
// Campus Announcements CRUD API
// -------------------------------------------------------------

export const getCampusAnnouncements = async (params: {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}): Promise<AnnouncementsPagedResponse> => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.sort) query.append('sort', params.sort);
  query.append('page', (params.page ?? 1).toString());
  query.append('pageSize', (params.pageSize ?? 10).toString());

  return (
    (await apiRequest<AnnouncementsPagedResponse>(`/notifications/announcements?${query.toString()}`)).data ?? {
      items: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    }
  );
};

export const createCampusAnnouncement = async (payload: CreateAnnouncementPayload): Promise<CampusAnnouncement | null> =>
  (
    await apiRequest<CampusAnnouncement>('/notifications/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  ).data ?? null;

export const updateCampusAnnouncement = async (
  id: string,
  payload: UpdateAnnouncementPayload
): Promise<CampusAnnouncement | null> =>
  (
    await apiRequest<CampusAnnouncement>(`/notifications/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  ).data ?? null;

export const deleteCampusAnnouncement = async (id: string): Promise<boolean> =>
  (
    await apiRequest<boolean>(`/notifications/announcements/${id}`, {
      method: 'DELETE',
    })
  ).data ?? false;

export const bulkDeleteCampusAnnouncements = async (ids: string[]): Promise<number> =>
  (
    await apiRequest<number>('/notifications/announcements/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  ).data ?? 0;

export const unpublishCampusAnnouncement = async (id: string): Promise<CampusAnnouncement | null> =>
  (
    await apiRequest<CampusAnnouncement>(`/notifications/announcements/${id}/unpublish`, {
      method: 'PUT',
    })
  ).data ?? null;

export const getAnnouncementAnalytics = async (id: string): Promise<AnnouncementAnalytics | null> =>
  (await apiRequest<AnnouncementAnalytics>(`/notifications/announcements/${id}/analytics`)).data ?? null;

// -------------------------------------------------------------
// Dispatch Queue & Telemetry API
// -------------------------------------------------------------

export const getDispatchQueueTelemetry = async (): Promise<DispatchQueueTelemetry> =>
  (await apiRequest<DispatchQueueTelemetry>('/notifications/dispatch-queue/telemetry')).data ?? {
    nextBatchRunSeconds: 0,
    nextBatchRunFormatted: 'in 00m 00s',
    batchWindowSeconds: 180,
    daemonRunning: false,
    retryFailureRate: 0.0,
    bouncedCount: 0,
    totalSmsCount: 0,
    queueDepth: 0,
    pendingEmailCount: 0,
    pendingSmsCount: 0,
    queueStatus: 'Idle',
    twilioLimit: 'Twilio: 30/min',
    sendGridLimit: 'SendGrid: 120/min',
    sesLimit: 'SES: 40/sec quota',
    gatewayStatus: 'Nominal',
  };

export const getDispatchTransactions = async (): Promise<DispatchTransactionItem[]> =>
  (await apiRequest<DispatchTransactionItem[]>('/notifications/dispatch-queue/transactions')).data ?? [];

export const getDispatchTemplates = async (): Promise<DispatchTemplateItem[]> =>
  (await apiRequest<DispatchTemplateItem[]>('/notifications/dispatch-queue/templates')).data ?? [];

export const dispatchBroadcastNotice = async (notice: {
  title: string;
  message: string;
  channels: string[];
  targetRoles: string[];
}) =>
  await apiRequest<object>('/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify(notice),
  });
