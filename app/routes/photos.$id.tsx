/** @jsxImportSource @emotion/react */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { css } from "@emotion/react";
import { Link } from "react-router";
import { fetchPhotoById } from "~/api/pexels";
import type { PexelsPhoto } from "~/api/pexels";
import { PhotoDetails } from "~/components/PhotoDetails";
import { DelayedSpinner } from "~/components/Spinner";
import type { Route } from "../+types/root";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Photo ${params.id} | Masonry Photo Gallery` },
    {
      name: "description",
      content: "Detailed view of a beautiful photo from Pexels",
    },
  ];
}

const containerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 1rem;
`;

function Error({ message }: { message: string | null }) {
  return (
    <div css={containerStyles}>
      <h1>Error</h1>
      {message && <p>{message}</p>}
      <p>
        <Link to="/">← Back to Gallery</Link>
      </p>
    </div>
  );
}

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PexelsPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadPhoto = useCallback(async () => {
    if (loadingRef.current) return;
    if (!id) return;

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const photoData = await fetchPhotoById(parseInt(id, 10));

      setPhoto(photoData);
    } catch (err) {
      console.error("Error loading photo:", err);
      setError("Failed to load photo. Please try again later.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPhoto();
  }, []);

  if (error) {
    return <Error message={error} />;
  }

  if (isLoading) {
    return (
      <div css={containerStyles}>
        <DelayedSpinner />
      </div>
    );
  }

  if (!photo) {
    return <Error message="Photo not found." />;
  }

  return <PhotoDetails photo={photo} />;
}
