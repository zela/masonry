/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";
import { Link } from "react-router";
import type { PexelsPhoto } from "~/api/pexels";

function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance (YIQ formula)
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#ffffff";
}

const containerStyles = css`
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 500px) {
    font-size: 0.875rem;
  }
`;

const backButtonStyles = css`
  display: block;
  margin-bottom: 1.5rem;
  text-decoration: none;
  font-size: 1.25em;
  text-align: left;
  &:hover {
    text-decoration: underline;
  }
`;

const photoContainerStyles = (aspectRatio: number) => css`
  display: flex;
  justify-content: center;
  width: 100%;
  aspect-ratio: ${aspectRatio};
  max-height: calc(100vh - 8rem);
`;

const photoStyles = css`
  border-radius: 0.75rem;
  max-width: 100%;
  max-height: calc(100vh - 8rem);
  width: auto;
  height: auto;
  object-fit: contain;
`;

const titleStyles = css`
  font-size: 1.5em;
  margin: 1.5rem 0;
  font-weight: normal;
  text-align: center;
`;

const metadataStyles = css`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  gap: 1rem;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const metadataItemStyles = css`
  h2 {
    font-size: 1.25em;
    margin: 0.5rem 0;
  }

  p {
    margin: 0;
    color: #666;
    line-height: 1.5;
  }

  a {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const colorBoxStyles = css`
  width: 9rem;
  height: 3rem;
  line-height: 3.3rem;
  text-align: center;
  border-radius: 0.5rem;
`;

export function PhotoDetails({ photo }: { photo: PexelsPhoto | null }) {
  if (!photo) {
    return null;
  }

  const aspectRatio = photo.width / photo.height;

  return (
    <div css={containerStyles}>
      <nav>
        <Link to="/" css={backButtonStyles}>
          ← Back to Gallery
        </Link>
      </nav>

      <div css={photoContainerStyles(aspectRatio)}>
        <img
          css={photoStyles}
          src={photo.src.large}
          srcSet={`
            ${photo.src.large} 430w,
            ${photo.src.large2x} 860w
          `}
          sizes="(max-width: 60rem) calc(100vw - 2rem), 58rem"
          alt={photo.alt || `Photo by ${photo.photographer}`}
          fetchPriority="high"
          width={photo.width}
          height={photo.height}
        />
      </div>

      <h1 css={titleStyles}>{photo.alt || `Photo by ${photo.photographer}`}</h1>

      <div css={metadataStyles}>
        <div css={metadataItemStyles}>
          <h2>Photographer</h2>
          <p>
            <a
              href={photo.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {photo.photographer}
            </a>
          </p>
        </div>

        <div css={metadataItemStyles}>
          <h2>Dimensions</h2>
          <p>
            {photo.width} × {photo.height} pixels
          </p>
        </div>

        <div css={metadataItemStyles}>
          <h2>Average Color</h2>
          <div
            css={colorBoxStyles}
            style={{
              backgroundColor: photo.avg_color,
              color: getContrastColor(photo.avg_color),
            }}
          >
            {photo.avg_color}
          </div>
        </div>
      </div>
    </div>
  );
}
