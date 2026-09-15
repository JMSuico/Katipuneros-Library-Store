// [Layer: Hooks]
// useFluidResposiveness.ts -- Global hook for responsive breakpoints & fluid scale calculations.
// Supports responsive adaptation for all devices (small, medium, large, ultra-wide) and fluid sizing.
// DO NOT put UI rendering, components, or direct API calls here.
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Breakpoint thresholds in pixels.
 */
export const BREAKPOINTS = {
  xs: 480,   // Mobile Portrait / Small phones
  sm: 640,   // Mobile Landscape / Larger phones
  md: 768,   // Tablets (iPad mini / portrait)
  lg: 1024,  // Small laptops / iPad Pro
  xl: 1280,  // Standard desktops / laptops
  '2xl': 1536, // Large desktop monitors
  ultrawide: 1920, // Full HD+ / 2K / 4K Ultrawide displays
} as const;

export type DeviceType = 'mobile-small' | 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'ultrawide';

export interface ViewportDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

export interface ResponsiveBreakpoints {
  isMobileSmall: boolean;   // < 480px
  isMobile: boolean;        // < 768px
  isTablet: boolean;        // 768px - 1023px
  isLaptop: boolean;        // 1024px - 1279px
  isDesktop: boolean;       // 1280px - 1919px
  isLargeDesktop: boolean;  // >= 1536px
  isUltraWide: boolean;     // >= 1920px
  deviceType: DeviceType;
}

export interface FluidResponsivenessState extends ViewportDimensions, ResponsiveBreakpoints {
  isTouch: boolean;
  /**
   * Dynamically calculates an interpolated pixel size clamped between minPx and maxPx
   * based on current viewport width relative to [minVw, maxVw].
   */
  getFluidPx: (minPx: number, maxPx: number, minVw?: number, maxVw?: number) => number;
  /**
   * Generates a CSS clamp() expression string for use in inline styles or CSS variables.
   * Example: clamp(14px, 0.75rem + 0.5vw, 18px)
   */
  getFluidClamp: (minPx: number, maxPx: number, minVw?: number, maxVw?: number) => string;
}

/**
 * Pure calculation utility: returns CSS clamp() string.
 */
export function calculateFluidClamp(
  minPx: number,
  maxPx: number,
  minVw: number = BREAKPOINTS.xs,
  maxVw: number = BREAKPOINTS['2xl']
): string {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const yAxisIntersection = -minVw * slope + minPx;
  const preferredVw = (slope * 100).toFixed(4);
  const preferredRem = (yAxisIntersection / 16).toFixed(4);
  return `clamp(${minPx}px, ${preferredRem}rem + ${preferredVw}vw, ${maxPx}px)`;
}

/**
 * Pure calculation utility: returns current interpolated pixel value.
 */
export function calculateFluidSize(
  currentVw: number,
  minPx: number,
  maxPx: number,
  minVw: number = BREAKPOINTS.xs,
  maxVw: number = BREAKPOINTS['2xl']
): number {
  if (currentVw <= minVw) return minPx;
  if (currentVw >= maxVw) return maxPx;
  const factor = (currentVw - minVw) / (maxVw - minVw);
  return Math.round(minPx + factor * (maxPx - minPx));
}

/**
 * Global React Hook: useFluidResposiveness
 * Provides real-time reactive device detection, orientation, and fluid interpolation
 * across mobile, tablet, laptop, desktop, and 4K ultrawide viewports.
 */
export function useFluidResposiveness(): FluidResponsivenessState {
  const [dimensions, setDimensions] = useState<ViewportDimensions>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
      width: w,
      height: h,
      aspectRatio: h > 0 ? w / h : 1.6,
      isPortrait: h >= w,
      isLandscape: w > h,
    };
  });

  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    let rafId: number | null = null;

    const handleResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setDimensions({
          width: w,
          height: h,
          aspectRatio: h > 0 ? w / h : 1.6,
          isPortrait: h >= w,
          isLandscape: w > h,
        });
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const breakpoints: ResponsiveBreakpoints = useMemo(() => {
    const { width } = dimensions;
    const isMobileSmall = width < BREAKPOINTS.xs;
    const isMobile = width < BREAKPOINTS.md;
    const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
    const isLaptop = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
    const isDesktop = width >= BREAKPOINTS.xl && width < BREAKPOINTS.ultrawide;
    const isLargeDesktop = width >= BREAKPOINTS['2xl'];
    const isUltraWide = width >= BREAKPOINTS.ultrawide;

    let deviceType: DeviceType = 'desktop';
    if (isMobileSmall) deviceType = 'mobile-small';
    else if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    else if (isLaptop) deviceType = 'laptop';
    else if (isUltraWide) deviceType = 'ultrawide';

    return {
      isMobileSmall,
      isMobile,
      isTablet,
      isLaptop,
      isDesktop,
      isLargeDesktop,
      isUltraWide,
      deviceType,
    };
  }, [dimensions]);

  const getFluidPx = useCallback(
    (minPx: number, maxPx: number, minVw?: number, maxVw?: number) => {
      return calculateFluidSize(dimensions.width, minPx, maxPx, minVw, maxVw);
    },
    [dimensions.width]
  );

  const getFluidClamp = useCallback(
    (minPx: number, maxPx: number, minVw?: number, maxVw?: number) => {
      return calculateFluidClamp(minPx, maxPx, minVw, maxVw);
    },
    []
  );

  return {
    ...dimensions,
    ...breakpoints,
    isTouch,
    getFluidPx,
    getFluidClamp,
  };
}

// Convenience alias for standard spelling
export const useFluidResponsiveness = useFluidResposiveness;

export default useFluidResposiveness;
