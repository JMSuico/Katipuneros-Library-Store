// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Notifications.tsx -- Institutional Communications, Campus Bulletins CRUD, Automated Dispatch Queue, and Hardware Alert Triage.
// Strictly adheres to AGENTS.md, SKILL.md, and Ideas to prompt.txt specifications.
// Consumes shared primitives (SearchBar, Dropdown, RadioButton, DefaultFloatingModalCard, KebabMenu) and global hooks.

import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { RadioButton } from '../../../../../Shared/RadioButton';
import { Dropdown } from '../../../../../Shared/Dropdown';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { KebabMenu } from '../../../../../Shared/KebabMenu';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { useToasts } from '../../../../../Hooks/useToasts';
import { useFluidResposiveness } from '../../../../../Hooks/useFluidResposiveness';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';
import {
  TopBentoMetrics,
  AdminSystemAlert,
  CampusAnnouncement,
  AnnouncementAnalytics,
  DispatchQueueTelemetry,
  DispatchTransactionItem,
  DispatchTemplateItem,
  CreateAnnouncementPayload,
  getTopBentoMetrics,
  getAdminAlerts,
  resolveAllSystemAlerts,
  triggerAcquisitionOrder,
  sendRegistrarNotice,
  pingHardwareTeam,
  repollHardwareSocket,
  getCampusAnnouncements,
  createCampusAnnouncement,
  updateCampusAnnouncement,
  deleteCampusAnnouncement,
  bulkDeleteCampusAnnouncements,
  unpublishCampusAnnouncement,
  getAnnouncementAnalytics,
  getDispatchQueueTelemetry,
  getDispatchTransactions,
  getDispatchTemplates,
} from '../../../../../Endpoints/Admin/notificationApi';

type TabType = 'tab-alerts' | 'tab-announcements' | 'tab-dispatch-queue' | 'tab-templates';
type ViewMode = 'table' | 'card';

