import React, { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load the heavy Warp shader component
const Warp = lazy(() => 
  import('@paper-design/shaders-react').then(module => ({ 
    default: module.Warp 
  }))
);

interface GradientFallbackProps {
  colors: string[];
}

// CSS gradient fallback that matches the Warp visual appearance
const GradientFallback: React.FC<GradientFallbackProps> = ({ colors }) => (
  <div 
    className="absolute inset-0"
    style={{ 
      background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 33%, ${colors[2]} 66%, ${colors[3]} 100%)`,
      height: '100%',
      width: '100%'
    }}
  />
);

interface LazyWarpProps {
  style?: React.CSSProperties;
  proportion?: number;
  softness?: number;
  distortion?: number;
  swirl?: number;
  swirlIterations?: number;
  shape?: "checks" | "edge" | "stripes";
  shapeScale?: number;
  scale?: number;
  rotation?: number;
  speed?: number;
  colors: string[];
}

export const LazyWarp: React.FC<LazyWarpProps> = (props) => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If user prefers reduced motion, skip loading the heavy shader
    if (prefersReducedMotion) {
      return;
    }

    // Defer loading until page is fully loaded to improve FID
    const loadShader = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(
          () => setShouldLoad(true),
          { timeout: 3000 }
        );
      } else {
        setTimeout(() => setShouldLoad(true), 500);
      }
    };

    let onLoad: (() => void) | undefined;

    // Wait for page to be fully loaded before starting shader load
    if (document.readyState === 'complete') {
      setTimeout(loadShader, 500);
    } else {
      onLoad = () => setTimeout(loadShader, 500);
      window.addEventListener('load', onLoad);
    }

    return () => {
      if (onLoad) {
        window.removeEventListener('load', onLoad);
      }
    };
  }, []);
 
  if (!shouldLoad) {
    return <GradientFallback colors={props.colors} />;
  }
 
  return (
    <Suspense fallback={<GradientFallback colors={props.colors} />}>
      <Warp {...props} />
    </Suspense>
  );
};
