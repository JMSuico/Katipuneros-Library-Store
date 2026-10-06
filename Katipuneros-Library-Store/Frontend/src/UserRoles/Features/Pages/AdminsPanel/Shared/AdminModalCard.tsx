// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// AdminModalCard.tsx -- Delegates to the global DefaultFloatingModalCard primitive.
// Maintains backward compatibility with all admin features.
// DO NOT put business logic or direct API calls here.

import { FC, ReactNode } from 'react';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';

interface AdminModalCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export const AdminModalCard: FC<AdminModalCardProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-2xl',
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
