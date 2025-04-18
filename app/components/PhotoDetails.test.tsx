/**
 * @vitest-environment jsdom
 */

import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { MemoryRouter } from "react-router";
import { PhotoDetails } from "./PhotoDetails";
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

test("displays photo metadata", async () => {
  const { getByText } = render(
    <MemoryRouter>
      <PhotoDetails photo={mockPhoto} />
    </MemoryRouter>,
  );

  await expect.element(getByText("John Doe")).toBeInTheDocument();
  await expect.element(getByText("3000 × 2000 pixels")).toBeInTheDocument();
  await expect.element(getByText("Average Color")).toBeInTheDocument();
});
