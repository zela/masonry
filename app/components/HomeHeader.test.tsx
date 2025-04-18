import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { HomeHeader } from "./HomeHeader";

test("renders title and description from props", async () => {
  const { getByText } = render(
    <HomeHeader title="Test Gallery" description="Test Description" />,
  );
  await expect.element(getByText("Test Gallery")).toBeInTheDocument();
  await expect.element(getByText("Test Description")).toBeInTheDocument();
});
