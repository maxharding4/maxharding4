/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import PhotoOfTheDayPage, { generateMetadata } from "../page";
import * as contentful from "@/lib/contentful";
import React from "react";

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the contentful module
jest.mock("@/lib/contentful");

const mockEmptyCityCollection = {
  items: [],
  total: 0,
  skip: 0,
  limit: 100,
  sys: { type: "Array" },
};

describe("Photo of the Day Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page with an sr-only h1 title", async () => {
    jest
      .spyOn(contentful, "getEntriesByType")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockResolvedValue(mockEmptyCityCollection as any);

    const page = await PhotoOfTheDayPage();
    const { container } = render(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Daily Photo"
    );
    expect(container.querySelector("h1")?.className).toContain("sr-only");
  });

  it("fetches cities with linked entries (include: 2)", async () => {
    const spy = jest
      .spyOn(contentful, "getEntriesByType")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockResolvedValue(mockEmptyCityCollection as any);

    await PhotoOfTheDayPage();

    expect(spy).toHaveBeenCalledWith("city", { include: 2 });
  });

  it("handles Contentful errors gracefully", async () => {
    jest
      .spyOn(contentful, "getEntriesByType")
      .mockRejectedValue(new Error("API Error"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await expect(PhotoOfTheDayPage()).resolves.not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching cities for Photo of the Day:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  describe("generateMetadata", () => {
    it("returns Daily Photo metadata", async () => {
      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Daily Photo | Max Harding");
      expect(metadata.description).toContain("travels around the world");
      expect(metadata.openGraph?.url).toBe("/photo-of-the-day");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((metadata.twitter as any)?.card).toBe("summary_large_image");
    });
  });
});
