// [Layer: Hooks]
// useNotification.ts -- Global role-aware notifications hook.
// Provides descending sorted notification stream, unread tracking, mark as read, and cross-panel sync.
// Universal lambda expressions (=>).
// DO NOT put UI rendering or direct API requests here.

import { useState, useEffect, useCallback, useMemo } from 'react';

export type NotificationSeverity = 'info' | 'warning' | 'danger' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationSeverity;
  roleTarget: 'Admin' | 'Cashier' | 'Customer' | 'All';
  actionUrl?: string;
  actionLabel?: string;
}

export interface UseNotificationReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  refresh: () => void;
}

const STORAGE_KEY = 'katipuneros_global_notifications_v1';

const formatRelativeTime = (isoString: string): string => {
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  return diffSec < 60
    ? 'Just now'
    : diffSec < 3600
    ? `${Math.floor(diffSec / 60)}m ago`
    : diffSec < 86400
    ? `${Math.floor(diffSec / 3600)}h ago`
    : `${Math.floor(diffSec / 86400)}d ago`;
};

export { formatRelativeTime };

const DEFAULT_ROLE_NOTIFICATIONS: NotificationItem[] = [
  // Admin Notifications
  {
    id: 'notif-adm-1',
    title: 'Cryptographic Audit Genesis Verified',
    message: 'SHA-256 tamper-evident blockchain ledger root successfully verified with 0 discrepancies.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'success',
    roleTarget: 'Admin',
    actionUrl: '/admin/audit-logs',
    actionLabel: 'Inspect Ledger',
  },
  {
    id: 'notif-adm-2',
    title: 'Monograph Reserve Threshold Alert',
    message: 'Noli Me Tangere scholarly edition reserve queue exceeds active copies. Acquisition recommended.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'warning',
    roleTarget: 'Admin',
    actionUrl: '/admin/inventory',
    actionLabel: 'View Stacks',
  },
  {
    id: 'notif-adm-3',
    title: 'Campus CIDR Access Verified',
    message: 'Staff VLAN 121.54.32.0/24 subnet validated for privileged administrative console access.',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'info',
    roleTarget: 'Admin',
    actionUrl: '/admin/settings',
    actionLabel: 'Network Policy',
  },

  // Cashier Notifications
  {
    id: 'notif-csh-1',
    title: 'Incoming Hold Ready to Stage',
    message: 'Patron Scholar submitted hold for Bay-B4. Pull physical copy from stacks and stage at counter.',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'warning',
    roleTarget: 'Cashier',
    actionUrl: '/cashier/reservations',
    actionLabel: 'Stage at Bay',
  },
  {
    id: 'notif-csh-2',
    title: 'Overdue Loan Window Active',
    message: 'Patron KP-2026-16137 has 1 overdue title. Calculate statutory fines upon counter check-in.',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'danger',
    roleTarget: 'Cashier',
    actionUrl: '/cashier/overdue-fines',
    actionLabel: 'Review Penalties',
  },
  {
    id: 'notif-csh-3',
    title: 'Station Sync Established',
    message: 'Front Desk Bay 01 hardware and barcode scanners synchronized with active circulation ledger.',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'info',
    roleTarget: 'Cashier',
    actionUrl: '/cashier/transactions',
    actionLabel: 'Shift Journal',
  },

  // Customer Notifications
  {
    id: 'notif-cust-1',
    title: 'Hold Staged at Counter Bay',
    message: 'Your reserved book "Noli Me Tangere" is staged at Ground Floor Counter Bay B-4. Ready for pickup within 48h.',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'success',
    roleTarget: 'Customer',
    actionUrl: '/customer/reservations',
    actionLabel: 'View Hold',
  },
  {
    id: 'notif-cust-2',
    title: 'Loan Due Date Reminder',
    message: 'Borrowed title "Clean Code" is due in 3 days. Return to circulation desk to avoid late fees.',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    isRead: false,
    type: 'warning',
    roleTarget: 'Customer',
    actionUrl: '/customer/borrowings',
    actionLabel: 'My Borrowings',
  },
  {
    id: 'notif-cust-3',
    title: 'Extended Study Stacks Hours',
    message: 'The Katipuneros Scholastic Library is open 24/7 during university midterm examination week.',
    timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    isRead: true,
    type: 'info',
    roleTarget: 'Customer',
    actionUrl: '/catalog',
    actionLabel: 'Explore Catalog',
  },
];

const loadInitialNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_ROLE_NOTIFICATIONS;
};

export const useNotification = (userRole?: 'Admin' | 'Cashier' | 'Customer'): UseNotificationReturn => {
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(loadInitialNotifications);

  const saveNotifications = useCallback((items: NotificationItem[]) => {
    setAllNotifications(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('katipuneros-notification-event', { detail: items }));
    } catch {
      // storage quota or private browsing guard
    }
  }, []);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<NotificationItem[]>;
      if (custom?.detail && Array.isArray(custom.detail)) {
        setAllNotifications(custom.detail);
      } else {
        setAllNotifications(loadInitialNotifications());
      }
    };

    window.addEventListener('katipuneros-notification-event', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('katipuneros-notification-event', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const notifications = useMemo(() => {
    const filtered = userRole
      ? allNotifications.filter((n) => n.roleTarget === userRole || n.roleTarget === 'All')
      : allNotifications;

    return [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [allNotifications, userRole]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const markAsRead = useCallback(
    (id: string) =>
      saveNotifications(
        allNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      ),
    [allNotifications, saveNotifications]
  );

  const markAllAsRead = useCallback(() => {
    const targetIds = new Set(notifications.map((n) => n.id));
    saveNotifications(
      allNotifications.map((n) => (targetIds.has(n.id) ? { ...n, isRead: true } : n))
    );
  }, [allNotifications, notifications, saveNotifications]);

  const removeNotification = useCallback(
    (id: string) =>
      saveNotifications(allNotifications.filter((n) => n.id !== id)),
    [allNotifications, saveNotifications]
  );

  const clearAll = useCallback(() => {
    const targetIds = new Set(notifications.map((n) => n.id));
    saveNotifications(allNotifications.filter((n) => !targetIds.has(n.id)));
  }, [allNotifications, notifications, saveNotifications]);

  const addNotification = useCallback(
    (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
      const newItem: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      saveNotifications([newItem, ...allNotifications]);
    },
    [allNotifications, saveNotifications]
  );

  const refresh = useCallback(() => setAllNotifications(loadInitialNotifications()), []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    addNotification,
    refresh,
  };
};
