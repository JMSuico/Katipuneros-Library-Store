// [Layer: Shared]
// Button.tsx -- Universal styled button primitive for Katipuneros Library Store.
// Accessible across Landing Pages, Customer, Cashier, and Admin panels.
// Supports design tokens, variants, sizes, icon integration, and loading states.
// DO NOT put business logic or API calls here.

import { FC, ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'action-green'
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'soft-blue';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-body-medium font-semibold rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-caption gap-1 rounded-lg',
    sm: 'px-3.5 py-1.5 text-small font-small gap-1.5 rounded-xl',
    md: 'px-4 py-2.5 text-body-medium gap-2 rounded-xl',
    lg: 'px-6 py-3 text-body-large gap-2.5 rounded-2xl',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-on-primary hover:bg-primary-container shadow-sm focus:ring-primary/40',
    secondary:
      'bg-surface-container text-text-primary hover:bg-surface-container-high shadow-xs focus:ring-surface-container-high',
    'action-green':
      'bg-action-green text-text-primary hover:bg-action-green-hover shadow-sm font-bold focus:ring-action-green/40',
    danger:
      'bg-status-danger text-white hover:bg-error shadow-sm focus:ring-status-danger/40',
    ghost:
      'bg-transparent text-text-secondary hover:bg-surface-container hover:text-text-primary focus:ring-surface-container',
    outline:
      'bg-transparent border border-outline-variant/30 text-text-primary hover:bg-surface-container-low hover:border-outline-variant focus:ring-primary/20',
    'soft-blue':
      'bg-soft-blue text-primary hover:bg-secondary-fixed font-bold focus:ring-primary/30',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon && iconPosition === 'left' ? (
        <span className="material-symbols-outlined text-[1.15em] leading-none">{icon}</span>
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && icon && iconPosition === 'right' ? (
        <span className="material-symbols-outlined text-[1.15em] leading-none">{icon}</span>
      ) : null}
    </button>
  );
};

export default Button;
