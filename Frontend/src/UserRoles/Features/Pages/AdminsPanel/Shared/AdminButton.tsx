// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// AdminButton.tsx -- Admin-scoped styled action button primitive.
// DO NOT put business logic or API calls here.
import { FC, ButtonHTMLAttributes, ReactNode } from 'react';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'action-green' | 'danger' | 'ghost' | 'secondary';
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AdminButton: FC<AdminButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-body-medium rounded-xl transition-all duration-200 cursor-pointer select-none font-semibold disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-small font-small rounded-lg',
    md: 'px-4 py-2 text-body-medium rounded-xl',
    lg: 'px-5 py-3 text-body-large rounded-2xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-primary text-on-primary hover:bg-primary-container shadow-sm active:scale-98',
    'action-green':
      'bg-action-green text-text-primary hover:bg-action-green-hover shadow-md font-bold active:scale-98',
    danger:
      'bg-status-danger text-on-primary hover:bg-error shadow-sm active:scale-98',
    ghost:
      'bg-transparent text-text-secondary hover:bg-surface-container hover:text-text-primary',
    secondary:
      'bg-surface-container hover:bg-surface-container-high text-text-primary shadow-xs',
  }[variant];

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default AdminButton;
