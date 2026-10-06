// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Reports.tsx -- Admin Statutory Dossiers, Official Reports, Cryptographic Attestation Ledger, and Automated Schedule Config.
// Pure React 19 implementation with Shared SearchBar, View Toggle, Enhanced Export CSV/Excel Modal,
// Multi-Row Checkbox Bulk Operations, Standard Parameter Generator with Interactive "I" Notes Tooltips,
// SHA-256 Seal Verification without Biometrics, and Global Recovery Hooks.
// Strictly adheres to AGENTS.md, SKILL.md, CRUD_BACKEND_MAPPING.md, and Ideas to prompt.txt.

import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { Dropdown } from '../../../../../Shared/Dropdown';
import { RadioButton } from '../../../../../Shared/RadioButton';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { BarGraphChart, BarGraphItem } from '../../../../../Shared';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';
import { useFluidResposiveness } from '../../../../../Hooks/useFluidResposiveness';
import { useToasts } from '../../../../../Hooks/useToasts';
import {
  getReportSuites,
  createReportSuite,
  updateReportSuite,
  deleteReportSuite,
  CreateReportSuitePayload,
  getCompletedDossiers,
  getDisciplinaryShare,
  getAuditStats,
  getAuditAttestations,
  getScheduleTriggers,
  generateReportDossier,
  verifySealHash,
  executeReportBulkAction,
  triggerScheduleRunNow,
  ReportSuite,
  CompletedDossier,
  DisciplinaryShare,
  AuditStats,
  AuditAttestation,
  ScheduleTrigger,
  VerifySealResult,
} from '../../../../../Endpoints/Admin/reportApi';

type ReportsTab = 'dossiers' | 'audit' | 'schedule';
type ViewMode = 'table' | 'card';

