// [Layer: Shared]
// DefaultFloatingModalCard.tsx -- Standard floating glassmorphic modal wrapper primitive.
// DO NOT put business logic or API calls here.
import { FC, ReactNode } from 'react';

export interface DefaultFloatingModalCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

const SIZE_MAP: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
};

export const DefaultFloatingModalCard: FC<DefaultFloatingModalCardProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size,
  children,
  footer,
  maxWidth,
}) => {
  if (!isOpen) return null;

  const effectiveMaxWidth = maxWidth || (size ? SIZE_MAP[size] || 'max-w-xl' : 'max-w-xl');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full ${effectiveMaxWidth} bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant/20 bg-surface-container-low/50">
          <div className="flex flex-col">
            <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">{title}</h3>
            {subtitle && (
              <p className="font-caption text-caption text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
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
