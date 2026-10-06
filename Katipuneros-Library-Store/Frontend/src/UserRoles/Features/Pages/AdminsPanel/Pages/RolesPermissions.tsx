// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// RolesPermissions.tsx -- Admin RBAC Access Governance, Security Privilege Matrix, 2FA Generator, and Login/Logout Event Stream.
// Strictly adheres to AGENTS.md, SKILL.md, and Ideas to prompt.txt specifications.
// Consumes shared primitives (SearchBar, Dropdown, RadioButton, DefaultFloatingModalCard) and global hooks.

import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { RadioButton } from '../../../../../Shared/RadioButton';
import { Dropdown } from '../../../../../Shared/Dropdown';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { useToasts } from '../../../../../Hooks/useToasts';
import { useFluidResposiveness } from '../../../../../Hooks/useFluidResposiveness';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';
import {
  SecurityMetrics,
  RoleConfig,
  ModulePrivilegeItem,
  UserLoginAudit,
  TwoFactorKeyResult,
  CirculationAnomaly,
  getSecurityMetrics,
  getPrivilegeMatrix,
  getRoleConfigs,
  updateRolePolicy,
  createCustomRole,
  resetSecurityDefaults,
  generateTwoFactorKey,
  getLoginAuditStream,
  getCirculationAnomaly,
} from '../../../../../Endpoints/Admin/rolesApi';

type RoleViewKey = 'all' | 'admin' | 'cashier' | 'user' | 'curator';
type ViewMode = 'table' | 'card';

