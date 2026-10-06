// [Layer: Endpoints/Admin]
// rolesApi.ts -- Typed API Client for Roles & Permissions Access Governance.
// Strictly adheres to AGENTS.md, SKILL.md, and universal expression bodies (=>).

import { apiRequest } from '../apiClient';

export interface PrivilegeItem {
  name: string;
  desc: string;
  enabled: boolean;
}

export interface SecurityMetrics {
  configuredRolesCount: number;
  defaultRolesCount: number;
  customRolesCount: number;
  activeIdentitiesCount: number;
  identityGrowthRate: number;
  superAdminsCount: number;
  twoFactorEnforcementRate: number;
}

export interface RoleConfig {
  id: string;
  key: string;
  title: string;
  desc: string;
  landingTitle: string;
  landingSub: string;
  tierBadge: string;
  privileges: PrivilegeItem[];
  policyTitle: string;
  policyBadge: string;
  policyDesc: string;
  assignedCount: string;
  avatarBadge: string;
  avatarSub: string;
  emergencyHoldOverride: boolean;
  cashDrawerKickout: boolean;
  fineCourtesyWaiver: boolean;
  holdStagingClearance: boolean;
}

export interface ModulePrivilegeItem {
  moduleId: string;
  moduleName: string;
  subsystem: string;
  icon: string;
  scopeDesc: string;
  adminGrant: string;
  cashierGrant: string;
  patronGrant: string;
  curatorGrant: string;
}

export interface TwoFactorKeyResult {
  secretKey: string;
  otpAuthUri: string;
  qrSeed: string;
  recoveryCodes: string[];
  generatedAt: string;
}

export interface UserLoginAudit {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: 'LOGIN' | 'LOGOUT';
  timestamp: string;
  formattedTimeAgo: string;
  twoFactorMethod: string;
  ipAddress: string;
  workstation: string;
  isSuccess: boolean;
}

export interface CirculationAnomaly {
  detected: boolean;
  title: string;
  description: string;
  holdVolumeIncreasePercent: number;
  zeroAvailabilityTitlesCount: number;
  categoryName: string;
}

export interface UpdateRolePolicyPayload {
  roleId?: string;
  title?: string;
  desc?: string;
  landingTitle?: string;
  landingSub?: string;
  tierBadge?: string;
  privileges?: PrivilegeItem[];
  policyTitle?: string;
  policyBadge?: string;
  policyDesc?: string;
  emergencyHoldOverride?: boolean;
  cashDrawerKickout?: boolean;
  fineCourtesyWaiver?: boolean;
  holdStagingClearance?: boolean;
}

export interface CreateCustomRolePayload {
  name: string;
  description: string;
  baseRole: string;
  privileges: PrivilegeItem[];
}

export interface GenerateTwoFactorKeyPayload {
  roleKey: string;
  userId?: string;
}

// Typed API Functions using clean expression bodies (=>)
export const getSecurityMetrics = async (): Promise<SecurityMetrics> =>
  (await apiRequest<SecurityMetrics>('/admin/roles/metrics')).data ?? {
    configuredRolesCount: 4,
    defaultRolesCount: 3,
    customRolesCount: 1,
    activeIdentitiesCount: 0,
    identityGrowthRate: 0.0,
    superAdminsCount: 0,
    twoFactorEnforcementRate: 0.0,
  };

export const getPrivilegeMatrix = async (): Promise<ModulePrivilegeItem[]> =>
  (await apiRequest<ModulePrivilegeItem[]>('/admin/roles/matrix')).data ?? [];

export const getRoleConfigs = async (): Promise<Record<string, RoleConfig>> =>
  (await apiRequest<Record<string, RoleConfig>>('/admin/roles/configs')).data ?? {};

export const getRoleConfigByKey = async (key: string): Promise<RoleConfig | null> =>
  (await apiRequest<RoleConfig>(`/admin/roles/configs/${key}`)).data ?? null;

export const updateRolePolicy = async (key: string, payload: UpdateRolePolicyPayload): Promise<{ message: string }> =>
  (
    await apiRequest<{ message: string }>(`/admin/roles/${key}/policy`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  ).data ?? { message: 'Updated' };

export const createCustomRole = async (payload: CreateCustomRolePayload): Promise<RoleConfig | null> =>
  (
    await apiRequest<RoleConfig>('/admin/roles/custom', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  ).data ?? null;

export const resetSecurityDefaults = async (): Promise<{ message: string }> =>
  (
    await apiRequest<{ message: string }>('/admin/roles/reset-defaults', {
      method: 'POST',
    })
  ).data ?? { message: 'Reset' };

export const generateTwoFactorKey = async (payload: GenerateTwoFactorKeyPayload): Promise<TwoFactorKeyResult | null> =>
  (
    await apiRequest<TwoFactorKeyResult>('/admin/roles/generate-2fa', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  ).data ?? null;

export const getLoginAuditStream = async (): Promise<UserLoginAudit[]> =>
  (await apiRequest<UserLoginAudit[]>('/admin/roles/auth-monitor')).data ?? [];

export const getCirculationAnomaly = async (): Promise<CirculationAnomaly> =>
  (await apiRequest<CirculationAnomaly>('/admin/roles/anomaly')).data ?? {
    detected: false,
    title: '',
    description: '',
    holdVolumeIncreasePercent: 0,
    zeroAvailabilityTitlesCount: 0,
    categoryName: '',
  };
