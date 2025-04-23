/**
 * Pexels API service
 *
 * This module provides functions to interact with the Pexels API
 * for fetching photos to display in our masonry grid.
 */

// Types for Pexels API responses
export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
  prev_page?: string;
}

const PEXELS_BASE_URL = "https://api.pexels.com/v1";

/**
 * Fetch photos from the dev server
 * @returns {Promise<PexelsResponse>}
 */
async function fetchLocalPhotos(): Promise<PexelsResponse> {
  const response = await fetch("/pexels_response_curated.json");
  return response.json();
}

/**
 * Fetch photo from the dev server
 * @returns {Promise<PexelsResponse>}
 */
async function fetchLocalPhotoById(): Promise<PexelsPhoto> {
  const response = await fetch("/pexels_response_image.json");
  return response.json();
}

/**
 * Fetch photos from a predefined list stored on the server.
 * Uses local data instead of making Pexels API calls.
 * Implements pagination by slicing the stored list.
 * When `page * perPage` exceeds list length, wraps back to start.
 * @param {number} [page=1] - Page number
 * @param {number} [perPage=80] - Number of photos per page
 */
export async function fetchPhotosFromList(
  page = 1,
  perPage = 80,
): Promise<PexelsResponse> {
  // Fetch the stored photo list with unique photos
  const response = await fetch("/photo_set.json");
  const photos: PexelsPhoto[] = await response.json();

  // Calculate start and end indices for pagination
  const startIndex = ((page - 1) * perPage) % photos.length;
  const endIndex = Math.min(startIndex + perPage, photos.length);

  // If we need to wrap around to the beginning of the list
  if (endIndex - startIndex < perPage) {
    const remainingCount = perPage - (endIndex - startIndex);
    return {
      page,
      per_page: perPage,
      next_page: `${page + 1}`,
      photos: [
        ...photos.slice(startIndex, endIndex),
        ...photos.slice(0, remainingCount),
      ],
      total_results: photos.length,
    };
  }

  return {
    page,
    per_page: perPage,
    next_page: `${page + 1}`,
    photos: photos.slice(startIndex, endIndex),
    total_results: photos.length,
  };
}

/**
 * Fetch a single photo from a predefined list stored on the server.
 * Uses local data instead of making Pexels API calls.
 * @param {number} id - The unique identifier of the photo to fetch
 * @returns {Promise<PexelsPhoto>} A promise that resolves to the photo object
 * @throws {Error} When the photo with the given ID is not found
 */
export async function fetchPhotoByIdFromList(id: number): Promise<PexelsPhoto> {
  const response = await fetch("/photo_set.json");
  const photos: PexelsPhoto[] = await response.json();

  const photo = photos.find((p) => p.id === id);
  if (!photo) {
    throw new Error(`Photo with ID ${id} not found`);
  }

  return photo;
}

/**
 * Fetch photos from Pexels API
 * @param {number} [page=1] - Page number
 * @param {number} [perPage=80] - Number of photos per page
 * @param {string} [query] - Search query
 * @returns {Promise<PexelsResponse>} A promise that resolves to the Pexels API response
 */
async function fetchPhotosFromPexels(
  page = 1,
  perPage = 80,
): Promise<PexelsResponse> {
  const endpoint = `${PEXELS_BASE_URL}/curated?page=${page}&per_page=${perPage}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: import.meta.env.VITE_PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch photos: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch a single photo from Pexels API by its ID
 * @param {number} id - The unique identifier of the photo to fetch
 * @returns {Promise<PexelsPhoto>} A promise that resolves to the photo object
 * @throws {Error} When the API request fails or returns a non-200 status code
 */
async function fetchPhotoByIdFromPexels(id: number): Promise<PexelsPhoto> {
  const endpoint = `${PEXELS_BASE_URL}/photos/${id}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: import.meta.env.VITE_PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch photo: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch photos, either from the dev server or Pexels API.
 * @param {number} [page=1] - Page number
 * @param {number} [perPage=80] - Number of photos per page
 * @returns {Promise<PexelsResponse>} A promise that resolves to the Pexels API response
 */
export async function fetchPhotos(
  page = 1,
  perPage = 80,
): Promise<PexelsResponse> {
  if (import.meta.env.VITE_BASIC_LOAD) {
    return fetchLocalPhotos();
  }

  if (!import.meta.env.VITE_PEXELS_API_KEY || import.meta.env.DEV) {
    return fetchPhotosFromList(page, perPage);
  }

  return fetchPhotosFromPexels(page, perPage);
}

export async function fetchPhotoById(id: number): Promise<PexelsPhoto> {
  if (import.meta.env.VITE_BASIC_LOAD) {
    return fetchLocalPhotoById();
  }

  if (!import.meta.env.VITE_PEXELS_API_KEY || import.meta.env.DEV) {
    return fetchPhotoByIdFromList(id);
  }

  return fetchPhotoByIdFromPexels(id);
}
