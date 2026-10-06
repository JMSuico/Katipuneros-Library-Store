// [Layer: Endpoints/Admin]
// settingsApi.ts -- Typed API client stubs bridging Admin Settings Console to .NET 10 Web API.
// Contains typed fetch wrappers and request/response interfaces ONLY.
// DO NOT put business logic or UI rendering here.

import { apiRequest } from '../apiClient';

export interface TierPolicyDto {
  daysDuration: number;
  maxConcurrency: number;
  renewalLimit: string;
  holdQueueLimit: number;
  overdueTariff: string;
}

export interface CirculationPolicyResponse {
  tier1: TierPolicyDto;
  tier2: TierPolicyDto;
  tier3: TierPolicyDto;
  gracePeriodHours: number;
  activeBorrowersCovered: number;
  circulatingTitleCatalog: number;
  interLibraryLoanProtocol: string;
}

export interface ReservationSetupsResponse {
  instantReshelveNotice: boolean;
  thesisScholarPriority: boolean;
  pickupNotificationCadence: string;
}

export interface FineTariffsResponse {
  dailyOverdueTariff: number;
  maxPenaltyCap: number;
  bindingRepairTariff: number;
  lostBookAdministrativeFee: number;
  medicalWaiverEnabled: boolean;
  typhoonWaiverEnabled: boolean;
}

export interface SecurityGovernanceResponse {
  posAutoLogoffMinutes: number;
  superAdminTimeoutMinutes: number;
  auditNodeStatus: string;
  hashChainLength: number;
  hmacKeyStatus: string;
}

export interface SecurityTelemetryDto {
  totalSystemEvents24h: number;
  eventsGrowthRate: number;
  securityAnomalies: number;
  hashChainStatus: string;
  lastValidatedBlock: string;
  activeSuperAdminSessions: number;
}

export interface SystemSettingsResponse {
  circulation: CirculationPolicyResponse;
  reservations: ReservationSetupsResponse;
  fines: FineTariffsResponse;
  security: SecurityGovernanceResponse;
  telemetry: SecurityTelemetryDto;
}

export interface CidrSubnetDto {
  id: string;
  cidrRange: string;
  networkClassification: string;
  accessLevel: string;
  isActive: boolean;
  createdAt: string;
}

export interface ArchiveModuleSummaryDto {
  moduleName: string;
  activeRecords: number;
  archivedRecords: number;
  storageFootprintBytes: number;
  lastArchivedDate: string | null;
  retentionDays: number;
  sha256Seal: string;
}

export const getSystemSettings = async (): Promise<SystemSettingsResponse | null> => {
  const res = await apiRequest<SystemSettingsResponse>('/admin/settings');
  return res.success ? res.data : null;
};

export const updateCirculationPolicy = async (data: Partial<CirculationPolicyResponse>) =>
  await apiRequest<object>('/admin/settings/circulation', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const updateReservationSetups = async (data: Partial<ReservationSetupsResponse>) =>
  await apiRequest<object>('/admin/settings/reservations', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const updateFineTariffs = async (data: Partial<FineTariffsResponse>) =>
  await apiRequest<object>('/admin/settings/fines', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getSystemArchives = async (): Promise<ArchiveModuleSummaryDto[]> => {
  const res = await apiRequest<ArchiveModuleSummaryDto[]>('/admin/settings/archives');
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const getCidrSubnets = async (): Promise<CidrSubnetDto[]> => {
  const res = await apiRequest<CidrSubnetDto[]>('/admin/settings/cidr');
  return res.success && Array.isArray(res.data) ? res.data : [];
};

export const addCidrSubnet = async (data: { cidrRange: string; networkClassification: string; accessLevel: string }) =>
  await apiRequest<CidrSubnetDto>('/admin/settings/cidr', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const bulkDeleteCidrSubnets = async (ids: string[]) =>
  await apiRequest<object>('/admin/settings/cidr/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });

export const getSecurityTelemetry = async (): Promise<SecurityTelemetryDto | null> => {
  const res = await apiRequest<SecurityTelemetryDto>('/admin/settings/telemetry');
  return res.success ? res.data : null;
};

export const saveAllSystemSettings = async (settings: SystemSettingsResponse) =>
  await apiRequest<object>('/admin/settings/save', {
    method: 'POST',
    body: JSON.stringify(settings),
  });

export const resetSystemSettingsToDefault = async (modules: string[] = []) =>
  await apiRequest<object>('/admin/settings/reset', {
    method: 'POST',
    body: JSON.stringify({ modules }),
  });
