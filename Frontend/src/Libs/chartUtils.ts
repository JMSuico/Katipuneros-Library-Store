// [Layer: Libs]
// chartUtils.ts -- Utility functions for SVG and chart rendering.
// DO NOT put UI components or business rules here.

export function generateBarPath(x: number, y: number, width: number, height: number, radius = 4): string {
  return `M${x},${y + height} 
          L${x},${y + radius} 
          Q${x},${y} ${x + radius},${y} 
          L${x + width - radius},${y} 
          Q${x + width},${y} ${x + width},${y + radius} 
          L${x + width},${y + height} Z`;
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}
