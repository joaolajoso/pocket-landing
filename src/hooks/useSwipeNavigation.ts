import { useRef, useCallback } from 'react';

interface UseSwipeNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  threshold?: number;
}

/**
 * Hook for horizontal swipe navigation between tabs on mobile.
 * Returns touch event handlers to attach to a container.
 */
export function useSwipeNavigation({
  tabs,
  activeTab,
  onTabChange,
  threshold = 50,
}: UseSwipeNavigationProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const ignored = useRef(false);

  const isScrollableElement = (el: HTMLElement | null): boolean => {
    while (el) {
      const { overflowX } = window.getComputedStyle(el);
      if (
        (overflowX === 'auto' || overflowX === 'scroll') &&
        el.scrollWidth > el.clientWidth
      ) {
        return true;
      }
      // Also check for common slider/carousel attributes
      if (
        el.getAttribute('role') === 'slider' ||
        el.getAttribute('role') === 'tablist' ||
        el.dataset.noSwipe !== undefined ||
        el.closest('[data-no-swipe]')
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    ignored.current = isScrollableElement(target);
    if (ignored.current) return;
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (ignored.current || !touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;

      // Only count horizontal swipes (angle < 30°)
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex === -1) return;

        if (dx < 0 && currentIndex < tabs.length - 1) {
          // Swipe left → next tab
          onTabChange(tabs[currentIndex + 1]);
        } else if (dx > 0 && currentIndex > 0) {
          // Swipe right → previous tab
          onTabChange(tabs[currentIndex - 1]);
        }
      }

      touchStart.current = null;
    },
    [tabs, activeTab, onTabChange, threshold]
  );

  return { onTouchStart, onTouchEnd };
}
