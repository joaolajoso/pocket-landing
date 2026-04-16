import React, { lazy, Suspense, useEffect, useState } from 'react';

const LavaLamp = lazy(() =>
  import('@/components/ui/fluid-blob').then((mod) => ({
    default: mod.LavaLamp,
  }))
);

interface LazyLavaLampProps {
  className?: string;
}

const GradientFallback: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={className}
    style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(262, 83%, 40%) 50%, hsl(262, 83%, 25%) 100%)',
    }}
  />
);

export const LazyLavaLamp: React.FC<LazyLavaLampProps> = ({ className }) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check reduced motion preference
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setPrefersReducedMotion(reducedMotion);
    
    if (reducedMotion) return;

    const load = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(
          () => setShouldLoad(true),
          { timeout: 3000 }
        );
      } else {
        setTimeout(() => setShouldLoad(true), 500);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(load, 300);
    } else {
      const onLoad = () => setTimeout(load, 300);
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  // Show fallback for reduced motion or while loading
  if (prefersReducedMotion || !shouldLoad) {
    return <GradientFallback className={className} />;
  }

  return (
    <Suspense fallback={<GradientFallback className={className} />}>
      <LavaLamp className={className} />
    </Suspense>
  );
};
