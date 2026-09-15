// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// NotificationUI.tsx -- Admin notification panel UI component.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

export interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  read: boolean;
}

interface NotificationUIProps {
  notifications: AdminNotificationItem[];
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationUI: FC<NotificationUIProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const typeStyles = {
    info: 'bg-soft-blue text-primary border-primary/20',
    warning: 'bg-status-pending/15 text-status-pending border-status-pending/30',
    danger: 'bg-error-container text-error border-error/20',
    success: 'bg-action-green/20 text-text-primary border-action-green/30',
  };

  const typeIcons = {
    info: 'info',
    warning: 'warning',
    danger: 'error',
    success: 'check_circle',
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
      <div className="px-5 py-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">notifications</span>
          <h3 className="font-body-large text-body-large font-bold text-text-primary">
            System Alerts &amp; Notifications
          </h3>
          <span className="bg-primary text-on-primary text-caption font-bold px-2 py-0.5 rounded-full">
            {notifications.filter((n) => !n.read).length} Unread
          </span>
        </div>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-caption font-caption text-text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="divide-y divide-surface-container-high max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-text-secondary font-small">
            No active notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkAsRead?.(notif.id)}
              className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                notif.read
                  ? 'bg-surface-container-lowest opacity-75 hover:opacity-100'
                  : 'bg-soft-blue/15 hover:bg-soft-blue/30'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  typeStyles[notif.type]
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {typeIcons[notif.type]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-body-medium text-body-medium font-bold text-text-primary truncate">
                    {notif.title}
                  </h4>
                  <span className="font-caption text-caption text-text-secondary whitespace-nowrap">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="font-small text-small text-text-secondary mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
              </div>
              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-action-green flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationUI;