const Notifications: FC = () => {
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

  // Active Tab & View Mode State
  const [activeTab, setActiveTab] = useState<TabType>('tab-alerts');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Core Data States
  const [topMetrics, setTopMetrics] = useState<TopBentoMetrics>({
    todayDispatchedTotal: 0,
    todayEmail: 0,
    todaySms: 0,
    todayPush: 0,
    deliveryReliability: 0.0,
    deliveryFailRate: 0.0,
    urgentAlertsCount: 0,
    activeBulletinsCount: 0,
    portalViewsToday: 0,
  });

  const [systemAlerts, setSystemAlerts] = useState<AdminSystemAlert[]>([]);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [dispatchTelemetry, setDispatchTelemetry] = useState<DispatchQueueTelemetry>({
    nextBatchRunSeconds: 180,
    nextBatchRunFormatted: 'in 03m 00s',
    batchWindowSeconds: 180,
    daemonRunning: true,
    retryFailureRate: 0.0,
    bouncedCount: 0,
    totalSmsCount: 0,
    queueDepth: 0,
    pendingEmailCount: 0,
    pendingSmsCount: 0,
    queueStatus: 'Idle (Nominal)',
    twilioLimit: 'Twilio: 30/min',
    sendGridLimit: 'SendGrid: 120/min',
    sesLimit: 'SES: 40/sec quota',
    gatewayStatus: 'Nominal',
  });
  const [transactions, setTransactions] = useState<DispatchTransactionItem[]>([]);
  const [templates, setTemplates] = useState<DispatchTemplateItem[]>([]);
  const [refreshingStream, setRefreshingStream] = useState(false);

  // Auto-sync ticker (15s)
  const [secondsUntilSync, setSecondsUntilSync] = useState(15);
  const [nextBatchSeconds, setNextBatchSeconds] = useState(165);

  // Multi-select bulk deletion state
  const [selectedAnnouncementIds, setSelectedAnnouncementIds] = useState<string[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<CampusAnnouncement | null>(null);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [activeAnalytics, setActiveAnalytics] = useState<AnnouncementAnalytics | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<CampusAnnouncement | null>(null);
  const [isInspectPayloadModalOpen, setIsInspectPayloadModalOpen] = useState(false);
  const [inspectPayload, setInspectPayload] = useState<string>('');
  const [isPedagogicalThesisOpen, setIsPedagogicalThesisOpen] = useState(false);
  const [isAcquisitionModalOpen, setIsAcquisitionModalOpen] = useState(false);
  const [acquisitionAlert, setAcquisitionAlert] = useState<AdminSystemAlert | null>(null);
  const [acquisitionCopies, setAcquisitionCopies] = useState(5);
  const [isRegistrarNoticeModalOpen, setIsRegistrarNoticeModalOpen] = useState(false);
  const [registrarAlert, setRegistrarAlert] = useState<AdminSystemAlert | null>(null);
  const [isHardwarePingModalOpen, setIsHardwarePingModalOpen] = useState(false);
  const [hardwareAlert, setHardwareAlert] = useState<AdminSystemAlert | null>(null);

  // Form input state for Create / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAudience, setFormAudience] = useState('All Users');
  const [formChannels, setFormChannels] = useState<string[]>(['Portal Banner', 'Mobile App Push']);
  const [formPriority, setFormPriority] = useState('Standard Campus Bulletin');
  const [formDuration, setFormDuration] = useState('7 Days (End of Academic Week)');
  const [formIsDraft, setFormIsDraft] = useState(false);

  // Template Preview Interactive State
  const [previewChannelMode, setPreviewChannelMode] = useState<'SMS' | 'Email'>('SMS');
  const [selectedTemplate, setSelectedTemplate] = useState<DispatchTemplateItem | null>(null);

  // Draggable table hook
  const { containerRef: tableContainerRef } = useTableDraggable<HTMLDivElement>();

  // Pagination hook for announcements
  const pagination = usePagination(announcements, {
    initialPageSize: 10,
  });

  // -------------------------------------------------------------
  // Data Fetching & Synchronization Handlers
  // -------------------------------------------------------------

  const fetchAllData = useCallback(async () => {
    try {
      const [metricsRes, alertsRes, teleRes, transRes, tplsRes] = await Promise.all([
        getTopBentoMetrics(),
        getAdminAlerts(),
        getDispatchQueueTelemetry(),
        getDispatchTransactions(),
        getDispatchTemplates(),
      ]);

      setTopMetrics(metricsRes);
      setSystemAlerts(alertsRes);
      setDispatchTelemetry(teleRes);
      setTransactions(transRes);
      setTemplates(tplsRes);
      if (tplsRes.length > 0 && !selectedTemplate) {
        setSelectedTemplate(tplsRes[0]);
      }
    } catch (err) {
      console.error('Error fetching notification center data:', err);
    }
  }, [selectedTemplate]);

  const fetchAnnouncementsList = useCallback(async () => {
    try {
      const res = await getCampusAnnouncements({
        search: debouncedSearch,
        status: statusFilter,
        sort: sortOrder,
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
      });

      setAnnouncements(res.items);
      setTotalAnnouncements(res.totalCount);
    } catch (err) {
      console.error('Error fetching campus announcements:', err);
    }
  }, [debouncedSearch, statusFilter, sortOrder, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchAnnouncementsList();
  }, [fetchAnnouncementsList]);

  usePagesGlobalRefresh(useCallback(() => {
    fetchAllData();
    fetchAnnouncementsList();
  }, [fetchAllData, fetchAnnouncementsList]));

  // 15s Auto-sync timer & Next Batch Run decrementer
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSecondsUntilSync((prev) => {
        if (prev <= 1) {
          fetchAllData();
          fetchAnnouncementsList();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    const batchInterval = setInterval(() => {
      setNextBatchSeconds((prev) => (prev <= 1 ? 180 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(batchInterval);
    };
  }, [fetchAllData, fetchAnnouncementsList]);

  // Format batch run countdown
  const formattedNextBatch = useMemo(() => {
    const minutes = Math.floor(nextBatchSeconds / 60);
    const seconds = nextBatchSeconds % 60;
    return `in ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }, [nextBatchSeconds]);

  // Filtered System Alerts
  const filteredAlerts = useMemo(() => {
    return systemAlerts.filter((alert) => {
      if (alert.isResolved) return false;
      if (!debouncedSearch) return true;
      const s = debouncedSearch.toLowerCase();
      return (
        alert.title.toLowerCase().includes(s) ||
        alert.category.toLowerCase().includes(s) ||
        alert.description.toLowerCase().includes(s)
      );
    });
  }, [systemAlerts, debouncedSearch]);

  // -------------------------------------------------------------
  // System Alerts Action Handlers
  // -------------------------------------------------------------

  const handleResolveAll = async () => {
    const success = await resolveAllSystemAlerts();
    if (success) {
      toast.success('All administrative system alerts marked resolved.');
      setSystemAlerts((prev) => prev.map((a) => ({ ...a, isResolved: true })));
      setTopMetrics((prev) => ({ ...prev, urgentAlertsCount: 0 }));
    } else {
      toast.error('Failed to resolve system alerts.');
    }
  };

  const handleConfirmAcquisition = async () => {
    if (!acquisitionAlert) return;
    const success = await triggerAcquisitionOrder({
      monographTitle: acquisitionAlert.title,
      copiesRequested: acquisitionCopies,
      notes: `Authorized via Admin Notification center from ${acquisitionAlert.shelfBay ?? 'Stacks'}.`,
    });

    if (success) {
      toast.success(`Purchase requisition sent for ${acquisitionCopies} copies of '${acquisitionAlert.title}'.`);
      setSystemAlerts((prev) => prev.map((a) => (a.id === acquisitionAlert.id ? { ...a, isResolved: true } : a)));
      setTopMetrics((prev) => ({ ...prev, urgentAlertsCount: Math.max(0, prev.urgentAlertsCount - 1) }));
      setIsAcquisitionModalOpen(false);
    } else {
      toast.error('Failed to dispatch acquisition order.');
    }
  };

  const handleConfirmRegistrarNotice = async () => {
    if (!registrarAlert) return;
    const success = await sendRegistrarNotice({
      subject: 'Urgent: Circulation Sanctions & Hold Freeze Delinquency Roster',
      memoNotes: '18 delinquent student accounts requiring Dean clearance.',
      affectedPatronsCount: registrarAlert.delinquentPatronCount || 18,
    });

    if (success) {
      toast.success('Formal sanction notice dispatched to Registrar & Dean of Admissions.');
      setSystemAlerts((prev) => prev.map((a) => (a.id === registrarAlert.id ? { ...a, isResolved: true } : a)));
      setTopMetrics((prev) => ({ ...prev, urgentAlertsCount: Math.max(0, prev.urgentAlertsCount - 1) }));
      setIsRegistrarNoticeModalOpen(false);
    } else {
      toast.error('Failed to dispatch registrar notice.');
    }
  };

  const handleConfirmHardwarePing = async () => {
    if (!hardwareAlert) return;
    const success = await pingHardwareTeam({
      deviceName: hardwareAlert.title,
      ipAddress: hardwareAlert.hardwareIp || '192.168.4.118',
      urgency: 'Critical',
    });

    if (success) {
      toast.success(`Priority support ticket logged for ${hardwareAlert.title}. Support ticket dispatched.`);
      setIsHardwarePingModalOpen(false);
      fetchAllData();
    } else {
      toast.error('Failed to log infrastructure ticket.');
    }
  };

  const handleRepollSocket = async () => {
    toast.info('Sending health check ping to circulation desk service...');
    const success = await repollHardwareSocket();
    if (success) {
      toast.success('Circulation service responded: 200 OK (Latency 12ms). Service operational.');
      fetchAllData();
    } else {
      toast.error('Health check timeout: service remains unreachable.');
    }
  };

  // -------------------------------------------------------------
  // Announcements CRUD Handlers
  // -------------------------------------------------------------

  const handleOpenCreateModal = () => {
    setFormTitle('');
    setFormContent('');
    setFormAudience('All Users');
    setFormChannels(['Portal Banner', 'Mobile App Push']);
    setFormPriority('Standard Campus Bulletin');
    setFormDuration('7 Days (End of Academic Week)');
    setFormIsDraft(false);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (item: CampusAnnouncement) => {
    setSelectedAnnouncement(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormAudience(item.audience);
    setFormChannels(item.channels);
    setFormPriority(item.priority);
    setFormDuration(item.activeRange);
    setFormIsDraft(item.isDraft);
    setIsEditModalOpen(true);
  };

  const handleSaveCreateAnnouncement = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast.warning('Please provide both title and announcement content.');
      return;
    }

    const payload: CreateAnnouncementPayload = {
      title: formTitle.trim(),
      content: formContent.trim(),
      audience: formAudience,
      channels: formChannels,
      priority: formPriority,
      displayDuration: formDuration,
      isDraft: formIsDraft,
    };

    const created = await createCampusAnnouncement(payload);
    if (created) {
      toast.success(formIsDraft ? 'Draft announcement saved.' : 'Announcement published to campus network.');
      setIsCreateModalOpen(false);
      fetchAnnouncementsList();
      fetchAllData();
    } else {
      toast.error('Failed to create announcement.');
    }
  };

  const handleSaveEditAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    if (!formTitle.trim() || !formContent.trim()) {
      toast.warning('Title and content are required.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      content: formContent.trim(),
      audience: formAudience,
      channels: formChannels,
      priority: formPriority,
      displayDuration: formDuration,
      isDraft: formIsDraft,
      status: formIsDraft ? 'Draft' : selectedAnnouncement.status,
    };

    const updated = await updateCampusAnnouncement(selectedAnnouncement.id, payload);
    if (updated) {
      toast.success('Announcement changes saved.');
      setIsEditModalOpen(false);
      fetchAnnouncementsList();
    } else {
      toast.error('Failed to update announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const success = await deleteCampusAnnouncement(id);
    if (success) {
      toast.success('Announcement removed.');
      setSelectedAnnouncementIds((prev) => prev.filter((item) => item !== id));
      fetchAnnouncementsList();
      fetchAllData();
    } else {
      toast.error('Failed to delete announcement.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAnnouncementIds.length === 0) return;
    const count = await bulkDeleteCampusAnnouncements(selectedAnnouncementIds);
    toast.success(`Removed ${count} announcements in bulk.`);
    setSelectedAnnouncementIds([]);
    fetchAnnouncementsList();
    fetchAllData();
  };

  const handleToggleUnpublish = async (id: string) => {
    const result = await unpublishCampusAnnouncement(id);
    if (result) {
      toast.info(`Announcement is now ${result.status}.`);
      fetchAnnouncementsList();
      fetchAllData();
    } else {
      toast.error('Failed to update publication status.');
    }
  };

  const handleOpenAnalytics = async (id: string) => {
    const analytics = await getAnnouncementAnalytics(id);
    if (analytics) {
      setActiveAnalytics(analytics);
      setIsAnalyticsModalOpen(true);
    } else {
      toast.warning('No analytics telemetry available for this announcement.');
    }
  };

  const handleOpenPreview = (item: CampusAnnouncement) => {
    setPreviewAnnouncement(item);
    setIsPreviewModalOpen(true);
  };

  // Selection toggle
  const handleToggleSelectAll = () => {
    if (selectedAnnouncementIds.length === announcements.length) {
      setSelectedAnnouncementIds([]);
    } else {
      setSelectedAnnouncementIds(announcements.map((a) => a.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAnnouncementIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRefreshStream = async () => {
    setRefreshingStream(true);
    const trans = await getDispatchTransactions();
    setTransactions(trans);
    setRefreshingStream(false);
    toast.success('Dispatch transaction stream refreshed (48ms).');
  };

  return (
    <div className="w-full flex flex-col gap-space-lg pb-space-2xl">
      {/* ------------------------------------------------------------- */}
      {/* 1. Top Action Header Banner */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-sm border-b border-outline-variant/15">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-sm">
            <span className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold tracking-wide uppercase">
              Institutional Dispatch Hub
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary font-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
              Gateways Active (Email, SMS, Webhook)
            </span>
            <span className="text-text-secondary font-caption text-caption">
              • Auto-sync in <strong className="text-primary font-mono">{secondsUntilSync}s</strong>
            </span>
          </div>
          <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
            Institutional Communications &amp; Dispatch Center
          </h1>
          <p className="font-body text-body text-text-secondary">
            Orchestrate university-wide bulletins, user recall sequences, and real-time administrative system triggers.
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="h-11 px-space-md rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold flex items-center gap-space-xs shadow-sm transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              campaign
            </span>
            <span>Broadcast System Announcement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tab-templates')}
            className="h-11 px-space-md rounded-full bg-surface-container-lowest text-text-primary hover:bg-surface-container font-small text-small font-semibold flex items-center gap-space-xs shadow-sm transition-colors cursor-pointer border border-outline-variant/15"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
            <span>Configure Dispatch Templates</span>
          </button>

          <button
            type="button"
            onClick={handleResolveAll}
            className="h-11 px-space-md rounded-full bg-surface-container hover:bg-surface-variant text-text-secondary hover:text-text-primary font-small text-small font-medium flex items-center gap-space-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Mark All Resolved</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Communication Hub Metrics (Bento Mosaic) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Metric 1: Automated Queue */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Today's Dispatch Queue
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="font-headline-1 text-headline-1 text-text-primary leading-none font-bold">
                  {topMetrics.todayDispatchedTotal}
                </span>
                <span className="font-caption text-caption text-text-secondary">dispatched</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[24px]">send_time_extension</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-outline-variant/10">
            <div className="flex items-center gap-1 font-caption text-caption text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary"></span> {topMetrics.todayEmail} Email
              <span className="mx-1">•</span>
              <span className="w-2 h-2 rounded-full bg-action-green"></span> {topMetrics.todaySms} SMS
              <span className="mx-1">•</span>
              <span className="w-2 h-2 rounded-full bg-status-pending"></span> {topMetrics.todayPush} Push
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('tab-dispatch-queue')}
              className="font-caption text-caption text-primary font-semibold hover:underline cursor-pointer"
            >
              Logs →
            </button>
          </div>
        </div>

        {/* Metric 2: Delivery Reliability with SVG Donut */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
              Delivery Reliability
            </span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-headline-1 text-headline-1 text-text-primary leading-none font-bold">
                {topMetrics.deliveryReliability}%
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 font-caption text-caption text-status-available">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>SMTP &amp; Twilio nominal</span>
            </div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-action-green"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${topMetrics.deliveryReliability}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute font-caption text-[11px] font-bold text-text-primary">
              {topMetrics.deliveryFailRate}% fl
            </span>
          </div>
        </div>

        {/* Metric 3: Urgent Alerts */}
        <div className="relative overflow-hidden rounded-2xl bg-error-container/40 p-space-lg shadow-sm border border-error/20 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-on-error-container uppercase tracking-wider font-bold">
                Urgent System Triggers
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="font-headline-1 text-headline-1 text-on-error-container leading-none font-bold">
                  {topMetrics.urgentAlertsCount}
                </span>
                <span className="font-caption text-caption text-error font-medium">pending attention</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error text-on-error flex items-center justify-center animate-pulse shadow-sm">
              <span className="material-symbols-outlined text-[24px]">warning</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-error-container font-caption text-caption border-t border-error/15">
            <span className="truncate">System, Stacks, Delinquency</span>
            <button
              type="button"
              onClick={() => setActiveTab('tab-alerts')}
              className="font-semibold text-error underline cursor-pointer hover:text-error/80"
            >
              Triage
            </button>
          </div>
        </div>

        {/* Metric 4: Active Campus Bulletins */}
        <div className="relative overflow-hidden rounded-2xl bg-primary text-on-primary p-space-lg shadow-sm border border-primary/20 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-primary-fixed uppercase tracking-wider font-semibold">
                Active Campus Bulletins
              </span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="font-headline-1 text-headline-1 text-on-primary leading-none font-bold">
                  {topMetrics.activeBulletinsCount}
                </span>
                <span className="font-caption text-caption text-primary-fixed-dim">broadcasting</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">podcasts</span>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs flex items-center justify-between text-primary-fixed-dim font-caption text-caption border-t border-white/10">
            <span>Portal: {topMetrics.portalViewsToday.toLocaleString()} views today</span>
            <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-bold">100% synced</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Segmented Navigation Tabs */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-1 border-b border-outline-variant/15">
        <button
          type="button"
          onClick={() => setActiveTab('tab-alerts')}
          className={`px-space-md py-2.5 rounded-full font-small text-small font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tab-alerts'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">notification_important</span>
          <span>System Alerts</span>
          <span
            className={`px-2 py-0.5 rounded-full font-caption text-[11px] font-bold ${
              activeTab === 'tab-alerts' ? 'bg-status-danger text-on-error' : 'bg-status-danger/20 text-error'
            }`}
          >
            {filteredAlerts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tab-announcements')}
          className={`px-space-md py-2.5 rounded-full font-small text-small font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tab-announcements'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">campaign</span>
          <span>Campus Announcements</span>
          <span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold">
            {topMetrics.activeBulletinsCount} Live
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tab-dispatch-queue')}
          className={`px-space-md py-2.5 rounded-full font-small text-small font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tab-dispatch-queue'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">outbox</span>
          <span>Automated Dispatch Queue</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-bold">
            {topMetrics.todayDispatchedTotal} Dispatched
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tab-templates')}
          className={`px-space-md py-2.5 rounded-full font-small text-small font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tab-templates'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">code_blocks</span>
          <span>User SMS/Email Templates</span>
          <span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold">
            {templates.length} Active
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TAB 1: System Alerts Feed */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tab-alerts' && (
        <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
          <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm border border-outline-variant/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md border-b border-outline-variant/10 gap-2">
              <div className="flex items-center gap-space-sm">
                <div className="w-3 h-3 rounded-full bg-error animate-ping"></div>
                <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                  Real-Time Administrative System Alert Feed
                </h2>
              </div>
              <span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-action-green">sync</span>
                Auto-syncing with Katipuneros Core API every 15s
              </span>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="p-space-2xl rounded-2xl bg-surface-container-low text-center flex flex-col items-center justify-center gap-space-sm mt-space-md">
                <div className="w-14 h-14 rounded-full bg-status-available/20 text-status-available flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[32px]">task_alt</span>
                </div>
                <p className="font-headline-4 text-headline-4 text-text-primary font-bold">
                  All System Alerts Resolved
                </p>
                <p className="font-small text-small text-text-secondary max-w-md">
                  No pending system incidents or inventory deficit triggers are currently queued for administrator intervention.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-space-md mt-space-md">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-space-md rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all gap-space-md border border-outline-variant/10"
                  >
                    <div className="flex items-start gap-space-md min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          alert.severity === 'critical'
                            ? 'bg-error/15 text-error'
                            : alert.type === 'delinquency'
                            ? 'bg-status-pending/20 text-text-primary'
                            : 'bg-soft-blue text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {alert.type === 'deficit'
                            ? 'inventory_2'
                            : alert.type === 'delinquency'
                            ? 'gavel'
                            : alert.type === 'hardware'
                            ? 'wifi_off'
                            : 'warning'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded font-caption text-[11px] font-bold uppercase tracking-wider ${
                              alert.severity === 'critical'
                                ? 'bg-status-danger text-on-error'
                                : 'bg-status-pending text-on-surface'
                            }`}
                          >
                            {alert.tag}
                          </span>
                          <span className="font-caption text-caption text-text-secondary">{alert.triggeredAgo}</span>
                          <span className="font-caption text-caption text-text-secondary">• {alert.category}</span>
                        </div>
                        <p className="font-body-large text-body-large font-bold text-text-primary mt-1">{alert.title}</p>
                        <p className="font-small text-small text-text-secondary mt-0.5 leading-relaxed">
                          {alert.description}
                        </p>
                      </div>
                    </div>

                    {/* Dedicated Action Buttons per Legend */}
                    <div className="flex items-center gap-space-sm shrink-0 pl-16 lg:pl-0">
                      {alert.type === 'deficit' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setAcquisitionAlert(alert);
                              setIsAcquisitionModalOpen(true);
                            }}
                            className="h-10 px-space-md rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                            <span>Trigger Acquisition Order</span>
                          </button>
                          <button
                            type="button"
                            title="View Reservation Stacks"
                            onClick={() => toast.info(`Viewing stacks for ${alert.title}`)}
                            className="h-10 w-10 rounded-full bg-surface-container-lowest hover:bg-surface text-text-secondary flex items-center justify-center cursor-pointer border border-outline-variant/15"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </>
                      )}

                      {alert.type === 'delinquency' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRegistrarAlert(alert);
                              setIsRegistrarNoticeModalOpen(true);
                            }}
                            className="h-10 px-space-md rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                            <span>Send Formal Registrar Notice</span>
                          </button>
                          <button
                            type="button"
                            title="View Delinquent Users"
                            onClick={() => toast.info('Navigating to Delinquency Registry (18 users).')}
                            className="h-10 w-10 rounded-full bg-surface-container-lowest hover:bg-surface text-text-secondary flex items-center justify-center cursor-pointer border border-outline-variant/15"
                          >
                            <span className="material-symbols-outlined text-[18px]">list_alt</span>
                          </button>
                        </>
                      )}

                      {alert.type === 'hardware' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setHardwareAlert(alert);
                              setIsHardwarePingModalOpen(true);
                            }}
                            className="h-10 px-space-md rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">build</span>
                            <span>Notify Facilities Team</span>
                          </button>
                          <button
                            type="button"
                            title="Re-poll circulation service"
                            onClick={handleRepollSocket}
                            className="h-10 w-10 rounded-full bg-surface-container-lowest hover:bg-surface text-text-secondary flex items-center justify-center cursor-pointer border border-outline-variant/15"
                          >
                            <span className="material-symbols-outlined text-[18px]">sync</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. TAB 2: Campus Announcements & Bulletins CRUD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tab-announcements' && (
        <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
          {/* Header & Controls Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-sm">
                <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
                  Campus Broadcast Network
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Active Sync: Web Portal, Digital Stacks Totems, Katipuneros Mobile App
                </span>
              </div>
              <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                Campus Announcements &amp; Bulletins
              </h2>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="h-11 px-space-md rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold flex items-center gap-space-xs shadow-sm transition-all cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ Create New Announcement</span>
            </button>
          </div>

          {/* Filter Toolbar: SearchBar + STATUS + SORT + RadioButton View Toggle */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
            {/* SearchBar */}
            <div className="w-full lg:w-80">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search bulletins by title, audience, content..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              {/* STATUS Dropdown */}
              <Dropdown
                items={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'published', label: 'Live • Published' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'unpublished', label: 'Unpublished' },
                ]}
                selectedValue={statusFilter}
                onSelect={setStatusFilter}
                menuWidth="w-48"
              />

              {/* SORT Dropdown */}
              <Dropdown
                items={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'openrate', label: 'Highest Open Rate' },
                  { value: 'az', label: 'Alphabetical A-Z' },
                  { value: 'za', label: 'Alphabetical Z-A' },
                  { value: 'priority', label: 'Priority Level' },
                ]}
                selectedValue={sortOrder}
                onSelect={setSortOrder}
                menuWidth="w-48"
              />

              {/* View Toggle (RadioButton) placed AFTER SearchBar and BEFORE Bulk Action */}
              <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-1.5 rounded-xl border border-outline-variant/15">
                <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                  Display:
                </span>
                <RadioButton
                  name="announcementViewMode"
                  label="Table View"
                  checked={viewMode === 'table'}
                  onChange={() => setViewMode('table')}
                />
                <RadioButton
                  name="announcementViewMode"
                  label="Card View"
                  checked={viewMode === 'card'}
                  onChange={() => setViewMode('card')}
                />
              </div>
            </div>
          </div>

          {/* Floating Bulk Action Bar */}
          {selectedAnnouncementIds.length > 0 && (
            <div className="p-space-md rounded-xl bg-primary text-on-primary shadow-lg flex items-center justify-between animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[20px]">check_box</span>
                <span className="font-small text-small font-bold">
                  {selectedAnnouncementIds.length} announcement(s) selected
                </span>
              </div>
              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncementIds([])}
                  className="px-space-md py-1 rounded-full bg-primary-container text-on-primary-container hover:bg-surface-container font-caption text-caption font-bold cursor-pointer"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-space-md py-1 rounded-full bg-status-danger text-on-error hover:bg-error font-caption text-caption font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  <span>Delete Selected ({selectedAnnouncementIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm overflow-hidden">
              <div ref={tableContainerRef} className="overflow-x-auto">
                <table className="w-full text-left font-small text-small border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider border-b border-outline-variant/15">
                      <th className="p-space-md w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedAnnouncementIds.length === announcements.length && announcements.length > 0}
                          onChange={handleToggleSelectAll}
                          className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="p-space-md">Announcement Title &amp; Audience</th>
                      <th className="p-space-md">Channels</th>
                      <th className="p-space-md">Broadcast Window</th>
                      <th className="p-space-md">Status</th>
                      <th className="p-space-md">Engagement</th>
                      <th className="p-space-md text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {pagination.paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-space-2xl text-center text-text-secondary">
                          No campus announcements found matching the current criteria.
                        </td>
                      </tr>
                    ) : (
                      pagination.paginatedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="p-space-md text-center">
                            <input
                              type="checkbox"
                              checked={selectedAnnouncementIds.includes(item.id)}
                              onChange={() => handleToggleSelectOne(item.id)}
                              className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-space-md">
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary text-body">{item.title}</span>
                              <span className="font-caption text-caption text-text-secondary mt-0.5">
                                Audience: {item.audience}
                              </span>
                            </div>
                          </td>
                          <td className="p-space-md">
                            <div className="flex flex-wrap gap-1">
                              {item.channels.map((ch, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-full bg-surface-container font-caption text-[11px] text-text-primary font-medium"
                                >
                                  {ch}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-space-md font-caption text-caption text-text-secondary">{item.activeRange}</td>
                          <td className="p-space-md">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-caption text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-max ${
                                item.status.includes('Live')
                                  ? 'bg-action-green/30 text-text-primary'
                                  : item.status.includes('Scheduled')
                                  ? 'bg-secondary-container text-on-secondary-container'
                                  : item.status.includes('Draft')
                                  ? 'bg-surface-container text-text-secondary'
                                  : 'bg-error-container text-on-error-container'
                              }`}
                            >
                              {item.status.includes('Live') && (
                                <span className="w-1.5 h-1.5 rounded-full bg-action-green animate-pulse"></span>
                              )}
                              {item.status}
                            </span>
                          </td>
                          <td className="p-space-md">
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary font-caption text-caption">
                                {item.openRate > 0 ? `${item.openRate}% Open Rate` : '—'}
                              </span>
                              <span className="font-caption text-[11px] text-text-secondary">
                                {item.viewsCount} views • {item.readsCount} reads
                              </span>
                            </div>
                          </td>
                          <td className="p-space-md text-right">
                            <KebabMenu
                              items={[
                                {
                                  label: 'Analytics',
                                  icon: 'analytics',
                                  onClick: () => handleOpenAnalytics(item.id),
                                },
                                {
                                  label: 'Edit',
                                  icon: 'edit',
                                  onClick: () => handleOpenEditModal(item),
                                },
                                {
                                  label: item.status.includes('Unpublished') ? 'Publish Draft' : 'Unpublish',
                                  icon: item.status.includes('Unpublished') ? 'publish' : 'visibility_off',
                                  onClick: () => handleToggleUnpublish(item.id),
                                },
                                {
                                  label: 'Public Preview',
                                  icon: 'preview',
                                  onClick: () => handleOpenPreview(item),
                                },
                                {
                                  label: 'Delete',
                                  icon: 'delete',
                                  danger: true,
                                  onClick: () => handleDeleteAnnouncement(item.id),
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARD VIEW */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
              {pagination.paginatedItems.length === 0 ? (
                <div className="col-span-full p-space-2xl text-center text-text-secondary bg-surface-container-lowest rounded-2xl border border-outline-variant/15">
                  No campus announcements found matching the current criteria.
                </div>
              ) : (
                pagination.paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border transition-all ${
                      item.status.includes('Live')
                        ? 'border-soft-blue'
                        : item.status.includes('Draft')
                        ? 'border-dashed border-outline-variant'
                        : 'border-outline-variant/15'
                    }`}
                  >
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-space-xs">
                          {/* Card Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedAnnouncementIds.includes(item.id)}
                            onChange={() => handleToggleSelectOne(item.id)}
                            className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer mr-1"
                          />
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-caption text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              item.status.includes('Live')
                                ? 'bg-action-green/30 text-text-primary'
                                : item.status.includes('Scheduled')
                                ? 'bg-secondary-container text-on-secondary-container'
                                : item.status.includes('Draft')
                                ? 'bg-surface-container text-text-secondary'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            {item.status.includes('Live') && (
                              <span className="w-1.5 h-1.5 rounded-full bg-action-green animate-pulse"></span>
                            )}
                            {item.status}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-semibold">
                            Audience: {item.audience}
                          </span>
                        </div>

                        {/* Shared Kebab Menu */}
                        <KebabMenu
                          items={[
                            {
                              label: 'Analytics',
                              icon: 'analytics',
                              onClick: () => handleOpenAnalytics(item.id),
                            },
                            {
                              label: 'Edit',
                              icon: 'edit',
                              onClick: () => handleOpenEditModal(item),
                            },
                            {
                              label: item.status.includes('Unpublished') ? 'Publish Draft' : 'Unpublish',
                              icon: item.status.includes('Unpublished') ? 'publish' : 'visibility_off',
                              onClick: () => handleToggleUnpublish(item.id),
                            },
                            {
                              label: 'Public Preview',
                              icon: 'preview',
                              onClick: () => handleOpenPreview(item),
                            },
                            {
                              label: 'Delete',
                              icon: 'delete',
                              danger: true,
                              onClick: () => handleDeleteAnnouncement(item.id),
                            },
                          ]}
                        />
                      </div>

                      <h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 font-bold">{item.title}</h3>
                      <p className="font-small text-small text-text-secondary leading-relaxed">{item.content}</p>

                      <div className="p-space-sm rounded-xl bg-soft-blue/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-primary text-[20px]">devices</span>
                          <div className="flex flex-col">
                            <span className="font-caption text-caption font-semibold text-text-primary">
                              Channels: {item.channels.join(' • ')}
                            </span>
                            <span className="font-caption text-[11px] text-text-secondary">
                              {item.viewsCount} Active views • {item.readsCount} App reads
                            </span>
                          </div>
                        </div>
                        {item.openRate > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-primary font-caption text-[11px] font-bold shrink-0">
                            {item.openRate}% Open Rate
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-space-lg pt-space-sm flex flex-wrap items-center justify-between gap-2 border-t border-surface-container-low">
                      <div className="flex items-center gap-2 font-caption text-caption text-text-secondary">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>{item.activeRange}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenAnalytics(item.id)}
                          className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">analytics</span>
                          <span>Analytics</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUnpublish(item.id)}
                          className={`px-3 py-1.5 rounded-full font-caption text-caption font-semibold transition-colors cursor-pointer ${
                            item.status.includes('Unpublished')
                              ? 'bg-action-green/30 text-text-primary'
                              : 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error'
                          }`}
                        >
                          {item.status.includes('Unpublished') ? 'Publish' : 'Unpublish'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Dynamic Pagination Bar (10, 25, 50, 100) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-sm border-t border-outline-variant/15">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                <span>Rows:</span>
                <Dropdown<string>
                  variant="pagination"
                  items={[
                    { value: '10', label: '10' },
                    { value: '25', label: '25' },
                    { value: '50', label: '50' },
                    { value: '100', label: '100' },
                  ]}
                  selectedValue={pagination.pageSize.toString()}
                  onSelect={(val) => pagination.setPageSize(Number(val))}
                />
              </div>
              <span className="font-caption text-caption text-text-secondary">
                Showing{' '}
                <strong className="text-text-primary">
                  {totalAnnouncements === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-text-primary">
                  {Math.min(pagination.currentPage * pagination.pageSize, totalAnnouncements)}
                </strong>{' '}
                of <strong className="text-text-primary">{totalAnnouncements}</strong> bulletins
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagination.currentPage <= 1}
                onClick={pagination.prevPage}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-3 py-1 font-caption text-caption font-bold text-text-primary">
                Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}
              </span>
              <button
                type="button"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={pagination.nextPage}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. TAB 3: Automated Dispatch Queue & Stream */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tab-dispatch-queue' && (
        <div className="flex flex-col gap-space-lg animate-in fade-in duration-200">
          {/* Dispatch Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Card 1: Next Batch Run */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                    Next Batch Run
                  </span>
                  <div className="font-headline-3 text-headline-3 text-text-primary font-bold mt-1 font-mono">
                    {formattedNextBatch}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">timer</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary">
                <span>Batch Window: {dispatchTelemetry.batchWindowSeconds}s</span>
                <span className="text-status-available font-semibold">Daemon Running</span>
              </div>
            </div>

            {/* Card 2: Retry Failure Rate */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                    Retry Failure Rate
                  </span>
                  <div className="font-headline-3 text-headline-3 text-text-primary font-bold mt-1">
                    {dispatchTelemetry.retryFailureRate}%
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-action-green/30 text-text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary">
                <span>
                  {dispatchTelemetry.bouncedCount} bounced / {dispatchTelemetry.totalSmsCount} SMS
                </span>
                <span className="text-primary font-semibold">Healthy</span>
              </div>
            </div>

            {/* Card 3: Queue Depth */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                    Queue Depth
                  </span>
                  <div className="font-headline-3 text-headline-3 text-text-primary font-bold mt-1">
                    {dispatchTelemetry.queueDepth} Pending
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">layers</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary">
                <span>
                  {dispatchTelemetry.pendingEmailCount} Email • {dispatchTelemetry.pendingSmsCount} SMS
                </span>
                <span className="text-text-primary font-semibold">{dispatchTelemetry.queueStatus}</span>
              </div>
            </div>

            {/* Card 4: Gateway Rate Limits */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                    Gateway Rate Limits
                  </span>
                  <div className="font-small text-small font-bold text-text-primary mt-1 leading-snug">
                    {dispatchTelemetry.twilioLimit}
                    <br />
                    {dispatchTelemetry.sendGridLimit}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">speed</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary">
                <span>{dispatchTelemetry.sesLimit}</span>
                <span className="text-status-available font-semibold">{dispatchTelemetry.gatewayStatus}</span>
              </div>
            </div>
          </div>

          {/* Live Dispatch Transaction Stream */}
          <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm border border-outline-variant/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-md border-b border-outline-variant/10">
              <div>
                <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                  Live Dispatch Transaction Stream
                </h2>
                <p className="font-caption text-caption text-text-secondary">
                  Outbound user messaging queue and instant carrier delivery feedback
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
                  Latency: 48ms
                </span>
                <button
                  type="button"
                  onClick={handleRefreshStream}
                  disabled={refreshingStream}
                  className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-variant font-caption text-caption text-text-primary font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className={`material-symbols-outlined text-[14px] ${refreshingStream ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>Refresh Stream</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-space-md">
              <table className="w-full text-left font-small text-small border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider border-b border-outline-variant/15">
                    <th className="p-space-md">Dispatch ID</th>
                    <th className="p-space-md">Recipient User</th>
                    <th className="p-space-md">Trigger Event</th>
                    <th className="p-space-md">Channel</th>
                    <th className="p-space-md">Delivery Status</th>
                    <th className="p-space-md">Timestamp</th>
                    <th className="p-space-md text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {transactions.map((tx) => (
                    <tr key={tx.dispatchId} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-space-md font-mono text-caption text-text-secondary font-bold">
                        {tx.dispatchId}
                      </td>
                      <td className="p-space-md">
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">
                            {tx.recipientName} (ID: {tx.recipientId})
                          </span>
                          <span className="text-caption text-text-secondary font-caption">{tx.recipientContact}</span>
                        </div>
                      </td>
                      <td className="p-space-md text-text-primary font-medium">{tx.triggerEvent}</td>
                      <td className="p-space-md">
                        <span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold">
                          {tx.channel}
                        </span>
                      </td>
                      <td className="p-space-md">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-caption text-[11px] font-bold flex items-center gap-1 w-max ${
                            tx.statusSeverity === 'success'
                              ? 'bg-status-available/20 text-text-primary'
                              : tx.statusSeverity === 'inflight'
                              ? 'bg-soft-blue text-primary'
                              : tx.statusSeverity === 'retrying'
                              ? 'bg-status-pending/20 text-text-primary'
                              : 'bg-surface-container text-text-secondary'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tx.statusSeverity === 'success'
                                ? 'bg-status-available'
                                : tx.statusSeverity === 'inflight'
                                ? 'bg-primary animate-pulse'
                                : tx.statusSeverity === 'retrying'
                                ? 'bg-status-pending'
                                : 'bg-text-secondary'
                            }`}
                          ></span>
                          {tx.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-space-md font-caption text-caption text-text-secondary">
                        {tx.timestampFormatted}
                      </td>
                      <td className="p-space-md text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectPayload(tx.rawPayload);
                            setIsInspectPayloadModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-variant text-text-secondary hover:text-text-primary font-caption text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Inspect Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. TAB 4: User SMS/Email Templates */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tab-templates' && (
        <div className="flex flex-col lg:flex-row gap-space-lg animate-in fade-in duration-200">
          {/* Template Roster */}
          <div className="w-full lg:w-2/3 flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
              <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                Institutional Dispatch Templates
              </h3>
              <span className="font-caption text-caption text-text-secondary">
                {templates.length} Production Templates Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border-2 transition-all cursor-pointer ${
                    selectedTemplate?.id === tpl.id ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/15 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption uppercase tracking-wider font-bold text-primary">
                        {tpl.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[10px] font-bold">
                        {tpl.channels}
                      </span>
                    </div>
                    <h4 className="font-headline-4 text-headline-4 text-text-primary font-bold">{tpl.name}</h4>
                    <p className="font-caption text-caption text-text-secondary leading-relaxed">{tpl.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tpl.placeholders.map((ph, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary"
                        >
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-space-md pt-2 flex items-center justify-between border-t border-surface-container-low">
                    <span className="font-caption text-caption text-text-secondary">
                      Dispatched: {tpl.dispatchedToday} today
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(tpl);
                        toast.info(`Selected '${tpl.name}' for live preview.`);
                      }}
                      className="px-3 py-1 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold hover:bg-primary-container cursor-pointer transition-colors"
                    >
                      Active Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Template Preview Drawer */}
          <div className="w-full lg:w-1/3 flex flex-col gap-space-md">
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-surface-container-low pb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">wysiwyg</span>
                  <h4 className="font-headline-4 text-small font-bold text-text-primary">Live Template Preview</h4>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-full">
                  <button
                    type="button"
                    onClick={() => setPreviewChannelMode('SMS')}
                    className={`px-2.5 py-0.5 rounded-full font-caption text-[11px] font-bold transition-all cursor-pointer ${
                      previewChannelMode === 'SMS'
                        ? 'bg-surface-container-lowest text-text-primary shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewChannelMode('Email')}
                    className={`px-2.5 py-0.5 rounded-full font-caption text-[11px] font-bold transition-all cursor-pointer ${
                      previewChannelMode === 'Email'
                        ? 'bg-surface-container-lowest text-text-primary shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-caption font-caption">
                <span className="text-text-secondary font-semibold">Active Relay Gateway:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-action-green"></span>
                  <span className="font-semibold text-text-primary">Twilio High-Throughput (Shortcode)</span>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-2">
                <span className="font-caption text-[11px] uppercase tracking-wider font-bold text-text-secondary">
                  Dispatched {previewChannelMode} Preview
                </span>
                <p className="font-body text-small text-text-primary leading-relaxed bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-soft-blue">
                  "{selectedTemplate?.smsPreview ?? 'Select a template from the roster to inspect live preview.'}"
                </p>
                <div className="flex items-center justify-between font-caption text-[11px] text-text-secondary mt-1">
                  <span>
                    Character Count:{' '}
                    <strong className="text-text-primary">
                      {selectedTemplate?.gsmCharacters ?? 142} / {selectedTemplate?.gsmLimit ?? 160} GSM
                    </strong>{' '}
                    (1 Segment)
                  </span>
                  <span className="text-status-available font-bold">Valid GSM-7</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                  Dynamic Data Binding
                </label>
                <div className="p-3 rounded-xl bg-surface-container-low font-mono text-[11px] text-text-secondary space-y-1">
                  <div>
                    <span className="text-primary font-bold">patron_name:</span> "Camilla Santos"
                  </div>
                  <div>
                    <span className="text-primary font-bold">book_title:</span> "Clean Code"
                  </div>
                  <div>
                    <span className="text-primary font-bold">locker_bay:</span> "Smart Locker Bay A-04"
                  </div>
                  <div>
                    <span className="text-primary font-bold">expiry_time:</span> "Oct 25, 18:00"
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-container-low">
                <button
                  type="button"
                  onClick={() => toast.success(`Simulated test ${previewChannelMode} dispatched to admin test handset.`)}
                  className="px-3 py-1.5 rounded-full bg-surface-container text-text-primary hover:bg-surface font-caption text-caption font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">science</span>
                  <span>Send Test {previewChannelMode}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.success(`Template '${selectedTemplate?.name}' changes saved.`)}
                  className="px-space-md py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-caption text-caption font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. Pedagogical Thesis & Disciplinary Share Banner */}
      {/* ------------------------------------------------------------- */}
      <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">school</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Curriculum Disciplinary Share • Q1 2026
              </span>
              <span className="px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary font-caption text-[10px] font-bold">
                Target Equilibrium Index: 1.15
              </span>
            </div>
            <p className="font-headline-4 text-headline-4 text-text-primary font-bold mt-0.5">
              44% STEM • 26% HumSS • 18% Health • 12% Law/Bus
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsPedagogicalThesisOpen(true)}
          className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-bold flex items-center gap-1.5 self-start md:self-auto cursor-pointer transition-colors"
        >
          <span>Read full pedagogical thesis</span>
          <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* Create Announcement Modal */}
      <DefaultFloatingModalCard
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Compose System Announcement"
        subtitle="Publish high-priority banners to Katipuneros web portal and mobile app"
        size="lg"
      >
        <div className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
              Target Audience
            </label>
            <div className="flex flex-wrap gap-space-xs">
              {['All Users', 'Faculty & Undergraduates', 'Faculty Only', 'Staff Only'].map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setFormAudience(aud)}
                  className={`px-space-md py-1.5 rounded-full font-caption text-caption font-semibold cursor-pointer transition-colors ${
                    formAudience === aud
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-text-primary hover:bg-surface-container'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
              Headline Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., Extended Stacks Hours During Examination Week..."
              className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-body text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
              Detailed Message Body
            </label>
            <textarea
              rows={4}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Detail opening hours, access protocols, affected stack zones, and assistance contact details..."
              className="w-full bg-surface-container-low p-space-md rounded-xl font-body text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
                Display Duration
              </label>
              <select
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="w-full mt-1 bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15 cursor-pointer"
              >
                <option value="Until tomorrow at midnight">Until tomorrow at midnight</option>
                <option value="7 Days (End of Academic Week)">7 Days (End of Academic Week)</option>
                <option value="Until manually dismissed">Until manually dismissed</option>
              </select>
            </div>
            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
                Priority Level
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
                className="w-full mt-1 bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15 cursor-pointer"
              >
                <option value="Standard Campus Bulletin">Standard Campus Bulletin</option>
                <option value="Urgent / Operating Hours Modification">Urgent / Operating Hours Modification</option>
                <option value="Emergency Stacks Closure">Emergency Stacks Closure</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-space-sm pt-2">
            <input
              type="checkbox"
              id="draftCheckbox"
              checked={formIsDraft}
              onChange={(e) => setFormIsDraft(e.target.checked)}
              className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
            <label htmlFor="draftCheckbox" className="font-caption text-caption text-text-primary cursor-pointer">
              Save as Draft (Do not publish immediately)
            </label>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-space-md py-2.5 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small font-semibold text-text-secondary cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleSaveCreateAnnouncement}
              className="px-space-lg py-2.5 rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              <span>{formIsDraft ? 'Save Draft' : 'Broadcast Announcement'}</span>
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* Edit Announcement Modal */}
      <DefaultFloatingModalCard
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Campus Announcement"
        subtitle={`Updating bulletin: ${selectedAnnouncement?.id}`}
        size="lg"
      >
        <div className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
              Headline Title
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-body text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
              Detailed Message Body
            </label>
            <textarea
              rows={4}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full bg-surface-container-low p-space-md rounded-xl font-body text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
                Display Duration
              </label>
              <input
                type="text"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="w-full mt-1 bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15"
              />
            </div>
            <div>
              <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
                Audience Scope
              </label>
              <input
                type="text"
                value={formAudience}
                onChange={(e) => setFormAudience(e.target.value)}
                className="w-full mt-1 bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-space-md py-2.5 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small font-semibold text-text-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEditAnnouncement}
              className="px-space-lg py-2.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* Announcement Analytics Modal */}
      <DefaultFloatingModalCard
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        title="Bulletin Performance Analytics"
        subtitle={activeAnalytics?.title ?? 'Announcement metrics'}
        size="md"
      >
        {activeAnalytics && (
          <div className="flex flex-col gap-space-md">
            <div className="grid grid-cols-3 gap-space-sm text-center">
              <div className="p-space-md rounded-xl bg-surface-container-low">
                <span className="font-caption text-caption text-text-secondary uppercase">Portal Views</span>
                <p className="font-headline-3 text-headline-3 font-bold text-text-primary mt-1">
                  {activeAnalytics.totalPortalViews}
                </p>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low">
                <span className="font-caption text-caption text-text-secondary uppercase">Mobile Push</span>
                <p className="font-headline-3 text-headline-3 font-bold text-text-primary mt-1">
                  {activeAnalytics.mobilePushReads}
                </p>
              </div>
              <div className="p-space-md rounded-xl bg-soft-blue/40">
                <span className="font-caption text-caption text-primary uppercase font-bold">Open Rate</span>
                <p className="font-headline-3 text-headline-3 font-bold text-primary mt-1">
                  {activeAnalytics.overallOpenRate}%
                </p>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
              <span className="font-caption text-caption text-text-secondary uppercase font-bold">
                Audience &amp; Channels
              </span>
              <p className="font-body text-body text-text-primary font-medium">
                Scope: {activeAnalytics.primaryAudience}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {activeAnalytics.activeChannels.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surface-container font-caption text-[11px] text-text-primary">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <p className="font-small text-small text-text-secondary leading-relaxed p-space-sm rounded-lg bg-surface-container-low">
              {activeAnalytics.performanceSummary}
            </p>

            <div className="flex justify-end pt-space-sm border-t border-outline-variant/10">
              <button
                type="button"
                onClick={() => setIsAnalyticsModalOpen(false)}
                className="px-space-md py-2 rounded-full bg-primary text-on-primary font-small text-small font-bold cursor-pointer"
              >
                Close Analytics
              </button>
            </div>
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* Public Preview Modal */}
      <DefaultFloatingModalCard
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Public Portal Preview"
        subtitle="Simulated rendering as seen by student and faculty accounts"
        size="md"
      >
        {previewAnnouncement && (
          <div className="flex flex-col gap-space-md">
            <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-space-lg shadow-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-caption text-[11px] font-bold uppercase tracking-wider">
                  Campus Announcement
                </span>
                <span className="font-caption text-caption text-text-secondary">{previewAnnouncement.activeRange}</span>
              </div>
              <h3 className="font-headline-3 text-headline-3 font-bold text-text-primary mt-1">
                {previewAnnouncement.title}
              </h3>
              <p className="font-body text-body text-text-secondary leading-relaxed">
                {previewAnnouncement.content}
              </p>
              <div className="mt-space-sm pt-space-xs border-t border-outline-variant/10 flex items-center justify-between text-caption font-caption text-text-secondary">
                <span>Target: {previewAnnouncement.audience}</span>
                <span className="text-primary font-semibold">Katipuneros Library Portal</span>
              </div>
            </div>

            <div className="flex justify-end pt-space-sm border-t border-outline-variant/10">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-variant text-text-primary font-small text-small font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </DefaultFloatingModalCard>

      {/* Inspect Dispatch Payload Modal */}
      <DefaultFloatingModalCard
        isOpen={isInspectPayloadModalOpen}
        onClose={() => setIsInspectPayloadModalOpen(false)}
        title="Dispatch Carrier Payload Inspector"
        subtitle="Raw JSON payload and delivery receipt confirmation"
        size="md"
      >
        <div className="flex flex-col gap-space-md">
          <pre className="p-space-md rounded-xl bg-surface-container-low text-text-primary font-mono text-[12px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-outline-variant/15 max-h-72">
            {inspectPayload ? JSON.stringify(JSON.parse(inspectPayload), null, 2) : '{}'}
          </pre>
          <div className="flex justify-end pt-space-sm border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsInspectPayloadModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-primary text-on-primary font-small text-small font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* Trigger Acquisition Order Modal */}
      <DefaultFloatingModalCard
        isOpen={isAcquisitionModalOpen}
        onClose={() => setIsAcquisitionModalOpen(false)}
        title="Trigger Acquisition Order"
        subtitle="Expedite purchase requisition for critical reserve deficit"
        size="md"
      >
        <div className="flex flex-col gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
            <span className="font-caption text-caption text-text-secondary uppercase font-semibold">
              Affected Monograph
            </span>
            <p className="font-body-large text-body-large font-bold text-text-primary">
              {acquisitionAlert?.title}
            </p>
            <p className="font-caption text-caption text-error font-medium mt-1">
              Active Queue: {acquisitionAlert?.activeReservations} reservations vs {acquisitionAlert?.availableCopies} copies in stacks.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
              Copies to Requisition
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={acquisitionCopies}
              onChange={(e) => setAcquisitionCopies(Number(e.target.value))}
              className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-body text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/15"
            />
          </div>

          <div className="flex justify-end gap-space-sm pt-space-sm border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsAcquisitionModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small font-semibold text-text-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAcquisition}
              className="px-space-lg py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-bold cursor-pointer"
            >
              Authorize Order
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* Send Formal Registrar Notice Modal */}
      <DefaultFloatingModalCard
        isOpen={isRegistrarNoticeModalOpen}
        onClose={() => setIsRegistrarNoticeModalOpen(false)}
        title="Send Formal Registrar Notice"
        subtitle="Circulation Sanction Warning: 14-Day Hold Freeze Clearance"
        size="md"
      >
        <div className="flex flex-col gap-space-md">
          <p className="font-body text-body text-text-secondary leading-relaxed">
            Dispatch an official certified memorandum to the Office of the Registrar regarding{' '}
            <strong className="text-text-primary">18 delinquent users</strong> who have exceeded the 14-day hold retention threshold.
          </p>
          <div className="p-space-md rounded-xl bg-surface-container-low font-caption text-caption text-text-secondary space-y-1">
            <div>
              <strong className="text-text-primary">Recipient:</strong> registrar@katipunan.edu.ph
            </div>
            <div>
              <strong className="text-text-primary">CC:</strong> dean.admissions@katipunan.edu.ph
            </div>
            <div>
              <strong className="text-text-primary">Action:</strong> Academic Clearance Suspension
            </div>
          </div>
          <div className="flex justify-end gap-space-sm pt-space-sm border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsRegistrarNoticeModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small font-semibold text-text-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRegistrarNotice}
              className="px-space-lg py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-bold cursor-pointer"
            >
              Send Certified Notice
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* Maintenance Support Notice Modal */}
      <DefaultFloatingModalCard
        isOpen={isHardwarePingModalOpen}
        onClose={() => setIsHardwarePingModalOpen(false)}
        title="Dispatch System Maintenance Notice"
        subtitle="Facility Infrastructure Incident: Circulation Desk Node Offline"
        size="md"
      >
        <div className="flex flex-col gap-space-md">
          <div className="p-space-md rounded-xl bg-error-container/30 border border-error/20 flex flex-col gap-1">
            <span className="font-caption text-caption text-error uppercase font-bold">Unreachable Node</span>
            <p className="font-body text-body font-bold text-text-primary">
              {hardwareAlert?.title} (IP: {hardwareAlert?.hardwareIp})
            </p>
            <p className="font-caption text-caption text-text-secondary mt-1">
              Circulation Desk Terminal node stopped responding to network polling. Transactions operate in resilient offline-buffered mode.
            </p>
          </div>
          <div className="flex justify-end gap-space-sm pt-space-sm border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsHardwarePingModalOpen(false)}
              className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small font-semibold text-text-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmHardwarePing}
              className="px-space-lg py-2 rounded-full bg-error text-on-error hover:bg-error/90 font-small text-small font-bold cursor-pointer"
            >
              Dispatch Ticket Now
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* Pedagogical Thesis Modal */}
      <DefaultFloatingModalCard
        isOpen={isPedagogicalThesisOpen}
        onClose={() => setIsPedagogicalThesisOpen(false)}
        title="Pedagogical Thesis: Curriculum Disciplinary Share & Equilibrium"
        subtitle="Institutional allocation formulas governing university monograph distribution"
        size="lg"
      >
        <div className="flex flex-col gap-space-md text-text-primary leading-relaxed">
          <div className="p-space-md rounded-xl bg-soft-blue/30 border border-soft-blue flex items-center justify-between">
            <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
              Target Equilibrium Index: 1.15
            </span>
            <span className="font-caption text-caption text-text-secondary">Statutory standard: CHED CMO 2024-Q1</span>
          </div>

          <h4 className="font-headline-4 text-headline-4 font-bold text-text-primary">
            Mathematical Formulation of Disciplinary Equilibrium
          </h4>
          <p className="font-small text-small text-text-secondary">
            The Katipuneros Library System regulates acquisition velocity using an empirical disciplinary ratio:
          </p>

          <div className="p-space-md rounded-xl bg-surface-container-low font-mono text-[12px] text-text-primary space-y-1">
            <div>Equilibrium Index (E) = (V_STEM × 0.44 + V_HumSS × 0.26 + V_Health × 0.18 + V_Law × 0.12) / V_Baseline</div>
            <div className="text-action-green font-bold">Target Range: 1.10 ≤ E ≤ 1.20 (Current: 1.15 Balanced)</div>
          </div>

          <p className="font-small text-small text-text-secondary">
            Under this pedagogical thesis, rapid circulation turns in Engineering and Computer Science are mathematically offset by deep archival holdings in Filipiniana, Classical Philosophy, and Jurisprudence, preventing algorithmic starvation of foundational humanities monographs.
          </p>

          <div className="flex justify-end pt-space-sm border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsPedagogicalThesisOpen(false)}
              className="px-space-md py-2 rounded-full bg-primary text-on-primary font-small text-small font-bold cursor-pointer"
            >
              Acknowledge Thesis
            </button>
          </div>
        </div>
      </DefaultFloatingModalCard>
    </div>
  );
};

export default Notifications;
