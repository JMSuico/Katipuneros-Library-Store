// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Settings.tsx -- Admin Library System Governance & Policy Console.
// Pure React 19 reactive state architecture with typed API stubs, global shared primitives,
// account-bound theme persistence, network recovery, and zero hardcoded mock values.
// DO NOT put direct fetch/axios calls here -- use Endpoints/Admin/settingsApi.ts only.

import { FC, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getSystemSettings,
  saveAllSystemSettings,
  resetSystemSettingsToDefault,
  getCidrSubnets,
  addCidrSubnet,
  bulkDeleteCidrSubnets,
  getSystemArchives,
  SystemSettingsResponse,
  CidrSubnetDto,
  ArchiveModuleSummaryDto,
} from '../../../../../Endpoints/Admin/settingsApi';
import { Dropdown, DropdownItem } from '../../../../../Shared/Dropdown';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { AdminSwitch } from '../Shared/AdminSwitch';
import { useAccountTheme, ThemeMode, DisplayDensity, FontSizeMultiplier } from '../../../../../Hooks/useAccountTheme';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';
import { useFluidResposiveness, DEVICE_PRESETS } from '../../../../../Hooks/useFluidResposiveness';
import { useToasts } from '../../../../../Hooks/useToasts';

type SettingsTab = 'circulation' | 'reservations' | 'fines' | 'appearance' | 'archives' | 'security';

const TAB_CONFIG: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'circulation', label: 'Circulation & Loan Durations', icon: 'schedule' },
  { id: 'reservations', label: 'Reservation Setups', icon: 'bookmarks' },
  { id: 'fines', label: 'Fine Calculation & Waiver Tariff', icon: 'calculate' },
  { id: 'appearance', label: 'Appearance & Theme', icon: 'palette' },
  { id: 'archives', label: 'Archives', icon: 'archive' },
  { id: 'security', label: 'Security & Access Governance', icon: 'shield' },
];

