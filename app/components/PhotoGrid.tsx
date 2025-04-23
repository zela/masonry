/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import type { PexelsPhoto } from "~/api/pexels";
import { useRef, useMemo } from "react";
import { distributePhotosGreedy } from "~/util/distributePhotosGreedy";
import { useInfiniteScroll } from "~/util/useInfiniteScroll";
import { useResponsiveColumns } from "~/util/useResponsiveColumns";
import PhotoItem from "./PhotoItem";

interface PhotoGridProps {
  photos: PexelsPhoto[];
  loadMore?: () => void;
  hasMore?: boolean;
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
                  key={photo.id}
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