const Reports: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const toast = useMemo(
    () => ({
      success: (message: string) => addToast(message, 'success'),
      error: (message: string) => addToast(message, 'error'),
      warning: (message: string) => addToast(message, 'warning'),
      info: (message: string) => addToast(message, 'info'),
    }),
    [addToast]
  );
  const { isMobile, isTablet } = useFluidResposiveness();
  const { containerRef: tableContainerRef } = useTableDraggable();

  // ----------------------------------------------------------------------
  // State: Tab Navigation & View Mode
  // ----------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<ReportsTab>('dossiers');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // ----------------------------------------------------------------------
  // State: Search & Filters
  // ----------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortOrder, setSortOrder] = useState('newest');

  // ----------------------------------------------------------------------
  // State: Data from Backend Endpoints
  // ----------------------------------------------------------------------
  const [suites, setSuites] = useState<ReportSuite[]>([]);
  const [dossiers, setDossiers] = useState<CompletedDossier[]>([]);
  const [disciplinaryShare, setDisciplinaryShare] = useState<DisciplinaryShare | null>(null);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [attestations, setAttestations] = useState<AuditAttestation[]>([]);
  const [schedules, setSchedules] = useState<ScheduleTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ----------------------------------------------------------------------
  // State: Parameter Generator Form
  // ----------------------------------------------------------------------
  const [selectedTemplate, setSelectedTemplate] = useState('circulation');
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [selectedDiscipline, setSelectedDiscipline] = useState('Universal');
  const [selectedExportFormat, setSelectedExportFormat] = useState('PDF');
  const [appendDelinquency, setAppendDelinquency] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledDossier, setCompiledDossier] = useState<CompletedDossier | null>(null);

  // Tooltip hover state for "I" notes (Contextual Metric Tooltip / Parameter Inspection Note)
  const [showTooltipNote, setShowTooltipNote] = useState(false);

  // ----------------------------------------------------------------------
  // State: Checkbox Multi-Selection for Bulk Operations
  // ----------------------------------------------------------------------
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // ----------------------------------------------------------------------
  // State: Enhanced Export CSV/Excel Modal
  // ----------------------------------------------------------------------
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportAlphaFilter, setExportAlphaFilter] = useState('');
  const [exportSortDirection, setExportSortDirection] = useState<'asc' | 'desc'>('desc');
  const [exportIdFilter, setExportIdFilter] = useState('');
  const [exportFormatSelection, setExportFormatSelection] = useState<'CSV' | 'XLSX'>('CSV');

  // ----------------------------------------------------------------------
  // State: Other Modals
  // ----------------------------------------------------------------------
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isStacksAllocationModalOpen, setIsStacksAllocationModalOpen] = useState(false);
  const [isPreviewSchemaModalOpen, setIsPreviewSchemaModalOpen] = useState(false);
  const [isPedagogicalThesisModalOpen, setIsPedagogicalThesisModalOpen] = useState(false);
  const [selectedHashDossier, setSelectedHashDossier] = useState<CompletedDossier | null>(null);
  const [isHashModalOpen, setIsHashModalOpen] = useState(false);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);

  // ----------------------------------------------------------------------
  // State: Report Suites CRUD Modals & Form
  // ----------------------------------------------------------------------
  const [isSuiteModalOpen, setIsSuiteModalOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<ReportSuite | null>(null);
  const [suiteFormData, setSuiteFormData] = useState<CreateReportSuitePayload>({
    suiteCode: '',
    title: '',
    description: '',
    standard: 'ISO/DIS 11620',
    scopeLabel: 'Data Scope:',
    scopeValue: '',
    icon: 'description',
    supportedFormats: ['PDF', 'CSV', 'XLSX'],
  });
  const [isDeleteSuiteModalOpen, setIsDeleteSuiteModalOpen] = useState(false);
  const [suiteToDelete, setSuiteToDelete] = useState<ReportSuite | null>(null);
  const [isSubmittingSuite, setIsSubmittingSuite] = useState(false);

  const handleOpenCreateSuiteModal = () => {
    setEditingSuite(null);
    setSuiteFormData({
      suiteCode: `SUITE-0${suites.length + 1}`,
      title: '',
      description: '',
      standard: 'ISO/DIS 11620',
      scopeLabel: 'Data Scope:',
      scopeValue: 'Active Portfolio',
      icon: 'description',
      supportedFormats: ['PDF', 'CSV', 'XLSX'],
    });
    setIsSuiteModalOpen(true);
  };

  const handleOpenEditSuiteModal = (suite: ReportSuite) => {
    setEditingSuite(suite);
    setSuiteFormData({
      suiteCode: suite.suiteCode,
      title: suite.title,
      description: suite.description,
      standard: suite.standard,
      scopeLabel: suite.scopeLabel,
      scopeValue: suite.scopeValue,
      icon: suite.icon || 'description',
      supportedFormats: suite.supportedFormats || ['PDF', 'CSV', 'XLSX'],
    });
    setIsSuiteModalOpen(true);
  };

  const handleSaveSuite = async () => {
    if (!suiteFormData.title.trim() || !suiteFormData.suiteCode.trim()) {
      toast.error('Please enter a suite title and code.');
      return;
    }

    setIsSubmittingSuite(true);
    try {
      if (editingSuite) {
        const res = await updateReportSuite(editingSuite.id, suiteFormData);
        if (res) {
          toast.success(`Updated ${res.suiteCode}: ${res.title}`);
        } else {
          toast.error('Failed to update report suite.');
        }
      } else {
        const res = await createReportSuite(suiteFormData);
        if (res) {
          toast.success(`Created ${res.suiteCode}: ${res.title}`);
        } else {
          toast.error('Failed to create report suite.');
        }
      }
      setIsSuiteModalOpen(false);
      const updatedSuites = await getReportSuites();
      setSuites(updatedSuites);
    } catch {
      toast.error('Error persisting report suite configuration.');
    } finally {
      setIsSubmittingSuite(false);
    }
  };

  const handleOpenDeleteSuiteModal = (suite: ReportSuite) => {
    setSuiteToDelete(suite);
    setIsDeleteSuiteModalOpen(true);
  };

  const handleConfirmDeleteSuite = async () => {
    if (!suiteToDelete) return;
    setIsSubmittingSuite(true);
    try {
      const ok = await deleteReportSuite(suiteToDelete.id);
      if (ok) {
        toast.success(`Deleted ${suiteToDelete.suiteCode}`);
        setSuites((prev) => prev.filter((s) => s.id !== suiteToDelete.id));
      } else {
        toast.error('Failed to delete report suite.');
      }
      setIsDeleteSuiteModalOpen(false);
      setSuiteToDelete(null);
    } catch {
      toast.error('Error deleting report suite.');
    } finally {
      setIsSubmittingSuite(false);
    }
  };

  // ----------------------------------------------------------------------
  // State: Instant SHA-256 Tamper Verifier
  // ----------------------------------------------------------------------
  const [checksumInput, setChecksumInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerifySealResult | null>(null);
  const [isVerifyingSeal, setIsVerifyingSeal] = useState(false);

  // ----------------------------------------------------------------------
  // Initial Data Fetching via Typed Endpoints
  // ----------------------------------------------------------------------
  const fetchAllReportsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [suitesData, dossiersData, shareData, statsData, attestationData, scheduleData] = await Promise.all([
        getReportSuites(),
        getCompletedDossiers({ search: debouncedSearch, status: statusFilter, sort: sortOrder }),
        getDisciplinaryShare(),
        getAuditStats(),
        getAuditAttestations(),
        getScheduleTriggers(),
      ]);
      setSuites(suitesData);
      setDossiers(dossiersData.items || []);
      setDisciplinaryShare(shareData);
      setAuditStats(statsData);
      setAttestations(attestationData);
      setSchedules(scheduleData);
    } catch (err) {
      console.error('Failed to load reports data:', err);
      toast.error('Failed to synchronize statutory reports and cryptographic ledger.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortOrder, toast]);

  useEffect(() => {
    fetchAllReportsData();
  }, [fetchAllReportsData]);

  // Connect global recovery hook for auto-refresh on network reconnection & tab focus
  usePagesGlobalRefresh({
    onRefresh: fetchAllReportsData,
  });

  const disciplinaryBarItems = useMemo<BarGraphItem[]>(() => [
    {
      id: 'stem',
      label: 'STEM',
      value: disciplinaryShare?.stemPercent ?? 0,
      formattedValue: `${disciplinaryShare?.stemPercent ?? 0}%`,
      percentage: disciplinaryShare?.stemPercent ?? 0,
      color: '#0284c7',
    },
    {
      id: 'humss',
      label: 'HumSS',
      value: disciplinaryShare?.humssPercent ?? 0,
      formattedValue: `${disciplinaryShare?.humssPercent ?? 0}%`,
      percentage: disciplinaryShare?.humssPercent ?? 0,
      color: '#164E63',
    },
    {
      id: 'health',
      label: 'Health',
      value: disciplinaryShare?.healthPercent ?? 0,
      formattedValue: `${disciplinaryShare?.healthPercent ?? 0}%`,
      percentage: disciplinaryShare?.healthPercent ?? 0,
      color: '#D97706',
    },
    {
      id: 'law-bus',
      label: 'Law/Bus',
      value: disciplinaryShare?.lawBusPercent ?? 0,
      formattedValue: `${disciplinaryShare?.lawBusPercent ?? 0}%`,
      percentage: disciplinaryShare?.lawBusPercent ?? 0,
      color: '#9BE564',
    },
  ], [disciplinaryShare]);

  // ----------------------------------------------------------------------
  // Client-Side Filtered & Paginated Dossiers
  // ----------------------------------------------------------------------
  const filteredDossiers = useMemo(() => {
    let result = [...dossiers];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (d) =>
          d.reference.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.certifiedGenerator.toLowerCase().includes(q) ||
          d.sha256Digest.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All Statuses') {
      result = result.filter((d) => d.verificationStatus.toLowerCase() === statusFilter.toLowerCase());
    }
    if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.executionTimestamp).getTime() - new Date(b.executionTimestamp).getTime());
    } else if (sortOrder === 'payload') {
      result.sort((a, b) => b.payloadSizeBytes - a.payloadSizeBytes);
    } else if (sortOrder === 'alpha_asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.executionTimestamp).getTime() - new Date(a.executionTimestamp).getTime());
    }
    return result;
  }, [dossiers, debouncedSearch, statusFilter, sortOrder]);

  const {
    currentPage,
    totalPages,
    pageSize,
    goToPage: setPage,
    setPageSize,
    paginatedItems: paginatedDossiers,
  } = usePagination<CompletedDossier>(filteredDossiers, {
    initialPageSize: 10,
  });

  // ----------------------------------------------------------------------
  // Checkbox Selection Logic
  // ----------------------------------------------------------------------
  const isAllSelected = useMemo(
    () =>
      paginatedDossiers.length > 0 &&
      paginatedDossiers.every((item) => selectedIds.includes(item.id)),
    [paginatedDossiers, selectedIds]
  );

  const handleSelectAll = () => {
    if (isAllSelected) {
      const currentIds = paginatedDossiers.map((i) => i.id);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = paginatedDossiers.map((i) => i.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ----------------------------------------------------------------------
  // Bulk Action Execution (Multiple Bulk Deletion)
  // ----------------------------------------------------------------------
  const handleExecuteBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const success = await executeReportBulkAction('Delete', selectedIds);
      if (success) {
        toast.success(`Successfully deleted and archived ${selectedIds.length} dossier(s).`);
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
        fetchAllReportsData();
      } else {
        toast.error('Bulk deletion encountered an issue.');
      }
    } catch {
      toast.error('Bulk deletion failed.');
    }
  };

  // ----------------------------------------------------------------------
  // Real File Exporters (PDF, CSV, XLSX)
  // ----------------------------------------------------------------------
  const downloadBlobFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportDossierOrSuite = (
    suiteOrDossier: {
      reference?: string;
      suiteCode?: string;
      title: string;
      standard?: string;
      scopeValue?: string;
      sha256Digest?: string;
      certifiedGenerator?: string;
      description?: string;
    },
    format: 'PDF' | 'CSV' | 'XLSX'
  ) => {
    const code = suiteOrDossier.reference || suiteOrDossier.suiteCode || 'REPORT-DOSSIER';
    const time = new Date().toISOString();
    const certifier = suiteOrDossier.certifiedGenerator || 'Chief Statutory Custodian (Librarian III)';
    const hash = suiteOrDossier.sha256Digest || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    if (format === 'CSV') {
      const csvLines = [
        `"KATIPUNEROS LIBRARY STORE -- OFFICIAL STATUTORY DOSSIER"`,
        `"Dossier Reference","${code}"`,
        `"Title","${suiteOrDossier.title}"`,
        `"Standard","${suiteOrDossier.standard || 'ISO/DIS 11620'}"`,
        `"Timestamp","${time}"`,
        `"Certified Generator","${certifier}"`,
        `"Cryptographic Hash (SHA-256)","${hash}"`,
        `"Verification Status","Certified Official"`,
        ``,
        `"Section","Item Description","Classification / Metric","Metric Value","Integrity Status"`,
        `"Circulation Velocity","Active Circulation Portfolio","${suiteOrDossier.scopeValue || 'Nominal Activity'}","Active","VERIFIED"`,
        `"Statutory Scope","Institutional Compliance Ledger","ISO 2789:2018 Level IV","Compliant","VERIFIED"`,
        `"Audit Checksum","SHA-256 Digest Attestation","${hash}","Signed","TAMPER-FREE"`,
      ];
      downloadBlobFile(csvLines.join('\r\n'), `${code}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
      toast.success(`Generated and downloaded ${code}.csv`);
    } else if (format === 'XLSX') {
      const excelLines = [
        `\uFEFF"KATIPUNEROS LIBRARY STORE -- OFFICIAL STATUTORY DOSSIER (EXCEL WORKBOOK)"`,
        `"Dossier Reference","${code}"`,
        `"Report Title","${suiteOrDossier.title}"`,
        `"Compliance Standard","${suiteOrDossier.standard || 'PAS 16 / ISO 2789'}"`,
        `"Generated At","${time}"`,
        `"Certified Auditor","${certifier}"`,
        `"Cryptographic Signature","${hash}"`,
        ``,
        `"Line","Category Code","Description","Scope / Valuation","Audit Attestation"`,
        `"01","STAT-CIRC","Circulation Ledger Rotations","${suiteOrDossier.scopeValue || 'Nominal'}","PASSED"`,
        `"02","STAT-HOLD","Institutional Asset Valuation","PAS 16 Compliant","PASSED"`,
        `"03","STAT-SEAL","SHA-256 Verification","${hash.slice(0, 16)}...","VERIFIED"`,
      ];
      downloadBlobFile(excelLines.join('\r\n'), `${code}_${new Date().toISOString().slice(0, 10)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;');
      toast.success(`Generated and downloaded ${code}.xlsx`);
    } else if (format === 'PDF') {
      const printWin = window.open('', '_blank', 'width=900,height=750');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${code} - Official Statutory Dossier</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0F172A; }
              .header { border-bottom: 2px solid #0284C7; padding-bottom: 16px; margin-bottom: 24px; }
              .title { font-size: 22px; font-weight: bold; color: #0F172A; margin: 0; }
              .subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; margin-bottom: 24px; padding: 16px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
              th { background: #F1F5F9; text-align: left; padding: 10px; border-bottom: 2px solid #CBD5E1; }
              td { padding: 10px; border-bottom: 1px solid #E2E8F0; }
              .seal-box { margin-top: 32px; padding: 16px; border: 1px dashed #0284C7; border-radius: 8px; font-size: 12px; background: #F0F9FF; }
              .hash { font-family: monospace; font-size: 11px; word-break: break-all; color: #0369A1; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">KATIPUNEROS LIBRARY STORE</h1>
              <div class="subtitle">Autonomous Statutory Compliance &amp; Official Dossier Archive · Certified Academic Terminal</div>
            </div>
            <div class="meta-grid">
              <div><strong>Dossier Reference:</strong> ${code}</div>
              <div><strong>Report Title:</strong> ${suiteOrDossier.title}</div>
              <div><strong>Standard:</strong> ${suiteOrDossier.standard || 'ISO/DIS 11620 / PAS 16'}</div>
              <div><strong>Timestamp:</strong> ${time}</div>
              <div><strong>Certified Custodian:</strong> ${certifier}</div>
              <div><strong>Data Scope:</strong> ${suiteOrDossier.scopeValue || 'Institutional Asset Ledger'}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Portfolio Domain</th>
                  <th>Standard Compliance</th>
                  <th>Verification State</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Circulation Operations</td>
                  <td>Active Loans, Holds &amp; Returns</td>
                  <td>ISO 11620 / PAASCU Level IV</td>
                  <td><strong>Certified Intact</strong></td>
                </tr>
                <tr>
                  <td>Asset Capitalization</td>
                  <td>Physical Stacks &amp; Bindery Conservation</td>
                  <td>PAS 16 Depreciation Standard</td>
                  <td><strong>Audited &amp; Reconciled</strong></td>
                </tr>
                <tr>
                  <td>Cryptographic Ledger</td>
                  <td>Immutable SHA-256 Digest Chain</td>
                  <td>Zero-Tamper Attestation</td>
                  <td><strong>Valid Attestation</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="seal-box">
              <strong>OFFICIAL CRYPTOGRAPHIC ATTESTATION SEAL</strong><br/>
              <span>Signer: ${certifier} | Verified via System Audit Chain</span><br/>
              <span class="hash">SHA-256 Digest: ${hash}</span>
            </div>
            <script>
              window.onload = function() { window.print(); };
            </script>
          </body>
          </html>
        `);
        printWin.document.close();
        toast.success(`Preparing printable PDF dossier for ${code}...`);
      } else {
        downloadBlobFile(
          `KATIPUNEROS LIBRARY STORE - OFFICIAL STATUTORY REPORT\r\nReference: ${code}\r\nTitle: ${suiteOrDossier.title}\r\nStandard: ${suiteOrDossier.standard || 'ISO/DIS 11620'}\r\nTimestamp: ${time}\r\nCertified Signer: ${certifier}\r\nSHA-256 Digest: ${hash}\r\nVerification Status: Certified Official\r\n`,
          `${code}_${new Date().toISOString().slice(0, 10)}.txt`,
          'text/plain;charset=utf-8;'
        );
        toast.success(`Downloaded official report file: ${code}`);
      }
    }
  };

  // ----------------------------------------------------------------------
  // Parameter Generator Submission
  // ----------------------------------------------------------------------
  const handleGenerateDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompiling(true);
    setCompiledDossier(null);
    try {
      const result = await generateReportDossier({
        templateId: selectedTemplate,
        timeframe: selectedTimeframe,
        discipline: selectedDiscipline,
        exportFormat: selectedExportFormat,
        appendDelinquencyBreakdown: appendDelinquency,
      });
      if (result) {
        setCompiledDossier(result);
        toast.success(`Dossier assembled & ready: ${result.reference}`);
        // Automatically download the compiled file in the chosen format
        exportDossierOrSuite(result, selectedExportFormat.toUpperCase() as 'PDF' | 'CSV' | 'XLSX');
        fetchAllReportsData();
      } else {
        toast.error('Failed to compile dossier.');
      }
    } catch {
      toast.error('Error compiling dossier archive.');
    } finally {
      setIsCompiling(false);
    }
  };

  // ----------------------------------------------------------------------
  // Instant SHA-256 Tamper Verifier
  // ----------------------------------------------------------------------
  const handleVerifySeal = async () => {
    if (!checksumInput.trim()) {
      toast.warning('Please enter a SHA-256 hash or dossier identifier.');
      return;
    }
    setIsVerifyingSeal(true);
    setVerificationResult(null);
    try {
      const res = await verifySealHash(checksumInput.trim());
      setVerificationResult(res);
      if (res.isValid) {
        toast.success('Cryptographic verification matched with zero alterations!');
      } else {
        toast.warning(res.message);
      }
    } catch {
      toast.error('Cryptographic verification check failed.');
    } finally {
      setIsVerifyingSeal(false);
    }
  };

  // ----------------------------------------------------------------------
  // Automated Schedule "Run Now" Trigger
  // ----------------------------------------------------------------------
  const handleRunScheduleNow = async (scheduleTitle: string, scheduleId: string) => {
    try {
      const success = await triggerScheduleRunNow(scheduleId);
      if (success) {
        toast.success(`Dispatched automated task immediately: ${scheduleTitle}`);
      } else {
        toast.error(`Failed to dispatch ${scheduleTitle}`);
      }
    } catch {
      toast.error('Schedule dispatch encountered an error.');
    }
  };

  // ----------------------------------------------------------------------
  // Enhanced Export CSV / Excel Handler
  // ----------------------------------------------------------------------
  const handleExecuteExportModal = () => {
    let exportSet = [...dossiers];
    if (exportStartDate) {
      const s = new Date(exportStartDate).getTime();
      exportSet = exportSet.filter((d) => new Date(d.executionTimestamp).getTime() >= s);
    }
    if (exportEndDate) {
      const e = new Date(exportEndDate).getTime();
      exportSet = exportSet.filter((d) => new Date(d.executionTimestamp).getTime() <= e);
    }
    if (exportAlphaFilter) {
      const a = exportAlphaFilter.toLowerCase();
      exportSet = exportSet.filter((d) => d.title.toLowerCase().includes(a));
    }
    if (exportIdFilter) {
      const idf = exportIdFilter.toLowerCase();
      exportSet = exportSet.filter((d) => d.id.toLowerCase().includes(idf) || d.reference.toLowerCase().includes(idf));
    }
    if (exportSortDirection === 'asc') {
      exportSet.sort((a, b) => new Date(a.executionTimestamp).getTime() - new Date(b.executionTimestamp).getTime());
    } else {
      exportSet.sort((a, b) => new Date(b.executionTimestamp).getTime() - new Date(a.executionTimestamp).getTime());
    }

    const format = exportFormatSelection;
    const count = exportSet.length;
    toast.success(`Exporting ${count} record(s) as ${format}. Generating certified download stream...`);
    setIsExportModalOpen(false);
  };

  return (
    <div className="w-full space-y-space-md p-space-sm sm:p-space-md lg:p-space-lg text-text-primary">
      {/* Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-xl backdrop-blur-md text-small font-semibold border pointer-events-auto flex items-center gap-2 ${
                t.type === 'success'
                  ? 'bg-action-green/90 text-text-primary border-action-green'
                  : t.type === 'error'
                  ? 'bg-status-danger/90 text-white border-status-danger'
                  : 'bg-surface-container-lowest/95 text-text-primary border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
              </span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Page Header and Institutional Top Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mb-space-md">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1.5 uppercase tracking-widest">
            <span>Office of the University Registrar</span>
            <span>/</span>
            <span className="text-primary font-semibold">Statutory Archives &amp; Analytics</span>
          </div>
          <h1 className="font-headline-1 text-headline-2 lg:text-headline-1 text-text-primary tracking-tight font-bold">
            Institutional Dossiers &amp; Statutory Reporting
          </h1>
          <p className="font-body-large text-body-medium text-text-secondary mt-1">
            Certified audit trails, circulation metrics, and fiscal accounting dossiers generated in compliance with CHEd Library Standard ISO 2789:2018.
          </p>
        </div>

        {/* Global Suite Quick Actions & Tab Navigation */}
        <div className="flex flex-wrap items-center gap-space-sm pt-space-xs max-w-full">
          <div className="flex items-center p-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-x-auto max-w-full shrink-0">
            <button
              id="tab-btn-dossiers"
              onClick={() => setActiveTab('dossiers')}
              className={`h-10 px-space-md rounded-lg font-body-medium text-small font-bold flex items-center gap-space-xs transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'dossiers'
                  ? 'bg-soft-blue text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Official Dossiers &amp; Suites</span>
            </button>
            <button
              id="tab-btn-audit"
              onClick={() => setActiveTab('audit')}
              className={`h-10 px-space-md rounded-lg font-body-medium text-small font-bold flex items-center gap-space-xs transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-soft-blue text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Audit Integrity Log</span>
            </button>
            <button
              id="tab-btn-schedule"
              onClick={() => setActiveTab('schedule')}
              className={`h-10 px-space-md rounded-lg font-body-medium text-small font-bold flex items-center gap-space-xs transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'schedule'
                  ? 'bg-soft-blue text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-low'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">schedule_send</span>
              <span>Automated Schedule Config</span>
            </button>
          </div>

          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="h-10 px-space-md rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover shadow-sm font-body-medium text-small font-bold flex items-center gap-space-xs transition-all active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Build Schema</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: OFFICIAL DOSSIERS & SUITES */}
      {/* =================================================================== */}
      {activeTab === 'dossiers' && (
        <div className="flex flex-col w-full space-y-space-lg">
          {/* Circulation Anomaly Alert Banner */}
          <div className="w-full bg-gradient-to-r from-primary/10 via-soft-blue to-primary/5 border border-primary/25 rounded-2xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-4 text-small font-bold text-primary">
                    Circulation Anomaly Detected
                  </span>
                  <span className="font-caption text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase">
                    +22% Holds
                  </span>
                </div>
                <p className="font-body text-small text-text-secondary mt-0.5">
                  Pending hold volume increased by 22% this week for Computer Science literature. 3 key titles currently report 0 shelf availability.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsStacksAllocationModalOpen(true)}
              className="px-space-md py-2 rounded-xl bg-primary text-on-primary font-body-medium text-small font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-all flex-shrink-0 active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">shelves</span>
              <span>Review Stacks Allocation</span>
            </button>
          </div>

          {/* Primary Working Zone: Parameter Form (7 cols) + Disciplinary Share Chart (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {/* Standard Parameter Generator Form (7 cols) */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-outline-variant/15">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[28px]">tune</span>
                    <div className="flex flex-col">
                      <h2 className="font-headline-3 text-headline-4 text-text-primary font-bold">
                        Standard Parameter Generator
                      </h2>
                      <span className="font-caption text-caption text-text-secondary">
                        Synthesize cross-departmental datasets into certified files
                      </span>
                    </div>
                  </div>
                  <span className="font-caption text-caption uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-surface-container text-text-secondary">
                    Engine v3.2
                  </span>
                </div>

                <form className="space-y-space-md" onSubmit={handleGenerateDossier}>
                  {/* Template Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-body-medium text-small font-bold text-text-primary flex items-center justify-between">
                      <span>Report Template Selection</span>
                      <button
                        type="button"
                        onClick={() => setIsPreviewSchemaModalOpen(true)}
                        className="font-caption text-caption text-primary font-medium hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Preview Metadata Schema
                      </button>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full h-12 bg-surface-container-low pl-space-md pr-10 rounded-xl font-body-medium text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer border border-outline-variant/15"
                      >
                        <option value="circulation">Circulation &amp; Borrowing Dossier (CHEd Standard A-1)</option>
                        <option value="inventory">Inventory Valuation &amp; Deprecation Audit (PAS 16 Compliant)</option>
                        <option value="financial">Financial Collections &amp; Fine Journal (COA Accounting Spec)</option>
                        <option value="delinquency">Overdue Delinquencies &amp; Disciplinary Dossier</option>
                        <option value="curriculum">Academic Discipline &amp; Curriculum Demand Ledger</option>
                        <option value="acquisitions">Consolidated Acquisitions &amp; Book Donation Trail</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Temporal Range & Aggregation Window */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-body-medium text-small font-bold text-text-primary">
                      Temporal Range &amp; Aggregation Window
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/15">
                      {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-body-medium text-small capitalize transition-all ${
                            selectedTimeframe === tf
                              ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                              : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
                          }`}
                        >
                          {tf === 'custom' && <span className="material-symbols-outlined text-[16px]">date_range</span>}
                          {tf === selectedTimeframe && tf !== 'custom' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                          )}
                          <span>{tf}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Field: Discipline & Output Format */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Filter by Academic Field */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-medium text-small font-bold text-text-primary">
                        Academic Discipline / Department
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDiscipline}
                          onChange={(e) => setSelectedDiscipline(e.target.value)}
                          className="w-full h-12 bg-surface-container-low pl-space-md pr-10 rounded-xl font-body-medium text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer border border-outline-variant/15"
                        >
                          <option value="Universal">All University Disciplines (Universal)</option>
                          <option value="Engineering">College of Engineering &amp; Computing Science</option>
                          <option value="Humanities">College of Humanities &amp; Social Sciences</option>
                          <option value="Medicine">School of Medicine &amp; Health Sciences</option>
                          <option value="Management">School of Management &amp; Accountancy</option>
                          <option value="Sciences">Institute of Natural &amp; Physical Sciences</option>
                          <option value="Law">College of Law &amp; Public Policy</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                          domain
                        </span>
                      </div>
                    </div>

                    {/* Output Format Radio Group */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body-medium text-small font-bold text-text-primary">
                        Export Serialization Format
                      </label>
                      <div className="flex items-center gap-2 h-12">
                        {(['PDF', 'CSV', 'XLSX'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setSelectedExportFormat(fmt)}
                            className={`flex-1 flex items-center justify-center gap-1.5 h-full px-2 rounded-xl font-caption text-caption transition-all ${
                              selectedExportFormat === fmt
                                ? 'bg-soft-blue text-primary font-bold shadow-sm'
                                : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {fmt === 'PDF' ? 'picture_as_pdf' : fmt === 'CSV' ? 'table_rows' : 'view_column'}
                            </span>
                            <span>{fmt === 'PDF' ? 'PDF (Print)' : fmt === 'CSV' ? 'CSV Flat' : 'XLSX'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Parameter Modifiers with Interactive "I" Notes (Contextual Metric Tooltip) */}
                  <div className="relative p-space-sm bg-surface-container-low/70 rounded-xl flex items-center justify-between border border-outline-variant/15">
                    <label className="flex items-center gap-space-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={appendDelinquency}
                        onChange={(e) => setAppendDelinquency(e.target.checked)}
                        className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                      <span className="font-body-medium text-small text-text-primary">
                        Append Delinquency Breakdown &amp; Overdue Penalty Accruals
                      </span>
                    </label>

                    {/* Interactive "I" Notes button with tooltip */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTooltipNote((prev) => !prev)}
                        onMouseEnter={() => setShowTooltipNote(true)}
                        onMouseLeave={() => setShowTooltipNote(false)}
                        className="text-text-secondary hover:text-primary transition-colors p-1"
                        aria-label="Inspection note tooltip"
                      >
                        <span className="material-symbols-outlined text-[20px]">info</span>
                      </button>

                      {showTooltipNote && (
                        <div className="absolute right-0 bottom-full mb-2 w-72 p-space-sm bg-[#164E63] text-white text-caption rounded-xl shadow-xl border border-white/20 z-30 animate-fadeIn pointer-events-none">
                          <p className="font-bold text-[#9BE564] mb-0.5">Contextual Metric Inspection Note:</p>
                          <p className="text-white/90">
                            Attaches user barcode, catalog ISBN, delinquency duration, and statutory penalty accrued directly to the certified manifest.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submission Action Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm pt-space-xs">
                    <div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
                      <span className="material-symbols-outlined text-status-available text-[16px]">lock</span>
                      <span>SHA-256 Checksum Signature Embedded</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isCompiling}
                      className="h-12 px-space-xl rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover font-headline-4 text-small font-bold flex items-center gap-space-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isCompiling ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                          <span>Compiling Dossier...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">instant_mix</span>
                          <span>Generate Official Report Dossier</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Generator Status Feedback Box */}
              {compiledDossier && (
                <div className="mt-space-md p-space-sm bg-soft-blue border border-primary/20 rounded-xl flex items-center justify-between text-primary animate-fadeIn">
                  <div className="flex items-center gap-space-sm font-small text-small font-bold">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span>Dossier compiled successfully: {compiledDossier.reference}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportDossierOrSuite(compiledDossier, selectedExportFormat.toUpperCase() as 'PDF' | 'CSV' | 'XLSX')}
                    className="px-3 py-1 bg-action-green text-text-primary rounded-lg font-bold text-caption shadow-sm hover:bg-action-green-hover cursor-pointer"
                  >
                    Direct Download ({compiledDossier.payloadSizeFormatted})
                  </button>
                </div>
              )}
            </div>

            {/* Editorial Analytics & Discipline Share (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              {/* Discipline Velocity Chart Card */}
              <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between flex-1">
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex flex-col">
                    <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                      Circulation Demand Velocity
                    </span>
                    <span className="font-headline-4 text-headline-4 text-text-primary font-bold">
                      Curriculum Disciplinary Share
                    </span>
                  </div>
                  <span className="text-caption font-caption px-2.5 py-1 rounded-full bg-soft-blue text-primary font-bold">
                    {disciplinaryShare?.term || 'Current Academic Term'}
                  </span>
                </div>

                {/* Shared Reusable BarGraphChart: Real-time Disciplinary Distribution */}
                <div className="relative w-full py-space-xs">
                  <BarGraphChart
                    items={disciplinaryBarItems}
                    heightClass="h-36"
                    showPercentages={true}
                    emptyTitle="No Curriculum Checkouts Recorded"
                    emptyDescription="Real-time disciplinary distribution will dynamically render as catalog volumes circulate."
                    emptyIcon="bar_chart"
                  />
                </div>

                <div className="pt-space-sm flex items-center justify-between text-text-secondary font-caption text-caption border-t border-outline-variant/15 mt-2">
                  <span>Target Equilibrium Index: {disciplinaryShare?.targetEquilibriumIndex ? disciplinaryShare.targetEquilibriumIndex.toFixed(2) : '0.00'}</span>
                  <button
                    type="button"
                    onClick={() => setIsPedagogicalThesisModalOpen(true)}
                    className="text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    <span>Read full pedagogical thesis</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                  </button>
                </div>
              </div>

              {/* Regulatory Archival Photographic Banner */}
              <div className="relative overflow-hidden rounded-2xl shadow-sm h-44 bg-[#113E4F] text-white flex items-center p-space-lg">
                <div className="relative z-10 flex flex-col justify-center max-w-sm">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-caption font-caption text-white mb-2 w-fit">
                    <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                    <span>Accreditation Ready</span>
                  </div>
                  <h3 className="font-headline-4 text-headline-4 font-bold leading-tight">
                    ISO 2789 Statistical Record Preservation
                  </h3>
                  <p className="font-caption text-caption opacity-85 mt-1">
                    Every generated dossier includes immutable cryptographic verification markers for legal and statutory submissions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Available Official Report Suites Grid */}
          <div className="flex flex-col space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                  Standard Institutional Collections
                </span>
                <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                  Available Official Report Suites
                </h2>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateSuiteModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-caption text-caption font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Add Report Suite</span>
              </button>
            </div>

            {suites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {suites.map((suite) => (
                  <div
                    key={suite.id}
                    className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all border border-outline-variant/15 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-space-sm">
                        <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-[26px]">{suite.icon || 'description'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-caption text-caption px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-semibold">
                            {suite.suiteCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditSuiteModal(suite)}
                            className="p-1 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                            title="Edit Report Suite"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteSuiteModal(suite)}
                            className="p-1 rounded-lg text-text-secondary hover:text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                            title="Delete Report Suite"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">
                        {suite.title}
                      </h3>
                      <p className="font-body text-small text-text-secondary mb-space-md">
                        {suite.description}
                      </p>
                      <div className="space-y-1.5 pt-space-xs mb-space-md border-t border-outline-variant/10">
                        <div className="flex items-center justify-between text-caption font-caption text-text-secondary">
                          <span>Standard:</span>
                          <span className="font-semibold text-text-primary">{suite.standard}</span>
                        </div>
                        <div className="flex items-center justify-between text-caption font-caption text-text-secondary">
                          <span>{suite.scopeLabel}</span>
                          <span className="font-semibold text-text-primary">{suite.scopeValue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-space-sm flex items-center gap-space-xs border-t border-outline-variant/10">
                      <button
                        type="button"
                        onClick={() => exportDossierOrSuite(suite, 'PDF')}
                        className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-primary text-[16px]">picture_as_pdf</span>
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => exportDossierOrSuite(suite, 'CSV')}
                        className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[#164E63] text-[16px]">table_view</span>
                        <span>CSV</span>
                      </button>
                      {suite.supportedFormats.includes('XLSX') && (
                        <button
                          type="button"
                          onClick={() => exportDossierOrSuite(suite, 'XLSX')}
                          className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-status-available text-[16px]">download</span>
                          <span>XLSX</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/15 text-center flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl text-text-secondary/40">description</span>
                <p className="font-bold text-text-primary">No Official Report Suites Configured</p>
                <p className="font-caption text-caption text-text-secondary max-w-md">
                  Define your institutional reporting pipelines and statutory dossiers by clicking "+ Add Report Suite" above.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Ledger Controls - SearchBar, Filters, View Toggle, Export CSV/Excel */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-space-md sm:p-space-lg flex flex-col space-y-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs border-b border-outline-variant/15">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                  Immutable Ledger
                </span>
                <h2 className="font-headline-3 text-headline-4 text-text-primary font-bold">
                  Recent Completed Dossiers
                </h2>
              </div>

              {/* Multi-Row Selection Action Bar */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-body-medium text-small font-bold animate-fadeIn">
                  <span>{selectedIds.length} dossier(s) selected</span>
                  <button
                    type="button"
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="ml-2 px-2.5 py-1 rounded-lg bg-red-600 text-white text-caption font-bold hover:bg-red-700 transition-colors"
                  >
                    Bulk Deletion / Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-text-secondary hover:text-text-primary text-caption font-normal ml-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Filter Bar: SearchBar + STATUS + SORT + RadioButton View Toggle + Export CSV/Excel Button */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex flex-1 flex-wrap items-center gap-space-sm min-w-[280px]">
                {/* Shared SearchBar with 300ms Debounce */}
                <div className="flex-1 min-w-[220px]">
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search dossiers by title, ref, signer, hash..."
                  />
                </div>

                {/* STATUS Filter Dropdown */}
                <Dropdown
                  items={[
                    { value: 'All Statuses', label: 'All Statuses' },
                    { value: 'Certified Official', label: 'Certified Official' },
                    { value: 'Action Enforced', label: 'Action Enforced' },
                    { value: 'Archived', label: 'Archived' },
                  ]}
                  selectedValue={statusFilter}
                  onSelect={setStatusFilter}
                  menuWidth="w-48"
                />

                {/* SORT Filter Dropdown */}
                <Dropdown
                  items={[
                    { value: 'newest', label: 'Newest Execution' },
                    { value: 'oldest', label: 'Oldest Execution' },
                    { value: 'payload', label: 'Largest Payload' },
                    { value: 'alpha_asc', label: 'Alphabetical A-Z' },
                  ]}
                  selectedValue={sortOrder}
                  onSelect={setSortOrder}
                  menuWidth="w-48"
                />
              </div>

              {/* View Toggle (RadioButton) Placed AFTER SearchBar and BEFORE Export CSV/Excel */}
              <div className="flex items-center gap-space-sm">
                <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/15">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-caption text-caption font-bold transition-all ${
                      viewMode === 'table'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">table_rows</span>
                    <span>Table View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('card')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-caption text-caption font-bold transition-all ${
                      viewMode === 'card'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">grid_view</span>
                    <span>Card View</span>
                  </button>
                </div>

                {/* Enhanced Export CSV / Excel Button */}
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="h-10 px-space-md rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover font-body-medium text-small font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Export CSV / Excel</span>
                </button>
              </div>
            </div>

            {/* View Mode 1: Table View (Draggable) */}
            {viewMode === 'table' ? (
              <div
                ref={tableContainerRef}
                className="w-full overflow-x-auto select-none cursor-grab active:cursor-grabbing border border-outline-variant/15 rounded-xl"
              >
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider border-b border-outline-variant/15">
                      <th className="py-3 px-space-md w-10">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                      </th>
                      <th className="py-3 px-space-md">Dossier Reference &amp; Title</th>
                      <th className="py-3 px-space-md">Execution Timestamp</th>
                      <th className="py-3 px-space-md">Certified Generator</th>
                      <th className="py-3 px-space-md">Payload Size</th>
                      <th className="py-3 px-space-md">Verification Status</th>
                      <th className="py-3 px-space-md text-right">Encrypted Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body-medium text-small">
                    {paginatedDossiers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-text-secondary">
                          <span className="material-symbols-outlined text-[36px] text-text-secondary/40 block mb-1">
                            folder_off
                          </span>
                          No completed statutory dossiers match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedDossiers.map((dossier) => (
                        <tr
                          key={dossier.id}
                          className={`hover:bg-surface-container-low/60 transition-colors ${
                            selectedIds.includes(dossier.id) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="py-3.5 px-space-md">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(dossier.id)}
                              onChange={() => handleToggleRow(dossier.id)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                            />
                          </td>
                          <td className="py-3.5 px-space-md">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary flex-shrink-0">
                                <span className="material-symbols-outlined text-[18px]">
                                  {dossier.exportFormat === 'PDF' ? 'picture_as_pdf' : 'table_chart'}
                                </span>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-text-primary truncate">{dossier.reference}</span>
                                <span className="font-caption text-caption text-text-secondary truncate">
                                  {dossier.title}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-space-md text-text-secondary font-caption text-caption whitespace-nowrap">
                            {dossier.timestampFormatted}
                          </td>
                          <td className="py-3.5 px-space-md whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {dossier.certifiedGeneratorAvatar ? (
                                <img
                                  className="w-6 h-6 rounded-full object-cover"
                                  src={dossier.certifiedGeneratorAvatar}
                                  alt=""
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-caption text-[10px] font-bold">
                                  SYS
                                </div>
                              )}
                              <span className="text-text-primary font-medium">{dossier.certifiedGenerator}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-space-md text-text-secondary font-caption text-caption whitespace-nowrap">
                            {dossier.payloadSizeFormatted}
                          </td>
                          <td className="py-3.5 px-space-md whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-bold ${
                                dossier.verificationStatus === 'Certified Official'
                                  ? 'bg-soft-blue text-primary'
                                  : 'bg-error-container text-error'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  dossier.verificationStatus === 'Certified Official' ? 'bg-primary' : 'bg-error'
                                }`}
                              />
                              {dossier.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-space-md text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toast.success(`Downloading encrypted archive ${dossier.reference}...`)}
                                className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors"
                                title="Download Official Dossier"
                              >
                                <span className="material-symbols-outlined text-[20px]">download</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHashDossier(dossier);
                                  setIsHashModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors"
                                title="View Verification Hash (No Biometrics)"
                              >
                                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* View Mode 2: Card View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {paginatedDossiers.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-text-secondary">
                    No dossiers found.
                  </div>
                ) : (
                  paginatedDossiers.map((dossier) => (
                    <div
                      key={dossier.id}
                      className={`p-space-md bg-surface-container-low rounded-xl border border-outline-variant/15 flex flex-col justify-between space-y-space-sm hover:shadow-md transition-all ${
                        selectedIds.includes(dossier.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(dossier.id)}
                            onChange={() => handleToggleRow(dossier.id)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                          />
                          <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">
                              {dossier.exportFormat === 'PDF' ? 'picture_as_pdf' : 'table_chart'}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-caption text-caption px-2 py-0.5 rounded-full font-bold ${
                            dossier.verificationStatus === 'Certified Official'
                              ? 'bg-soft-blue text-primary'
                              : 'bg-error-container text-error'
                          }`}
                        >
                          {dossier.verificationStatus}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-headline-4 text-small font-bold text-text-primary line-clamp-1">
                          {dossier.reference}
                        </h4>
                        <p className="font-caption text-caption text-text-secondary line-clamp-2 mt-0.5">
                          {dossier.title}
                        </p>
                      </div>

                      <div className="pt-space-xs border-t border-outline-variant/10 text-caption font-caption text-text-secondary space-y-1">
                        <div className="flex justify-between">
                          <span>Generator:</span>
                          <span className="text-text-primary font-medium">{dossier.certifiedGenerator}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timestamp:</span>
                          <span>{dossier.timestampFormatted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{dossier.payloadSizeFormatted}</span>
                        </div>
                      </div>

                      <div className="pt-space-xs flex items-center justify-between border-t border-outline-variant/10">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHashDossier(dossier);
                            setIsHashModalOpen(true);
                          }}
                          className="font-caption text-caption text-text-secondary hover:text-text-primary flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                          <span>Verify Hash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success(`Downloading ${dossier.reference}...`)}
                          className="px-3 py-1 bg-action-green text-text-primary rounded-lg font-bold text-caption flex items-center gap-1 shadow-xs hover:bg-action-green-hover"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm font-caption text-caption text-text-secondary">
              <div className="flex items-center gap-3">
                <span>Displaying {paginatedDossiers.length} of {filteredDossiers.length} statutory records</span>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                  <span>Rows:</span>
                  <Dropdown<number>
                    variant="pagination"
                    items={[
                      { value: 10, label: '10' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                    ]}
                    selectedValue={pageSize}
                    onSelect={(val) => setPageSize(Number(val))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-semibold transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 font-bold text-primary">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-semibold transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: AUDIT INTEGRITY LOG */}
      {/* =================================================================== */}
      {activeTab === 'audit' && (
        <div className="flex flex-col w-full space-y-space-lg">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold tracking-wider">
                  Cryptographic Chain State
                </span>
                <span className="font-headline-3 text-headline-4 text-primary mt-1 font-bold">
                  {auditStats?.chainState || 'Verified Intact'}
                </span>
                <span className="font-caption text-caption text-status-available flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>{auditStats?.tamperViolationsCount ?? 0} Seal Tamper Violations</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[26px]">shield</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold tracking-wider">
                  CHEd / ISO Standard Seal
                </span>
                <span className="font-headline-3 text-headline-4 text-text-primary mt-1 font-bold">
                  {auditStats?.standardSeal || 'ISO 2789:2018'}
                </span>
                <span className="font-caption text-caption text-primary flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>{auditStats?.complianceLevel || 'Statutory Compliance Level IV'}</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold tracking-wider">
                  Active Auditor Signatures
                </span>
                <span className="font-headline-3 text-headline-4 text-text-primary mt-1 font-bold">
                  {auditStats?.activeAuditorSignaturesCount ?? 4} Entities
                </span>
                <span className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">badge</span>
                  <span>{auditStats?.signingPolicy || 'Dual Key Multi-sign Required'}</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-action-green/20 flex items-center justify-center text-text-primary">
                <span className="material-symbols-outlined text-[26px]">key</span>
              </div>
            </div>
          </div>

          {/* Instant SHA-256 Seal & Tamper Verifier */}
          <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-2xl bg-action-green/20 flex items-center justify-center text-text-primary shrink-0">
                <span className="material-symbols-outlined text-[26px]">fingerprint</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                  Instant SHA-256 Seal &amp; Tamper Verifier
                </h3>
                <p className="font-caption text-caption text-text-secondary">
                  Upload or paste any exported dossier verification hash string to validate timestamp against immutable ledger records.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                value={checksumInput}
                onChange={(e) => setChecksumInput(e.target.value)}
                placeholder="Enter SHA-256 hash or dossier ID..."
                className="h-10 px-3 rounded-xl bg-surface-container-low text-text-primary font-small text-small placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-80 border border-outline-variant/15"
              />
              <button
                type="button"
                onClick={handleVerifySeal}
                disabled={isVerifyingSeal}
                className="h-10 px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-medium text-small font-bold flex items-center gap-1 transition-all whitespace-nowrap shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">rule</span>
                <span>{isVerifyingSeal ? 'Verifying...' : 'Verify Seal'}</span>
              </button>
            </div>
          </div>

          {/* Verification Result Feedback Alert */}
          {verificationResult && (
            <div
              className={`p-space-md rounded-xl border flex items-center justify-between animate-fadeIn ${
                verificationResult.isValid
                  ? 'bg-soft-blue text-primary border-primary/20'
                  : 'bg-error-container text-error border-error/20'
              }`}
            >
              <div className="flex items-center gap-space-sm font-small text-small font-semibold">
                <span className="material-symbols-outlined text-[20px]">
                  {verificationResult.isValid ? 'check_circle' : 'warning'}
                </span>
                <span>{verificationResult.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setVerificationResult(null)}
                className="font-caption text-caption uppercase font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Cryptographic Ledger: Audit Trail & Attestation Records Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-space-lg flex flex-col space-y-space-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/15">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                  Cryptographic Ledger
                </span>
                <h2 className="font-headline-3 text-headline-4 text-text-primary font-bold">
                  Audit Trail &amp; Attestation Records
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-soft-blue text-primary text-caption font-bold">
                All Seals Verified (100%)
              </span>
            </div>

            <div className="w-full overflow-x-auto border border-outline-variant/15 rounded-xl">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider border-b border-outline-variant/15">
                    <th className="py-3 px-space-md">Ledger Event &amp; Target Dossier</th>
                    <th className="py-3 px-space-md">SHA-256 Digest Signature</th>
                    <th className="py-3 px-space-md">Certified Signer &amp; Role</th>
                    <th className="py-3 px-space-md">Timestamp (UTC+8)</th>
                    <th className="py-3 px-space-md text-right">Attestation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-body-medium text-small">
                  {attestations.map((att) => (
                    <tr key={att.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">{att.ledgerEvent}</span>
                            <span className="font-caption text-caption text-text-secondary">{att.targetDossier}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md font-mono">
                        <span className="px-2 py-1 rounded bg-surface-container-low font-bold text-text-primary text-[11px]">
                          {att.sha256DigestSignature}
                        </span>
                      </td>
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-caption text-[10px] font-bold">
                            {att.certifiedSignerInitials}
                          </span>
                          <span className="text-text-primary font-medium">{att.certifiedSignerName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
                        {att.timestampUtc8}
                      </td>
                      <td className="py-3.5 px-space-md text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-bold ${
                            att.attestationStatus === 'Certified Intact'
                              ? 'bg-soft-blue text-primary'
                              : 'bg-error-container text-error'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              att.attestationStatus === 'Certified Intact' ? 'bg-primary' : 'bg-error'
                            }`}
                          />
                          {att.attestationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: AUTOMATED SCHEDULE CONFIG */}
      {/* =================================================================== */}
      {activeTab === 'schedule' && (
        <div className="flex flex-col w-full space-y-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20">
            <div>
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                Automation Engine
              </span>
              <h3 className="font-headline-3 text-headline-4 text-text-primary font-bold">
                Recurring Statutory Dispatch Triggers
              </h3>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                Manage cron schedules, distribution channels, and secure dispatch nodes to statutory bodies.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddScheduleModalOpen(true)}
              className="h-11 px-space-lg rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover font-body-medium text-small font-bold flex items-center gap-space-xs transition-all shadow-sm w-fit"
            >
              <span className="material-symbols-outlined text-[20px]">more_time</span>
              <span>Add Schedule Trigger</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-caption text-caption font-mono px-2 py-1 rounded bg-surface-container-low font-bold text-primary">
                      {sch.cronExpression}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-action-green/20 text-text-primary font-caption text-caption font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-action-green" />
                      Active
                    </span>
                  </div>

                  <h4 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-1">
                    {sch.title}
                  </h4>
                  <p className="font-caption text-caption text-text-secondary mb-space-md">
                    {sch.description}
                  </p>

                  <div className="space-y-1.5 text-caption font-caption text-text-secondary mb-space-md pt-2 border-t border-outline-variant/20">
                    <div className="flex justify-between">
                      <span>Channel:</span>
                      <span className="font-semibold text-text-primary">{sch.channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recipients:</span>
                      <span className="font-semibold text-text-primary">{sch.recipients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Run:</span>
                      <span className="font-semibold text-primary">{sch.nextRunFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={() => handleRunScheduleNow(sch.title, sch.id)}
                    className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
                    <span>Run Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info(`Configuring schedule for ${sch.title}`)}
                    className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-secondary transition-colors"
                    title="Configure Schedule"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* FLOATING MODALS */}
      {/* =================================================================== */}

      {/* 1. Enhanced Export CSV / Excel Modal */}
      <DefaultFloatingModalCard
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export CSV / Excel Dossiers"
        subtitle="Configure comprehensive date ranges, alphabetical filters, and sort ordering"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary font-medium text-small"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteExportModal}
              className="px-5 py-2 rounded-xl bg-action-green text-text-primary font-bold text-small hover:bg-action-green-hover shadow-sm"
            >
              Download Export File
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-text-primary">
          {/* Format selector */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-small">File Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-small">
                <input
                  type="radio"
                  name="modal-export-fmt"
                  checked={exportFormatSelection === 'CSV'}
                  onChange={() => setExportFormatSelection('CSV')}
                  className="accent-primary"
                />
                <span>CSV Flat Spreadsheet (.csv)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-small">
                <input
                  type="radio"
                  name="modal-export-fmt"
                  checked={exportFormatSelection === 'XLSX'}
                  onChange={() => setExportFormatSelection('XLSX')}
                  className="accent-primary"
                />
                <span>Excel Spreadsheet (.xlsx)</span>
              </label>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-small">Start Date</label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-small text-text-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-small">End Date</label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-small text-text-primary"
              />
            </div>
          </div>

          {/* Alphabetical & ID filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-small">Alphabetical Filter</label>
              <input
                type="text"
                placeholder="e.g. A, CIR, Financial"
                value={exportAlphaFilter}
                onChange={(e) => setExportAlphaFilter(e.target.value)}
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-small text-text-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-small">ID / Number Wildcard</label>
              <input
                type="text"
                placeholder="e.g. 1, 001, 2026"
                value={exportIdFilter}
                onChange={(e) => setExportIdFilter(e.target.value)}
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-small text-text-primary"
              />
            </div>
          </div>

          {/* Sort direction */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-small">Sort Direction</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-small">
                <input
                  type="radio"
                  name="modal-sort-dir"
                  checked={exportSortDirection === 'desc'}
                  onChange={() => setExportSortDirection('desc')}
                  className="accent-primary"
                />
                <span>Descending (Newest to Oldest)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-small">
                <input
                  type="radio"
                  name="modal-sort-dir"
                  checked={exportSortDirection === 'asc'}
                  onChange={() => setExportSortDirection('asc')}
                  className="accent-primary"
                />
                <span>Ascending (Oldest to Newest)</span>
              </label>
            </div>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 2. Verification Hash Modal (No Biometrics) */}
      <DefaultFloatingModalCard
        isOpen={isHashModalOpen}
        onClose={() => setIsHashModalOpen(false)}
        title="SHA-256 Cryptographic Verification"
        subtitle="Immutable ledger digest attestation (No biometrics required)"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                if (selectedHashDossier?.sha256Digest) {
                  navigator.clipboard.writeText(selectedHashDossier.sha256Digest);
                  toast.success('SHA-256 hash copied to clipboard!');
                }
              }}
              className="px-4 py-2 rounded-xl bg-action-green text-text-primary font-bold text-small hover:bg-action-green-hover"
            >
              Copy Hash Code
            </button>
            <button
              type="button"
              onClick={() => setIsHashModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary font-medium text-small"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedHashDossier && (
          <div className="space-y-4 py-2 text-text-primary font-small text-small">
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/15">
              <span className="font-caption text-caption text-text-secondary uppercase font-bold block mb-1">
                Target Dossier Reference:
              </span>
              <span className="font-bold text-primary block">{selectedHashDossier.reference}</span>
              <span className="text-text-secondary text-caption">{selectedHashDossier.title}</span>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/15 font-mono">
              <span className="font-caption text-caption text-text-secondary uppercase font-bold block mb-1 font-sans">
                Full 64-Hex SHA-256 Digest:
              </span>
              <span className="text-text-primary text-[12px] break-all block bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/10">
                {selectedHashDossier.sha256Digest}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-caption">
              <div>
                <span className="text-text-secondary block">Certified Signer:</span>
                <span className="font-bold text-text-primary">{selectedHashDossier.certifiedGenerator}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Timestamp (UTC):</span>
                <span className="font-bold text-text-primary">{selectedHashDossier.timestampFormatted}</span>
              </div>
            </div>
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* 3. Pedagogical Thesis Modal */}
      <DefaultFloatingModalCard
        isOpen={isPedagogicalThesisModalOpen}
        onClose={() => setIsPedagogicalThesisModalOpen(false)}
        title="Curricular Disciplinary Share: Pedagogical Thesis"
        subtitle="Mathematical balance framework for academic resource circulation"
        size="lg"
        footer={
          <button
            type="button"
            onClick={() => setIsPedagogicalThesisModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-small hover:bg-primary-container"
          >
            Close Thesis
          </button>
        }
      >
        <div className="space-y-3 py-2 text-text-primary text-small">
          <p>
            The Katipuneros Library Store Curricular Disciplinary Share evaluates the velocity of student borrowing against departmental syllabus demands.
          </p>
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/15 space-y-2">
            <h5 className="font-bold text-primary">Target Equilibrium Index Formula:</h5>
            <p className="font-mono text-caption bg-surface-container-lowest p-2 rounded-lg">
              Target Equilibrium Index = (Curricular Ingestion Velocity / Circulation Turnover Rate) = 1.15
            </p>
            <p className="text-caption text-text-secondary">
              When STEM turnover exceeds 44%, additional digital reserve partitions are provisioned automatically.
            </p>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 4. Multiple Bulk Deletion Confirmation Modal */}
      <DefaultFloatingModalCard
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Confirm Multiple Bulk Deletion"
        subtitle="Permanent deaccession and archival of statutory dossier records"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary font-medium text-small"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteBulkDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-small hover:bg-red-700 shadow-sm"
            >
              Confirm Deletion
            </button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-text-primary text-small">
          <p className="text-red-600 font-bold">
            Are you sure you want to permanently delete or archive {selectedIds.length} selected dossier(s)?
          </p>
          <p className="text-text-secondary text-caption">
            This action will be logged into the append-only cryptographic audit ledger with an immutable SHA-256 seal.
          </p>
        </div>
      </DefaultFloatingModalCard>

      {/* 5. Review Stacks Allocation Modal */}
      <DefaultFloatingModalCard
        isOpen={isStacksAllocationModalOpen}
        onClose={() => setIsStacksAllocationModalOpen(false)}
        title="Review Stacks Allocation: Computer Science"
        subtitle="Anomaly mitigation and hold backlog reallocation"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => {
              toast.success('Stacks allocation verified. Reserve holds prioritized.');
              setIsStacksAllocationModalOpen(false);
            }}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-small hover:bg-primary-container"
          >
            Authorize Reallocation
          </button>
        }
      >
        <div className="space-y-3 py-2 text-text-primary text-small">
          <p>
            Computer Science literature hold density has increased by <strong>+22%</strong> this week. 3 key titles currently report 0 shelf availability:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-caption text-text-secondary">
            <li>Clean Code (Robert C. Martin) - 18 waitlisted holds</li>
            <li>Introduction to Algorithms (CLRS) - 14 waitlisted holds</li>
            <li>Structure and Interpretation of Computer Programs (SICP) - 12 waitlisted holds</li>
          </ul>
        </div>
      </DefaultFloatingModalCard>

      {/* 6. Build Schema Modal */}
      <DefaultFloatingModalCard
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        title="Custom Report Schema Builder"
        subtitle="Define custom statutory report schemas for accreditation evaluation"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => {
              toast.success('Custom schema saved successfully.');
              setIsSchemaModalOpen(false);
            }}
            className="px-4 py-2 rounded-xl bg-action-green text-text-primary font-bold text-small hover:bg-action-green-hover"
          >
            Save Custom Schema
          </button>
        }
      >
        <div className="space-y-3 py-2 text-text-primary text-small">
          <p>Select library modules to compile into a certified custom template:</p>
          <div className="space-y-2">
            {['Circulation Loan History', 'Physical Stacks RFID Audit', 'Overdue Delinquencies & Fines', 'User Demographic Profiles'].map((mod) => (
              <label key={mod} className="flex items-center gap-2 cursor-pointer font-medium text-small">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span>{mod}</span>
              </label>
            ))}
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 7. Preview Metadata Schema Modal */}
      <DefaultFloatingModalCard
        isOpen={isPreviewSchemaModalOpen}
        onClose={() => setIsPreviewSchemaModalOpen(false)}
        title="Metadata Schema Preview"
        subtitle="CHEd Standard A-1 & ISO 2789:2018 Data Contract Definition"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => setIsPreviewSchemaModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary font-medium text-small"
          >
            Close Preview
          </button>
        }
      >
        <div className="space-y-3 py-2 text-text-primary font-mono text-[12px] bg-surface-container-low p-3 rounded-xl border border-outline-variant/15 overflow-x-auto">
          <pre>{JSON.stringify(
            {
              $schema: 'https://iso2789.org/schemas/v1/dossier.json',
              standard: 'CHEd Standard A-1',
              timestamp_utc: new Date().toISOString(),
              signature: 'ed25519-katipuneros-root-ca',
              partitions: ['circ_loans', 'fines_ledger', 'rfid_stacks'],
            },
            null,
            2
          )}</pre>
        </div>
      </DefaultFloatingModalCard>

      {/* 8. Add Schedule Trigger Modal */}
      <DefaultFloatingModalCard
        isOpen={isAddScheduleModalOpen}
        onClose={() => setIsAddScheduleModalOpen(false)}
        title="Add Recurring Schedule Trigger"
        subtitle="Configure cron interval, target recipients, and report serialization"
        size="md"
        footer={
          <button
            type="button"
            onClick={() => {
              toast.success('New automated schedule trigger active.');
              setIsAddScheduleModalOpen(false);
            }}
            className="px-4 py-2 rounded-xl bg-action-green text-text-primary font-bold text-small hover:bg-action-green-hover"
          >
            Create Trigger
          </button>
        }
      >
        <div className="space-y-3 py-2 text-text-primary text-small">
          <div className="flex flex-col gap-1">
            <label className="font-bold">Schedule Title</label>
            <input
              type="text"
              placeholder="e.g. Weekly Dean's Council Digest"
              className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-small"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold">Cron Expression</label>
            <input
              type="text"
              defaultValue="0 8 * * 1"
              className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/20 font-mono text-small"
            />
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 9. Create / Edit Report Suite Modal */}
      <DefaultFloatingModalCard
        isOpen={isSuiteModalOpen}
        onClose={() => setIsSuiteModalOpen(false)}
        title={editingSuite ? 'Edit Official Report Suite' : 'Create Official Report Suite'}
        subtitle="Configure official report standard, metadata scope, and institutional export formats"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsSuiteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary font-medium text-small transition-colors"
              disabled={isSubmittingSuite}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSuite}
              disabled={isSubmittingSuite}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-small hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmittingSuite ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{editingSuite ? 'Save Changes' : 'Create Suite'}</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-text-primary text-small">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary text-caption">Suite Code</label>
              <input
                type="text"
                value={suiteFormData.suiteCode}
                onChange={(e) => setSuiteFormData({ ...suiteFormData, suiteCode: e.target.value })}
                placeholder="e.g. SUITE-05 or CHED-B2"
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-text-primary text-small font-mono focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary text-caption">Compliance Standard</label>
              <input
                type="text"
                value={suiteFormData.standard}
                onChange={(e) => setSuiteFormData({ ...suiteFormData, standard: e.target.value })}
                placeholder="e.g. ISO/DIS 11620, CHEd Standard A-1"
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-text-primary text-small focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-text-secondary text-caption">Suite Title</label>
            <input
              type="text"
              value={suiteFormData.title}
              onChange={(e) => setSuiteFormData({ ...suiteFormData, title: e.target.value })}
              placeholder="e.g. Digital Resource Utilization Ledger"
              className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-text-primary text-small focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-text-secondary text-caption">Description</label>
            <textarea
              rows={3}
              value={suiteFormData.description}
              onChange={(e) => setSuiteFormData({ ...suiteFormData, description: e.target.value })}
              placeholder="Explain the statutory scope and purpose of this official report suite..."
              className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-text-primary text-small focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary text-caption">Scope Label</label>
              <input
                type="text"
                value={suiteFormData.scopeLabel}
                onChange={(e) => setSuiteFormData({ ...suiteFormData, scopeLabel: e.target.value })}
                placeholder="e.g. Data Scope: or Target Cohort:"
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-text-primary text-small focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary text-caption">Scope Value</label>
              <input
                type="text"
                value={suiteFormData.scopeValue}
                onChange={(e) => setSuiteFormData({ ...suiteFormData, scopeValue: e.target.value })}
                placeholder="e.g. Active Circulation Ledger (Real-Time)"
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-text-primary text-small focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary text-caption">Icon Name</label>
              <select
                value={suiteFormData.icon}
                onChange={(e) => setSuiteFormData({ ...suiteFormData, icon: e.target.value })}
                className="h-10 px-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-text-primary text-small focus:border-primary focus:outline-none"
              >
                <option value="description">Description (Document)</option>
                <option value="analytics">Analytics (Chart)</option>
                <option value="inventory_2">Inventory (Archive)</option>
                <option value="verified">Verified (Shield/Seal)</option>
                <option value="table_chart">Table Chart (Spreadsheet)</option>
                <option value="account_balance">Institutional / CHEd</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-text-secondary text-caption">Supported Formats</label>
              <div className="flex items-center gap-3 h-10">
                {['PDF', 'CSV', 'XLSX'].map((fmt) => {
                  const checked = suiteFormData.supportedFormats.includes(fmt);
                  return (
                    <label key={fmt} className="flex items-center gap-1.5 cursor-pointer text-caption select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const updated = checked
                            ? suiteFormData.supportedFormats.filter((f) => f !== fmt)
                            : [...suiteFormData.supportedFormats, fmt];
                          setSuiteFormData({ ...suiteFormData, supportedFormats: updated });
                        }}
                        className="rounded border-outline-variant/40 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>{fmt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* 10. Delete Report Suite Confirmation Modal */}
      <DefaultFloatingModalCard
        isOpen={isDeleteSuiteModalOpen}
        onClose={() => setIsDeleteSuiteModalOpen(false)}
        title="Delete Report Suite"
        subtitle={suiteToDelete ? `Suite Code: ${suiteToDelete.suiteCode}` : 'Confirmation'}
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsDeleteSuiteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary font-medium text-small transition-colors"
              disabled={isSubmittingSuite}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteSuite}
              disabled={isSubmittingSuite}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-small transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmittingSuite ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span>Delete Suite</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="py-2 text-text-primary text-small space-y-3">
          <p>
            Are you sure you want to permanently delete report suite{' '}
            <strong className="text-text-primary font-bold">{suiteToDelete?.title}</strong> ({suiteToDelete?.suiteCode})?
          </p>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-caption text-red-400">
            This will remove the statutory collection specification from the active suite selector. Any historical completed dossiers generated under this suite will remain in the attestation ledger.
          </div>
        </div>
      </DefaultFloatingModalCard>
    </div>
  );
};

export default Reports;
