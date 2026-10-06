// [Layer: UserRoles/Features/Pages/CashiersPanel/Shared]
// CashierModalCard.tsx -- Delegates to the global DefaultFloatingModalCard primitive.
// Maintains backward compatibility with all cashier features.
// DO NOT put business logic or API calls here.

import { FC, ReactNode } from 'react';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';

interface CashierModalCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export const CashierModalCard: FC<CashierModalCardProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-xl',
}) => {
  return (
    <DefaultFloatingModalCard
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      maxWidth={maxWidth}
    >
      {subtitle && (
        <p className="font-caption text-caption text-text-secondary mb-3 -mt-1">
          {subtitle}
        </p>
      )}
      {children}
    </DefaultFloatingModalCard>
  );
};

export default CashierModalCard;
