// [Layer: Hooks]
// useNotifications.ts -- Notification counter and unread tracking hook.
// DO NOT put UI rendering or direct API requests here.
import { useState, useCallback } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'success' | 'danger';
}

export function useNotifications(initialList: AppNotification[] = []) {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialList);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
