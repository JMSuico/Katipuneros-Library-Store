// [Layer: Shared/Utils]
// notificationBus.ts -- Unified cross-portal notification bus for real-time circulation alerts.
// Connects Customer, Cashier, and Admin portals across tabs and frames.
// DO NOT put UI rendering or backend API calls here.

export interface CirculationNotificationEvent {
  id: string;
  type: 'borrow_confirmed' | 'return_confirmed';
  reference: string;
  title: string;
  patronName: string;
  timestamp: string;
  message: string;
  recipientRoles: ('Customer' | 'Cashier' | 'Admin')[];
}

const STORAGE_NOTIF_KEY = 'kls_latest_notification';
const GLOBAL_STORAGE_KEY = 'katipuneros_global_notifications_v1';

/**
 * Dispatches a real-time circulation notification event across all listening tabs and components.
 */
export const dispatchCirculationNotification = (event: CirculationNotificationEvent): void => {
  try {
    const payload = JSON.stringify(event);
    localStorage.setItem(STORAGE_NOTIF_KEY, payload);

    // Dispatch custom event in current window
    window.dispatchEvent(
      new CustomEvent<CirculationNotificationEvent>('kls_notification_received', {
        detail: event,
      })
    );

    // Synchronize to global notifications storage for top navigation bell dropdowns
    try {
      const raw = localStorage.getItem(GLOBAL_STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const newGlobalItems = event.recipientRoles.map((role) => ({
        id: `${event.id}-${role.toLowerCase()}-${Date.now().toString(36)}`,
        title:
          event.type === 'borrow_confirmed'
            ? `Circulation: ${event.title} Checked Out`
            : `Circulation: ${event.title} Returned`,
        message:
          event.message ||
          `Patron ${event.patronName} (Reference: ${event.reference})`,
        timestamp: event.timestamp || new Date().toISOString(),
        isRead: false,
        type: event.type === 'borrow_confirmed' ? 'info' : 'success',
        roleTarget: role,
        actionUrl:
          role === 'Admin'
            ? '/admin/returns'
            : role === 'Cashier'
            ? '/cashier/notifications'
            : '/customer/borrowings',
        actionLabel: role === 'Customer' ? 'My Borrowings' : 'View Circulation',
      }));

      const merged = [...newGlobalItems, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(
        new CustomEvent('katipuneros-notification-event', { detail: merged })
      );
    } catch {
      // Storage quota or parsing guard
    }
  } catch (err) {
    console.error('[NotificationBus] Failed to dispatch circulation notification:', err);
  }
};

/**
 * Subscribes a listener to circulation notification events across local window and other browser tabs.
 * Returns an unsubscribe callback for clean unmounting.
 */
export const listenCirculationNotifications = (
  callback: (event: CirculationNotificationEvent) => void
): (() => void) => {
  const handleLocal = (e: Event) => {
    const custom = e as CustomEvent<CirculationNotificationEvent>;
    if (custom?.detail) {
      callback(custom.detail);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_NOTIF_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as CirculationNotificationEvent;
        if (parsed && parsed.type) {
          callback(parsed);
        }
      } catch {
        // Parsing guard
      }
    }
  };

  const handleLegacyBorrow = (e: Event) => {
    const custom = e as CustomEvent<{
      reference?: string;
      title?: string;
      patronName?: string;
      dueDate?: string;
      message?: string;
    }>;
    if (custom?.detail) {
      const detail = custom.detail;
      const ref = detail.reference || `KP-TXN-${Date.now().toString().slice(-8)}`;
      callback({
        id: `notif-circ-borrow-${Date.now()}`,
        type: 'borrow_confirmed',
        reference: ref,
        title: detail.title || 'Book Title',
        patronName: detail.patronName || 'Patron Scholar',
        timestamp: new Date().toISOString(),
        message:
          detail.message ||
          `Checkout confirmed for "${detail.title || 'Book'}" by ${detail.patronName || 'Patron'}. Gate Pass Ref: ${ref}`,
        recipientRoles: ['Customer', 'Cashier', 'Admin'],
      });
    }
  };

  const handleLegacyReturn = (e: Event) => {
    const custom = e as CustomEvent<{
      reference?: string;
      title?: string;
      patronName?: string;
      fine?: number;
      message?: string;
    }>;
    if (custom?.detail) {
      const detail = custom.detail;
      const ref = detail.reference || `KP-RET-${Date.now().toString().slice(-8)}`;
      callback({
        id: `notif-circ-return-${Date.now()}`,
        type: 'return_confirmed',
        reference: ref,
        title: detail.title || 'Book Title',
        patronName: detail.patronName || 'Patron Scholar',
        timestamp: new Date().toISOString(),
        message:
          detail.message ||
          `Return processed for "${detail.title || 'Book'}" from ${detail.patronName || 'Patron'}. Ref: ${ref}`,
        recipientRoles: ['Customer', 'Cashier', 'Admin'],
      });
    }
  };

  window.addEventListener('kls_notification_received', handleLocal);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('circulation-borrow-confirmed', handleLegacyBorrow);
  window.addEventListener('circulation-return-confirmed', handleLegacyReturn);

  return () => {
    window.removeEventListener('kls_notification_received', handleLocal);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('circulation-borrow-confirmed', handleLegacyBorrow);
    window.removeEventListener('circulation-return-confirmed', handleLegacyReturn);
  };
};