const RolesPermissions: FC = () => {
  const { addToast } = useToasts();
  const toast = useMemo(
    () => ({
      success: (msg: string) => addToast(msg, 'success'),
      error: (msg: string) => addToast(msg, 'error'),
      warning: (msg: string) => addToast(msg, 'warning'),
      info: (msg: string) => addToast(msg, 'info'),
    }),
    [addToast]
  );

  const { isMobile } = useFluidResposiveness();

  // State: Active Role Filter & View Mode
  const [selectedRoleView, setSelectedRoleView] = useState<RoleViewKey>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  // Core Data States
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    configuredRolesCount: 4,
    defaultRolesCount: 3,
    customRolesCount: 1,
    activeIdentitiesCount: 0,
    identityGrowthRate: 0.0,
    superAdminsCount: 0,
    twoFactorEnforcementRate: 0.0,
  });

  const [privilegeMatrix, setPrivilegeMatrix] = useState<ModulePrivilegeItem[]>([]);
  const [roleConfigs, setRoleConfigs] = useState<Record<string, RoleConfig>>({});
  const [activeInspectorKey, setActiveInspectorKey] = useState<string>('cashier');
  const [loginAudits, setLoginAudits] = useState<UserLoginAudit[]>([]);
  const [anomaly, setAnomaly] = useState<CirculationAnomaly | null>(null);

  // Inspector Interactive Checkbox States (for current inspector role)
  const currentRoleConfig = useMemo(
    () => roleConfigs[activeInspectorKey] || null,
    [roleConfigs, activeInspectorKey]
  );

  const [emergencyHoldOverride, setEmergencyHoldOverride] = useState(true);
  const [cashDrawerKickout, setCashDrawerKickout] = useState(true);
  const [fineCourtesyWaiver, setFineCourtesyWaiver] = useState(true);
  const [holdStagingClearance, setHoldStagingClearance] = useState(true);

  // Sync checkboxes when currentRoleConfig changes
  useEffect(() => {
    if (currentRoleConfig) {
      setEmergencyHoldOverride(currentRoleConfig.emergencyHoldOverride);
      setCashDrawerKickout(currentRoleConfig.cashDrawerKickout);
      setFineCourtesyWaiver(currentRoleConfig.fineCourtesyWaiver);
      setHoldStagingClearance(currentRoleConfig.holdStagingClearance);
    }
  }, [currentRoleConfig]);

  // Multi-Selection State for Bulk Actions
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

  // Modals State
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCustomRoleModalOpen, setIsCustomRoleModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
  const [twoFactorResult, setTwoFactorResult] = useState<TwoFactorKeyResult | null>(null);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);

  // Custom Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleBase, setNewRoleBase] = useState('Staff');

  // Export Filter Form State
  const [exportDateRange, setExportDateRange] = useState('');
  const [exportAlphabeticalFilter, setExportAlphabeticalFilter] = useState('');
  const [exportSortDirection, setExportSortDirection] = useState<'asc' | 'desc'>('asc');
  const [exportIdFilter, setExportIdFilter] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');

  // Load All Security Data
  const loadData = useCallback(async () => {
    try {
      const [m, matrix, configs, audits, anom] = await Promise.all([
        getSecurityMetrics(),
        getPrivilegeMatrix(),
        getRoleConfigs(),
        getLoginAuditStream(),
        getCirculationAnomaly(),
      ]);
      if (m) setMetrics(m);
      if (matrix) setPrivilegeMatrix(matrix);
      if (configs) setRoleConfigs(configs);
      if (audits) setLoginAudits(audits);
      if (anom) setAnomaly(anom);
    } catch (err) {
      console.error('Failed to load roles & permissions data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Recovery Hook (auto re-fetches when network is restored or window regains focus)
  usePagesGlobalRefresh({
    onRefresh: async () => {
      await loadData();
    },
  });

  // Filtered & Sorted Privilege Matrix Modules
  const filteredModules = useMemo(() => {
    let result = [...privilegeMatrix];

    // Filter by Search Query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (m) =>
          m.moduleName.toLowerCase().includes(query) ||
          m.subsystem.toLowerCase().includes(query) ||
          m.scopeDesc.toLowerCase().includes(query)
      );
    }

    // Filter by Status (Grant Type)
    if (statusFilter !== 'all') {
      result = result.filter(
        (m) =>
          m.adminGrant.toLowerCase() === statusFilter ||
          m.cashierGrant.toLowerCase() === statusFilter ||
          m.patronGrant.toLowerCase() === statusFilter ||
          m.curatorGrant.toLowerCase() === statusFilter
      );
    }

    // Sort Order
    if (sortOrder === 'name-asc') {
      result.sort((a, b) => a.moduleName.localeCompare(b.moduleName));
    } else if (sortOrder === 'name-desc') {
      result.sort((a, b) => b.moduleName.localeCompare(a.moduleName));
    }

    return result;
  }, [privilegeMatrix, debouncedSearch, statusFilter, sortOrder]);

  // Pagination Hook
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems: paginatedModules,
    goToPage,
    prevPage,
    nextPage,
    setPageSize,
    totalItems,
  } = usePagination<ModulePrivilegeItem>(filteredModules, {
    initialPageSize: 10,
  });

  // Draggable Table Hook
  const { containerRef } = useTableDraggable();

  // Multi-Select Handlers
  const handleToggleSelectAll = () => {
    if (selectedModuleIds.length === paginatedModules.length) {
      setSelectedModuleIds([]);
    } else {
      setSelectedModuleIds(paginatedModules.map((m) => m.moduleId));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handler: Save Role Policy
  const handleSaveRolePolicy = async () => {
    if (!currentRoleConfig) return;
    try {
      await updateRolePolicy(activeInspectorKey, {
        emergencyHoldOverride,
        cashDrawerKickout,
        fineCourtesyWaiver,
        holdStagingClearance,
      });
      toast.success(`Role policy for "${currentRoleConfig.title}" saved successfully.`);
      loadData();
    } catch {
      toast.error('Failed to save role policy. Please check backend connection.');
    }
  };

  // Handler: Generate 2FA Key
  const handleTrigger2FaGeneration = async () => {
    try {
      const res = await generateTwoFactorKey({
        roleKey: activeInspectorKey,
        userId: currentRoleConfig?.id || activeInspectorKey.toUpperCase(),
      });
      setTwoFactorResult(res);
      setIs2FaModalOpen(true);
      toast.success('Generated fresh RFC 6238 TOTP cryptographic seed.');
    } catch {
      toast.error('Failed to generate 2FA key.');
    }
  };

  // Handler: Reset Security Defaults
  const handleConfirmResetDefaults = async () => {
    try {
      await resetSecurityDefaults();
      setIsResetConfirmModalOpen(false);
      toast.success('Institutional security matrix successfully reset to statutory defaults.');
      loadData();
    } catch {
      toast.error('Failed to reset security defaults.');
    }
  };

  // Handler: Create Custom Role
  const handleCreateCustomRole = async () => {
    if (!newRoleName.trim()) {
      toast.warning('Please enter a role name.');
      return;
    }
    try {
      await createCustomRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim() || 'Custom departmental authority profile.',
        baseRole: newRoleBase,
        privileges: [
          { name: 'Standard Module Inspection', desc: 'Read-only departmental access', enabled: true },
          { name: 'Departmental Catalog Tagging', desc: 'Tag specialized subject taxonomy', enabled: true },
        ],
      });
      setIsCustomRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      toast.success(`Custom role "${newRoleName}" registered successfully.`);
      loadData();
    } catch {
      toast.error('Failed to create custom role.');
    }
  };

  // Handler: Perform Export
  const handleExecuteExport = () => {
    let exportItems = [...privilegeMatrix];

    // Alphabetical filter
    if (exportAlphabeticalFilter.trim()) {
      const letter = exportAlphabeticalFilter.trim().toLowerCase();
      exportItems = exportItems.filter(
        (m) =>
          m.moduleName.toLowerCase().startsWith(letter) ||
          m.moduleName.toLowerCase().endsWith(letter) ||
          m.moduleName.toLowerCase().includes(letter)
      );
    }

    // ID filter
    if (exportIdFilter.trim()) {
      const idTerm = exportIdFilter.trim().toLowerCase();
      exportItems = exportItems.filter((m) => m.moduleId.toLowerCase().includes(idTerm));
    }

    // Sort Direction
    if (exportSortDirection === 'desc') {
      exportItems.reverse();
    }

    // Build CSV
    const headers = ['Module ID', 'Functional Module', 'Subsystem', 'Admin Grant', 'Cashier Grant', 'User Grant', 'Curator Grant', 'Operational Scope'];
    const rows = exportItems.map((m) => [
      m.moduleId,
      `"${m.moduleName}"`,
      `"${m.subsystem}"`,
      m.adminGrant,
      m.cashierGrant,
      m.patronGrant,
      m.curatorGrant,
      `"${m.scopeDesc.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Katipuneros_Security_Matrix_${exportFormat.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setIsExportModalOpen(false);
    toast.success(`Security policy exported successfully (${exportItems.length} records).`);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Top Header Overlay */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div>
            <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1 tracking-wider uppercase">
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Security</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-semibold">Roles &amp; Permissions</span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
              Access Governance &amp; Granular Privilege Matrix
            </h1>
            <p className="font-body text-small text-text-secondary mt-1 max-w-3xl">
              Manage institutional role assignments, define boundary tokens, and calibrate runtime permission sets for staff, cashiers, and active users across all Katipuneros library store branches.
            </p>
          </div>

          {/* Action Toolbelt */}
          <div className="flex items-center flex-wrap gap-space-sm self-start md:self-end">
            <button
              onClick={() => setIsResetConfirmModalOpen(true)}
              className="h-11 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-all flex items-center gap-space-xs shadow-sm active:scale-95 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset to Defaults</span>
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="h-11 px-space-md rounded-xl bg-surface-container-lowest hover:bg-surface text-text-primary font-small text-small font-semibold transition-all flex items-center gap-space-xs shadow-sm active:scale-95 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export CSV/Excel</span>
            </button>
            <button
              onClick={() => setIsCustomRoleModalOpen(true)}
              className="h-11 px-space-lg rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold transition-all flex items-center gap-space-xs shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add_moderator</span>
              <span>Create Custom Role</span>
            </button>
          </div>
        </div>

        {/* Circulation Anomaly Alert Banner (Ideas to prompt.txt) */}
        {anomaly?.detected && (
          <div className="mb-space-xl p-space-md rounded-xl bg-secondary-container/20 border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-xs">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              </div>
              <div>
                <h4 className="font-small text-small font-bold text-text-primary flex items-center gap-1.5">
                  {anomaly.title}
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold uppercase tracking-wider">
                    Attention
                  </span>
                </h4>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  {anomaly.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAnomalyModalOpen(true)}
              className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-hover font-small text-small font-semibold transition-all flex items-center gap-space-xs shadow-xs self-end sm:self-center cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">shelves</span>
              <span>Review Stacks Allocation</span>
            </button>
          </div>
        )}

        {/* Key Security Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {/* Metric 1: Configured Roles */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-soft-blue/40 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                Configured Roles
              </span>
              <span className="w-9 h-9 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                  {metrics.configuredRolesCount}
                </span>
                <span className="font-caption text-caption text-text-secondary">Roles Active</span>
              </div>
              <div className="mt-space-xs flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption">
                  {metrics.defaultRolesCount} Default
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-semibold">
                  {metrics.customRolesCount} Custom
                </span>
              </div>
            </div>
          </div>

          {/* Metric 2: Active Identities */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-secondary-container/30 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                Active Identities
              </span>
              <span className="w-9 h-9 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">group</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                  {metrics.activeIdentitiesCount.toLocaleString()}
                </span>
                <span className="font-caption text-caption text-status-available font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +{metrics.identityGrowthRate}% mo
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">Bound to active campus card IDs</p>
            </div>
          </div>

          {/* Metric 3: High-Privilege Grants */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-status-pending/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                High-Privilege Grants
              </span>
              <span className="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">security</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                  {metrics.superAdminsCount}
                </span>
                <span className="font-caption text-caption text-status-danger font-semibold">Super Admins</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full mt-space-sm overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>
          </div>

          {/* Metric 4: 2FA Enforcement */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-action-green/30 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                2FA Enforcement
              </span>
              <span className="w-9 h-9 rounded-lg bg-surface-container text-status-available flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                  {metrics.twoFactorEnforcementRate}%
                </span>
                <span className="font-caption text-caption text-status-available font-semibold">Mandatory</span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">FIDO2 &amp; TOTP on staff tiers</p>
            </div>
          </div>
        </div>

        {/* Role Selector Ribbon & Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-md">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-space-xs overflow-x-auto py-1">
            <button
              onClick={() => {
                setSelectedRoleView('all');
              }}
              className={`px-space-md py-2 rounded-full font-small text-small font-semibold flex items-center gap-space-xs transition-all cursor-pointer ${
                selectedRoleView === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              <span>All Roles Matrix</span>
            </button>
            <button
              onClick={() => {
                setSelectedRoleView('admin');
                setActiveInspectorKey('admin');
              }}
              className={`px-space-md py-2 rounded-full font-small text-small font-medium flex items-center gap-space-xs transition-all cursor-pointer ${
                selectedRoleView === 'admin'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
              <span>Administrator (16)</span>
            </button>
            <button
              onClick={() => {
                setSelectedRoleView('cashier');
                setActiveInspectorKey('cashier');
              }}
              className={`px-space-md py-2 rounded-full font-small text-small font-medium flex items-center gap-space-xs transition-all cursor-pointer ${
                selectedRoleView === 'cashier'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              <span>Cashier Desk (24)</span>
            </button>
            <button
              onClick={() => {
                setSelectedRoleView('user');
                setActiveInspectorKey('user');
              }}
              className={`px-space-md py-2 rounded-full font-small text-small font-medium flex items-center gap-space-xs transition-all cursor-pointer ${
                selectedRoleView === 'user'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>User / Customer (3,372)</span>
            </button>
            <button
              onClick={() => {
                setSelectedRoleView('curator');
                setActiveInspectorKey('curator');
              }}
              className={`px-space-md py-2 rounded-full font-small text-small font-medium flex items-center gap-space-xs transition-all cursor-pointer ${
                selectedRoleView === 'curator'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
              <span>Department Curator (8)</span>
            </button>
          </div>

          {/* Search, Filters, and Table <-> Card View Toggle */}
          <div className="flex items-center flex-wrap gap-space-xs">
            {/* Shared SearchBar */}
            <div className="w-56 sm:w-64">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Filter module privileges..."
              />
            </div>

            {/* STATUS Dropdown */}
            <Dropdown
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
              items={[
                { value: 'all', label: 'All Grants' },
                { value: 'full', label: 'Full Grant' },
                { value: 'scoped', label: 'Scoped Grant' },
                { value: 'restricted', label: 'Restricted' },
              ]}
              label="Grant"
            />

            {/* SORT Dropdown */}
            <Dropdown
              selectedValue={sortOrder}
              onSelect={setSortOrder}
              items={[
                { value: 'default', label: 'Default Order' },
                { value: 'name-asc', label: 'Module A-Z' },
                { value: 'name-desc', label: 'Module Z-A' },
              ]}
              label="Sort"
            />

            {/* Table <-> Card View Toggle via RadioButton */}
            <div className="flex items-center gap-space-xs bg-surface-container-lowest p-1 rounded-xl shadow-xs border border-surface-container-high">
              <RadioButton
                id="view-table"
                name="viewMode"
                value="table"
                label="Table"
                checked={viewMode === 'table'}
                onChange={() => setViewMode('table')}
              />
              <RadioButton
                id="view-card"
                name="viewMode"
                value="card"
                label="Card"
                checked={viewMode === 'card'}
                onChange={() => setViewMode('card')}
              />
            </div>
          </div>
        </div>

        {/* Split View: Matrix (Left 68%) and Role Inspector Drawer (Right 32%) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Matrix Panel (Left) */}
          <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-space-lg py-space-md bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs border-b border-surface-container-high">
              <div>
                <h2 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                  Functional Module Privileges
                </h2>
                <p className="font-caption text-caption text-text-secondary">
                  Granular operational grants mapped across institutional subsystems
                </p>
              </div>
              <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-action-green"></span> Full
                </span>
                <span className="flex items-center gap-1 ml-2">
                  <span className="w-2 h-2 rounded-full bg-soft-blue"></span> Scoped
                </span>
                <span className="flex items-center gap-1 ml-2">
                  <span className="w-2 h-2 rounded-full bg-surface-variant"></span> Restricted
                </span>
              </div>
            </div>

            {/* Bulk Selection Floating Bar */}
            {selectedModuleIds.length > 0 && (
              <div className="px-space-lg py-2.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-caption font-caption">
                <span className="font-semibold text-primary">
                  {selectedModuleIds.length} module{selectedModuleIds.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={() => {
                      toast.info(`Adjusted grants for ${selectedModuleIds.length} modules.`);
                      setSelectedModuleIds([]);
                    }}
                    className="px-2.5 py-1 rounded bg-primary text-on-primary text-[11px] font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
                    type="button"
                  >
                    Calibrate Grants
                  </button>
                  <button
                    onClick={() => setSelectedModuleIds([])}
                    className="px-2 py-1 text-text-secondary hover:text-text-primary text-[11px] font-medium transition-colors cursor-pointer"
                    type="button"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* View Mode: Table vs Card */}
            {viewMode === 'table' ? (
              <div
                ref={containerRef}
                className="overflow-x-auto cursor-grab active:cursor-grabbing select-none"
              >
                <table className="w-full text-left font-small text-small border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider border-b border-surface-container-high">
                      <th className="py-3.5 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={
                            paginatedModules.length > 0 &&
                            selectedModuleIds.length === paginatedModules.length
                          }
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                          aria-label="Select all modules"
                        />
                      </th>
                      <th className="py-3.5 px-space-md font-semibold">Functional Module</th>
                      <th className="py-3.5 px-3 text-center font-semibold text-primary bg-secondary-container/20 rounded-t-lg">
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px]">shield_person</span>
                          <span>Admin</span>
                          <span className="text-[10px] font-normal normal-case text-text-secondary">(16)</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-3 text-center font-semibold text-primary bg-soft-blue/40 rounded-t-lg">
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                          <span>Cashier</span>
                          <span className="text-[10px] font-normal normal-case text-text-secondary">(24)</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-3 text-center font-semibold text-primary bg-surface-container/40 rounded-t-lg">
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          <span>User</span>
                          <span className="text-[10px] font-normal normal-case text-text-secondary">(3,372)</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-3 text-center font-semibold text-primary bg-secondary-container/15 rounded-t-lg">
                        <div className="flex flex-col items-center">
                          <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                          <span>Curator</span>
                          <span className="text-[10px] font-normal normal-case text-text-secondary">(8)</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-space-sm text-center font-semibold">Operational Grant Scope</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary divide-y divide-surface-container-high">
                    {paginatedModules.map((item) => {
                      const isSelected = selectedModuleIds.includes(item.moduleId);
                      return (
                        <tr
                          key={item.moduleId}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-primary/5 hover:bg-primary/10'
                              : 'hover:bg-surface-container-low/60'
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(item.moduleId)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                              aria-label={`Select ${item.moduleName}`}
                            />
                          </td>
                          <td className="py-3 px-space-md">
                            <div className="flex flex-col">
                              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px] text-primary">
                                  {item.icon}
                                </span>
                                {item.moduleName}
                              </span>
                              <span className="font-caption text-caption text-text-secondary">
                                {item.subsystem}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-3 bg-secondary-container/10">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              {item.adminGrant}
                            </span>
                          </td>
                          <td className="text-center py-3 px-3 bg-soft-blue/20">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold gap-0.5 ${
                                item.cashierGrant === 'Full'
                                  ? 'bg-action-green/30 text-text-primary'
                                  : item.cashierGrant === 'Restricted'
                                  ? 'bg-surface-container text-text-secondary'
                                  : 'bg-soft-blue text-primary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {item.cashierGrant === 'Full' ? 'check_circle' : 'rule'}
                              </span>
                              {item.cashierGrant}
                            </span>
                          </td>
                          <td className="text-center py-3 px-3">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold gap-0.5 ${
                                item.patronGrant === 'Restricted'
                                  ? 'bg-surface-container text-text-secondary'
                                  : 'bg-soft-blue text-primary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {item.patronGrant === 'Restricted' ? 'block' : 'person'}
                              </span>
                              {item.patronGrant}
                            </span>
                          </td>
                          <td className="text-center py-3 px-3 bg-secondary-container/5">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold gap-0.5 ${
                                item.curatorGrant === 'Full'
                                  ? 'bg-action-green/30 text-text-primary font-bold'
                                  : item.curatorGrant === 'Restricted'
                                  ? 'bg-surface-container text-text-secondary'
                                  : 'bg-soft-blue text-primary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {item.curatorGrant === 'Full' ? 'edit_note' : 'visibility'}
                              </span>
                              {item.curatorGrant}
                            </span>
                          </td>
                          <td className="py-3 px-space-sm text-caption text-text-secondary">
                            {item.scopeDesc}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* View Mode: Card Grid */
              <div className="p-space-lg grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {paginatedModules.map((item) => {
                  const isSelected = selectedModuleIds.includes(item.moduleId);
                  return (
                    <div
                      key={item.moduleId}
                      onClick={() => handleToggleSelectRow(item.moduleId)}
                      className={`p-space-md rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-surface-container-high bg-surface-container-low/40 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-[22px] text-primary">
                            {item.icon}
                          </span>
                          <div>
                            <h3 className="font-small text-small font-bold text-text-primary leading-tight">
                              {item.moduleName}
                            </h3>
                            <span className="font-caption text-[11px] text-text-secondary">
                              {item.subsystem}
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelectRow(item.moduleId);
                          }}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>
                      <p className="font-caption text-caption text-text-secondary line-clamp-2 my-space-xs">
                        {item.scopeDesc}
                      </p>
                      <div className="grid grid-cols-4 gap-1 pt-2 border-t border-surface-container-high/60 text-[10px] text-center">
                        <div className="flex flex-col">
                          <span className="text-text-secondary">Admin</span>
                          <span className="font-bold text-status-available">{item.adminGrant}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-text-secondary">Cashier</span>
                          <span className="font-semibold text-primary">{item.cashierGrant}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-text-secondary">User</span>
                          <span className="font-medium text-text-secondary">{item.patronGrant}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-text-secondary">Curator</span>
                          <span className="font-semibold text-primary">{item.curatorGrant}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm text-caption font-caption text-text-secondary border-t border-surface-container-high">
              <div className="flex items-center gap-space-md">
                <span className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-status-available">verified</span>
                  <span>Matrix schema synced with Central Security Directive v4.12</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  Showing <strong>{paginatedModules.length}</strong> of <strong>{totalItems}</strong> subsystems
                </span>
              </div>

              <div className="flex items-center gap-space-sm">
                {/* Rows per page selector via Dropdown */}
                <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                  <span>Rows:</span>
                  <Dropdown<string>
                    variant="pagination"
                    selectedValue={pageSize.toString()}
                    onSelect={(val) => setPageSize(Number(val))}
                    items={[
                      { value: '10', label: '10' },
                      { value: '25', label: '25' },
                      { value: '50', label: '50' },
                      { value: '100', label: '100' },
                    ]}
                  />
                </div>

                {/* Page Prev/Next */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                    className="w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface border border-surface-container-high flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    type="button"
                    aria-label="Previous Page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <span className="px-2 font-medium">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    className="w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface border border-surface-container-high flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                    type="button"
                    aria-label="Next Page"
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role Inspector Drawer (Right Panel) */}
          <div className="xl:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Inspector Header with Role Switcher Quick Pill Strip */}
            <div className="p-space-lg bg-secondary-container/25 relative border-b border-surface-container-high">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-action-green"></span>
                  Role Inspector
                </span>
                <span className="font-caption text-caption text-text-secondary font-mono font-bold">
                  {currentRoleConfig?.id || 'ROLE-POS-01'}
                </span>
              </div>
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                {currentRoleConfig?.title || 'Cashier Desk'}
              </h3>
              <p className="font-caption text-caption text-text-secondary mt-0.5">
                {currentRoleConfig?.desc || 'Front desk terminal & express book checkout gates'}
              </p>

              {/* Interactive Mini Role Selector Buttons inside Drawer */}
              <div className="grid grid-cols-4 gap-1 mt-3 bg-surface-container-lowest p-1 rounded-lg shadow-sm">
                <button
                  onClick={() => setActiveInspectorKey('admin')}
                  className={`py-1 px-1.5 text-center font-caption text-[11px] rounded-md transition-all cursor-pointer ${
                    activeInspectorKey === 'admin'
                      ? 'font-bold bg-primary text-on-primary shadow-xs'
                      : 'font-semibold text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] block mx-auto">shield_person</span>
                  Admin
                </button>
                <button
                  onClick={() => setActiveInspectorKey('cashier')}
                  className={`py-1 px-1.5 text-center font-caption text-[11px] rounded-md transition-all cursor-pointer ${
                    activeInspectorKey === 'cashier'
                      ? 'font-bold bg-primary text-on-primary shadow-xs'
                      : 'font-semibold text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] block mx-auto">point_of_sale</span>
                  Cashier
                </button>
                <button
                  onClick={() => setActiveInspectorKey('user')}
                  className={`py-1 px-1.5 text-center font-caption text-[11px] rounded-md transition-all cursor-pointer ${
                    activeInspectorKey === 'user'
                      ? 'font-bold bg-primary text-on-primary shadow-xs'
                      : 'font-semibold text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] block mx-auto">person</span>
                  User
                </button>
                <button
                  onClick={() => setActiveInspectorKey('curator')}
                  className={`py-1 px-1.5 text-center font-caption text-[11px] rounded-md transition-all cursor-pointer ${
                    activeInspectorKey === 'curator'
                      ? 'font-bold bg-primary text-on-primary shadow-xs'
                      : 'font-semibold text-text-secondary hover:text-text-primary'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] block mx-auto">auto_stories</span>
                  Curator
                </button>
              </div>
            </div>

            {/* Dynamic Inspector Body */}
            <div className="p-space-lg flex flex-col gap-space-lg">
              {/* Section: Default Landing Scope */}
              <div>
                <label className="block font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold mb-space-xs">
                  Assigned Default Landing View
                </label>
                <div className="p-space-sm rounded-lg bg-soft-blue/60 border border-soft-blue flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {activeInspectorKey === 'admin'
                        ? 'admin_panel_settings'
                        : activeInspectorKey === 'cashier'
                        ? 'point_of_sale'
                        : activeInspectorKey === 'curator'
                        ? 'auto_stories'
                        : 'local_library'}
                    </span>
                    <div>
                      <span className="font-small text-small font-bold text-text-primary block leading-tight">
                        {currentRoleConfig?.landingTitle || 'Cashier Circulation Console'}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        {currentRoleConfig?.landingSub || 'Express barcode loans, holds & returns'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container-lowest font-caption text-caption text-primary font-semibold">
                    Default
                  </span>
                </div>
              </div>

              {/* Section: Core Entitlements & Boundaries with Interactive Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <label className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                    Role Governance Bounds
                  </label>
                  <span className="font-caption text-caption px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                    {currentRoleConfig?.tierBadge || 'Station Tier'}
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencyHoldOverride}
                      onChange={(e) => setEmergencyHoldOverride(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary mt-1 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-small text-small font-semibold text-text-primary">
                        Emergency Hold Override
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Permits physical checkouts during queue conflicts
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cashDrawerKickout}
                      onChange={(e) => setCashDrawerKickout(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary mt-1 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-small text-small font-semibold text-text-primary">
                        Cash Drawer Register Action
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Manual release with automatic audit trace log
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fineCourtesyWaiver}
                      onChange={(e) => setFineCourtesyWaiver(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary mt-1 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-small text-small font-semibold text-text-primary">
                        Fine Courtesy Waiver (up to ₱50)
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Immediate settlement without supervisor secondary key
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={holdStagingClearance}
                      onChange={(e) => setHoldStagingClearance(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary mt-1 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-small text-small font-semibold text-text-primary">
                        Hold Staging Clearance
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Process arrival of books to express pickup lockers
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section: 2FA Generator (Replaces deprecated Inactivity & Station Token) */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container-high/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-small text-small font-medium text-text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">key</span>
                    <span>Two-Factor Authentication (2FA)</span>
                  </span>
                  <span className="font-caption text-caption font-bold text-status-available">
                    {currentRoleConfig?.policyBadge || 'Mandatory'}
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary leading-relaxed mb-3">
                  Generate RFC 6238 compliant TOTP cryptographic secrets and recovery codes for verified operators assigned to this profile.
                </p>
                <button
                  onClick={handleTrigger2FaGeneration}
                  className="w-full py-2 px-space-md rounded-lg bg-primary text-on-primary hover:bg-primary-hover font-small text-small font-semibold transition-all flex items-center justify-center gap-space-xs shadow-xs cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  <span>Generate 2FA Key</span>
                </button>
              </div>

              {/* Section: Assigned Active Operators Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold block">
                    Assigned Active Operators
                  </span>
                  <span className="font-caption text-caption text-primary font-bold">
                    {currentRoleConfig?.assignedCount || '24 Terminals'}
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <img
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMQDQyLV5gCc9XcblZNcn8V3RKkOmccAu2yjTxp82zIRbRf7m5z-LZ4-lvhirhsKnNbYEP8MMsZ9-KPvMdXwUTiHwRPnUiVFGPmplyh5V1LiI7f7u3Odxuwpl0iAHBJ3uqZK0nZjiRxE5ddSDrGqMyPeRLUytQGtUfGXibI-NqtlenhPJ9kGqRWef4sWOd37D8lMBkE3cxXO9PP2mPrx46WK9YSHa03w_xbUgkfRsu_yoYVfqbajTR"
                    alt="Operator 1"
                  />
                  <img
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwlHPQTeddwjEAl1SSwLSDUJEAq6_Vx67pGrype1ExTDQVLOmLwe9NCtAJ7T1awhIa4ax9dKdmXu6icYAclrv12QO2KzJhLNLx0jyu41xR7ek77XAGYFNv9mfFVuB29Twh0NAac5wHjAszRGQVR81UcXAAHmkBUUQBk_qu44SI9WCJOYs6n3osCoHIPU-McEvcvK6VeAfMeZTnHCPiyqlOqCp9Y3tpSAvjxOnN2Wi_MYOJJKMNCc2n"
                    alt="Operator 2"
                  />
                  <img
                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt1s-pk-lZaRVRnxMPFzlahHHByh3KO_wbKHU0UrSpDNmPDxpxeKq4g6Un5a-N0sSNSd2HAFlKnIqUV-DOyOCifbhQ5KOgmUOxMjthGUhqFlEsC5s_-s7AN8U3dCdORzzWIHra88eDdRJmVuMJQKEeliDUMErOIaJOwHDfXNOw_yQZXzu0K2fbPYgZ_FMh2Dmn6_ELaQPDD4A4q6JIKBaSdjwOyrgu7POTUn-8NuSjJZnWHtakaqas"
                    alt="Operator 3"
                  />
                  <div className="w-8 h-8 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold flex items-center justify-center shadow-sm">
                    {currentRoleConfig?.avatarBadge || '+21'}
                  </div>
                  <span className="font-caption text-caption text-text-secondary ml-space-xs">
                    {currentRoleConfig?.avatarSub || 'Active on Terminal Fleet'}
                  </span>
                </div>
              </div>

              {/* Inspector Action Button */}
              <div className="pt-space-xs">
                <button
                  onClick={handleSaveRolePolicy}
                  className="w-full h-11 px-space-md rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold transition-all flex items-center justify-center gap-space-xs shadow-md active:scale-98 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>Save Role Policy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Authentication & Login/Logout Monitor (Replaces old static Privilege Modulation Trace) */}
        <div className="mt-space-xl bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
            <div>
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                Real-Time Authentication &amp; Access Monitor
              </h3>
              <p className="font-caption text-caption text-text-secondary">
                Live audit telemetry of user, cashier, and administrator access sessions with cryptographic verification
              </p>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-caption text-caption text-status-available font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-status-available animate-pulse"></span>
                Real-time Ingestion
              </span>
              <button
                onClick={() => setIsTelemetryModalOpen(true)}
                className="px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-small text-small font-medium transition-colors cursor-pointer"
                type="button"
              >
                View Raw Telemetry
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loginAudits.map((audit) => (
              <div
                key={audit.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low transition-colors gap-space-sm border border-surface-container-high/40"
              >
                <div className="flex items-center gap-space-md">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      audit.action === 'LOGIN'
                        ? 'bg-action-green/30 text-text-primary'
                        : 'bg-surface-container-high text-text-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {audit.action === 'LOGIN' ? 'login' : 'logout'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-small text-small font-semibold text-text-primary">
                        {audit.username}
                      </p>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          audit.action === 'LOGIN'
                            ? 'bg-action-green/20 text-text-primary'
                            : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        {audit.action}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Session verified via <strong>{audit.twoFactorMethod}</strong> • {audit.workstation} ({audit.ipAddress})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-md self-end sm:self-center">
                  <span className="font-caption text-caption text-text-secondary font-mono">
                    {audit.formattedTimeAgo}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-caption text-[11px] font-semibold">
                    {audit.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: Circulation Anomaly & Stacks Allocation Review */}
      <DefaultFloatingModalCard
        isOpen={isAnomalyModalOpen}
        onClose={() => setIsAnomalyModalOpen(false)}
        title="Stacks Allocation Review"
        subtitle="Autonomous circulation surge analysis and reserve reallocation"
      >
        <div className="space-y-4">
          <div className="p-3 bg-secondary-container/20 rounded-xl border border-secondary/30">
            <span className="font-small text-small font-bold text-text-primary block mb-1">
              Discipline: Computer Science
            </span>
            <p className="font-caption text-caption text-text-secondary">
              Pending hold volume increased by <strong>22%</strong> this week. 3 key titles currently report 0 shelf availability.
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-caption text-caption font-semibold text-text-primary uppercase tracking-wider block">
              Flagged Zero-Copy Titles
            </label>
            <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between text-caption font-caption">
              <span className="font-semibold text-text-primary">Discrete Mathematics &amp; Applications</span>
              <span className="px-2 py-0.5 bg-error-container text-error rounded font-bold">0 On Shelf / 8 Holds</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between text-caption font-caption">
              <span className="font-semibold text-text-primary">Operating System Concepts (10th Ed.)</span>
              <span className="px-2 py-0.5 bg-error-container text-error rounded font-bold">0 On Shelf / 6 Holds</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between text-caption font-caption">
              <span className="font-semibold text-text-primary">Introduction to Algorithms (CLRS)</span>
              <span className="px-2 py-0.5 bg-error-container text-error rounded font-bold">0 On Shelf / 5 Holds</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsAnomalyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-text-primary font-small text-small font-semibold cursor-pointer"
              type="button"
            >
              Close
            </button>
            <button
              onClick={() => {
                toast.success('Acquisition replenishment order dispatched to University Procurement.');
                setIsAnomalyModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold cursor-pointer"
              type="button"
            >
              Trigger Stacks Replenishment
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* MODAL 2: Enhanced 4-Way Export CSV/Excel */}
      <DefaultFloatingModalCard
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Security Policy & Access Matrix"
        subtitle="Configure multi-criteria export filters for compliance and audit dossiers"
      >
        <div className="space-y-4">
          {/* Date Range Selector */}
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Date Range
            </label>
            <input
              type="text"
              value={exportDateRange}
              onChange={(e) => setExportDateRange(e.target.value)}
              placeholder="e.g. 2026-01-01 to 2026-02-25"
              className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl border border-surface-container-high font-small text-small text-text-primary focus:outline-none"
            />
          </div>

          {/* Alphabetical Filter */}
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Alphabetical Filter (Starts with, Ends with, or Contains)
            </label>
            <input
              type="text"
              value={exportAlphabeticalFilter}
              onChange={(e) => setExportAlphabeticalFilter(e.target.value)}
              placeholder="e.g. A, O, or Users"
              className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl border border-surface-container-high font-small text-small text-text-primary focus:outline-none"
            />
          </div>

          {/* Sort Direction */}
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Sort Direction
            </label>
            <Dropdown
              selectedValue={exportSortDirection}
              onSelect={(val) => setExportSortDirection(val as 'asc' | 'desc')}
              items={[
                { value: 'asc', label: 'Ascending (Newest / A to Z)' },
                { value: 'desc', label: 'Descending (Oldest / Z to A)' },
              ]}
              label="Sort Direction"
            />
          </div>

          {/* Numeric ID Filter */}
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              ID Filter (Starts with, Ends with, or Contains)
            </label>
            <input
              type="text"
              value={exportIdFilter}
              onChange={(e) => setExportIdFilter(e.target.value)}
              placeholder="e.g. 1, MOD-01, or 02"
              className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl border border-surface-container-high font-small text-small text-text-primary focus:outline-none"
            />
          </div>

          {/* Format Selector */}
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Export Format
            </label>
            <div className="flex items-center gap-4">
              <RadioButton
                id="fmt-csv"
                name="exportFormat"
                value="csv"
                label="CSV Dossier"
                checked={exportFormat === 'csv'}
                onChange={() => setExportFormat('csv')}
              />
              <RadioButton
                id="fmt-excel"
                name="exportFormat"
                value="excel"
                label="Excel Spreadsheet (.xlsx)"
                checked={exportFormat === 'excel'}
                onChange={() => setExportFormat('excel')}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-text-primary font-small text-small font-semibold cursor-pointer"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteExport}
              className="px-4 py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Generate &amp; Download</span>
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* MODAL 3: Create Custom Role */}
      <DefaultFloatingModalCard
        isOpen={isCustomRoleModalOpen}
        onClose={() => setIsCustomRoleModalOpen(false)}
        title="Create Custom Staff Role"
        subtitle="Register a new institutional authority profile with custom boundaries"
      >
        <div className="space-y-4">
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Role Name
            </label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Rare Books Specialist"
              className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl border border-surface-container-high font-small text-small text-text-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Describe role scope and operational duties..."
              rows={3}
              className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl border border-surface-container-high font-small text-small text-text-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-1">
              Base Template Profile
            </label>
            <Dropdown
              selectedValue={newRoleBase}
              onSelect={setNewRoleBase}
              items={[
                { value: 'Staff', label: 'Specialist Staff (Curator Base)' },
                { value: 'Station', label: 'Station Tier (Cashier Base)' },
                { value: 'Admin', label: 'Administrative Tier' },
              ]}
              label="Base Profile"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsCustomRoleModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-text-primary font-small text-small font-semibold cursor-pointer"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCustomRole}
              className="px-4 py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold cursor-pointer"
              type="button"
            >
              Save Role
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* MODAL 4: Reset Security Defaults Confirmation */}
      <DefaultFloatingModalCard
        isOpen={isResetConfirmModalOpen}
        onClose={() => setIsResetConfirmModalOpen(false)}
        title="Reset to Statutory Defaults?"
        subtitle="This will restore all RBAC privileges to default University Charter v4.12"
      >
        <div className="space-y-4">
          <p className="font-small text-small text-text-secondary">
            Are you sure you want to reset all role configuration parameters, boundary tokens, and station overrides to the system defaults? Any uncommitted custom role calibrations will be reverted.
          </p>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setIsResetConfirmModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-text-primary font-small text-small font-semibold cursor-pointer"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmResetDefaults}
              className="px-4 py-2 rounded-xl bg-error hover:bg-error/90 text-on-error font-small text-small font-bold cursor-pointer"
              type="button"
            >
              Yes, Reset Defaults
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* MODAL 5: 2FA Setup & Key Generator */}
      <DefaultFloatingModalCard
        isOpen={is2FaModalOpen && !!twoFactorResult}
        onClose={() => setIs2FaModalOpen(false)}
        title="2FA Cryptographic Key Generated"
        subtitle="RFC 6238 TOTP seed and one-time emergency recovery codes"
      >
        {twoFactorResult && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-container-low rounded-xl text-center">
              <span className="font-caption text-caption text-text-secondary block mb-1">
                Base32 Secret Key (Enter into Authenticator App):
              </span>
              <span className="font-mono font-bold text-headline-4 text-primary tracking-widest select-all">
                {twoFactorResult.secretKey}
              </span>
            </div>

            <div>
              <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                Emergency Backup Recovery Codes (8 Remaining):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {twoFactorResult.recoveryCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-surface-container-lowest rounded border border-surface-container-high font-mono text-caption text-center select-all"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(twoFactorResult.secretKey);
                  toast.success('Copied 2FA Secret Key to clipboard.');
                }}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-hover font-small text-small font-semibold cursor-pointer"
                type="button"
              >
                Copy Secret Key
              </button>
              <button
                onClick={() => setIs2FaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold cursor-pointer"
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* MODAL 6: Raw Telemetry Stream */}
      <DefaultFloatingModalCard
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        title="Raw Authentication Telemetry Stream"
        subtitle="Real-time JSON payload from Central Security Audit Ingestion Socket"
      >
        <div className="space-y-3">
          <pre className="p-4 bg-surface-container-lowest rounded-xl border border-surface-container-high font-mono text-[11px] text-text-primary max-h-96 overflow-y-auto">
            {JSON.stringify(loginAudits, null, 2)}
          </pre>
          <div className="flex justify-end">
            <button
              onClick={() => setIsTelemetryModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-text-primary font-small text-small font-semibold cursor-pointer"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>
    </div>
  );
};

export default RolesPermissions;
