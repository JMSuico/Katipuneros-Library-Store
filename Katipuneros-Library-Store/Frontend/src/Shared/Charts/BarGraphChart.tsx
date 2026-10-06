// [Layer: Shared/Charts]
// BarGraphChart.tsx -- Universal Interactive Bar Graph Visualizer.
// Supports vertical and horizontal layouts, percentage/metric scaling, peak/highlight states,
// adaptive hover states with value tooltips, and strict N=0 empty baseline handling.
// Strictly adheres to SKILL.md, AGENTS.md, and universal lambda expressions (=>).

import { FC, useState, useMemo, useCallback } from 'react';

export interface BarGraphItem {
  id?: string;
  label: string;
  value: number;
  formattedValue?: string;
  percentage?: number;
  color?: string;
  isHighlighted?: boolean;
  tooltip?: string;
  subLabel?: string;
}

export interface BarGraphChartProps {
  items: BarGraphItem[];
  orientation?: 'vertical' | 'horizontal';
  heightClass?: string;
  barColor?: string;
  highlightColor?: string;
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  maxValue?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  onBarClick?: (item: BarGraphItem, index: number) => void;
  className?: string;
}

export const BarGraphChart: FC<BarGraphChartProps> = ({
  items = [],
  orientation = 'vertical',
  heightClass = 'h-36',
  barColor = 'bg-primary/80 hover:bg-primary',
  highlightColor = 'bg-primary hover:bg-action-green',
  showLabels = true,
  showValues = true,
  showPercentages = false,
  maxValue,
  emptyTitle = 'No Circulation Activity Recorded',
  emptyDescription = 'Real-time circulation and demand metrics will dynamically render as catalog volumes circulate.',
  emptyIcon = 'bar_chart',
  onBarClick,
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute maximum value for scaling
  const effectiveMax = useMemo(() => {
    if (maxValue && maxValue > 0) return maxValue;
    const computed = Math.max(...items.map((i) => i.value), 0);
    return computed > 0 ? computed : 100;
  }, [items, maxValue]);

  // Total check for N=0 validation
  const totalSum = useMemo(
    () => items.reduce((acc, curr) => acc + (curr.value || 0), 0),
    [items]
  );

  const handleMouseEnter = useCallback((idx: number) => setHoveredIdx(idx), []);
  const handleMouseLeave = useCallback(() => setHoveredIdx(null), []);

  if (items.length === 0 || totalSum === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center text-text-secondary gap-1 select-none ${className}`}>
        <span className="material-symbols-outlined text-[32px] text-text-secondary/40">{emptyIcon}</span>
        <span className="font-small font-semibold text-text-primary">{emptyTitle}</span>
        <span className="text-[11px] text-text-secondary max-w-xs">{emptyDescription}</span>
      </div>
    );
  }

  if (orientation === 'horizontal') {
    return (
      <div className={`w-full flex flex-col gap-2.5 py-1 ${className}`}>
        {items.map((item, idx) => {
          const ratio = Math.max(0, Math.min(100, (item.value / effectiveMax) * 100));
          const pct = item.percentage ?? Math.round((item.value / (totalSum || 1)) * 100);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.id || item.label || idx}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onBarClick?.(item, idx)}
              className="group flex flex-col gap-1 cursor-pointer"
            >
              <div className="flex items-center justify-between font-caption text-caption">
                <span className={`font-semibold transition-colors ${isHovered ? 'text-primary' : 'text-text-primary'}`}>
                  {item.label}
                </span>
                <span className="text-text-secondary font-mono">
                  {item.formattedValue || item.value}
                  {showPercentages ? ` (${pct}%)` : ''}
                </span>
              </div>
              <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.isHighlighted ? highlightColor : item.color || barColor
                  }`}
                  style={{ width: `${Math.max(4, ratio)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical Orientation (Standard Histogram)
  return (
    <div className={`w-full flex flex-col justify-end select-none ${className}`}>
      <div className={`flex items-end justify-between gap-2 sm:gap-3 px-1 w-full ${heightClass}`}>
        {items.map((item, idx) => {
          const ratio = Math.max(0, Math.min(100, (item.value / effectiveMax) * 100));
          const pct = item.percentage ?? Math.round((item.value / (totalSum || 1)) * 100);
          const isHovered = hoveredIdx === idx;
          const displayVal = showPercentages ? `${pct}%` : item.formattedValue || `${item.value}`;

          return (
            <div
              key={item.id || item.label || idx}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onBarClick?.(item, idx)}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
              title={item.tooltip || `${item.label}: ${item.formattedValue || item.value} (${pct}%)`}
            >
              {/* Value Header on Top of Bar */}
              {showValues && (
                <span
                  className={`font-caption text-[11px] font-bold transition-transform ${
                    isHovered ? 'scale-110 text-primary' : 'text-text-secondary'
                  }`}
                  style={item.color ? { color: item.color } : undefined}
                >
                  {displayVal}
                </span>
              )}

              {/* Vertical Bar Graphic */}
              <div
                className={`w-full rounded-t-lg transition-all duration-200 shadow-xs ${
                  item.isHighlighted ? highlightColor : item.color ? '' : barColor
                }`}
                style={{
                  height: `${Math.max(6, ratio)}%`,
                  backgroundColor: item.color ? item.color : undefined,
                }}
              />

              {/* Category Label Underneath */}
              {showLabels && (
                <span
                  className={`font-caption text-[11px] truncate w-full text-center transition-colors ${
                    isHovered ? 'font-bold text-primary' : 'text-text-secondary'
                  }`}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
