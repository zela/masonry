/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import type { PexelsPhoto } from "~/api/pexels";
import { useState, useEffect, useRef, useMemo } from "react";
import PhotoItem from "./PhotoItem";

interface PhotoGridProps {
  photos: PexelsPhoto[];
  loadMore?: () => void;
  hasMore?: boolean;
}

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
function useResponsiveColumns(containerRef: React.RefObject<HTMLDivElement>) {
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

/**
 * Hook for the infinite scroll:
 * 1. Sets up IntersectionObserver to watch sentinel element
 * 2. Triggers callback when sentinel becomes visible in viewport
 * 3. Uses 200px root margin for early loading before reaching bottom
 * 4. Implements debouncing to prevent duplicate requests during momentum scrolling
 * 5. Properly cleans up observer references on unmount or dependency changes
 * 6. Maintains reference stability to prevent unnecessary re-renders
 */
function useInfiniteScroll(
  callback?: () => void | Promise<void>,
  hasMore?: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const timeoutRef = useRef<number>(0);

  useEffect(() => {
    if (typeof callback !== "function" || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingRef.current) {
          isLoadingRef.current = true;
          clearTimeout(timeoutRef.current);

          timeoutRef.current = window.setTimeout(() => {
            const potentialPromise = callback();

            if (
              potentialPromise &&
              typeof potentialPromise.then === "function"
            ) {
              potentialPromise.finally(() => {
                isLoadingRef.current = false;
              });
            } else {
              isLoadingRef.current = false;
            }
          }, 200);
        }
      },
      { rootMargin: "300px" },
    );

    const currentRef = sentinelRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup function
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
      clearTimeout(timeoutRef.current);
      isLoadingRef.current = false;
    };
  }, [callback, hasMore]);

  return sentinelRef;
}

const getGridContainerStyles = (columnCount: number) => css`
  display: grid;
  grid-template-columns: repeat(${columnCount}, minmax(min(18rem, 100%), 1fr));
  gap: 1rem;
  max-width: 90rem;
  margin: 0 auto;
`;

const columnStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/**
 * Distributes photos across columns using a greedy algorithm to balance column heights
 *
 * @param photos - Array of photos to distribute
 * @param columnCount - Number of columns to distribute photos into
 * @returns Array of column arrays, where each column array contains the photos for that column
 *
 * Algorithm:
 * 1. Maintains running height totals for each column
 * 2. Places each photo in the column with smallest current height
 * 3. Updates column height after each placement
 * 4. Results in roughly balanced column heights
 */
function distributePhotosGreedy(
  photos: PexelsPhoto[],
  columnCount: number,
  columnWidth: number,
  gap: number,
) {
  const columnHeights = Array(columnCount).fill(gap); // Account for first gap
  const columns = Array.from({ length: columnCount }, () => []);

  photos.forEach((photo) => {
    const shortestIndex = columnHeights.indexOf(Math.min(...columnHeights));
    const renderedHeight = columnWidth / (photo.width / photo.height) + gap;

    (columns[shortestIndex] as PexelsPhoto[]).push(photo);
    columnHeights[shortestIndex] += renderedHeight;
  });

  return columns;
}

export function PhotoGrid({ photos, loadMore, hasMore }: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnCount = useResponsiveColumns(
    containerRef as React.RefObject<HTMLDivElement>,
  );

  const sentinelRef = useInfiniteScroll(loadMore, hasMore);

  // Distribute photos into columns
  const columns = useMemo(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const gap = 16; // 1rem in pixels
    const columnWidth =
      (containerWidth - gap * (columnCount - 1)) / columnCount;
    return distributePhotosGreedy(photos, columnCount, columnWidth, gap);
  }, [photos, columnCount]);

  return (
    <>
      <div css={getGridContainerStyles(columnCount)} ref={containerRef}>
        {columns.map((columnPhotos, columnIndex) => (
          <div key={columnIndex} css={columnStyles}>
            {(columnPhotos as PexelsPhoto[]).map((photo, index) => {
              const isSuperPriorityImage = index === 0;
              const isPriorityImage = index < 2;

              return (
                <PhotoItem
                  key={photo.id} // Key should be here ideally, or on the outer element if Link is removed
                  photo={photo}
                  columnCount={columnCount}
                  isSuperPriorityImage={isSuperPriorityImage}
                  isPriorityImage={isPriorityImage}
                />
              );
            })}
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </>
  );
}
