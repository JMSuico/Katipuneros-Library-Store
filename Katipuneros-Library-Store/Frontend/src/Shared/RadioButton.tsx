// [Layer: Shared]
// RadioButton.tsx -- Universal atomic RadioButton and RadioGroup primitives for Katipuneros Library Store.
// Accessible across Landing Pages, Customer, Cashier, and Admin panels.
// DO NOT put business logic or API calls here.

import { FC, InputHTMLAttributes, ReactNode } from 'react';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: ReactNode;
}

export const RadioButton: FC<RadioButtonProps> = ({
  label,
  description,
  checked,
  disabled,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (typeof label === 'string' ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none transition-opacity ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="radio"
          id={inputId}
          checked={checked}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className="w-4 h-4 rounded-full border border-outline-variant/50 bg-surface-container-lowest peer-checked:border-primary peer-checked:bg-primary transition-all duration-150 flex items-center justify-center shadow-xs peer-focus:ring-2 peer-focus:ring-primary/30">
          <div className="w-1.5 h-1.5 rounded-full bg-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col text-small font-small">
          {label && <span className={`font-semibold ${checked ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</span>}
          {description && <span className="font-caption text-caption text-text-secondary mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
};

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  badge?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
  direction?: 'row' | 'col';
  variant?: 'card' | 'simple';
  className?: string;
}

export const RadioGroup: FC<RadioGroupProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  label,
  direction = 'row',
  variant = 'card',
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
          {label}
        </span>
      )}

      <div className={`flex flex-wrap ${direction === 'col' ? 'flex-col' : 'flex-row'} gap-2`}>
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;

          if (variant === 'simple') {
            return (
              <RadioButton
                key={opt.value}
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                label={opt.label}
                description={opt.description}
              />
            );
          }

          return (
            <label
              key={opt.value}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-small font-small cursor-pointer transition-all duration-150 select-none ${
                isSelected
                  ? 'bg-soft-blue/50 border-primary text-primary font-bold shadow-xs'
                  : 'bg-surface-container-lowest border-outline-variant/20 text-text-secondary hover:bg-surface-container-low hover:text-text-primary'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  {opt.icon && <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {opt.description && (
                  <span className="text-caption font-caption text-text-secondary mt-0.5">
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RadioButton;
