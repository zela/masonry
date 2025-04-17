/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useState, useCallback, useRef } from "react";
import { fetchPhotos } from "~/api/pexels";
import type { PexelsPhoto } from "~/api/pexels";
import { HomeHeader } from "~/components/HomeHeader";
import { PhotoGrid } from "~/components/PhotoGrid";
import { DelayedSpinner } from "~/components/Spinner";

const containerStyles = css`
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
`;

const title = "Masonry Photo Gallery";
const description = "Displaying photos sourced from the Pexels API";
export function meta() {
  return [
    { title },
    {
      name: "description",
      content: description,
    },
  ];
}

export default function Home() {
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const loadPhotos = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;

      try {
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);

        const currentPage = reset ? 1 : page;
        const response = await fetchPhotos(currentPage, 80);

        setPhotos((prev) => {
          if (reset) return response.photos;
          return [...prev, ...response.photos];
        });

        setPage(currentPage + 1);
        setHasMore(!!response.next_page);
      } catch (error) {
        console.error("Error loading photos:", error);
        setError(`Error loading photos: ${error}`);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    },
    [page],
  );

  return (
    <div css={containerStyles}>
      <HomeHeader title={title} description={description} />
      {error && <p>Error: {error}</p>}
      {photos && (
        <PhotoGrid photos={photos} loadMore={loadPhotos} hasMore={hasMore} />
      )}
      {isLoading && <DelayedSpinner />}
    </div>
  );
}
