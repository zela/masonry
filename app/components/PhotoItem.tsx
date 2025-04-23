/** @jsxImportSource @emotion/react */

import React from "react";
import { Link } from "react-router";
import { css } from "@emotion/react";
import type { PexelsPhoto } from "~/api/pexels";

const itemStyles = css`
  break-inside: avoid;
  content-visibility: auto;
  contain-intrinsic-size: auto 18rem;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
  }
`;

interface PhotoItemProps {
  photo: PexelsPhoto;
  columnCount: number; // Needed for sizes calculation
  isSuperPriorityImage: boolean;
  isPriorityImage: boolean;
}

const PhotoItem = React.memo(
  ({
    photo,
    columnCount,
    isSuperPriorityImage,
    isPriorityImage,
  }: PhotoItemProps) => {
    const aspectRatio = photo.width / photo.height;
    const maxColWidth = 18 * 16; // 18rem = 288px
    const sizes = [
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
              backgroundColor: photo.avg_color || "#eee",
            }}
          />
        </div>
      </Link>
    );
  },
);

export default PhotoItem;
