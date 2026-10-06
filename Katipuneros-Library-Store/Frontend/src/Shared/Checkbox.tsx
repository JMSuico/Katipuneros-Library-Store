// [Layer: Shared]
// Checkbox.tsx -- Accessible, theme-styled Checkbox primitive with checked, unchecked, and indeterminate support.
// Universal component for table headers, item rows, filters, and batch selection.
// DO NOT put feature-specific or API business logic here.

import React, { FC, useEffect, useRef } from 'react';

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  id?: string;
}

export const Checkbox: FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  className = '',
  ariaLabel,
  id,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange?.(e.target.checked);
  };

  const isActive = checked || indeterminate;

  return (
    <label
      className={`inline-flex items-center gap-2 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          aria-label={ariaLabel}
          className="peer sr-only"
        />
        <div
          className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center ${
            isActive
              ? 'bg-primary border-primary text-white shadow-xs'
              : 'bg-surface-container-lowest border-surface-container-highest hover:border-primary/50 text-transparent'
          } ${disabled ? 'bg-surface-container-high border-surface-container-high' : ''}`}
        >
          {indeterminate ? (
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          ) : (
            <svg
              className={`w-3 h-3 text-white transition-transform duration-150 ${
                checked ? 'scale-100' : 'scale-0'
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className="font-body text-small text-text-primary leading-tight">
          {label}
        </span>
      )}
    </label>
  );
};
