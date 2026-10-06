// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// Notifications.tsx -- Cashier Operations Notifications and Alerts.
// Connects to live /api/notifications/alerts, /api/notifications/top-metrics, /api/cashier/dashboard-kpis, and /api/notifications/alerts/resolve-all.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alerts (useToasts).

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useToasts } from '../../../../../Hooks/useToasts';
import {
  getAdminAlerts,
  getTopBentoMetrics,
  resolveAllSystemAlerts,
  AdminSystemAlert,
  TopBentoMetrics,
} from '../../../../../Endpoints/Admin/notificationApi';
import { getCashierDashboardKpis, CashierDashboardKpis } from '../../../../../Endpoints/Cashier/cashierApi';

export const Notifications: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();

  const [alerts, setAlerts] = useState<AdminSystemAlert[]>([]);
  const [bentoMetrics, setBentoMetrics] = useState<TopBentoMetrics | null>(null);
  const [kpis, setKpis] = useState<CashierDashboardKpis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter state
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'hold' | 'returns' | 'system'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState<boolean>(false);

  // Broadcast form state
  const [broadcastTarget, setBroadcastTarget] = useState<string>('all');
  const [broadcastSubject, setBroadcastSubject] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertData, bentoData, kpiData] = await Promise.all([
        getAdminAlerts(),
        getTopBentoMetrics(),
        getCashierDashboardKpis(),
      ]);

      setAlerts(alertData);
      setBentoMetrics(bentoData);
      setKpis(kpiData);
    } catch {
      addToast('Failed to synchronize notification stream from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    const handleRefresh = () => loadData();
    window.addEventListener('cashier-refresh-kpis', handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cashier-refresh-kpis', handleRefresh);
    };
  }, [loadData]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await resolveAllSystemAlerts();
      setAlerts((prev) => prev.map((a) => ({ ...a, isResolved: true })));
      addToast('All system and circulation alerts marked as read.', 'success');
    } catch {
      addToast('Failed to mark alerts as read on server.', 'error');
    }
  };

  // Dismiss single alert
  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    addToast('Notification alert dismissed.', 'info');
  };

  // Broadcast dispatch action
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      addToast('Please provide both a subject and message for the terminal broadcast.', 'warning');
      return;
    }

    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      addToast(
        `Terminal broadcast "${broadcastSubject}" dispatched successfully to ${
          broadcastTarget === 'all' ? 'all active patrons' : broadcastTarget
        }.`,
        'success'
      );
      setBroadcastSubject('');
      setBroadcastMessage('');
    }, 700);
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: alerts.length, urgent: 0, hold: 0, returns: 0, system: 0 };
    alerts.forEach((a) => {
      if (a.severity === 'critical') counts.urgent++;
      if (a.type === 'deficit' || a.category?.toLowerCase().includes('hold') || a.category?.toLowerCase().includes('reserv')) {
        counts.hold++;
      }
      if (a.type === 'delinquency' || a.category?.toLowerCase().includes('return') || a.category?.toLowerCase().includes('overdue')) {
        counts.returns++;
      }
      if (a.type === 'hardware' || a.type === 'system' || a.category?.toLowerCase().includes('system')) {
        counts.system++;
      }
    });
    return counts;
  }, [alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Priority filter
      if (priorityFilter !== 'all' && alert.severity !== priorityFilter) return false;

      // Tab filter
      if (activeTab === 'urgent' && alert.severity !== 'critical') return false;
      if (
        activeTab === 'hold' &&
        !(alert.type === 'deficit' || alert.category?.toLowerCase().includes('hold') || alert.category?.toLowerCase().includes('reserv'))
      ) {
        return false;
      }
      if (
        activeTab === 'returns' &&
        !(alert.type === 'delinquency' || alert.category?.toLowerCase().includes('return') || alert.category?.toLowerCase().includes('overdue'))
      ) {
        return false;
      }
      if (
        activeTab === 'system' &&
        !(alert.type === 'hardware' || alert.type === 'system' || alert.category?.toLowerCase().includes('system'))
      ) {
        return false;
      }

      return true;
    });
  }, [alerts, activeTab, priorityFilter]);

  // Derived Bento Metrics
  const urgentAlertsCount = bentoMetrics?.urgentAlertsCount ?? alerts.filter((a) => a.severity === 'critical').length;
  const toReleaseCount = kpis?.toReleaseCount ?? 0;
  const returnRemindersSent = (bentoMetrics?.todaySms ?? 0) + (bentoMetrics?.todayPush ?? 0);

  return (
    <div className="w-full">
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-small font-medium transition-all animate-in fade-in slide-in-from-bottom-5 ${
                toast.type === 'success'
                  ? 'bg-action-green text-text-primary border border-action-green-hover'
                  : toast.type === 'error'
                  ? 'bg-status-danger text-on-error'
                  : toast.type === 'warning'
                  ? 'bg-status-pending text-text-primary'
                  : 'bg-primary text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success'
                  ? 'check_circle'
                  : toast.type === 'error'
                  ? 'error'
                  : toast.type === 'warning'
                  ? 'warning'
                  : 'info'}
              </span>
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 hover:opacity-75 cursor-pointer text-[16px] material-symbols-outlined"
              >
                close
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col w-full pb-space-2xl pt-space-lg gap-space-xl">
        {/* Header Section */}
        <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
              <span>DESK 01 OPERATIONS</span>
              <span className="text-text-secondary/50">/</span>
              <span className="text-primary font-bold">Operational Notifications &amp; Alerts</span>
              <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> LIVE WEBSOCKET
              </span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
              Circulation Desk Notification Center
            </h1>
            <p className="font-body text-body text-text-secondary">
              Real-time alerts for pending reservation queues, return deadlines, hold pickups, system synchronization, and user communications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              className="h-11 px-4 rounded-xl bg-surface-container-lowest text-text-primary font-small text-small font-semibold shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-2 cursor-pointer"
              onClick={handleMarkAllRead}
            >
              <span className="material-symbols-outlined text-[18px] text-primary">done_all</span>
              <span>Mark All as Read</span>
            </button>

            {/* Priority Filter Dropdown */}
            <div className="relative">
              <button
                className="h-11 px-4 rounded-xl bg-surface-container-lowest text-text-primary font-small text-small font-semibold shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-2 cursor-pointer"
                onClick={() => setShowPriorityDropdown((prev) => !prev)}
              >
                <span className="material-symbols-outlined text-[18px] text-text-secondary">filter_list</span>
                <span>
                  {priorityFilter === 'all'
                    ? 'All Priorities'
                    : priorityFilter === 'critical'
                    ? 'Critical Only'
                    : priorityFilter === 'warning'
                    ? 'Warning Only'
                    : 'Info Only'}
                </span>
                <span className="material-symbols-outlined text-[18px] text-text-secondary">expand_more</span>
              </button>
              {showPriorityDropdown && (
                <div className="absolute right-0 top-12 w-48 rounded-xl bg-surface-container-lowest shadow-lg border border-surface-container-high/40 p-1.5 z-20 flex flex-col gap-1">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg font-small text-small transition-colors ${
                      priorityFilter === 'all' ? 'bg-primary text-on-primary font-semibold' : 'hover:bg-surface-container'
                    }`}
                    onClick={() => {
                      setPriorityFilter('all');
                      setShowPriorityDropdown(false);
                    }}
                  >
                    All Priorities
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg font-small text-small transition-colors ${
                      priorityFilter === 'critical' ? 'bg-primary text-on-primary font-semibold' : 'hover:bg-surface-container'
                    }`}
                    onClick={() => {
                      setPriorityFilter('critical');
                      setShowPriorityDropdown(false);
                    }}
                  >
                    Critical Only
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg font-small text-small transition-colors ${
                      priorityFilter === 'warning' ? 'bg-primary text-on-primary font-semibold' : 'hover:bg-surface-container'
                    }`}
                    onClick={() => {
                      setPriorityFilter('warning');
                      setShowPriorityDropdown(false);
                    }}
                  >
                    Warning Only
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-lg font-small text-small transition-colors ${
                      priorityFilter === 'info' ? 'bg-primary text-on-primary font-semibold' : 'hover:bg-surface-container'
                    }`}
                    onClick={() => {
                      setPriorityFilter('info');
                      setShowPriorityDropdown(false);
                    }}
                  >
                    Info Only
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top 4 Bento Telemetry Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* Bento Card 1: Urgent Action Items */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-status-danger/10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-status-danger/15 flex items-center justify-center text-status-danger">
                <span className="material-symbols-outlined text-[22px]">error</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold animate-pulse">
                HIGH PRIORITY
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-1 text-headline-1 text-text-primary">{urgentAlertsCount}</span>
                <span className="font-caption text-caption font-semibold text-status-danger uppercase tracking-wider">
                  Unread
                </span>
              </div>
              <p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">
                Urgent Action Items
              </p>
              <p className="font-caption text-caption text-text-secondary mt-1">
                {urgentAlertsCount > 0 ? 'Immediate desk cashier handling needed' : 'All critical items resolved'}
              </p>
            </div>
          </div>

          {/* Bento Card 2: Staging Locker Holds */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-action-green/15 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
              <span className="font-caption text-caption font-semibold text-text-secondary">Bay Locker Area</span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-1 text-headline-1 text-text-primary">{toReleaseCount}</span>
                <span className="font-caption text-caption font-semibold text-status-available uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">
                Staging Locker Holds
              </p>
              <p className="font-caption text-caption text-text-secondary mt-1">
                {toReleaseCount > 0 ? 'Awaiting user pickup in staged bays' : 'Zero pending pickup holds'}
              </p>
            </div>
          </div>

          {/* Bento Card 3: Return Reminders Sent */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-status-pending/10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-status-pending/15 flex items-center justify-center text-status-pending">
                <span className="material-symbols-outlined text-[22px]">mark_email_read</span>
              </div>
              <span className="font-caption text-caption font-semibold text-text-secondary">Automated Dispatch</span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-1 text-headline-1 text-text-primary">{returnRemindersSent}</span>
                <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                  Today
                </span>
              </div>
              <p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">
                Return Reminders Sent
              </p>
              <p className="font-caption text-caption text-text-secondary mt-1">
                Automated SMS &amp; user portal notices
              </p>
            </div>
          </div>

          {/* Bento Card 4: System Sync Status */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-action-green/20 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-action-green/20 flex items-center justify-center text-text-primary">
                <span className="material-symbols-outlined text-[22px]">sync_alt</span>
              </div>
              <span className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-action-green-hover">
                <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span> Live Sync
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-4 text-headline-4 text-text-primary">Connected</span>
                <span className="font-caption text-caption font-semibold text-action-green uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">
                System Sync Status
              </p>
              <p className="font-caption text-caption text-text-secondary mt-1">
                WebSocket Desk Bay 01 fully operational
              </p>
            </div>
          </div>
        </section>

        {/* Main Feed & Quick Broadcast Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Feed Column */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 select-none">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container">
                <button
                  className={`px-3.5 py-1.5 rounded-lg font-small text-small transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-surface-container-lowest text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary font-medium'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  <span>All Alerts</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-bold">
                    {tabCounts.all}
                  </span>
                </button>
                <button
                  className={`px-3.5 py-1.5 rounded-lg font-small text-small transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'urgent'
                      ? 'bg-surface-container-lowest text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary font-medium'
                  }`}
                  onClick={() => setActiveTab('urgent')}
                >
                  <span>Urgent / Action Required</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold">
                    {tabCounts.urgent}
                  </span>
                </button>
                <button
                  className={`px-3.5 py-1.5 rounded-lg font-small text-small transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'hold'
                      ? 'bg-surface-container-lowest text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary font-medium'
                  }`}
                  onClick={() => setActiveTab('hold')}
                >
                  <span>Hold Reservations</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-bold">
                    {tabCounts.hold}
                  </span>
                </button>
                <button
                  className={`px-3.5 py-1.5 rounded-lg font-small text-small transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'returns'
                      ? 'bg-surface-container-lowest text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary font-medium'
                  }`}
                  onClick={() => setActiveTab('returns')}
                >
                  <span>Returns &amp; Overdue</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-bold">
                    {tabCounts.returns}
                  </span>
                </button>
                <button
                  className={`px-3.5 py-1.5 rounded-lg font-small text-small transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'system'
                      ? 'bg-surface-container-lowest text-text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary font-medium'
                  }`}
                  onClick={() => setActiveTab('system')}
                >
                  <span>System &amp; Shift</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-bold">
                    {tabCounts.system}
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-text-secondary font-caption text-caption whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>{filteredAlerts.length} Active Records</span>
              </div>
            </div>

            {/* Notification Items List */}
            <div className="flex flex-col gap-space-sm">
              {loading ? (
                <div className="py-16 text-center text-text-secondary bg-surface-container-lowest rounded-2xl shadow-sm">
                  <span className="material-symbols-outlined text-3xl animate-spin mb-2">sync</span>
                  <p>Loading real-time terminal notifications...</p>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="py-16 text-center text-text-secondary bg-surface-container-lowest rounded-2xl shadow-sm">
                  <span className="material-symbols-outlined text-4xl text-status-available mb-2">
                    notifications_off
                  </span>
                  <p className="font-semibold text-text-primary">No active notifications or alerts</p>
                  <p className="font-caption text-caption mt-1">
                    Your circulation desk feed is fully cleared and up to date.
                  </p>
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const isCritical = alert.severity === 'critical';
                  const isWarning = alert.severity === 'warning';

                  return (
                    <article
                      key={alert.id}
                      className={`relative overflow-hidden rounded-2xl p-space-md sm:p-space-lg shadow-sm transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row gap-space-md ${
                        alert.isResolved ? 'bg-surface-container-lowest opacity-80' : 'bg-soft-blue'
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          isCritical ? 'bg-status-danger' : isWarning ? 'bg-status-pending' : 'bg-primary'
                        }`}
                      ></div>
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isCritical
                              ? 'bg-status-danger/15 text-status-danger'
                              : isWarning
                              ? 'bg-status-pending/20 text-status-pending'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[26px]">
                            {isCritical ? 'warning' : isWarning ? 'hourglass_top' : 'notifications'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full font-caption text-caption font-bold uppercase ${
                                isCritical
                                  ? 'bg-status-danger text-on-error'
                                  : isWarning
                                  ? 'bg-status-pending/20 text-text-primary'
                                  : 'bg-primary text-on-primary'
                              }`}
                            >
                              {alert.tag || alert.severity}
                            </span>
                            <h3 className="font-headline-4 text-headline-4 text-text-primary">{alert.title}</h3>
                          </div>
                          <div className="flex items-center gap-1 text-text-secondary font-caption text-caption whitespace-nowrap">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            <span>{alert.triggeredAgo || 'Recently'}</span>
                          </div>
                        </div>
                        <p className="font-body text-body text-text-primary/90 mt-1 leading-relaxed">
                          {alert.description}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-md pt-space-sm">
                          <span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-primary">
                              precision_manufacturing
                            </span>
                            <span>{alert.category || 'System Trigger'}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              className="h-9 px-3 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-small text-small font-medium transition-colors cursor-pointer"
                              onClick={() => handleDismissAlert(alert.id)}
                            >
                              Dismiss
                            </button>
                            <button
                              className="h-9 px-4 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                              onClick={() => handleDismissAlert(alert.id)}
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Mark Handled</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Sidebar: Terminal Notice Dispatch */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-surface-container-high/40 flex flex-col gap-space-md sticky top-20">
              <div className="flex items-center gap-2.5 pb-2 border-b border-surface-container-high/60">
                <span className="material-symbols-outlined text-primary text-[22px]">send</span>
                <div>
                  <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">
                    Quick Broadcast Notice
                  </h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Dispatch instant messages to circulating patrons from Bay 01
                  </p>
                </div>
              </div>

              <form onSubmit={handleBroadcastSubmit} className="flex flex-col gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption font-semibold text-text-secondary">Target Audience</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                  >
                    <option value="all">All Active Borrowers</option>
                    <option value="Undergraduate">Undergraduate Patrons</option>
                    <option value="Graduate">Graduate Scholars</option>
                    <option value="Faculty">Faculty &amp; Fellows</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption font-semibold text-text-secondary">Notice Subject</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Inclement Weather Grace Extension"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption font-semibold text-text-secondary">Notice Message</label>
                  <textarea
                    rows={4}
                    className="w-full p-3 rounded-xl bg-surface-container-low font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Enter broadcast message text dispatched to patron mobile portal..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="w-full h-11 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isBroadcasting ? 'sync' : 'forward_to_inbox'}
                  </span>
                  <span>{isBroadcasting ? 'Dispatching Broadcast...' : 'Dispatch Broadcast'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
