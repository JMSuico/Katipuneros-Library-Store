// [Layer: UserRoles/Features/Pages/CashiersPanel/Shared]
// CashierButton.tsx -- Cashier-scoped operational action button primitive.
// DO NOT put business logic or API calls here.
import { FC, ButtonHTMLAttributes, ReactNode } from 'react';

interface CashierButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  icon?: string;
  children: ReactNode;
}

export const CashierButton: FC<CashierButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}) => {
  const base =
    'h-11 px-4 rounded-xl font-body-medium text-small font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50';

  const styles = {
    primary: 'bg-action-green hover:bg-action-green-hover text-text-primary font-bold',
    secondary: 'bg-primary hover:bg-primary-container text-on-primary',
    accent: 'bg-surface-container hover:bg-surface-container-high text-text-primary',
    danger: 'bg-status-danger hover:bg-red-700 text-white',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default CashierButton;
