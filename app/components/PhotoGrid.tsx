/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import type { PexelsPhoto } from "~/api/pexels";

interface PhotoGridProps {
  photos: PexelsPhoto[];
}

const gridStyles = css`
  max-width: 1400px;
  columns: 20rem;
  gap: 1rem;

  @media (max-width: 700px) {
    columns: 15rem;
  }
`;

const itemStyles = css`
  break-inside: avoid;
  border-radius: 0.75rem;
  margin-bottom: 1rem;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
  }
`;

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div css={gridStyles}>
      {photos.map((photo) => (
        <div key={photo.id} css={itemStyles}>
          <img
            src={photo.src.medium}
            srcSet={`${photo.src.medium} 200w, ${photo.src.large} 433w, ${photo.src.large2x} 940w`}
            sizes="(max-width: 700px) 15rem, 20rem"
            alt={photo.alt || `Photo by ${photo.photographer}`}
            loading="lazy"
            width={photo.width}
            height={photo.height}
          />
        </div>
      ))}
    </div>
  );
}
