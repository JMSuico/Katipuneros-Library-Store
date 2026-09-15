// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// AdminModalCard.tsx -- Admin-scoped modal wrapper primitive.
// DO NOT put business logic or direct API calls here.
import { FC, ReactNode } from 'react';

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18323D]/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-surface-container-lowest rounded-3xl shadow-2xl w-full ${maxWidth} overflow-hidden border border-surface-container-high transition-all transform scale-100 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-surface-container-high bg-surface-container-low/60">
          <div className="flex flex-col">
            <h3 className="font-headline-4 text-headline-4 font-bold text-primary">
              {title}
            </h3>
            {subtitle && (
              <span className="font-caption text-caption text-text-secondary mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-space-lg overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-space-lg py-space-md border-t border-surface-container-high bg-surface-container-low/40 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModalCard;
