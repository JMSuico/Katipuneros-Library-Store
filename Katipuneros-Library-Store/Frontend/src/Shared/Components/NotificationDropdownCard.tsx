// [Layer: Shared/Components]
// NotificationDropdownCard.tsx -- Reusable floating notification card for panel headers.
// Renders descending notifications list, unread counters, mark-read actions, and route navigation.
// Universal component across AdminTopBar, CashierTopBar, and CustomerHeader.
// DO NOT put direct backend API fetch calls here.

import React, { FC, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem, formatRelativeTime } from '../../Hooks/useNotification';

export interface NotificationDropdownCardProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  panelLabel?: string;
  viewAllRoute?: string;
}

const severityIconMap: Record<string, { icon: string; bg: string; text: string }> = {
  success: { icon: 'check_circle', bg: 'bg-action-green/15', text: 'text-action-green' },
  warning: { icon: 'warning', bg: 'bg-amber-500/15', text: 'text-amber-500' },
  danger: { icon: 'error', bg: 'bg-status-danger/15', text: 'text-status-danger' },
  info: { icon: 'info', bg: 'bg-soft-blue', text: 'text-primary' },
};

export const NotificationDropdownCard: FC<NotificationDropdownCardProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  panelLabel = 'Notifications',
  viewAllRoute,
}) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={cardRef}
      className="absolute right-0 top-12 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-surface-container-high rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container-high bg-surface-container-low/60">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
          <h3 className="font-small text-small font-bold text-text-primary">{panelLabel}</h3>
          {unreadCount > 0 && (
            <span className="bg-primary text-white font-caption text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-caption text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List (Descending Order) */}
      <div className="max-h-80 overflow-y-auto divide-y divide-surface-container-high/60">
        {notifications.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-text-secondary text-4xl mb-2 opacity-50">
              notifications_paused
            </span>
            <p className="font-small text-small font-semibold text-text-primary">All caught up!</p>
            <p className="font-caption text-caption text-text-secondary mt-0.5">
              No recent notifications or alerts at this time.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const config = severityIconMap[item.type] || severityIconMap.info;
            return (
              <div
                key={item.id}
                className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-surface-container-low/80 ${
                  !item.isRead ? 'bg-soft-blue/20' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full ${config.bg} ${config.text} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`font-small text-small leading-snug truncate ${
                        !item.isRead ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-caption text-text-secondary shrink-0">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <p className="font-caption text-[11.5px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {item.actionUrl && item.actionLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          onMarkAsRead(item.id);
                          onClose();
                          navigate(item.actionUrl!);
                        }}
                        className="text-[11px] font-caption font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>{item.actionLabel}</span>
                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                      </button>
                    )}

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => onMarkAsRead(item.id)}
                        className="text-[11px] font-caption text-text-secondary hover:text-text-primary cursor-pointer ml-auto"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-surface-container-high bg-surface-container-low/40 flex items-center justify-between">
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-caption text-text-secondary hover:text-status-danger cursor-pointer"
          >
            Clear all
          </button>
        )}

        {viewAllRoute ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(viewAllRoute);
            }}
            className="text-[11px] font-caption font-bold text-primary hover:underline cursor-pointer ml-auto"
          >
            View all alerts
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-caption font-semibold text-text-secondary hover:text-text-primary cursor-pointer ml-auto"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
