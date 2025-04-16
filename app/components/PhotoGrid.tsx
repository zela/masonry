/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import type { PexelsPhoto } from "~/api/pexels";
import { useState, useEffect, useRef, useMemo } from "react";

interface PhotoGridProps {
  photos: PexelsPhoto[];
  loadMore?: () => void;
  hasMore?: boolean;
}

const getGridContainerStyles = (columnCount: number) => css`
  max-width: 90rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(${columnCount}, minmax(18rem, 1fr));
  gap: 1rem;
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
  const [columnCount, setColumnCount] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /**
   * Column Calculation Effect:
   * 1. Observes container width changes using ResizeObserver
   * 2. Calculates optimal column count based on:
   *    - Minimum column width of 18rem
   *    - Maximum of 4 columns
   *    - Responsive fallback to 1 column on narrow screens
   * 3. Updates columnCount state to trigger layout reflow
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const calculateColumns = () => {
      const containerWidth = containerRef.current?.offsetWidth || 0;
      const remSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const maxColumns = Math.min(
        4,
        // (containerWidth - 16) is the minimal container padding
        Math.floor((containerWidth - 16) / (18 * remSize))
      );
      return Math.max(1, maxColumns);
    };

    const observer = new ResizeObserver(() => {
      setColumnCount(calculateColumns());
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Distribute photos into columns
  const columns = useMemo(() => {
    return Array.from({ length: columnCount }, (_, i) =>
      photos.filter((_, index) => index % columnCount === i)
    );
  }, [photos, columnCount]);

  /**
   * Infinite Scroll Effect:
   * 1. Sets up IntersectionObserver to watch sentinel element
   * 2. Triggers loadMore callback when sentinel becomes visible
   * 3. Uses 200px root margin for early loading before reaching bottom
   * 4. Automatically cleans up observer on unmount
   */
  useEffect(() => {
    if (!loadMore || !hasMore) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [loadMore, hasMore]);

  return (
    <>
      <div css={getGridContainerStyles(columnCount)} ref={containerRef}>
        {columns.map((columnPhotos, columnIndex) => (
          <div key={columnIndex} css={columnStyles}>
            {columnPhotos.map((photo) => (
              <div key={photo.id} css={itemStyles}>
                <img
                  src={photo.src.medium}
                  srcSet={`${photo.src.medium} 200w, ${photo.src.large} 433w, ${photo.src.large2x} 940w`}
                  sizes="18rem"
                  alt={photo.alt || `Photo by ${photo.photographer}`}
                  loading="lazy"
                  width={photo.width}
                  height={photo.height}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
    </>
  );
}
