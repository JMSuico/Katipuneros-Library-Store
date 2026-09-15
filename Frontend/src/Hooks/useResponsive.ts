// [Layer: Hooks]
// useResponsive.ts -- Global responsive viewport breakpoint detection hook.
// DO NOT put UI rendering or API calls here.
import { useState, useEffect } from 'react';

export interface Breakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
}

export function useResponsive(): Breakpoints {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    isLargeDesktop: dimensions.width >= 1440,
    width: dimensions.width,
  };
}
