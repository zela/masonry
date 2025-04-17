/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import type { PexelsPhoto } from "~/api/pexels";
import { useState, useEffect, useRef, useMemo } from "react";

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
        getComputedStyle(document.documentElement).fontSize
      );
      const maxColumns = Math.min(
        4,
        // 16 here is the minimal container padding
        Math.floor((containerWidth - 16) / (18 * remSize))
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
      { rootMargin: "200px" }
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

export function PhotoGrid({ photos, loadMore, hasMore }: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnCount = useResponsiveColumns(
    containerRef as React.RefObject<HTMLDivElement>
  );
  const sentinelRef = useInfiniteScroll(loadMore, hasMore);

  // Distribute photos into columns
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => [] as PexelsPhoto[]);
    photos.forEach((photo, index) => {
      cols[index % columnCount].push(photo);
    });
    return cols;
  }, [photos, columnCount]);

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
                <div key={photo.id} css={itemStyles}>
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
              );
            })}
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </>
  );
}
