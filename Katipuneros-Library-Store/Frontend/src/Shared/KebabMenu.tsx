// [Layer: Shared]
// KebabMenu.tsx -- Universal 3-dot (more_vert) action menu for table rows and card action toolbars.
// Supports custom items (Analytics, Edit, Unpublish, Public Preview), outside-click auto-close, and keyboard access.
// DO NOT put business logic or direct API calls here.

import { FC, useState, useRef, useEffect, useCallback } from 'react';

export interface KebabMenuItem {
  id?: string;
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface KebabMenuProps {
  items: KebabMenuItem[];
  align?: 'left' | 'right';
  className?: string;
  buttonClassName?: string;
  menuWidth?: string;
  title?: string;
  disabled?: boolean;
}

export const KebabMenu: FC<KebabMenuProps> = ({
  items,
  align = 'right',
  className = '',
  buttonClassName = '',
  menuWidth = 'w-48',
  title = 'More options',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        title={title}
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={handleToggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-container transition-all ${
          isOpen ? 'bg-surface-container text-text-primary ring-2 ring-primary/20' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${buttonClassName}`}
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-50 mt-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuWidth} rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-xl py-1.5 backdrop-blur-md focus:outline-none animate-in fade-in zoom-in-95 duration-100`}
        >
          {items.map((item, index) => (
            <button
              key={item.id ?? `${item.label}-${index}`}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  handleClose();
                }
              }}
              className={`w-full px-space-md py-2 text-left font-caption text-caption font-semibold flex items-center gap-space-sm transition-colors ${
                item.danger
                  ? 'text-status-danger hover:bg-error-container/20'
                  : 'text-text-primary hover:bg-surface-container'
              } ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {item.icon && (
                <span
                  className={`material-symbols-outlined text-[18px] shrink-0 ${
                    item.danger ? 'text-status-danger' : 'text-text-secondary'
                  }`}
                >
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default KebabMenu;
