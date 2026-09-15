// [Layer: UserRoles/Features/Pages/CustomersPanel/Shared]
// CustomerButton.tsx -- Customer-scoped primary, secondary, and ghost action button.
// DO NOT put business logic or API calls here.
import { FC, ButtonHTMLAttributes, ReactNode } from 'react';

interface CustomerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  children: ReactNode;
}

export const CustomerButton: FC<CustomerButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}) => {
  const base =
    'h-11 px-5 rounded-full font-body-medium text-small font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50';

  const styles = {
    primary: 'bg-action-green hover:bg-action-green-hover text-text-primary',
    secondary: 'bg-primary hover:bg-primary-container text-on-primary',
    outline: 'border border-outline-variant bg-surface hover:bg-surface-container text-text-primary',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default CustomerButton;
