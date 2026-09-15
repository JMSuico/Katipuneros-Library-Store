// [Layer: UserRoles/Features/Pages/AdminsPanel/Components]
// StatsCard.tsx -- Admin Dashboard KPI statistics card component.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  accentColor?: string;
}

export const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  icon,
  accentColor = 'bg-primary',
}) => {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-container-high/60 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
            {title}
          </span>
          <span className="font-headline-2 text-headline-2 text-text-primary font-bold tracking-tight">
            {value}
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-soft-blue/50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0">
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-container-high/40 text-caption font-caption">
        {subtitle && (
          <span className="text-text-secondary truncate">{subtitle}</span>
        )}
        {trend && (
          <span
            className={`font-bold flex items-center gap-0.5 ml-auto ${
              trendUp ? 'text-status-available' : 'text-status-danger'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
