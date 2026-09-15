// [Layer: UserRoles/Features/Pages/CashiersPanel/Shared]
// CashierModalCard.tsx -- Cashier-scoped modal card dialog container.
// DO NOT put business logic or API calls here.
import { FC, ReactNode } from 'react';

interface CashierModalCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const CashierModalCard: FC<CashierModalCardProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low">
          <div>
            <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">{title}</h3>
            {subtitle && <p className="font-caption text-caption text-text-secondary">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default CashierModalCard;
