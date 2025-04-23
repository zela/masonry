import { useState, useEffect } from "react";

/**
 * Column calculation hook:
 * 1. Observes container width changes using ResizeObserver
 * 2. Calculates optimal column count based on:
 *    - Minimum column width of 18rem
 *    - Maximum of 4 columns
 *    - Responsive fallback to 1 column on narrow screens
 * 3. Updates columnCount state to trigger layout reflow
 * 4. Performs initial calculation on mount
 * 5. Cleans up observer on unmount to prevent memory leaks
 */
export function useResponsiveColumns(
  containerRef: React.RefObject<HTMLDivElement>,
) {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateColumns = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const remSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const maxColumns = Math.min(
        4,
        // 16 here is the minimal container padding
        Math.floor((containerWidth - 16) / (18 * remSize)),
      );
      return Math.max(1, maxColumns);
    };

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => setColumnCount(calculateColumns()));
    });

    observer.observe(containerRef.current);
    setColumnCount(calculateColumns()); // Initial calculation

    return () => observer.disconnect();
  }, []);

  return columnCount;
}
