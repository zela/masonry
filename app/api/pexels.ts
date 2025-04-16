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
 * Fetch photos from Pexels API
 * @param {number} [page=1] - Page number
 * @param {number} [perPage=80] - Number of photos per page
 * @param {string} [query] - Search query
 * @returns {Promise<PexelsResponse>} A promise that resolves to the Pexels API response
 */
async function fetchPhotosFromPexels(
  page = 1,
  perPage = 80,
  query?: string
): Promise<PexelsResponse> {
  const endpoint = query
    ? `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    : `${PEXELS_BASE_URL}/curated?page=${page}&per_page=${perPage}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: import.meta.env.VITE_PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch photos: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch photos, either from the dev server or Pexels API.
 * In development mode, arguments are ignored for simplicity.
 * @param {number} [page=1] - Page number
 * @param {number} [perPage=80] - Number of photos per page
 * @param {string} [query] - Search query
 * @returns {Promise<PexelsResponse>} A promise that resolves to the Pexels API response
 */
export async function fetchPhotos(
  page = 1,
  perPage = 80,
  query?: string
): Promise<PexelsResponse> {
  if (import.meta.env.DEV) {
    return fetchLocalPhotos();
  }
  return fetchPhotosFromPexels(page, perPage, query);
}

/**
 * Fetch a single photo from Pexels API by its ID
 * @param {number} id - The unique identifier of the photo to fetch
 * @returns {Promise<PexelsPhoto>} A promise that resolves to the photo object
 * @throws {Error} When the API request fails or returns a non-200 status code
 */
export async function fetchPhotoById(id: number): Promise<PexelsPhoto> {
  const endpoint = `${PEXELS_BASE_URL}/photos/${id}`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: import.meta.env.VITE_PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch photo: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
