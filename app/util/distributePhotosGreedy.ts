import type { PexelsPhoto } from "~/api/pexels";

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
export function distributePhotosGreedy(
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
