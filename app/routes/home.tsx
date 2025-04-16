/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchPhotos } from "~/api/pexels";
import type { PexelsPhoto } from "~/api/pexels";
import { HomeHeader } from "~/components/HomeHeader";
import { PhotoGrid } from "~/components/PhotoGrid";
import type { Route } from "../+types/root";

const containerStyles = css`
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const title = "Masonry Photo Gallery";
const description = "A responsive, virtualized masonry grid photo gallery";
export function meta({}: Route.MetaArgs) {
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const loadPhotos = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;

      try {
        loadingRef.current = true;
        setIsLoading(true);

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
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    },
    [page]
  );

  // Load initial photos
  useEffect(() => {
    setPage(1);
    loadPhotos(true);
  }, []);

  return (
    <div css={containerStyles}>
      <HomeHeader title={title} description={description} />
      <PhotoGrid photos={photos} />
    </div>
  );
}
