// [Layer: Shared/Charts]
// HeatmapChart.tsx -- Universal 2D Density Matrix / Heatmap Visualizer.
// Visualizes multi-dimensional footfall, bay saturation, and schedule distributions.
// Features: Dynamic intensity grading, interactive hover tooltips, cell highlight states, and strict N=0 baseline handling.
// Strictly adheres to SKILL.md, AGENTS.md, and universal lambda expressions (=>).

import { FC, useState, useMemo, useCallback } from 'react';

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  formattedValue?: string;
  tooltip?: string;
  meta?: Record<string, unknown>;
}

export interface HeatmapChartProps {
  rows: string[];
  cols: string[];
  cells: HeatmapCell[];
  title?: string;
  subTitle?: string;
  colorTheme?: 'primary' | 'emerald' | 'amber';
  emptyMessage?: string;
  onCellClick?: (cell: HeatmapCell) => void;
  className?: string;
}

export const HeatmapChart: FC<HeatmapChartProps> = ({
  rows = [],
  cols = [],
  cells = [],
  title,
  subTitle,
  colorTheme = 'primary',
  emptyMessage = 'No matrix density recorded for this period.',
  onCellClick,
  className = '',
}) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Maximum value for intensity normalization
  const maxVal = useMemo(() => {
    const vals = cells.map((c) => c.value);
    const m = Math.max(...vals, 0);
    return m > 0 ? m : 1;
  }, [cells]);

  // Fast lookup map for (row + '::' + col) -> cell
  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    cells.forEach((c) => map.set(`${c.row}::${c.col}`, c));
    return map;
  }, [cells]);

  // Intensity color generator
  const getCellBgClass = useCallback(
    (val: number) => {
      if (val <= 0) return 'bg-surface-container-low/60 hover:bg-surface-container text-text-secondary/40';
      const ratio = val / maxVal;
      if (colorTheme === 'emerald') {
        if (ratio < 0.25) return 'bg-action-green/20 hover:bg-action-green/30 text-text-primary';
        if (ratio < 0.5) return 'bg-action-green/40 hover:bg-action-green/50 text-text-primary';
        if (ratio < 0.75) return 'bg-action-green/70 hover:bg-action-green/80 text-text-primary';
        return 'bg-action-green hover:bg-action-green-hover text-text-primary font-bold';
      }
      if (colorTheme === 'amber') {
        if (ratio < 0.25) return 'bg-amber-100 dark:bg-amber-950/40 text-text-primary';
        if (ratio < 0.5) return 'bg-amber-300 dark:bg-amber-800/60 text-text-primary';
        if (ratio < 0.75) return 'bg-amber-500 text-white font-semibold';
        return 'bg-amber-600 text-white font-bold';
      }
      // Default: Primary (Blue/Teal)
      if (ratio < 0.25) return 'bg-soft-blue/60 hover:bg-soft-blue text-primary';
      if (ratio < 0.5) return 'bg-primary/30 hover:bg-primary/40 text-text-primary';
      if (ratio < 0.75) return 'bg-primary/70 hover:bg-primary/80 text-white font-semibold';
      return 'bg-primary hover:bg-primary-hover text-white font-bold';
    },
    [maxVal, colorTheme]
  );

  return (
    <div className={`w-full flex flex-col gap-space-sm select-none ${className}`}>
      {/* Header if provided */}
      {(title || subTitle) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <div>
            {title && <h4 className="font-headline-4 text-headline-4 font-bold text-text-primary">{title}</h4>}
            {subTitle && <p className="font-caption text-caption text-text-secondary">{subTitle}</p>}
          </div>
          {hoveredCell && (
            <div className="text-caption font-caption bg-surface-container px-2.5 py-1 rounded-lg text-primary font-semibold animate-fadeIn self-start">
              {hoveredCell.row} · {hoveredCell.col}: {hoveredCell.formattedValue || hoveredCell.value}
            </div>
          )}
        </div>
      )}

      {cells.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-text-secondary gap-1">
          <span className="material-symbols-outlined text-[32px] text-text-secondary/40">grid_view</span>
          <span className="font-small font-semibold text-text-primary">{emptyMessage}</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[500px] flex flex-col gap-1.5">
            {/* Column Headers */}
            <div className="flex items-center gap-1.5 pl-20">
              {cols.map((col) => (
                <div
                  key={`col-hdr-${col}`}
                  className="flex-1 text-center font-caption text-[11px] text-text-secondary font-medium truncate"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {rows.map((row) => (
              <div key={`row-${row}`} className="flex items-center gap-1.5">
                {/* Row Header Label */}
                <div className="w-20 font-caption text-[11px] text-text-secondary font-semibold truncate pr-2 text-right">
                  {row}
                </div>

                {/* Cells in Row */}
                {cols.map((col) => {
                  const key = `${row}::${col}`;
                  const cell = cellMap.get(key) || { row, col, value: 0 };
                  const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;

                  return (
                    <div
                      key={`cell-${key}`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => onCellClick?.(cell)}
                      className={`flex-1 h-9 rounded-lg flex items-center justify-center text-caption text-[11px] font-mono transition-all cursor-pointer shadow-2xs ${getCellBgClass(
                        cell.value
                      )} ${isHovered ? 'ring-2 ring-primary scale-105 z-10' : ''}`}
                      title={cell.tooltip || `${row} ${col}: ${cell.formattedValue || cell.value}`}
                    >
                      {cell.value > 0 ? cell.formattedValue || cell.value : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend Scale */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-text-secondary font-caption text-[11px]">
        <span>Density Intensity:</span>
        <div className="flex items-center gap-1.5">
          <span>Low</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-surface-container-low border border-outline-variant/20" />
            <span className="w-3.5 h-3.5 rounded bg-primary/30" />
            <span className="w-3.5 h-3.5 rounded bg-primary/70" />
            <span className="w-3.5 h-3.5 rounded bg-primary" />
          </div>
          <span>Peak</span>
        </div>
      </div>
    </div>
  );
};
