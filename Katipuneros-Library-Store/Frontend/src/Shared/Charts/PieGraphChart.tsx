// [Layer: Shared/Charts]
// PieGraphChart.tsx -- Universal Donut and Pie Graph Visualizer.
// Supports multi-segment SVG distribution, central KPI metric summary, interactive slice hover,
// detailed legend breakdown with percentages/counts, and strict N=0 empty baseline handling.
// Strictly adheres to SKILL.md, AGENTS.md, and universal lambda expressions (=>).

import { FC, useState, useMemo, useCallback } from 'react';

export interface PieGraphSlice {
  id?: string;
  label: string;
  value: number;
  color: string;
  percentage?: number;
  count?: number;
  formattedValue?: string;
}

export interface PieGraphChartProps {
  slices: PieGraphSlice[];
  centerMetric?: string | number;
  centerLabel?: string;
  sizeClass?: string;
  donut?: boolean;
  strokeWidth?: number;
  showLegend?: boolean;
  legendLayout?: 'grid' | 'stack';
  emptyMessage?: string;
  onSliceClick?: (slice: PieGraphSlice, index: number) => void;
  className?: string;
}

export const PieGraphChart: FC<PieGraphChartProps> = ({
  slices = [],
  centerMetric,
  centerLabel = 'Total Volumes',
  sizeClass = 'w-44 h-44',
  donut = true,
  strokeWidth = 12,
  showLegend = false,
  legendLayout = 'grid',
  emptyMessage = 'No holdings recorded in catalog.',
  onSliceClick,
  className = '',
}) => {
  const [hoveredSliceIdx, setHoveredSliceIdx] = useState<number | null>(null);

  // Total sum
  const totalValue = useMemo(
    () => slices.reduce((acc, curr) => acc + (curr.value || 0), 0),
    [slices]
  );

  // Circumference for standard r=38 in 100x100 viewBox
  const radius = 38;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // Precompute segment lengths and offsets
  const computedSlices = useMemo(() => {
    let currentOffset = 0;
    return slices.map((s, idx) => {
      const pct = s.percentage ?? (totalValue > 0 ? (s.value / totalValue) * 100 : 0);
      const length = totalValue > 0 ? (s.value / totalValue) * circumference : 0;
      const offset = currentOffset;
      currentOffset -= length;

      return {
        ...s,
        computedPercentage: pct,
        dashArray: `${length.toFixed(2)} ${circumference.toFixed(2)}`,
        dashOffset: offset.toFixed(2),
        index: idx,
      };
    });
  }, [slices, totalValue, circumference]);

  const handleMouseEnter = useCallback((idx: number) => setHoveredSliceIdx(idx), []);
  const handleMouseLeave = useCallback(() => setHoveredSliceIdx(null), []);

  const displayCenterMetric = useMemo(() => {
    if (centerMetric !== undefined) return centerMetric;
    return totalValue.toLocaleString();
  }, [centerMetric, totalValue]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Visual Chart Graphic */}
      <div className={`relative ${sizeClass} flex items-center justify-center my-space-xs`}>
        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
          {/* Base Background Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="text-surface-container"
            stroke="currentColor"
            strokeWidth={donut ? strokeWidth : 76}
          />

          {/* Render Active Slices */}
          {totalValue > 0 &&
            computedSlices.map((slice) => {
              if (slice.value <= 0) return null;
              const isHovered = hoveredSliceIdx === slice.index;

              return (
                <circle
                  key={slice.id || slice.label || slice.index}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={donut ? (isHovered ? strokeWidth + 2 : strokeWidth) : 76}
                  strokeDasharray={slice.dashArray}
                  strokeDashoffset={slice.dashOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(slice.index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onSliceClick?.(slice, slice.index)}
                >
                  <title>{`${slice.label}: ${slice.formattedValue || slice.value} (${slice.computedPercentage.toFixed(1)}%)`}</title>
                </circle>
              );
            })}
        </svg>

        {/* Donut Center KPI Metric Display */}
        {donut && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
            <span className="font-headline-3 text-headline-3 font-bold text-text-primary leading-none">
              {displayCenterMetric}
            </span>
            <span className="font-caption text-caption text-text-secondary mt-1 max-w-[85%] truncate">
              {hoveredSliceIdx !== null && computedSlices[hoveredSliceIdx]
                ? `${computedSlices[hoveredSliceIdx].label} (${computedSlices[hoveredSliceIdx].computedPercentage.toFixed(0)}%)`
                : centerLabel}
            </span>
          </div>
        )}
      </div>

      {/* Empty State Fallback Warning */}
      {totalValue === 0 && (
        <span className="font-caption text-caption text-text-secondary/70 text-center mt-1">
          {emptyMessage}
        </span>
      )}

      {/* Optional Integrated Legend Breakdown */}
      {showLegend && slices.length > 0 && (
        <div
          className={`w-full mt-space-sm pt-space-xs ${
            legendLayout === 'grid' ? 'grid grid-cols-2 gap-space-xs sm:gap-space-sm' : 'flex flex-col gap-2'
          }`}
        >
          {computedSlices.map((slice) => {
            const isHovered = hoveredSliceIdx === slice.index;
            return (
              <div
                key={slice.id || slice.label || slice.index}
                onMouseEnter={() => handleMouseEnter(slice.index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onSliceClick?.(slice, slice.index)}
                className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
                  isHovered ? 'bg-surface-container-low' : 'hover:bg-surface-container-low/50'
                }`}
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-caption text-caption text-text-secondary truncate">
                    {slice.label}
                  </span>
                </div>
                <span className="font-small text-small font-bold text-text-primary font-mono ml-2">
                  {slice.computedPercentage.toFixed(0)}%{' '}
                  <span className="font-normal text-text-secondary text-[11px]">
                    ({slice.count !== undefined ? slice.count.toLocaleString() : slice.value.toLocaleString()})
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
