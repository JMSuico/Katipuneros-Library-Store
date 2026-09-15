// [Layer: UserRoles/Features/Pages/CustomersPanel/Shared]
// CustomerModalCard.tsx -- Customer-scoped floating modal card container.
// DO NOT put business logic or API calls here.
import { FC, ReactNode } from 'react';

interface CustomerModalCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const CustomerModalCard: FC<CustomerModalCardProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="max-w-lg w-full bg-white/95 rounded-3xl p-6 shadow-2xl relative border border-outline-variant/30">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
          <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default CustomerModalCard;
