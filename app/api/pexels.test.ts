import { expect, test, vi } from "vitest";
import { fetchPhotoById, fetchPhotos } from "./pexels";
import type { PexelsPhoto } from "~/api/pexels";

const mockPhoto: PexelsPhoto = {
  id: 123456,
  width: 3000,
  height: 2000,
  url: "https://pexels.com/photo/123456",
  photographer: "John Doe",
  photographer_url: "https://pexels.com/johndoe",
  photographer_id: 789,
  avg_color: "#cccccc",
  src: {
    original: "photo.jpg",
    large: "photo-large.jpg",
    large2x: "photo-large2x.jpg",
    medium: "photo-medium.jpg",
    small: "photo-small.jpg",
    portrait: "photo-portrait.jpg",
    landscape: "photo-landscape.jpg",
    tiny: "photo-tiny.jpg",
  },
  liked: false,
  alt: "Test photo",
};

test("fetchPhotoById returns photo data", async () => {
  const mockResponse = {
    ok: true,
    json: () => Promise.resolve(mockPhoto),
  };
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    mockResponse as unknown as Response,
  );

  const result = await fetchPhotoById(123456);
  expect(result).toEqual(mockPhoto);
});

test("fetchCuratedPhotos returns photo collection", async () => {
  const mockResponse = {
    ok: true,
    json: () => Promise.resolve({ photos: [mockPhoto], page: 1 }),
  };
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    mockResponse as unknown as Response,
  );

  const result = await fetchPhotos();
  expect(result.photos).toHaveLength(1);
});
