// [Layer: Shared/Components]
// KatipunanLogo.tsx -- Unified, zero-latency vector icon and brand emblem component.
// Replaces fragile external Googleusercontent URLs with responsive, offline-first Katipunan icon branding.
// Supports Landing, Customer, Cashier, Admin, Auth, and Footer contexts.
// DO NOT put direct API calls or page-level state here.

import React from 'react';
import { Link } from 'react-router-dom';

export type KatipunanLogoVariant = 'landing' | 'customer' | 'cashier' | 'admin' | 'auth' | 'footer';

export interface KatipunanLogoProps {
  variant?: KatipunanLogoVariant;
  collapsed?: boolean;
  to?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const KatipunanLogo: React.FC<KatipunanLogoProps> = ({
  variant = 'landing',
  collapsed = false,
  to,
  onClick,
  className = '',
  showSubtitle = true,
  size = 'md',
}) => {
  // Dimension tokens based on size prop
  const iconBoxSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl',
  };

  const iconTextSizes = {
    sm: 'text-[18px]',
    md: 'text-[20px]',
    lg: 'text-[24px]',
  };

  // Variant-specific styling presets
  const variantStyles = {
    landing: {
      badge: 'bg-primary text-white shadow-sm ring-1 ring-primary/20 hover:scale-105 transition-transform',
      symbol: 'local_library',
      title: 'Katipuneros Library Store',
      titleClass: 'font-headline-4 text-headline-4 text-text-primary tracking-tight font-semibold',
      subtitle: '',
      subtitleClass: '',
      defaultTo: '/#home',
    },
    customer: {
      badge: 'bg-secondary-container text-primary border border-primary/20 shadow-sm hover:scale-105 transition-transform',
      symbol: 'local_library',
      title: 'Katipuneros',
      titleClass: 'font-headline-4 text-headline-4 text-text-primary leading-tight font-bold',
      subtitle: 'Academic & Digital Stacks',
      subtitleClass: 'font-caption text-caption text-text-secondary',
      defaultTo: '/customer/home',
    },
    cashier: {
      badge: 'bg-white/10 text-white border border-white/20 shadow-sm relative',
      symbol: 'local_library',
      title: 'Katipuneros',
      titleClass: 'font-headline-4 text-[14px] font-bold text-white leading-tight truncate',
      subtitle: 'Cashier Terminal • Desk 01',
      subtitleClass: 'font-caption text-[10.5px] text-[#D9EEF5]/80 leading-tight truncate',
      extraSubtitle: 'Library Store',
      defaultTo: '/cashier/checkout',
      statusDot: {
        icon: 'point_of_sale',
        color: 'text-action-green bg-[#123B5D] border-white/20',
        title: 'Active Cashier Session',
      },
    },
    admin: {
      badge: 'bg-[#113E4F]/90 text-white border border-white/20 shadow-sm relative',
      symbol: 'local_library',
      title: 'KATIPUNEROS',
      titleClass: 'font-headline-4 text-[13px] font-bold text-white tracking-tight leading-tight truncate',
      subtitle: 'Library Store',
      subtitleClass: 'font-caption text-[11px] text-white/70 uppercase tracking-wider',
      defaultTo: '/admin/dashboard',
      statusDot: {
        icon: 'shield_person',
        color: 'text-[#9BE564] bg-[#164E63] border-white/20',
        title: 'Active Administrator Session',
      },
    },
    auth: {
      badge: 'bg-secondary-container text-primary shadow-sm hover:scale-105 transition-transform',
      symbol: 'menu_book',
      title: 'Katipuneros Library',
      titleClass: 'font-headline-4 text-headline-4 text-text-primary font-bold',
      subtitle: 'Circulation & Knowledge System',
      subtitleClass: 'font-caption text-caption text-text-secondary',
      defaultTo: '/',
    },
    footer: {
      badge: 'bg-white/10 text-white border border-white/20 shadow-sm',
      symbol: 'local_library',
      title: 'Katipuneros Library Store',
      titleClass: 'font-headline-4 text-headline-4 text-white tracking-tight font-semibold',
      subtitle: 'Preserving Heritage • Empowering Scholars',
      subtitleClass: 'font-caption text-caption text-white/70',
      defaultTo: '/',
    },
  };

  const current = variantStyles[variant];
  const targetLink = to !== undefined ? to : current.defaultTo;

  const content = (
    <div className={`flex items-center gap-space-sm shrink-0 select-none ${className}`}>
      {/* Visual Katipunan Icon Badge */}
      <div
        className={`${iconBoxSizes[size]} ${current.badge} flex items-center justify-center shrink-0 flex-shrink-0 transition-all`}
        aria-label="Katipunan Icon"
      >
        <span
          className={`material-symbols-outlined ${iconTextSizes[size]} leading-none flex items-center justify-center`}
        >
          {current.symbol}
        </span>

        {/* Optional Status Indicator Badge (Admin / Cashier) */}
        {'statusDot' in current && current.statusDot && (
          <span
            className={`material-symbols-outlined text-[11px] ${current.statusDot.color} absolute -bottom-1 -right-1 rounded-full p-0.5 border shadow-sm`}
            title={current.statusDot.title}
          >
            {current.statusDot.icon}
          </span>
        )}
      </div>

      {/* Brand Typography (Hidden when sidebar is collapsed) */}
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className={current.titleClass}>{current.title}</span>
          {showSubtitle && current.subtitle && (
            <span className={current.subtitleClass}>{current.subtitle}</span>
          )}
          {showSubtitle && 'extraSubtitle' in current && current.extraSubtitle && (
            <span className="font-caption text-[10px] text-white/60 uppercase tracking-wider leading-tight truncate">
              {current.extraSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (targetLink && targetLink.startsWith('/#')) {
    return (
      <a href={targetLink} onClick={onClick} className="cursor-pointer group flex items-center">
        {content}
      </a>
    );
  }

  if (targetLink) {
    return (
      <Link to={targetLink} onClick={onClick} className="cursor-pointer group flex items-center">
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={onClick ? 'cursor-pointer group flex items-center' : ''}>
      {content}
    </div>
  );
};
