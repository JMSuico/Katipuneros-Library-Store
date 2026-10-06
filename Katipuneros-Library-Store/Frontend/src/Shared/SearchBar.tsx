// [Layer: Shared]
// SearchBar.tsx -- Universal glassmorphic search bar component with shortcut pill, clear button, and input debouncing.
// Reusable across Admin, Cashier, and Customer panels.
// DO NOT put business logic or API calls here.

import React, { FC } from 'react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  shortcutKey?: string;
  autoFocus?: boolean;
}

export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search records...',
  className = '',
  shortcutKey = '⌘K',
  autoFocus = false,
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[20px] pointer-events-none select-none">
        search
      </span>
      <input
        type="text"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-low pl-11 pr-14 py-2.5 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 transition-all shadow-inner border border-outline-variant/15"
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded-full transition-colors cursor-pointer"
          title="Clear search"
          aria-label="Clear search input"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      ) : shortcutKey ? (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-caption text-[11px] bg-surface-container px-2 py-0.5 rounded text-text-secondary tracking-wide select-none pointer-events-none border border-outline-variant/10">
          {shortcutKey}
        </span>
      ) : null}
    </div>
  );
};

export { useDebounce } from '../Hooks/useDebounce';
