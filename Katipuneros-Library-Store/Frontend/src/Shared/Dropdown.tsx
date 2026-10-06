// [Layer: Shared]
// Dropdown.tsx -- Universal generic Dropdown component and floating menu panel layout.
// Accessible across Landing Pages, Customer, Cashier, and Admin panels.
// Supports custom trigger, icons, badges, click-outside auto-close, and keyboard access.
// Optional `searchable` mode renders a search bar above the options (combobox / select-with-search),
// and `fullWidth` renders a form-field style trigger that stretches to its container.
// DO NOT put business logic or API calls here.

import { FC, ReactNode, useState, useRef, useEffect, useCallback, useMemo } from 'react';

export interface DropdownItem<T = string> {
  id?: string;
  value: T;
  label: string;
  icon?: string;
  badge?: string | number;
  description?: string;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps<T = string> {
  items: DropdownItem<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
  trigger?: ReactNode | ((isOpen: boolean, selectedItem?: DropdownItem<T>) => ReactNode);
  label?: string;
  icon?: string;
  placeholder?: string;
  align?: 'left' | 'right';
  className?: string;
  menuWidth?: string;
  disabled?: boolean;
  direction?: 'down' | 'up' | 'auto';
  variant?: 'default' | 'pagination';
  /** Renders a search bar inside the menu that filters items by label/description. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Stretch trigger + menu to the container width (form-field style). */
  fullWidth?: boolean;
  /** Accessible id for the trigger button (useful for <label htmlFor>). */
  id?: string;
}

export function Dropdown<T = string>({
  items,
  selectedValue,
  onSelect,
  trigger,
  label,
  icon,
  placeholder = 'Select option...',
  align = 'left',
  className = '',
  menuWidth,
  disabled = false,
  direction,
  variant = 'default',
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No matching options',
  fullWidth = false,
  id,
}: DropdownProps<T>) {
  const isPagination = variant === 'pagination';
  const effectiveDirection = direction ?? (isPagination ? 'up' : 'auto');
  const effectiveMenuWidth = fullWidth ? 'w-full' : menuWidth ?? (isPagination ? 'w-20' : 'w-52');

  const [isOpen, setIsOpen] = useState(false);
  const [actualDirection, setActualDirection] = useState<'down' | 'up'>(effectiveDirection === 'up' ? 'up' : 'down');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtered items for searchable mode
  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false)
    );
  }, [items, query, searchable]);

  // Reset search when closed; focus search input when opened
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(-1);
      return;
    }
    if (searchable) {
      const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, searchable]);

  // Auto-detect direction on open if 'auto'
  useEffect(() => {
    if (!isOpen) return;
    if (effectiveDirection === 'up') {
      setActualDirection('up');
    } else if (effectiveDirection === 'down') {
      setActualDirection('down');
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setActualDirection(spaceBelow < (searchable ? 320 : 240) ? 'up' : 'down');
    }
  }, [isOpen, effectiveDirection, searchable]);

  const selectedItem = items.find((item) => item.value === selectedValue);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = useCallback(
    (item: DropdownItem<T>) => {
      if (item.disabled) return;
      onSelect(item.value);
      setIsOpen(false);
    },
    [onSelect]
  );

  // Keyboard navigation inside the search box
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(visibleItems.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = visibleItems[activeIndex >= 0 ? activeIndex : 0];
      if (target) handleSelect(target);
    }
  };

  return (
    <div className={`relative ${fullWidth ? 'block w-full' : 'inline-block'} ${className}`} ref={containerRef}>
      {/* Trigger */}
      {typeof trigger === 'function' ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)}>{trigger(isOpen, selectedItem)}</div>
      ) : trigger ? (
        <div onClick={() => !disabled && setIsOpen(!isOpen)}>{trigger}</div>
      ) : fullWidth ? (
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between gap-2 bg-surface-container-low px-3.5 py-2.5 rounded-xl text-body-sm font-body-sm text-left hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/30 select-none ${
            isOpen ? 'ring-2 ring-primary/30 border-primary/40 bg-surface-container' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="flex items-center gap-2 min-w-0">
            {(selectedItem?.icon ?? icon) && (
              <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0">
                {selectedItem?.icon ?? icon}
              </span>
            )}
            <span className={`truncate ${selectedItem ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
              {selectedItem?.label ?? placeholder}
            </span>
          </span>
          <span
            className={`material-symbols-outlined text-[18px] text-text-secondary flex-shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          >
            expand_more
          </span>
        </button>
      ) : isPagination ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg text-caption font-caption text-text-primary hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/20 select-none ${
            isOpen ? 'ring-2 ring-primary/20 bg-surface-container' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="font-semibold">{selectedItem?.label ?? String(selectedValue ?? '')}</span>
          <span
            className={`material-symbols-outlined text-[14px] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          >
            expand_more
          </span>
        </button>
      ) : (
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl text-caption font-caption text-text-secondary hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/15 select-none ${
            isOpen ? 'ring-2 ring-primary/20 bg-surface-container' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {icon && <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>}
          {label && <span>{label}:</span>}
          <span className="text-text-primary font-semibold truncate max-w-[140px]">
            {selectedItem?.label ?? placeholder}
          </span>
          <span
            className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          >
            expand_more
          </span>
        </button>
      )}

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            actualDirection === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${effectiveMenuWidth} bg-surface-container-lowest/98 backdrop-blur-xl rounded-xl shadow-2xl border border-outline-variant/20 py-1 z-50 animate-scaleUp overflow-hidden`}
        >
          {searchable && (
            <div className="px-2 pt-1.5 pb-1 border-b border-outline-variant/15">
              <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-2.5 py-1.5 border border-outline-variant/20 focus-within:ring-2 focus-within:ring-primary/25">
                <span className="material-symbols-outlined text-[16px] text-text-secondary">search</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="flex-1 min-w-0 bg-transparent outline-none border-none text-small font-small text-text-primary placeholder:text-text-secondary/70"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="material-symbols-outlined text-[16px] text-text-secondary hover:text-primary cursor-pointer"
                    aria-label="Clear search"
                  >
                    close
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto p-1 space-y-0.5 scrollbar-thin" role="listbox">
            {searchable && visibleItems.length === 0 && (
              <div className="px-3 py-3 text-center text-caption font-caption text-text-secondary">{emptyMessage}</div>
            )}
            {visibleItems.map((item, index) => {
              const isSelected = item.value === selectedValue;
              const isActive = searchable && index === activeIndex;

              if (isPagination) {
                return (
                  <button
                    key={`${item.label}-${index}`}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => handleSelect(item)}
                    className={`w-full text-center px-2 py-1.5 rounded-lg text-caption font-caption transition-colors cursor-pointer select-none font-semibold ${
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-primary text-white font-bold'
                        : 'text-text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <button
                  key={`${item.label}-${index}`}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-small font-small flex items-center justify-between transition-colors cursor-pointer select-none ${
                    item.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-soft-blue/30 text-primary font-bold'
                      : isActive
                      ? 'bg-surface-container-low text-primary ring-1 ring-primary/20'
                      : item.danger
                      ? 'text-status-danger hover:bg-status-danger/10'
                      : 'text-text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.icon && (
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          item.danger ? 'text-status-danger' : isSelected ? 'text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {item.icon}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.description && (
                        <span className="text-caption text-text-secondary text-[11px] truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
