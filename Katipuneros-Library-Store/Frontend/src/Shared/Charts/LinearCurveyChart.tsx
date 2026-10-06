// [Layer: Shared/Charts]
// LinearCurveyChart.tsx -- Universal Multi-Series Curvy SVG Linear Chart with Adaptive Tooltip.
// Features: Smooth cubic-bezier spline interpolation, gradient area fills, dynamic X/Y crosshairs,
// adaptive cursor-adjacent floating tooltip (left/right/top/bottom near pointer), glowing active nodes,
// wave legend swatches with series toggle, and strict N=0 empty baseline handling.
// Strictly adheres to SKILL.md, AGENTS.md, and universal lambda expressions (=>).

import { FC, useState, useRef, useMemo, useCallback } from 'react';

export interface LinearCurveyDataPoint {
  label: string;
  isoDate?: string;
  values: Record<string, number>;
}

export interface LinearCurveySeriesConfig {
  key: string;
  label: string;
  color: string;
  isDashed?: boolean;
  activeCountLabel?: string;
}

export interface LinearCurveyChartProps {
  data: LinearCurveyDataPoint[];
  series: LinearCurveySeriesConfig[];
  heightClass?: string;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  showSeriesToggle?: boolean;
  showCrosshairs?: boolean;
  showYAxisBubble?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const LinearCurveyChart: FC<LinearCurveyChartProps> = ({
  data = [],
  series = [],
  heightClass = 'h-64 sm:h-80',
  viewBoxWidth = 800,
  viewBoxHeight = 240,
  showSeriesToggle = true,
  showCrosshairs = true,
  showYAxisBubble = true,
  emptyMessage = 'No circulation points recorded for this timeframe.',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Active series toggles state
  const [activeSeriesKeys, setActiveSeriesKeys] = useState<Record<string, boolean>>(() =>
    series.reduce<Record<string, boolean>>((acc, s) => {
      acc[s.key] = true;
      return acc;
    }, {})
  );

  // Hover state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{
    x: number;
    y: number;
    svgX: number;
    svgY: number;
    containerWidth: number;
    containerHeight: number;
  } | null>(null);

  const toggleSeries = useCallback((key: string) => {
    setActiveSeriesKeys((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  }, []);

  // Geometry margins
  const margin = useMemo(
    () => ({
      top: 30,
      right: 28,
      bottom: 40,
      left: 28,
    }),
    []
  );

  const plotWidth = useMemo(
    () => Math.max(10, viewBoxWidth - margin.left - margin.right),
    [viewBoxWidth, margin]
  );
  const plotHeight = useMemo(
    () => Math.max(10, viewBoxHeight - margin.top - margin.bottom),
    [viewBoxHeight, margin]
  );
  const baselineY = useMemo(
    () => viewBoxHeight - margin.bottom,
    [viewBoxHeight, margin]
  );

  // Max value calculation
  const maxVal = useMemo(() => {
    const allValues = data.flatMap((d) =>
      series.filter((s) => activeSeriesKeys[s.key] !== false).map((s) => d.values[s.key] ?? 0)
    );
    const m = Math.max(...allValues, 0);
    return m > 0 ? m : 5; // Clean visual baseline when all values are zero
  }, [data, series, activeSeriesKeys]);

  // Coordinate mapping function
  const getCoordinates = useCallback(
    (key: string) => {
      if (data.length === 0) return [];
      if (data.length === 1) {
        const val = data[0].values[key] ?? 0;
        const y = Math.round(baselineY - (val / maxVal) * plotHeight);
        return [{ x: Math.round(viewBoxWidth / 2), y }];
      }
      return data.map((d, idx) => {
        const val = d.values[key] ?? 0;
        const x = Math.round(margin.left + (idx / (data.length - 1)) * plotWidth);
        const y = Math.round(baselineY - (val / maxVal) * plotHeight);
        return { x, y };
      });
    },
    [data, baselineY, maxVal, plotHeight, margin.left, plotWidth, viewBoxWidth]
  );

  // Smooth spline generator
  const buildSmoothPath = useCallback((coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpx1 = Math.round(curr.x + (next.x - curr.x) / 3);
      const cpy1 = curr.y;
      const cpx2 = Math.round(curr.x + ((next.x - curr.x) * 2) / 3);
      const cpy2 = next.y;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`;
    }
    return d;
  }, []);

  // Area path generator (spline closed down to baseline)
  const buildAreaPath = useCallback(
    (coords: { x: number; y: number }[]) => {
      if (coords.length === 0) return '';
      const linePath = buildSmoothPath(coords);
      const firstX = coords[0].x;
      const lastX = coords[coords.length - 1].x;
      return `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
    },
    [buildSmoothPath, baselineY]
  );

  // Series coordinate dictionary
  const seriesCoords = useMemo(
    () =>
      series.reduce<Record<string, { x: number; y: number }[]>>((acc, s) => {
        acc[s.key] = getCoordinates(s.key);
        return acc;
      }, {}),
    [series, getCoordinates]
  );

  // Dynamic Y value at cursor
  const pointerYVal = useMemo(() => {
    if (!mousePos) return 0;
    const rel = Math.max(0, Math.min(1, (baselineY - mousePos.svgY) / plotHeight));
    return Math.round(rel * maxVal);
  }, [mousePos, baselineY, plotHeight, maxVal]);

  // Adaptive Tooltip Position Calculation
  const tooltipPos = useMemo(() => {
    if (!mousePos) return null;
    const cardW = 225;
    const cardH = 155;
    const pad = 12;

    // Prefer right of cursor (+18px); if space is tight, flip to left (-cardW - 18px)
    let left = mousePos.x + 18;
    if (left + cardW > mousePos.containerWidth - pad) {
      left = mousePos.x - cardW - 18;
    }
    left = Math.max(pad, Math.min(mousePos.containerWidth - cardW - pad, left));

    // Place vertically beside cursor, clamped within container boundaries
    let top = mousePos.y - cardH / 2;
    top = Math.max(pad, Math.min(mousePos.containerHeight - cardH - pad, top));

    return { left, top };
  }, [mousePos]);

  // Mouse event handlers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || data.length === 0) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect() ?? svgRect;
      const clientX = e.clientX - containerRect.left;
      const clientY = e.clientY - containerRect.top;

      const svgX = Math.max(0, Math.min(viewBoxWidth, ((e.clientX - svgRect.left) / svgRect.width) * viewBoxWidth));
      const svgY = Math.max(0, Math.min(viewBoxHeight, ((e.clientY - svgRect.top) / svgRect.height) * viewBoxHeight));

      const pct = data.length > 1 ? Math.max(0, Math.min(1, (svgX - margin.left) / plotWidth)) : 0;
      const nearestIdx = Math.round(pct * (data.length - 1));
      const clampedIdx = Math.max(0, Math.min(data.length - 1, nearestIdx));

      setHoverIndex(clampedIdx);
      setMousePos({
        x: clientX,
        y: clientY,
        svgX,
        svgY,
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
      });
    },
    [data.length, viewBoxWidth, viewBoxHeight, margin.left, plotWidth]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
    setMousePos(null);
  }, []);

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Series Toggle Pills with Curvy Wave Indicators */}
      {showSeriesToggle && series.length > 0 && (
        <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm mb-space-md">
          {series.map((s) => {
            const isActive = activeSeriesKeys[s.key] !== false;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSeries(s.key)}
                className={`flex items-center gap-space-xs px-2.5 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-surface-container-low border-outline-variant/30 text-text-primary'
                    : 'bg-surface-container-low/40 opacity-40 border-transparent text-text-secondary'
                }`}
                title={`Toggle ${s.label} series`}
              >
                {/* Linear Curvy Indicator Wave */}
                <svg className="w-5 h-3 overflow-visible" viewBox="0 0 20 12" fill="none">
                  <path
                    d="M 1 6 Q 5.5 1, 10 6 T 19 6"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeDasharray={s.isDashed ? '3 2' : undefined}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-caption text-caption font-semibold">
                  {s.label}
                  {s.activeCountLabel ? ` (${s.activeCountLabel})` : ''}
                </span>
                <span
                  className={`material-symbols-outlined text-[14px] ${
                    isActive ? 'text-action-green' : 'text-text-secondary'
                  }`}
                >
                  {isActive ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className={`relative w-full ${heightClass} bg-surface-container-low/40 rounded-xl p-3 sm:p-4 flex flex-col justify-end select-none`}
      >
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary gap-2">
            <span className="material-symbols-outlined text-[32px] text-text-secondary/50">show_chart</span>
            <span className="font-small text-small">{emptyMessage}</span>
          </div>
        ) : (
          <>
            <svg
              ref={svgRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full overflow-visible cursor-crosshair"
              preserveAspectRatio="none"
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            >
              <defs>
                {series.map((s) => (
                  <linearGradient key={`grad-${s.key}`} id={`grad-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
                  </linearGradient>
                ))}
              </defs>

              {/* Horizontal Dashed Grid Guides */}
              <line
                stroke="#e2e9ea"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1={margin.left}
                x2={viewBoxWidth - margin.right}
                y1={margin.top}
                y2={margin.top}
              />
              <line
                stroke="#e2e9ea"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1={margin.left}
                x2={viewBoxWidth - margin.right}
                y1={Math.round(margin.top + plotHeight * 0.33)}
                y2={Math.round(margin.top + plotHeight * 0.33)}
              />
              <line
                stroke="#e2e9ea"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1={margin.left}
                x2={viewBoxWidth - margin.right}
                y1={Math.round(margin.top + plotHeight * 0.66)}
                y2={Math.round(margin.top + plotHeight * 0.66)}
              />
              {/* Baseline Solid Axis Line */}
              <line
                stroke="#cbd5e1"
                strokeWidth="1.5"
                x1={margin.left}
                x2={viewBoxWidth - margin.right}
                y1={baselineY}
                y2={baselineY}
              />

              {/* Render Curves & Area Fills for Active Series */}
              {series.map((s) => {
                if (activeSeriesKeys[s.key] === false) return null;
                const coords = seriesCoords[s.key] || [];
                if (coords.length === 0) return null;

                return (
                  <g key={`series-group-${s.key}`}>
                    {!s.isDashed && (
                      <path d={buildAreaPath(coords)} fill={`url(#grad-${s.key})`} />
                    )}
                    <path
                      d={buildSmoothPath(coords)}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={s.isDashed ? '2' : '2.8'}
                      strokeDasharray={s.isDashed ? '4 4' : undefined}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Dynamic Crosshairs and Glowing Points on Hover */}
              {showCrosshairs && hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length && (
                <>
                  {/* Vertical Snapped X Crosshair */}
                  {(() => {
                    const firstActive = series.find((s) => activeSeriesKeys[s.key] !== false) || series[0];
                    const activeCoords = firstActive ? seriesCoords[firstActive.key] : null;
                    const xCoord = activeCoords && activeCoords[hoverIndex] ? activeCoords[hoverIndex].x : viewBoxWidth / 2;
                    return (
                      <line
                        stroke="#0284c7"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                        x1={xCoord}
                        x2={xCoord}
                        y1={margin.top}
                        y2={baselineY}
                        opacity="0.8"
                      />
                    );
                  })()}

                  {/* Horizontal Tracking Y Crosshair */}
                  <line
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                    x1={margin.left}
                    x2={viewBoxWidth - margin.right}
                    y1={mousePos?.svgY ?? margin.top}
                    y2={mousePos?.svgY ?? margin.top}
                    opacity="0.65"
                  />

                  {/* Left Y-Axis Value Bubble */}
                  {showYAxisBubble && (
                    <>
                      <rect
                        x="0"
                        y={(mousePos?.svgY ?? margin.top) - 10}
                        width="30"
                        height="20"
                        rx="4"
                        fill="#0f172a"
                      />
                      <text
                        x="15"
                        y={(mousePos?.svgY ?? margin.top) + 4}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {pointerYVal}
                      </text>
                    </>
                  )}

                  {/* Concentric Glowing Points for Active Series */}
                  {series.map((s) => {
                    if (activeSeriesKeys[s.key] === false) return null;
                    const coords = seriesCoords[s.key];
                    if (!coords || !coords[hoverIndex]) return null;
                    const pt = coords[hoverIndex];
                    return (
                      <g key={`glow-${s.key}`}>
                        <circle cx={pt.x} cy={pt.y} r="8" fill={s.color} fillOpacity="0.3" />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4.5"
                          fill={s.color}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </>
              )}
            </svg>

            {/* Adaptive Cursor-Adjacent Floating Tooltip */}
            {mousePos && tooltipPos && hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length && (
              <div
                className="absolute z-30 bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl rounded-xl p-3 border border-outline-variant/30 min-w-[215px] pointer-events-none transition-all duration-75 ease-out select-none"
                style={{
                  left: `${tooltipPos.left}px`,
                  top: `${tooltipPos.top}px`,
                }}
              >
                <div className="flex items-center justify-between pb-1 mb-1.5 bg-surface-container-low/70 px-2 py-0.5 rounded-lg">
                  <span className="font-caption text-caption font-bold text-text-primary">
                    {data[hoverIndex].label}
                  </span>
                  <span className="font-caption text-[10px] font-mono text-primary font-bold">
                    Y-Cursor: ~{pointerYVal}
                  </span>
                </div>
                <div className="space-y-1 px-1">
                  {series.map((s) => {
                    if (activeSeriesKeys[s.key] === false) return null;
                    const val = data[hoverIndex].values[s.key] ?? 0;
                    return (
                      <div key={`tip-val-${s.key}`} className="flex items-center justify-between font-caption text-caption">
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <svg className="w-4 h-2.5" viewBox="0 0 16 10" fill="none">
                            <path
                              d="M 0 5 Q 4 1, 8 5 T 16 5"
                              stroke={s.color}
                              strokeWidth="2"
                              strokeDasharray={s.isDashed ? '2 1.5' : undefined}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span>{s.label}:</span>
                        </span>
                        <span className="font-bold font-mono" style={{ color: s.color }}>
                          {val}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between font-caption text-[11px] pt-1 border-t border-outline-variant/15 text-text-secondary">
                    <span>Total Dynamic:</span>
                    <span className="font-bold text-text-primary font-mono">
                      {series
                        .filter((s) => activeSeriesKeys[s.key] !== false)
                        .reduce((acc, s) => acc + (data[hoverIndex].values[s.key] ?? 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* X-axis Timeline Labels */}
            <div className="flex justify-between font-caption text-[11px] text-text-secondary pt-2 px-1 select-none">
              {data.map((d, idx) => {
                const show =
                  data.length <= 10 ||
                  idx === 0 ||
                  idx === data.length - 1 ||
                  idx % Math.max(1, Math.ceil(data.length / 7)) === 0;
                if (!show) return null;
                const isHovered = hoverIndex === idx;
                return (
                  <span
                    key={d.isoDate || idx}
                    onClick={() => setHoverIndex(idx)}
                    className={`cursor-pointer transition-colors ${
                      isHovered ? 'font-bold text-primary' : 'hover:text-text-primary'
                    }`}
                  >
                    {d.label}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
