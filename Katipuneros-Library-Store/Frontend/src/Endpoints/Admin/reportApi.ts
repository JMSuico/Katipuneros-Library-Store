// [Layer: Endpoints/Admin]
// reportApi.ts -- API client stubs for official reports, statutory dossiers, audit attestation ledger, and schedule automation.
// Strictly consumes apiClient.ts; never bypasses or makes direct fetch/axios calls in UI components.
// Strict Real-Time Zero-Data Mandate: Returns 0 or clean zero data fallback if API is unreachable.
// DO NOT put UI rendering or business logic here.

import { apiRequest } from '../apiClient';

export interface AnalyticsSummary {
  totalUsers: number;
  totalBooks: number;
  activeLoans: number;
  pendingReservations: number;
  finesCollected: number;
}

export interface ReportSuite {
  id: string;
  suiteCode: string;
  title: string;
  description: string;
  standard: string;
  scopeLabel: string;
  scopeValue: string;
  icon: string;
  supportedFormats: string[];
}

export interface CompletedDossier {
  id: string;
  reference: string;
  title: string;
  executionTimestamp: string;
  timestampFormatted: string;
  certifiedGenerator: string;
  certifiedGeneratorRole: string;
  certifiedGeneratorAvatar: string;
  payloadSizeBytes: number;
  payloadSizeFormatted: string;
  verificationStatus: string;
  sha256Digest: string;
  exportFormat: string;
}

export interface DisciplinaryShare {
  term: string;
  stemPercent: number;
  humssPercent: number;
  healthPercent: number;
  lawBusPercent: number;
  targetEquilibriumIndex: number;
  pedagogicalThesisSummary: string;
}

export interface AuditStats {
  chainState: string;
  tamperViolationsCount: number;
  standardSeal: string;
  complianceLevel: string;
  activeAuditorSignaturesCount: number;
  signingPolicy: string;
}

export interface AuditAttestation {
  id: string;
  ledgerEvent: string;
  targetDossier: string;
  sha256DigestSignature: string;
  certifiedSignerName: string;
  certifiedSignerRole: string;
  certifiedSignerInitials: string;
  timestampUtc8: string;
  attestationStatus: string;
}

export interface ScheduleTrigger {
  id: string;
  cronExpression: string;
  title: string;
  description: string;
  channel: string;
  recipients: string;
  nextRunFormatted: string;
  isActive: boolean;
}

export interface VerifySealResult {
  isValid: boolean;
  matchedDigest: string;
  signerName: string;
  signerRole: string;
  attestationTimestamp: string;
  message: string;
}

export interface ReportPagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GenerateReportPayload {
  templateId: string;
  timeframe: string;
  discipline: string;
  exportFormat: string;
  appendDelinquencyBreakdown: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ReportFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  alphaFilter?: string;
  idFilter?: string;
}

// ----------------------------------------------------------------------
// API Functions using clean arrow functions (=>)
// ----------------------------------------------------------------------

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await apiRequest<AnalyticsSummary>('/admin/metrics');
  return res.success && res.data
    ? res.data
    : {
        totalUsers: 0,
        totalBooks: 0,
        activeLoans: 0,
        pendingReservations: 0,
        finesCollected: 0,
      };
};

export const getReportSuites = async (): Promise<ReportSuite[]> => {
  const res = await apiRequest<ReportSuite[]>('/reports/suites');
  return res.success && res.data ? res.data : [];
};

export interface CreateReportSuitePayload {
  suiteCode: string;
  title: string;
  description: string;
  standard: string;
  scopeLabel: string;
  scopeValue: string;
  icon: string;
  supportedFormats: string[];
}

