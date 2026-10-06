// [Layer: Shared]
// SkeletonLoader.tsx -- Loading animation placeholders (line, circle, card variants).
// DO NOT put business logic or API calls here.
import { FC } from 'react';

interface SkeletonLoaderProps {
  variant?: 'line' | 'circle' | 'card' | 'rect';
  className?: string;
}

export const SkeletonLoader: FC<SkeletonLoaderProps> = ({ variant = 'line', className = '' }) => {
  if (variant === 'circle') {
    return <div className={`rounded-full bg-surface-container-high animate-pulse ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`rounded-xl bg-surface-container-lowest p-4 border border-outline-variant/30 flex flex-col gap-3 animate-pulse ${className}`}>
        <div className="h-40 bg-surface-container-high rounded-lg w-full" />
        <div className="h-4 bg-surface-container-high rounded w-3/4" />
        <div className="h-3 bg-surface-container-high rounded w-1/2" />
      </div>
    );
  }

  return <div className={`h-4 rounded bg-surface-container-high animate-pulse ${className}`} />;
};