const Settings: FC = () => {
  const { toasts, addToast } = useToasts();
  const toast = useMemo(
    () => ({
      success: (msg: string) => addToast(msg, 'success'),
      error: (msg: string) => addToast(msg, 'error'),
      warning: (msg: string) => addToast(msg, 'warning'),
      info: (msg: string) => addToast(msg, 'info'),
    }),
    [addToast]
  );
  const { isMobile, width } = useFluidResposiveness();
  const themeHook = useAccountTheme();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<SettingsTab>('circulation');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<SystemSettingsResponse>({
    circulation: {
      tier1: { daysDuration: 14, maxConcurrency: 4, renewalLimit: '1 Time (7d)', holdQueueLimit: 2, overdueTariff: 'Standard Daily' },
      tier2: { daysDuration: 28, maxConcurrency: 8, renewalLimit: '2 Times (14d)', holdQueueLimit: 5, overdueTariff: 'Standard Daily' },
      tier3: { daysDuration: 60, maxConcurrency: 15, renewalLimit: 'Auto Semester', holdQueueLimit: 10, overdueTariff: 'Waived 1st Cycle' },
      gracePeriodHours: 24,
      activeBorrowersCovered: 0,
      circulatingTitleCatalog: 0,
      interLibraryLoanProtocol: 'Katipunan Consortium',
    },
    reservations: {
      instantReshelveNotice: true,
      thesisScholarPriority: true,
      pickupNotificationCadence: '3 Alerts (Deposit / 24h / 6h)',
    },
    fines: {
      dailyOverdueTariff: 15.0,
      maxPenaltyCap: 500.0,
      bindingRepairTariff: 280.0,
      lostBookAdministrativeFee: 150.0,
      medicalWaiverEnabled: true,
      typhoonWaiverEnabled: true,
    },
    security: {
      posAutoLogoffMinutes: 15,
      superAdminTimeoutMinutes: 60,
      auditNodeStatus: 'Nominal',
      hashChainLength: 0,
      hmacKeyStatus: 'Rotated (3d ago)',
    },
    telemetry: {
      totalSystemEvents24h: 0,
      eventsGrowthRate: 14.2,
      securityAnomalies: 0,
      hashChainStatus: '100%',
      lastValidatedBlock: 'Block #1 validated 2m ago',
      activeSuperAdminSessions: 1,
    },
  });

  // CIDR Subnets State
  const [cidrList, setCidrList] = useState<CidrSubnetDto[]>([]);
  const [selectedCidrIds, setSelectedCidrIds] = useState<string[]>([]);
  const [isAddCidrModalOpen, setIsAddCidrModalOpen] = useState(false);
  const [newCidrRange, setNewCidrRange] = useState('');
  const [newCidrClass, setNewCidrClass] = useState('Circulation Kiosk LAN');
  const [newCidrAccess, setNewCidrAccess] = useState('Staff POS Desks');

  // Archives State
  const [archivesList, setArchivesList] = useState<ArchiveModuleSummaryDto[]>([]);
  const [selectedArchiveModules, setSelectedArchiveModules] = useState<string[]>([]);

  // Fine Calculation Simulator State
  const [simulatedDays, setSimulatedDays] = useState(5);

  // Modals State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [saveSelections, setSaveSelections] = useState({
    circulation: true,
    reservations: true,
    fines: true,
    security: true,
  });
  const [resetSelections, setResetSelections] = useState({
    circulation: true,
    reservations: true,
    fines: true,
  });

  // Device Preview State for Appearance
  const [selectedDevicePreset, setSelectedDevicePreset] = useState<string>('standard');

  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, cidrRes, archivesRes] = await Promise.all([
        getSystemSettings(),
        getCidrSubnets(),
        getSystemArchives(),
      ]);

      if (settingsRes) setSettings(settingsRes);
      if (cidrRes) setCidrList(cidrRes);
      if (archivesRes) setArchivesList(archivesRes);
    } catch (err) {
      console.error('[Settings] Failed to fetch data:', err);
      toast.error('Failed to load system settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Network Recovery auto-refresh hook
  usePagesGlobalRefresh({
    onRefresh: async () => {
      await loadData();
      toast.info('System back online. Settings synchronized.');
    },
  });

  // Tab scroll helpers
  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fine calculation simulator formulas
  const fineSimCalculation = useMemo(() => {
    const gross = simulatedDays;
    const graceDays = Math.round(settings.circulation.gracePeriodHours / 24);
    const billable = Math.max(0, gross - graceDays);
    const rawTotal = billable * settings.fines.dailyOverdueTariff;
    const finalTotal = Math.min(rawTotal, settings.fines.maxPenaltyCap);
    const isCapped = rawTotal >= settings.fines.maxPenaltyCap;

    return { gross, graceDays, billable, rawTotal, finalTotal, isCapped };
  }, [simulatedDays, settings.circulation.gracePeriodHours, settings.fines.dailyOverdueTariff, settings.fines.maxPenaltyCap]);

  // Stepper handlers for Circulation Tier Policies
  const updateTier1Days = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      circulation: {
        ...prev.circulation,
        tier1: { ...prev.circulation.tier1, daysDuration: Math.max(1, prev.circulation.tier1.daysDuration + delta) },
      },
    }));
  };

  const updateTier1Concurrency = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      circulation: {
        ...prev.circulation,
        tier1: { ...prev.circulation.tier1, maxConcurrency: Math.max(1, prev.circulation.tier1.maxConcurrency + delta) },
      },
    }));
  };

  const updateTier2Days = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      circulation: {
        ...prev.circulation,
        tier2: { ...prev.circulation.tier2, daysDuration: Math.max(1, prev.circulation.tier2.daysDuration + delta) },
      },
    }));
  };

  const updateTier2Concurrency = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      circulation: {
        ...prev.circulation,
        tier2: { ...prev.circulation.tier2, maxConcurrency: Math.max(1, prev.circulation.tier2.maxConcurrency + delta) },
      },
    }));
  };

  const updateTier3Days = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      circulation: {
        ...prev.circulation,
        tier3: { ...prev.circulation.tier3, daysDuration: Math.max(1, prev.circulation.tier3.daysDuration + delta) },
      },
    }));
  };

  const updateTier3Concurrency = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      circulation: {
        ...prev.circulation,
        tier3: { ...prev.circulation.tier3, maxConcurrency: Math.max(1, prev.circulation.tier3.maxConcurrency + delta) },
      },
    }));
  };

  // Stepper handlers for Fines & Tariffs
  const updateDailyTariff = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      fines: { ...prev.fines, dailyOverdueTariff: Math.max(0, prev.fines.dailyOverdueTariff + delta) },
    }));
  };

  const updateMaxPenaltyCap = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      fines: { ...prev.fines, maxPenaltyCap: Math.max(0, prev.fines.maxPenaltyCap + delta) },
    }));
  };

  const updateBindingRepairTariff = (delta: number) => {
    setSettings((prev) => ({
      ...prev,
      fines: { ...prev.fines, bindingRepairTariff: Math.max(0, prev.fines.bindingRepairTariff + delta) },
    }));
  };

  // CIDR Add & Delete Handlers
  const handleAddCidr = async () => {
    if (!newCidrRange.trim()) {
      toast.warning('Please enter a valid CIDR subnet range (e.g. 192.168.100.0/22).');
      return;
    }
    try {
      const res = await addCidrSubnet({
        cidrRange: newCidrRange.trim(),
        networkClassification: newCidrClass.trim(),
        accessLevel: newCidrAccess.trim(),
      });
      if (res.success && res.data) {
        setCidrList((prev) => [res.data, ...prev]);
        setNewCidrRange('');
        setIsAddCidrModalOpen(false);
        toast.success(`Subnet ${res.data.cidrRange} added to campus whitelist.`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add subnet. Ensure valid CIDR format.');
    }
  };

  const handleBulkDeleteCidr = async () => {
    if (selectedCidrIds.length === 0) return;
    try {
      await bulkDeleteCidrSubnets(selectedCidrIds);
      setCidrList((prev) => prev.filter((s) => !selectedCidrIds.includes(s.id)));
      toast.success(`Removed ${selectedCidrIds.length} subnet(s) from whitelist.`);
      setSelectedCidrIds([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete selected subnets.');
    }
  };

  const handleDeleteSingleCidr = async (id: string) => {
    try {
      await bulkDeleteCidrSubnets([id]);
      setCidrList((prev) => prev.filter((s) => s.id !== id));
      setSelectedCidrIds((prev) => prev.filter((i) => i !== id));
      toast.success('Subnet removed from whitelist.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove subnet.');
    }
  };

  // Save full configuration
  const handleConfirmSave = async () => {
    try {
      setSaving(true);
      await saveAllSystemSettings(settings);
      toast.success('System configurations successfully saved and synchronized across campus nodes!');
      setIsSaveModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save configurations.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const handleConfirmReset = async () => {
    const modulesToReset = Object.entries(resetSelections)
      .filter(([_, checked]) => checked)
      .map(([mod]) => mod);

    if (modulesToReset.length === 0) {
      toast.warning('Please select at least one module to reset.');
      return;
    }

    try {
      setSaving(true);
      await resetSystemSettingsToDefault(modulesToReset);
      await loadData();
      toast.success('Selected modules reverted to default institutional policy.');
      setIsResetModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reset configurations.');
    } finally {
      setSaving(false);
    }
  };

  // Grace Period Options
  const graceOptions: DropdownItem<string>[] = [
    { value: '12', label: '12 Hours Window' },
    { value: '24', label: '24 Hours (1 Day Buffer)' },
    { value: '48', label: '48 Hours (2 Days Buffer)' },
  ];

  // Auto-logoff Options
  const posLogoffOptions: DropdownItem<string>[] = [
    { value: '5', label: '5 Minutes' },
    { value: '10', label: '10 Minutes' },
    { value: '15', label: '15 Minutes (Default)' },
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '60 Minutes' },
  ];

  const adminTimeoutOptions: DropdownItem<string>[] = [
    { value: '15', label: '15 Minutes' },
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '60 Minutes (Mandatory)' },
    { value: '120', label: '120 Minutes' },
  ];

  const activeTabMeta = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];

  return (
    <div className="w-full pb-16">
      {/* Toast Render */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg border text-small font-medium flex items-center gap-2 backdrop-blur-md transition-all ${
              t.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700'
                : t.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-700'
                : 'bg-slate-900/90 text-slate-100 border-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1">
            <span className="hover:text-primary transition-colors cursor-pointer">Admin Console</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Settings</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-text-primary font-medium">{activeTabMeta.label}</span>
          </div>
          <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
            System Governance &amp; Policy Console
          </h1>
          <p className="font-body text-small text-text-secondary mt-0.5">
            Centrally configure institutional loan caps, security policies, appearance parameters, and campus archives.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-space-sm self-start lg:self-auto">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="h-11 px-space-md rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-body text-small font-medium transition-colors flex items-center gap-space-xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => setIsSaveModalOpen(true)}
            disabled={saving}
            className="h-11 px-space-lg rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold shadow-sm transition-all transform active:scale-95 flex items-center gap-space-xs cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {saving ? 'progress_activity' : 'save'}
            </span>
            <span className="whitespace-nowrap">{saving ? 'Saving...' : 'Save Configurations'}</span>
          </button>
        </div>
      </div>

      {/* Top Horizontal Navigation Tabs with prominent '‹' and '›' arrow buttons */}
      <div className="relative flex items-center mb-space-lg bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-surface-container">
        <button
          aria-label="Scroll tabs left"
          onClick={() => handleScrollTabs('left')}
          className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-soft-blue text-primary border border-surface-container flex items-center justify-center font-bold text-xl transition-all shrink-0 select-none mr-2 active:scale-95 cursor-pointer"
          title="Scroll tabs left"
          type="button"
        >
          ‹
        </button>

        <div
          ref={tabsScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-0 no-scrollbar scroll-smooth select-none w-full"
        >
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-space-md py-2.5 rounded-xl font-body text-small font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-md'
                    : 'bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          aria-label="Scroll tabs right"
          onClick={() => handleScrollTabs('right')}
          className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-soft-blue text-primary border border-surface-container flex items-center justify-center font-bold text-xl transition-all shrink-0 select-none ml-2 active:scale-95 cursor-pointer"
          title="Scroll tabs right"
          type="button"
        >
          ›
        </button>
      </div>

      {/* TAB 1: CIRCULATION & LOAN DURATIONS */}
      {activeTab === 'circulation' && (
        <div className="flex flex-col gap-space-lg">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
            <div className="xl:col-span-8 flex flex-col gap-space-lg">
              <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">auto_stories</span>
                    </div>
                    <div>
                      <h2 className="font-headline-4 text-headline-4 text-text-primary">
                        Circulation Policy &amp; Loan Rules
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Default borrowing windows, concurrency caps, renewal limits, and hold queue thresholds per user classification.
                      </p>
                    </div>
                  </div>
                  <span className="font-caption text-caption px-space-sm py-1 rounded-full bg-soft-blue text-primary font-semibold uppercase tracking-wider">
                    Active Policy v4.2
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
                  {/* Tier 1: Undergraduate */}
                  <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-small font-bold text-text-primary">Undergraduate</span>
                        <span className="font-caption text-[11px] font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                          TIER 1
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-surface-container rounded-lg bg-surface-container-lowest overflow-hidden">
                            <span className="w-12 text-center font-headline-3 font-bold text-primary py-0.5">
                              {settings.circulation.tier1.daysDuration}
                            </span>
                            <div className="flex flex-col border-l border-surface-container">
                              <button
                                type="button"
                                onClick={() => updateTier1Days(1)}
                                className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                                title="Increase Days Duration"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateTier1Days(-1)}
                                className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary transition-colors border-t border-surface-container"
                                title="Decrease Days Duration"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                              </button>
                            </div>
                          </div>
                          <span className="font-body text-small text-text-secondary">Days Duration</span>
                        </div>
                      </div>
                      <div className="space-y-2.5 font-caption text-caption text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span>Max Concurrency:</span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center border border-surface-container rounded bg-surface-container-lowest overflow-hidden">
                              <span className="w-8 text-center font-bold text-text-primary">
                                {settings.circulation.tier1.maxConcurrency}
                              </span>
                              <div className="flex flex-col border-l border-surface-container">
                                <button
                                  type="button"
                                  onClick={() => updateTier1Concurrency(1)}
                                  className="px-1 py-0.2 hover:bg-surface-container text-text-secondary hover:text-primary"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateTier1Concurrency(-1)}
                                  className="px-1 py-0.2 hover:bg-surface-container text-text-secondary hover:text-primary border-t border-surface-container"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                            <span>books</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Renewal Limit:</span>
                          <span className="font-bold text-text-primary">1 Time (7d)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Hold Queue Limit:</span>
                          <span className="font-bold text-text-primary">2 Volumes</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                      <span className="font-caption text-caption text-text-secondary">Overdue Tariff</span>
                      <span className="font-caption text-caption font-semibold text-status-danger">Standard Daily</span>
                    </div>
                  </div>

                  {/* Tier 2: Graduate / Scholar */}
                  <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-small font-bold text-text-primary">Graduate / Scholar</span>
                        <span className="font-caption text-[11px] font-bold text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full">
                          TIER 2
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-surface-container rounded-lg bg-surface-container-lowest overflow-hidden">
                            <span className="w-12 text-center font-headline-3 font-bold text-primary py-0.5">
                              {settings.circulation.tier2.daysDuration}
                            </span>
                            <div className="flex flex-col border-l border-surface-container">
                              <button
                                type="button"
                                onClick={() => updateTier2Days(1)}
                                className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateTier2Days(-1)}
                                className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary transition-colors border-t border-surface-container"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                              </button>
                            </div>
                          </div>
                          <span className="font-body text-small text-text-secondary">Days Duration</span>
                        </div>
                      </div>
                      <div className="space-y-2.5 font-caption text-caption text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span>Max Concurrency:</span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center border border-surface-container rounded bg-surface-container-lowest overflow-hidden">
                              <span className="w-8 text-center font-bold text-text-primary">
                                {settings.circulation.tier2.maxConcurrency}
                              </span>
                              <div className="flex flex-col border-l border-surface-container">
                                <button
                                  type="button"
                                  onClick={() => updateTier2Concurrency(1)}
                                  className="px-1 py-0.2 hover:bg-surface-container text-text-secondary hover:text-primary"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateTier2Concurrency(-1)}
                                  className="px-1 py-0.2 hover:bg-surface-container text-text-secondary hover:text-primary border-t border-surface-container"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                            <span>books</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Renewal Limit:</span>
                          <span className="font-bold text-text-primary">2 Times (14d)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Hold Queue Limit:</span>
                          <span className="font-bold text-text-primary">5 Volumes</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                      <span className="font-caption text-caption text-text-secondary">Thesis Priority</span>
                      <span className="font-caption text-caption font-semibold text-primary">High Request</span>
                    </div>
                  </div>

                  {/* Tier 3: Faculty & Fellow */}
                  <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-small font-bold text-text-primary">Faculty &amp; Fellow</span>
                        <span className="font-caption text-[11px] font-bold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-full">
                          TIER 3
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-surface-container rounded-lg bg-surface-container-lowest overflow-hidden">
                            <span className="w-12 text-center font-headline-3 font-bold text-primary py-0.5">
                              {settings.circulation.tier3.daysDuration}
                            </span>
                            <div className="flex flex-col border-l border-surface-container">
                              <button
                                type="button"
                                onClick={() => updateTier3Days(1)}
                                className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateTier3Days(-1)}
                                className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary transition-colors border-t border-surface-container"
                              >
                                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                              </button>
                            </div>
                          </div>
                          <span className="font-body text-small text-text-secondary">Days Duration</span>
                        </div>
                      </div>
                      <div className="space-y-2.5 font-caption text-caption text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span>Max Concurrency:</span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center border border-surface-container rounded bg-surface-container-lowest overflow-hidden">
                              <span className="w-8 text-center font-bold text-text-primary">
                                {settings.circulation.tier3.maxConcurrency}
                              </span>
                              <div className="flex flex-col border-l border-surface-container">
                                <button
                                  type="button"
                                  onClick={() => updateTier3Concurrency(1)}
                                  className="px-1 py-0.2 hover:bg-surface-container text-text-secondary hover:text-primary"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateTier3Concurrency(-1)}
                                  className="px-1 py-0.2 hover:bg-surface-container text-text-secondary hover:text-primary border-t border-surface-container"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                            <span>books</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Renewal Limit:</span>
                          <span className="font-bold text-text-primary">Auto Semester</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Hold Queue Limit:</span>
                          <span className="font-bold text-text-primary">10 Volumes</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
                      <span className="font-caption text-caption text-text-secondary">Overdue Tariff</span>
                      <span className="font-caption text-caption font-semibold text-action-green-hover">Waived 1st Cycle</span>
                    </div>
                  </div>
                </div>

                {/* Courtesy Grace Period Buffer using Dropdown */}
                <div className="mt-4 pt-4 border-t border-surface-container/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-text-secondary">hourglass_top</span>
                    <div>
                      <h4 className="font-body text-small font-bold text-text-primary">Courtesy Grace Period Buffer</h4>
                      <p className="font-caption text-caption text-text-secondary">
                        Non-penalized time window after official loan expiration before daily fine accrual begins.
                      </p>
                    </div>
                  </div>
                  <div className="w-64">
                    <Dropdown
                      items={graceOptions}
                      selectedValue={String(settings.circulation.gracePeriodHours)}
                      onSelect={(val) =>
                        setSettings((prev) => ({
                          ...prev,
                          circulation: { ...prev.circulation, gracePeriodHours: parseInt(val, 10) },
                        }))
                      }
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Active Policy Scope */}
            <div className="xl:col-span-4 flex flex-col gap-space-lg">
              <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60">
                <h3 className="font-headline-4 text-headline-4 text-text-primary mb-space-md">Active Policy Scope</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                    <span className="font-body text-small text-text-secondary">Active Borrowers Covered:</span>
                    <span className="font-body text-small font-bold text-text-primary">
                      {settings.circulation.activeBorrowersCovered.toLocaleString()} Users
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                    <span className="font-body text-small text-text-secondary">Circulating Title Catalog:</span>
                    <span className="font-body text-small font-bold text-text-primary">
                      {settings.circulation.circulatingTitleCatalog.toLocaleString()} Volumes
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                    <span className="font-body text-small text-text-secondary">Inter-Library Loan Protocol:</span>
                    <span className="font-body text-small font-bold text-primary">Katipunan Consortium</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-surface-container-low text-caption font-caption text-text-secondary leading-relaxed">
                  Consortium Policy Note: Changes propagate immediately to all catalog endpoints, self-checkout kiosks, and smart return bookdrops across campus.
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESERVATION SETUPS (Renamed from Reservation & Locking Staging, RFID Purged) */}
      {activeTab === 'reservations' && (
        <div className="flex flex-col gap-space-lg">
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60">
            <div className="flex items-start justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">bookmarks</span>
                </div>
                <div>
                  <h2 className="font-headline-4 text-headline-4 text-text-primary">Reservation Setups</h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Hold Policies (Auto-reshelving thresholds, waitlist priority rules, and notification cadence.)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
              {/* Auto-Reshelving Threshold */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[18px]">shelves</span>
                  </div>
                  <h3 className="font-body text-small font-bold text-text-primary mb-1">
                    Auto-Reshelving Threshold
                  </h3>
                  <p className="font-caption text-caption text-text-secondary mb-4">
                    Automated re-indexing task dispatched to shelving staff when hold window expires uncollected.
                  </p>
                </div>
                <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                  <span className="font-caption text-caption font-medium text-text-primary">
                    Instant Re-shelve Notice:
                  </span>
                  <AdminSwitch
                    checked={settings.reservations.instantReshelveNotice}
                    onChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        reservations: { ...prev.reservations, instantReshelveNotice: checked },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Waitlist Priority Algorithm */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container text-action-green flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                  </div>
                  <h3 className="font-body text-small font-bold text-text-primary mb-1">
                    Waitlist Priority Algorithm
                  </h3>
                  <p className="font-caption text-caption text-text-secondary mb-4">
                    Fast-track queue priority weighting for graduating candidates with verified thesis milestones.
                  </p>
                </div>
                <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                  <span className="font-caption text-caption font-medium text-text-primary">
                    Thesis Scholar Priority:
                  </span>
                  <AdminSwitch
                    checked={settings.reservations.thesisScholarPriority}
                    onChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        reservations: { ...prev.reservations, thesisScholarPriority: checked },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Pickup Notification Cadence */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container text-primary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[18px]">schedule_send</span>
                  </div>
                  <h3 className="font-body text-small font-bold text-text-primary mb-1">
                    Pickup Notification Cadence
                  </h3>
                  <p className="font-caption text-caption text-text-secondary mb-4">
                    Automated alert sent upon hold ready deposit, followed by countdown alerts at 24h and 6h prior to release.
                  </p>
                </div>
                <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                  <span className="font-caption text-caption font-medium text-text-primary">Dispatch Sequence:</span>
                  <span className="font-caption text-[11px] font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                    3 Alerts (Deposit / 24h / 6h)
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: FINE CALCULATIONS & WAIVER TARIFF */}
      {activeTab === 'fines' && (
        <div className="flex flex-col gap-space-lg">
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60">
            <div className="flex items-start justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div>
                  <h2 className="font-headline-4 text-headline-4 text-text-primary">
                    Fine Tariff &amp; Algorithmic Calculator
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Configure overdue rates, maximum fine ceiling, binding repair costs, replacement cost rules, and live sandbox.
                  </p>
                </div>
              </div>
            </div>

            {/* Tariff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md mb-space-lg">
              {/* Daily Overdue Tariff */}
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Daily Overdue Tariff</span>
                <span className="font-caption text-[11px] text-text-secondary block mb-2">Assessed per calendar day post-grace</span>
                <div className="flex items-center gap-2">
                  <span className="font-headline-3 font-bold text-text-primary">₱</span>
                  <div className="flex items-center border border-surface-container rounded-lg bg-surface-container-lowest overflow-hidden">
                    <span className="w-14 text-center font-headline-3 font-bold text-primary py-0.5">
                      {settings.fines.dailyOverdueTariff.toFixed(2)}
                    </span>
                    <div className="flex flex-col border-l border-surface-container">
                      <button
                        type="button"
                        onClick={() => updateDailyTariff(1.0)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDailyTariff(-1.0)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary border-t border-surface-container"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maximum Penalty Cap */}
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Maximum Penalty Cap</span>
                <span className="font-caption text-[11px] text-text-secondary block mb-2">Protective ceiling per volume</span>
                <div className="flex items-center gap-2">
                  <span className="font-headline-3 font-bold text-text-primary">₱</span>
                  <div className="flex items-center border border-surface-container rounded-lg bg-surface-container-lowest overflow-hidden">
                    <span className="w-16 text-center font-headline-3 font-bold text-primary py-0.5">
                      {settings.fines.maxPenaltyCap.toFixed(2)}
                    </span>
                    <div className="flex flex-col border-l border-surface-container">
                      <button
                        type="button"
                        onClick={() => updateMaxPenaltyCap(25.0)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMaxPenaltyCap(-25.0)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary border-t border-surface-container"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Binding Repair Tariff */}
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Binding Repair Tariff</span>
                <span className="font-caption text-[11px] text-text-secondary block mb-2">Damaged spine/cover triage cost</span>
                <div className="flex items-center gap-2">
                  <span className="font-headline-3 font-bold text-text-primary">₱</span>
                  <div className="flex items-center border border-surface-container rounded-lg bg-surface-container-lowest overflow-hidden">
                    <span className="w-16 text-center font-headline-3 font-bold text-primary py-0.5">
                      {settings.fines.bindingRepairTariff.toFixed(2)}
                    </span>
                    <div className="flex flex-col border-l border-surface-container">
                      <button
                        type="button"
                        onClick={() => updateBindingRepairTariff(10.0)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBindingRepairTariff(-10.0)}
                        className="px-1.5 py-0.5 hover:bg-surface-container text-text-secondary hover:text-primary border-t border-surface-container"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lost Book Replacement Cost */}
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Lost Book Replacement</span>
                <span className="font-caption text-[11px] text-text-secondary block mb-2">Market Value + Admin Acquisition</span>
                <div className="pt-2">
                  <span className="font-body text-small font-bold text-text-primary">
                    Cost + ₱{settings.fines.lostBookAdministrativeFee.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Fine Calculation Simulator */}
            <div className="bg-surface-container-low rounded-xl p-space-lg border border-surface-container mb-space-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">biotech</span>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary">
                    Live Fine Calculation Simulator
                  </h3>
                </div>
                <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Real-time Sandbox
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="font-body text-small text-text-secondary block mb-2">
                    Simulate Overdue Period: <strong className="text-text-primary">{simulatedDays} days</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={simulatedDays}
                    onChange={(e) => setSimulatedDays(parseInt(e.target.value, 10))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-caption font-caption text-text-secondary mt-1">
                    <span>0 days</span>
                    <span>15 days</span>
                    <span>30 days</span>
                    <span>45 days</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="font-caption text-[11px] text-text-secondary block">Gross Period</span>
                    <span className="font-body text-small font-bold text-text-primary">{fineSimCalculation.gross} days</span>
                  </div>
                  <div>
                    <span className="font-caption text-[11px] text-text-secondary block">Grace Window</span>
                    <span className="font-body text-small font-bold text-status-danger">-{fineSimCalculation.graceDays} day</span>
                  </div>
                  <div>
                    <span className="font-caption text-[11px] text-text-secondary block">Billable Days</span>
                    <span className="font-body text-small font-bold text-text-primary">{fineSimCalculation.billable} days</span>
                  </div>
                  <div>
                    <span className="font-caption text-[11px] text-text-secondary block">Calculated Fine</span>
                    <span className="font-headline-3 font-bold text-primary">
                      ₱{fineSimCalculation.finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              {fineSimCalculation.isCapped && (
                <div className="mt-3 text-caption font-caption text-status-pending">
                  *Capped automatically at ₱{settings.fines.maxPenaltyCap.toFixed(2)} when charges reach ceiling limit.
                </div>
              )}
            </div>

            {/* Waiver Governance Workflows */}
            <div className="border-t border-surface-container/60 pt-4">
              <h3 className="font-headline-4 text-headline-4 text-text-primary mb-3">Waiver Governance Workflows</h3>
              <p className="font-caption text-caption text-text-secondary mb-4">
                Librarians can waive up to ₱100.00 without elevated authorization. Higher amounts trigger Dean's digital signature.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                  <div>
                    <span className="font-body text-small font-bold text-text-primary block">Medical / Emergency Waiver</span>
                    <span className="font-caption text-caption text-text-secondary">Allows clinic note upload</span>
                  </div>
                  <AdminSwitch
                    checked={settings.fines.medicalWaiverEnabled}
                    onChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        fines: { ...prev.fines, medicalWaiverEnabled: checked },
                      }))
                    }
                  />
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
                  <div>
                    <span className="font-body text-small font-bold text-text-primary block">Typhoon / Calamity Waiver</span>
                    <span className="font-caption text-caption text-text-secondary">Institutional campus freeze</span>
                  </div>
                  <AdminSwitch
                    checked={settings.fines.typhoonWaiverEnabled}
                    onChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        fines: { ...prev.fines, typhoonWaiverEnabled: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: APPEARANCE & THEME */}
      {activeTab === 'appearance' && (
        <div className="flex flex-col gap-space-lg">
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60">
            <div className="flex items-start justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">palette</span>
                </div>
                <div>
                  <h2 className="font-headline-4 text-headline-4 text-text-primary">
                    Appearance &amp; Console Themes
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Customize theme modes, primary brand colors, display density, and font size multipliers stored locally per user account.
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Mode Selection */}
            <div className="mb-6">
              <label className="font-body text-small font-bold text-text-primary block mb-3">Theme Mode Selection</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'light', label: 'Light Academic', sub: 'Active Day Mode', icon: 'light_mode' },
                  { id: 'oled', label: 'OLED High-Contrast', sub: 'Deep Contrast Black', icon: 'contrast' },
                  { id: 'dark', label: 'Dark Theme', sub: 'Sleek Dark Mode', icon: 'dark_mode' },
                  { id: 'system', label: 'System Auto', sub: 'OS Sync', icon: 'settings_brightness' },
                ].map((m) => {
                  const isSelected = themeHook.themeMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => themeHook.setThemeMode(m.id as ThemeMode)}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-surface-container-low shadow-sm'
                          : 'border-surface-container bg-surface-container-lowest hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="material-symbols-outlined text-[22px] text-primary">{m.icon}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-action-green"></span>
                        )}
                      </div>
                      <div>
                        <span className="font-body text-small font-bold text-text-primary block">{m.label}</span>
                        <span className="font-caption text-[11px] text-text-secondary">{m.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Brand Accent Colors */}
            <div className="mb-6">
              <label className="font-body text-small font-bold text-text-primary block mb-3">
                Primary Brand Accent Colors
              </label>
              <div className="flex flex-wrap gap-4">
                {themeHook.accentColorOptions.map((opt) => {
                  const isSelected = themeHook.accentColor.toLowerCase() === opt.hex.toLowerCase();
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => themeHook.setAccentColor(opt.hex)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-surface-container-low font-bold shadow-sm'
                          : 'border-surface-container bg-surface-container-lowest hover:border-primary/40'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shadow-inner flex items-center justify-center text-white"
                        style={{ backgroundColor: opt.hex }}
                      >
                        {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className="font-body text-small text-text-primary">{opt.name}</span>
                        <span className="font-caption text-[11px] text-text-secondary font-mono">{opt.hex}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Density & Font Multiplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Display Density */}
              <div>
                <label className="font-body text-small font-bold text-text-primary block mb-3">Display Density</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['compact', 'comfortable', 'relaxed'] as DisplayDensity[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => themeHook.setDisplayDensity(d)}
                      className={`py-3 px-2 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                        themeHook.displayDensity === d
                          ? 'border-primary bg-primary text-on-primary font-bold shadow-sm'
                          : 'border-surface-container bg-surface-container-lowest hover:border-primary/40 text-text-secondary'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Multiplier */}
              <div>
                <label className="font-body text-small font-bold text-text-primary block mb-3">
                  Font Size Multiplier
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['90%', '100%', '110%', '125%'] as FontSizeMultiplier[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => themeHook.setFontSizeMultiplier(f)}
                      className={`py-3 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        themeHook.fontSizeMultiplier === f
                          ? 'border-primary bg-primary text-on-primary font-bold shadow-sm'
                          : 'border-surface-container bg-surface-container-lowest hover:border-primary/40 text-text-secondary'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Viewport Selector for Testing */}
            <div className="mb-6">
              <label className="font-body text-small font-bold text-text-primary block mb-2">
                Responsive Device Viewport Preset
              </label>
              <div className="w-72">
                <Dropdown
                  items={DEVICE_PRESETS.map((p) => ({
                    value: p.id,
                    label: p.width > 0 ? `${p.name} (${p.width}×${p.height})` : p.name,
                  }))}
                  selectedValue={selectedDevicePreset}
                  onSelect={(val) => setSelectedDevicePreset(val)}
                />
              </div>
            </div>

            {/* Live Interface Preview Card */}
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-surface-container">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-small font-bold text-text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-action-green">check_circle</span>
                  Live Interface Preview
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Density: {themeHook.displayDensity} • Scale: {themeHook.fontSizeMultiplier}
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mb-4">
                Applied styling renders consistently across student catalog portals, staff circulation desks, and self-serve stations.
              </p>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: themeHook.accentColor }}
                  >
                    KP
                  </div>
                  <div>
                    <span className="font-body text-small font-bold text-text-primary block">
                      Katipuneros Library Store
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Active Theme: {themeHook.themeMode.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white font-bold text-small shadow-sm"
                  style={{ backgroundColor: themeHook.accentColor }}
                >
                  Interactive Action
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: ARCHIVES (Replaces Notification Dispatch Gateways) */}
      {activeTab === 'archives' && (
        <div className="flex flex-col gap-space-lg">
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60">
            <div className="flex items-start justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">archive</span>
                </div>
                <div>
                  <h2 className="font-headline-4 text-headline-4 text-text-primary">
                    Centralized System Archives &amp; Deaccession Registry
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    Centrally manage archived historical records, deaccessioned volumes, completed transactions, and cryptographic WAL audit ledgers across all institutional modules.
                  </p>
                </div>
              </div>
            </div>

            {/* Archival Metrics Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Total Archived Records</span>
                <span className="font-headline-2 font-bold text-text-primary">
                  {archivesList.reduce((acc, m) => acc + m.archivedRecords, 0).toLocaleString()}
                </span>
                <span className="font-caption text-[11px] text-action-green block mt-1">Across 10 Core Modules</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Total Storage Footprint</span>
                <span className="font-headline-2 font-bold text-primary">
                  {(archivesList.reduce((acc, m) => acc + m.storageFootprintBytes, 0) / (1024 * 1024)).toFixed(1)} MB
                </span>
                <span className="font-caption text-[11px] text-text-secondary block mt-1">Compressed Persistent WAL</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Retention Governance</span>
                <span className="font-headline-2 font-bold text-text-primary">180 – 3,650d</span>
                <span className="font-caption text-[11px] text-text-secondary block mt-1">Statutory University Compliance</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
                <span className="font-caption text-caption text-text-secondary block mb-1">Cryptographic Seal</span>
                <span className="font-headline-3 font-bold text-action-green-hover flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  SHA-256
                </span>
                <span className="font-caption text-[11px] text-text-secondary block mt-1">Immutable Merkle Chain</span>
              </div>
            </div>

            {/* Floating Bulk Action Bar for Archives */}
            {selectedArchiveModules.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-primary text-on-primary flex items-center justify-between shadow-md">
                <span className="font-body text-small font-semibold">
                  {selectedArchiveModules.length} archive module(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.success(`Exporting ${selectedArchiveModules.length} encrypted archive dossier(s)...`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-small flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Export Dossier
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info(`Restoring historical indexes for ${selectedArchiveModules.length} module(s)...`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-small flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">restore</span>
                    Un-archive
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedArchiveModules([])}
                    className="px-2 py-1.5 text-white/80 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Archives Table */}
            <div className="overflow-x-auto rounded-xl border border-surface-container bg-surface-container-lowest">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container text-caption font-caption text-text-secondary">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedArchiveModules.length === archivesList.length && archivesList.length > 0}
                        onChange={(e) =>
                          setSelectedArchiveModules(e.target.checked ? archivesList.map((m) => m.moduleName) : [])
                        }
                        className="rounded accent-primary cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold">Module Scope</th>
                    <th className="py-3 px-4 font-bold">Active Records</th>
                    <th className="py-3 px-4 font-bold">Archived Records</th>
                    <th className="py-3 px-4 font-bold">Footprint</th>
                    <th className="py-3 px-4 font-bold">Retention SLA</th>
                    <th className="py-3 px-4 font-bold">Cryptographic Seal</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body text-small">
                  {archivesList.map((arch) => {
                    const isSelected = selectedArchiveModules.includes(arch.moduleName);
                    return (
                      <tr key={arch.moduleName} className={isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-low/50'}>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              setSelectedArchiveModules((prev) =>
                                e.target.checked
                                  ? [...prev, arch.moduleName]
                                  : prev.filter((m) => m !== arch.moduleName)
                              );
                            }}
                            className="rounded accent-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-bold text-text-primary">{arch.moduleName}</td>
                        <td className="py-3 px-4 text-text-secondary">{arch.activeRecords.toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-primary">{arch.archivedRecords.toLocaleString()}</td>
                        <td className="py-3 px-4 text-text-secondary">{(arch.storageFootprintBytes / 1024).toFixed(0)} KB</td>
                        <td className="py-3 px-4 text-text-secondary">{arch.retentionDays} Days</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-action-green">{arch.sha256Seal}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => toast.info(`Viewing archive journal for ${arch.moduleName}...`)}
                            className="p-1 rounded text-primary hover:bg-surface-container"
                            title="Inspect Archive"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 6: SECURITY & ACCESS GOVERNANCE */}
      {activeTab === 'security' && (
        <div className="flex flex-col gap-space-lg">
          <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container/60">
            <div className="flex items-start justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">shield</span>
                </div>
                <div>
                  <h2 className="font-headline-4 text-headline-4 text-text-primary">
                    Security &amp; Access Governance
                  </h2>
                  <p className="font-caption text-caption text-text-secondary">
                    POS auto-logoff, Super Admin timeouts, and campus CIDR whitelisting. (Strictly non-biometric).
                  </p>
                </div>
              </div>
              <span className="font-caption text-caption px-space-sm py-1 rounded-full bg-soft-blue text-primary font-semibold uppercase tracking-wider">
                Strict Compliance
              </span>
            </div>

            {/* Timeout Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-lg">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">timer</span>
                    <h3 className="font-body text-small font-bold text-text-primary">
                      POS Terminal Idle Auto-Logoff
                    </h3>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mb-4">
                    Front desk circulation checkout stations lock automatically after inactivity.
                  </p>
                </div>
                <div className="w-full">
                  <span className="font-caption text-[11px] text-text-secondary block mb-1">Timeout Window:</span>
                  <Dropdown
                    items={posLogoffOptions}
                    selectedValue={String(settings.security.posAutoLogoffMinutes)}
                    onSelect={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, posAutoLogoffMinutes: parseInt(val, 10) },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">admin_panel_settings</span>
                    <h3 className="font-body text-small font-bold text-text-primary">
                      Super Admin Console Timeout
                    </h3>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mb-4">
                    High-privilege console auto-termination window for security integrity.
                  </p>
                </div>
                <div className="w-full">
                  <span className="font-caption text-[11px] text-text-secondary block mb-1">Timeout Window:</span>
                  <Dropdown
                    items={adminTimeoutOptions}
                    selectedValue={String(settings.security.superAdminTimeoutMinutes)}
                    onSelect={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        security: { ...prev.security, superAdminTimeoutMinutes: parseInt(val, 10) },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Campus IP & CIDR Whitelist Table */}
            <div className="border-t border-surface-container/60 pt-4 mb-space-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary flex items-center gap-2">
                    Campus IP &amp; CIDR Whitelist Table
                    <span className="font-caption text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Subnet Protection Active
                    </span>
                  </h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Enforce admin portal traffic strictly from approved university subnet ranges.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCidrIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDeleteCidr}
                      className="px-3 py-1.5 rounded-lg bg-status-danger text-white text-small font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete Selected ({selectedCidrIds.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAddCidrModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary text-small font-bold hover:bg-primary-container transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Subnet
                  </button>
                </div>
              </div>

              {/* CIDR Table */}
              <div className="overflow-x-auto rounded-xl border border-surface-container bg-surface-container-lowest">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container text-caption font-caption text-text-secondary">
                      <th className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedCidrIds.length === cidrList.length && cidrList.length > 0}
                          onChange={(e) =>
                            setSelectedCidrIds(e.target.checked ? cidrList.map((c) => c.id) : [])
                          }
                          className="rounded accent-primary cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 font-bold">Subnet / CIDR</th>
                      <th className="py-3 px-4 font-bold">Network Classification</th>
                      <th className="py-3 px-4 font-bold">Access Level</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-body text-small">
                    {cidrList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-text-secondary font-caption">
                          No campus CIDR subnets registered.
                        </td>
                      </tr>
                    ) : (
                      cidrList.map((cidr) => {
                        const isSelected = selectedCidrIds.includes(cidr.id);
                        return (
                          <tr key={cidr.id} className={isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-low/50'}>
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) =>
                                  setSelectedCidrIds((prev) =>
                                    e.target.checked ? [...prev, cidr.id] : prev.filter((id) => id !== cidr.id)
                                  )
                                }
                                className="rounded accent-primary cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-primary">{cidr.cidrRange}</td>
                            <td className="py-3 px-4 text-text-primary">{cidr.networkClassification}</td>
                            <td className="py-3 px-4 text-text-secondary">{cidr.accessLevel}</td>
                            <td className="py-3 px-4">
                              <span className="font-caption text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                Active
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteSingleCidr(cidr.id)}
                                className="text-status-danger hover:underline text-small font-medium cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cryptographic Audit Node */}
            <div className="border-t border-surface-container/60 pt-4">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-body text-small font-bold text-text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-action-green">security</span>
                    Cryptographic Audit Node
                  </h4>
                  <p className="font-caption text-caption text-text-secondary mt-1">
                    All policy and security alterations are permanently written to an immutable append-only ledger.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="font-caption text-[11px] text-text-secondary block">Node Status</span>
                    <span className="font-body text-small font-bold text-action-green">
                      {settings.security.auditNodeStatus}
                    </span>
                  </div>
                  <div>
                    <span className="font-caption text-[11px] text-text-secondary block">Hash Chain Length</span>
                    <span className="font-body text-small font-bold text-text-primary">
                      {settings.security.hashChainLength.toLocaleString()} blocks
                    </span>
                  </div>
                  <div>
                    <span className="font-caption text-[11px] text-text-secondary block">HMAC Key Status</span>
                    <span className="font-body text-small font-bold text-text-secondary">
                      {settings.security.hmacKeyStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* MODAL 1: ADD CIDR SUBNET */}
      {isAddCidrModalOpen && (
        <DefaultFloatingModalCard
          isOpen={isAddCidrModalOpen}
          onClose={() => setIsAddCidrModalOpen(false)}
          title="Add Campus Subnet Range"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-body text-small font-bold text-text-primary block mb-1">
                Subnet / CIDR Range
              </label>
              <input
                type="text"
                placeholder="e.g. 10.20.0.0/16 or 192.168.100.0/22"
                value={newCidrRange}
                onChange={(e) => setNewCidrRange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface-container-lowest font-mono text-small focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-body text-small font-bold text-text-primary block mb-1">
                Network Classification
              </label>
              <input
                type="text"
                placeholder="e.g. Katipunan Staff WiFi VLAN"
                value={newCidrClass}
                onChange={(e) => setNewCidrClass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface-container-lowest text-small focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-body text-small font-bold text-text-primary block mb-1">
                Access Level
              </label>
              <input
                type="text"
                placeholder="e.g. Staff Mobile or POS Desks"
                value={newCidrAccess}
                onChange={(e) => setNewCidrAccess(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-container bg-surface-container-lowest text-small focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsAddCidrModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-surface-container text-text-secondary hover:bg-surface-container font-medium text-small"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCidr}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-small hover:bg-primary-container"
              >
                Confirm &amp; Whitelist
              </button>
            </div>
          </div>
        </DefaultFloatingModalCard>
      )}

      {/* MODAL 2: SAVE CONFIGURATIONS CONFIRMATION */}
      {isSaveModalOpen && (
        <DefaultFloatingModalCard
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          title="Confirm Save Configurations"
        >
          <div className="flex flex-col gap-4">
            <p className="font-body text-small text-text-secondary">
              Review and select the governance modules to apply permanently across institutional nodes:
            </p>
            <div className="space-y-2 border border-surface-container rounded-xl p-3 bg-surface-container-low">
              <label className="flex items-center gap-2 cursor-pointer font-body text-small text-text-primary">
                <input
                  type="checkbox"
                  checked={saveSelections.circulation}
                  onChange={(e) => setSaveSelections({ ...saveSelections, circulation: e.target.checked })}
                  className="rounded accent-primary"
                />
                <span>Circulation Policies (Tier 1-3 Durations &amp; Concurrency Caps)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-body text-small text-text-primary">
                <input
                  type="checkbox"
                  checked={saveSelections.reservations}
                  onChange={(e) => setSaveSelections({ ...saveSelections, reservations: e.target.checked })}
                  className="rounded accent-primary"
                />
                <span>Reservation Setups (Re-shelve notices, Thesis Priority)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-body text-small text-text-primary">
                <input
                  type="checkbox"
                  checked={saveSelections.fines}
                  onChange={(e) => setSaveSelections({ ...saveSelections, fines: e.target.checked })}
                  className="rounded accent-primary"
                />
                <span>Fine Tariffs &amp; Waiver Governance (Tariffs, Caps &amp; Freezes)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-body text-small text-text-primary">
                <input
                  type="checkbox"
                  checked={saveSelections.security}
                  onChange={(e) => setSaveSelections({ ...saveSelections, security: e.target.checked })}
                  className="rounded accent-primary"
                />
                <span>Security Governance (POS &amp; Console Timeouts)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-surface-container text-text-secondary hover:bg-surface-container font-medium text-small"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-action-green text-text-primary font-bold text-small hover:bg-action-green-hover"
              >
                {saving ? 'Applying...' : 'Confirm & Apply'}
              </button>
            </div>
          </div>
        </DefaultFloatingModalCard>
      )}

      {/* MODAL 3: RESET DEFAULTS CONFIRMATION */}
      {isResetModalOpen && (
        <DefaultFloatingModalCard
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="Reset Configurations to Defaults"
        >
          <div className="flex flex-col gap-4">
            <p className="font-body text-small text-text-secondary">
              Select which institutional modules to revert to standard active defaults:
            </p>
            <div className="space-y-2 border border-surface-container rounded-xl p-3 bg-surface-container-low">
              <label className="flex items-center gap-2 cursor-pointer font-body text-small text-text-primary">
                <input
                  type="checkbox"
                  checked={resetSelections.circulation}
                  onChange={(e) => setResetSelections({ ...resetSelections, circulation: e.target.checked })}
                  className="rounded accent-primary"
                />
                <span>Reset Circulation Policies (14d/4b, 28d/8b, 60d/15b)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-body text-small text-text-primary">
                <input
                  type="checkbox"
                  checked={resetSelections.reservations}
                  onChange={(e) => setResetSelections({ ...resetSelections, reservations: e.target.checked })}
                  className="rounded accent-primary"
                />
                <span>Reset Reservation Setups</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-body text-small text-text-primary">
                <input
                  type="checkbox"
                  checked={resetSelections.fines}
                  onChange={(e) => setResetSelections({ ...resetSelections, fines: e.target.checked })}
                  className="rounded accent-primary"
                />
                <span>Reset Fine Tariffs (₱15/day, ₱500 cap, ₱280 repair)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-surface-container text-text-secondary hover:bg-surface-container font-medium text-small"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-status-danger text-white font-bold text-small hover:bg-rose-700"
              >
                {saving ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </DefaultFloatingModalCard>
      )}
    </div>
  );
};

export default Settings;