export const createReportSuite = async (payload: CreateReportSuitePayload): Promise<ReportSuite | null> => {
  const res = await apiRequest<ReportSuite>('/reports/suites', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.success && res.data ? res.data : null;
};

export const updateReportSuite = async (id: string, payload: CreateReportSuitePayload): Promise<ReportSuite | null> => {
  const res = await apiRequest<ReportSuite>(`/reports/suites/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.success && res.data ? res.data : null;
};

export const deleteReportSuite = async (id: string): Promise<boolean> => {
  const res = await apiRequest<boolean>(`/reports/suites/${id}`, {
    method: 'DELETE',
  });
  return !!res.success && !!res.data;
};

export const getCompletedDossiers = async (
  params?: ReportFilterParams
): Promise<ReportPagedResult<CompletedDossier>> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  if (params?.sort) query.append('sort', params.sort);
  if (params?.startDate) query.append('startDate', params.startDate);
  if (params?.endDate) query.append('endDate', params.endDate);
  if (params?.alphaFilter) query.append('alphaFilter', params.alphaFilter);
  if (params?.idFilter) query.append('idFilter', params.idFilter);

  const res = await apiRequest<ReportPagedResult<CompletedDossier>>(`/reports/ledger?${query.toString()}`);
  return res.success && res.data
    ? res.data
    : { items: [], totalCount: 0, page: 1, pageSize: params?.pageSize || 10, totalPages: 0 };
};

export const getDisciplinaryShare = async (): Promise<DisciplinaryShare> => {
  const res = await apiRequest<DisciplinaryShare>('/reports/disciplinary-share');
  return res.success && res.data
    ? res.data
    : {
        term: 'Q1 2026',
        stemPercent: 0.0,
        humssPercent: 0.0,
        healthPercent: 0.0,
        lawBusPercent: 0.0,
        targetEquilibriumIndex: 1.15,
        pedagogicalThesisSummary: '',
      };
};

export const getAuditStats = async (): Promise<AuditStats> => {
  const res = await apiRequest<AuditStats>('/reports/audit-stats');
  return res.success && res.data
    ? res.data
    : {
        chainState: 'Genesis Ready',
        tamperViolationsCount: 0,
        standardSeal: 'ISO 2789:2018',
        complianceLevel: 'Statutory Compliance Level IV',
        activeAuditorSignaturesCount: 0,
        signingPolicy: 'Dual Key Multi-sign Required',
      };
};

export const getAuditAttestations = async (): Promise<AuditAttestation[]> => {
  const res = await apiRequest<AuditAttestation[]>('/reports/audit-attestations');
  return res.success && res.data ? res.data : [];
};

export const getScheduleTriggers = async (): Promise<ScheduleTrigger[]> => {
  const res = await apiRequest<ScheduleTrigger[]>('/reports/schedules');
  return res.success && res.data ? res.data : [];
};

export const generateReportDossier = async (
  payload: GenerateReportPayload
): Promise<CompletedDossier | null> => {
  const res = await apiRequest<CompletedDossier>('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.success && res.data ? res.data : null;
};

export const verifySealHash = async (
  hashOrId: string
): Promise<VerifySealResult> => {
  const res = await apiRequest<VerifySealResult>('/reports/verify-seal', {
    method: 'POST',
    body: JSON.stringify({ hashOrId }),
  });
  return res.success && res.data
    ? res.data
    : {
        isValid: false,
        matchedDigest: '',
        signerName: '',
        signerRole: '',
        attestationTimestamp: '',
        message: 'Unable to reach cryptographic attestation service.',
      };
};

export const executeReportBulkAction = async (
  action: string,
  dossierIds: string[]
): Promise<boolean> => {
  const res = await apiRequest<boolean>('/reports/bulk-action', {
    method: 'POST',
    body: JSON.stringify({ action, dossierIds }),
  });
  return !!res.success && !!res.data;
};

export const triggerScheduleRunNow = async (
  scheduleId: string
): Promise<boolean> => {
  const res = await apiRequest<boolean>(`/reports/schedules/${scheduleId}/run-now`, {
    method: 'POST',
  });
  return !!res.success && !!res.data;
};
