// [Layer: Shared]
// Switch.tsx -- Universal toggle switch presentational primitive.
// Provides accessible, smooth animated on/off toggle switch with optional label and description.
// DO NOT put business logic, API calls, or domain-specific logic here.

import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  id,
  className = '',
}) => {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const sizeClasses = {
    sm: {
      track: 'w-8 h-4.5 p-0.5',
      thumb: 'w-3.5 h-3.5',
      translate: 'translate-x-3.5',
    },
    md: {
      track: 'w-11 h-6 p-0.5',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7.5 p-1',
      thumb: 'w-6 h-6',
      translate: 'translate-x-6.5',
    },
  }[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      onClick={handleToggle}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        id={switchId}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
          sizeClasses.track
        } ${
          checked
            ? 'bg-action-green'
            : 'bg-surface-container-high dark:bg-surface-container'
        }`}
      >
        <span
          className={`inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
            sizeClasses.thumb
          } ${checked ? sizeClasses.translate : 'translate-x-0'}`}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="font-body text-small font-medium text-text-primary leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="font-caption text-caption text-text-secondary leading-normal">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Switch;
