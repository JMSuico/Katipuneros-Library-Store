// [Layer: Shared]
// DefaultFloatingModalCard.tsx -- Standard floating glassmorphic modal wrapper primitive.
// DO NOT put business logic or API calls here.
import { FC, ReactNode } from 'react';

interface DefaultFloatingModalCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export const DefaultFloatingModalCard: FC<DefaultFloatingModalCardProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full ${maxWidth} bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant/20 bg-surface-container-low/50">
          <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-space-lg overflow-y-auto max-h-[75vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-space-lg py-space-md border-t border-outline-variant/20 bg-surface-container-low/40 flex items-center justify-end gap-space-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
