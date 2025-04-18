/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import type { PexelsPhoto } from "~/api/pexels";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";

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
 * 4. Skips setup when callback is missing or no more content is available
 * 5. Properly cleans up observer references on unmount or dependency changes
 * 6. Maintains reference stability to prevent unnecessary re-renders
 */
function useInfiniteScroll(callback?: () => void, hasMore?: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!callback || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          callback();
        }
      },
      { rootMargin: "200px" },
    );

    const currentRef = sentinelRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
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

const itemStyles = css`
  break-inside: avoid;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
  }
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
): PexelsPhoto[][] {
  // Create array of column arrays with their total height
  const columnHeights = Array(columnCount).fill(0);
  const columns = Array.from(
    { length: columnCount },
    () => [] as PexelsPhoto[],
  );

  // Greedy distribution
  photos.forEach((photo) => {
    // Find column with smallest current height
    const shortestColumnIndex = columnHeights.reduce(
      (minIndex, height, index) =>
        height < columnHeights[minIndex] ? index : minIndex,
      0,
    );

    columns[shortestColumnIndex].push(photo);
    columnHeights[shortestColumnIndex] += photo.height;
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
  const columns = useMemo(
    () => distributePhotosGreedy(photos, columnCount),
    [photos, columnCount],
  );

  return (
    <>
      <div css={getGridContainerStyles(columnCount)} ref={containerRef}>
        {columns.map((columnPhotos, columnIndex) => (
          <div key={columnIndex} css={columnStyles}>
            {columnPhotos.map((photo, index) => {
              const isSuperPriorityImage = index === 0; // First image in each column
              const isPriorityImage = index < 2; // First 2 images in each column
              const aspectRatio = photo.width / photo.height;
              const maxColWidth = 18 * 16; // 18rem = 288px
              const sizes = [
                // 2x density covers 95%+ of high-density devices
                `${Math.round(maxColWidth * 2)}w`, // 576w
                `${Math.round(maxColWidth)}w`, // 288w
              ];

              return (
                <Link key={photo.id} to={`/photos/${photo.id}`}>
                  <div css={itemStyles}>
                    <img
                      src={photo.src.medium}
                      srcSet={
                        `${photo.src.medium} ${sizes[1]}, ` +
                        `${photo.src.large} ${sizes[0]}`
                      }
                      sizes={`(max-width: 90rem) calc((100vw - 1rem * ${columnCount - 1}) / ${columnCount}), ${maxColWidth}px`}
                      alt={photo.alt || `Photo by ${photo.photographer}`}
                      fetchPriority={isSuperPriorityImage ? "high" : "auto"}
                      loading={isPriorityImage ? "eager" : "lazy"}
                      width={photo.width}
                      height={photo.height}
                      style={{
                        aspectRatio: aspectRatio,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </>
  );
}
