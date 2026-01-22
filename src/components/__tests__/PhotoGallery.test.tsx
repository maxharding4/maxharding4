/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from "@testing-library/react";
import PhotoGallery from "../PhotoGallery";
import { Asset } from "contentful";
import React from "react";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

describe("PhotoGallery", () => {
  const mockPhotos: Asset[] = [
    {
      sys: {
        id: "photo-1",
        type: "Asset",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        locale: "en-US",
        revision: 1,
      },
      fields: {
        title: "Beach Photo",
        file: {
          url: "//images.ctfassets.net/space/beach.jpg",
          details: {
            size: 12345,
            image: {
              width: 1200,
              height: 800,
            },
          },
          fileName: "beach.jpg",
          contentType: "image/jpeg",
        },
      },
      metadata: {
        tags: [],
      },
    } as unknown as Asset,
    {
      sys: {
        id: "photo-2",
        type: "Asset",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        locale: "en-US",
        revision: 1,
      },
      fields: {
        title: "Mountain Photo",
        file: {
          url: "//images.ctfassets.net/space/mountain.jpg",
          details: {
            size: 23456,
            image: {
              width: 1920,
              height: 1080,
            },
          },
          fileName: "mountain.jpg",
          contentType: "image/jpeg",
        },
      },
      metadata: {
        tags: [],
      },
    } as unknown as Asset,
    {
      sys: {
        id: "photo-3",
        type: "Asset",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
        locale: "en-US",
        revision: 1,
      },
      fields: {
        title: "City Photo",
        file: {
          url: "//images.ctfassets.net/space/city.jpg",
          details: {
            size: 34567,
            image: {
              width: 1600,
              height: 900,
            },
          },
          fileName: "city.jpg",
          contentType: "image/jpeg",
        },
      },
      metadata: {
        tags: [],
      },
    } as unknown as Asset,
  ];

  const defaultProps = {
    photos: mockPhotos,
    cityName: "Barcelona",
  };

  describe("Photo Grid Rendering", () => {
    it("should render all photos in a grid", () => {
      render(<PhotoGallery {...defaultProps} />);
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThanOrEqual(mockPhotos.length);
    });

    it("should render photo thumbnails with correct URLs", () => {
      render(<PhotoGallery {...defaultProps} />);
      const images = screen.getAllByRole("img");

      // Check that at least one image has the correct source
      const beachImage = images.find((img) =>
        img.getAttribute("src")?.includes("beach.jpg")
      );
      expect(beachImage).toBeInTheDocument();
    });

    it("should render clickable buttons for each photo", () => {
      render(<PhotoGallery {...defaultProps} />);
      const buttons = screen.getAllByRole("button");

      // At least as many buttons as photos (excluding lightbox buttons which aren't visible initially)
      const photoButtons = buttons.filter((btn) =>
        btn.getAttribute("aria-label")?.includes("View photo")
      );
      expect(photoButtons).toHaveLength(mockPhotos.length);
    });

    it("should use city name as alt text fallback when photo has no title", () => {
      const photoWithoutTitle: Asset = {
        ...mockPhotos[0],
        fields: {
          ...mockPhotos[0].fields,
          title: undefined,
        },
      } as unknown as Asset;

      render(<PhotoGallery photos={[photoWithoutTitle]} cityName="Madrid" />);
      const button = screen.getByRole("button", { name: /View photo 1 - Madrid/i });
      expect(button).toBeInTheDocument();
    });

    it("should not render photos without URLs", () => {
      const photoWithoutUrl: Asset = {
        ...mockPhotos[0],
        fields: {
          title: "No URL Photo",
          file: undefined,
        },
      } as unknown as Asset;

      render(
        <PhotoGallery photos={[photoWithoutUrl, mockPhotos[1]]} cityName="Barcelona" />
      );

      const images = screen.getAllByRole("img");
      // Should only render one image (the valid one)
      expect(images.length).toBe(1);
    });
  });

  describe("Lightbox Functionality", () => {
    it("should open lightbox when clicking on a photo", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const lightbox = screen.getByRole("dialog", { name: "Photo viewer" });
      expect(lightbox).toBeInTheDocument();
    });

    it("should display the correct photo in lightbox", () => {
      render(<PhotoGallery {...defaultProps} />);

      const secondPhotoButton = screen.getByRole("button", { name: /View photo 2/i });
      fireEvent.click(secondPhotoButton);

      const lightboxImages = screen.getAllByRole("img");
      const lightboxImage = lightboxImages.find((img) =>
        img.getAttribute("src")?.includes("mountain.jpg")
      );
      expect(lightboxImage).toBeInTheDocument();
    });

    it("should close lightbox when clicking close button", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const closeButton = screen.getByRole("button", { name: "Close photo viewer" });
      fireEvent.click(closeButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should close lightbox when clicking on overlay", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const lightbox = screen.getByRole("dialog");
      fireEvent.click(lightbox);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should not close lightbox when clicking on the image itself", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const images = screen.getAllByRole("img");
      const lightboxImage = images.find((img) =>
        img.getAttribute("src")?.includes("beach.jpg") &&
        (img as HTMLImageElement).width === 1920
      );

      if (lightboxImage) {
        fireEvent.click(lightboxImage);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      }
    });

    it("should display photo counter in lightbox", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });
  });

  describe("Navigation Buttons", () => {
    it("should show navigation buttons when there are multiple photos", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      expect(screen.getByRole("button", { name: "Previous photo" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next photo" })).toBeInTheDocument();
    });

    it("should not show navigation buttons when there is only one photo", () => {
      render(<PhotoGallery photos={[mockPhotos[0]]} cityName="Barcelona" />);

      const photoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(photoButton);

      expect(screen.queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
    });

    it("should navigate to next photo when clicking next button", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      expect(screen.getByText("1 / 3")).toBeInTheDocument();

      const nextButton = screen.getByRole("button", { name: "Next photo" });
      fireEvent.click(nextButton);

      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("should navigate to previous photo when clicking previous button", () => {
      render(<PhotoGallery {...defaultProps} />);

      const secondPhotoButton = screen.getByRole("button", { name: /View photo 2/i });
      fireEvent.click(secondPhotoButton);

      expect(screen.getByText("2 / 3")).toBeInTheDocument();

      const prevButton = screen.getByRole("button", { name: "Previous photo" });
      fireEvent.click(prevButton);

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("should wrap to last photo when clicking previous on first photo", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const prevButton = screen.getByRole("button", { name: "Previous photo" });
      fireEvent.click(prevButton);

      expect(screen.getByText("3 / 3")).toBeInTheDocument();
    });

    it("should wrap to first photo when clicking next on last photo", () => {
      render(<PhotoGallery {...defaultProps} />);

      const lastPhotoButton = screen.getByRole("button", { name: /View photo 3/i });
      fireEvent.click(lastPhotoButton);

      const nextButton = screen.getByRole("button", { name: "Next photo" });
      fireEvent.click(nextButton);

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("should not propagate click events from navigation buttons to overlay", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const nextButton = screen.getByRole("button", { name: "Next photo" });
      fireEvent.click(nextButton);

      // Lightbox should still be open
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should close lightbox when pressing Escape key", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const lightbox = screen.getByRole("dialog");
      fireEvent.keyDown(lightbox, { key: "Escape" });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should navigate to next photo when pressing ArrowRight key", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      expect(screen.getByText("1 / 3")).toBeInTheDocument();

      const lightbox = screen.getByRole("dialog");
      fireEvent.keyDown(lightbox, { key: "ArrowRight" });

      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("should navigate to previous photo when pressing ArrowLeft key", () => {
      render(<PhotoGallery {...defaultProps} />);

      const secondPhotoButton = screen.getByRole("button", { name: /View photo 2/i });
      fireEvent.click(secondPhotoButton);

      expect(screen.getByText("2 / 3")).toBeInTheDocument();

      const lightbox = screen.getByRole("dialog");
      fireEvent.keyDown(lightbox, { key: "ArrowLeft" });

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("should wrap around when navigating with arrow keys", () => {
      render(<PhotoGallery {...defaultProps} />);

      const lastPhotoButton = screen.getByRole("button", { name: /View photo 3/i });
      fireEvent.click(lastPhotoButton);

      const lightbox = screen.getByRole("dialog");
      fireEvent.keyDown(lightbox, { key: "ArrowRight" });

      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on photo buttons", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstButton = screen.getByRole("button", { name: /View photo 1 - Beach Photo/i });
      expect(firstButton).toBeInTheDocument();
    });

    it("should have proper ARIA labels on lightbox", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const lightbox = screen.getByRole("dialog", { name: "Photo viewer" });
      expect(lightbox).toHaveAttribute("aria-modal", "true");
    });

    it("should have proper ARIA labels on navigation buttons", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      expect(screen.getByRole("button", { name: "Close photo viewer" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Previous photo" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next photo" })).toBeInTheDocument();
    });

    it("should hide decorative SVG icons from screen readers", () => {
      render(<PhotoGallery {...defaultProps} />);

      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive grid classes", () => {
      const { container } = render(<PhotoGallery {...defaultProps} />);

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid-cols-1");
      expect(grid).toHaveClass("sm:grid-cols-2");
      expect(grid).toHaveClass("lg:grid-cols-3");
      expect(grid).toHaveClass("xl:grid-cols-4");
    });

    it("should have proper image sizing for different viewports", () => {
      render(<PhotoGallery {...defaultProps} />);

      const images = screen.getAllByRole("img");
      const thumbnailImage = images[0];

      expect(thumbnailImage).toHaveAttribute(
        "sizes",
        expect.stringContaining("(max-width: 640px) 100vw")
      );
    });
  });

  describe("Security Tests", () => {
    it("should safely handle malicious image URLs", () => {
      const maliciousPhoto: Asset = {
        ...mockPhotos[0],
        fields: {
          title: "Test",
          file: {
            url: "javascript:alert('XSS')",
            details: {
              size: 12345,
              image: {
                width: 1200,
                height: 800,
              },
            },
            fileName: "test.jpg",
            contentType: "image/jpeg",
          },
        },
      } as unknown as Asset;

      expect(() => {
        render(<PhotoGallery photos={[maliciousPhoto]} cityName="Test City" />);
      }).not.toThrow();
    });

    it("should sanitize photo titles to prevent XSS", () => {
      const xssPhoto: Asset = {
        ...mockPhotos[0],
        fields: {
          ...mockPhotos[0].fields,
          title: '<script>alert("XSS")</script>',
        },
      } as unknown as Asset;

      render(<PhotoGallery photos={[xssPhoto]} cityName="Barcelona" />);

      // React automatically escapes text content, so the script should be rendered as text
      const button = screen.getByRole("button", {
        name: /View photo 1 - <script>alert\("XSS"\)<\/script>/i,
      });
      expect(button).toBeInTheDocument();

      // Ensure no script was actually executed
      expect(document.querySelectorAll("script").length).toBe(0);
    });

    it("should handle extremely long photo titles without breaking layout", () => {
      const longTitlePhoto: Asset = {
        ...mockPhotos[0],
        fields: {
          ...mockPhotos[0].fields,
          title: "A".repeat(1000),
        },
      } as unknown as Asset;

      expect(() => {
        render(<PhotoGallery photos={[longTitlePhoto]} cityName="Barcelona" />);
      }).not.toThrow();
    });

    it("should handle null or undefined photo fields gracefully", () => {
      const invalidPhoto: Asset = {
        sys: mockPhotos[0].sys,
        fields: null as never,
        metadata: {
          tags: [],
        },
      } as unknown as Asset;

      expect(() => {
        render(<PhotoGallery photos={[invalidPhoto]} cityName="Barcelona" />);
      }).not.toThrow();
    });

    it("should prevent event handler injection through photo data", () => {
      const maliciousPhoto: Asset = {
        ...mockPhotos[0],
        fields: {
          title: '" onclick="alert(\'XSS\')" data-test="',
          file: mockPhotos[0].fields.file,
        },
      } as unknown as Asset;

      render(<PhotoGallery photos={[maliciousPhoto]} cityName="Barcelona" />);

      const button = screen.getAllByRole("button")[0];
      expect(button.getAttribute("onclick")).toBeNull();
    });

    it("should enforce https protocol on image URLs", () => {
      render(<PhotoGallery {...defaultProps} />);

      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && src.startsWith("http")) {
          expect(src).toMatch(/^https:/);
        }
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle empty photos array", () => {
      const { container } = render(<PhotoGallery photos={[]} cityName="Barcelona" />);

      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
      expect(grid?.children.length).toBe(0);
    });

    it("should handle photos with missing file details", () => {
      const photoWithoutDetails: Asset = {
        ...mockPhotos[0],
        fields: {
          title: "Test",
          file: {
            url: "//images.ctfassets.net/test.jpg",
            details: undefined,
            fileName: "test.jpg",
            contentType: "image/jpeg",
          },
        },
      } as unknown as Asset;

      expect(() => {
        render(<PhotoGallery photos={[photoWithoutDetails]} cityName="Barcelona" />);
      }).not.toThrow();
    });

    it("should handle invalid photo sys.id gracefully", () => {
      const invalidIdPhoto: Asset = {
        ...mockPhotos[0],
        sys: {
          ...mockPhotos[0].sys,
          id: undefined as unknown as string,
        },
      };

      expect(() => {
        render(<PhotoGallery photos={[invalidIdPhoto]} cityName="Barcelona" />);
      }).not.toThrow();
    });
  });

  describe("Styling and Visual Feedback", () => {
    it("should apply hover effects on photo thumbnails", () => {
      const { container } = render(<PhotoGallery {...defaultProps} />);

      const buttons = container.querySelectorAll("button.group");
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]).toHaveClass("hover:shadow-xl");
      expect(buttons[0]).toHaveClass("hover:scale-105");
    });

    it("should apply transition classes for smooth animations", () => {
      const { container } = render(<PhotoGallery {...defaultProps} />);

      const buttons = container.querySelectorAll("button.group");
      expect(buttons[0]).toHaveClass("transition-all");
      expect(buttons[0]).toHaveClass("duration-300");
    });

    it("should have focus styles for keyboard navigation", () => {
      const { container } = render(<PhotoGallery {...defaultProps} />);

      const buttons = container.querySelectorAll("button.group");
      expect(buttons[0]).toHaveClass("focus:outline-none");
      expect(buttons[0]).toHaveClass("focus:ring-2");
      expect(buttons[0]).toHaveClass("focus:ring-blue-500");
    });
  });

  describe("Breakpoint Responsiveness", () => {
    it("applies responsive grid layout classes", () => {
      const { container } = render(<PhotoGallery photos={mockPhotos} cityName="Barcelona" />);
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid");
      expect(grid).toHaveClass("grid-cols-1");
      expect(grid).toHaveClass("sm:grid-cols-2");
      expect(grid).toHaveClass("lg:grid-cols-3");
      expect(grid).toHaveClass("xl:grid-cols-4");
    });

    it("applies consistent gap spacing", () => {
      const { container } = render(<PhotoGallery photos={mockPhotos} cityName="Barcelona" />);
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("gap-4");
    });

    it("uses responsive image sizes attribute", () => {
      render(<PhotoGallery photos={mockPhotos} cityName="Barcelona" />);
      const images = screen.getAllByRole("img");
      const firstImage = images[0];
      expect(firstImage).toHaveAttribute("sizes");
      const sizes = firstImage.getAttribute("sizes");
      expect(sizes).toContain("max-width: 640px");
      expect(sizes).toContain("max-width: 1024px");
      expect(sizes).toContain("max-width: 1280px");
    });

    it("lightbox modal is viewport-aware", () => {
      render(<PhotoGallery photos={mockPhotos} cityName="Barcelona" />);
      const firstPhotoButton = screen.getByRole("button", { name: /View photo 1/i });
      fireEvent.click(firstPhotoButton);

      const lightbox = screen.getByRole("dialog", { name: "Photo viewer" });
      const lightboxImage = lightbox.querySelector("img");
      expect(lightboxImage?.parentElement).toHaveClass("max-h-[90vh]", "max-w-[90vw]");
    });

    it("applies responsive aspect ratio to photo container", () => {
      const { container } = render(<PhotoGallery photos={mockPhotos} cityName="Barcelona" />);
      const aspectContainer = container.querySelector(".aspect-\\[4\\/3\\]");
      expect(aspectContainer).toBeInTheDocument();
      expect(aspectContainer).toHaveClass("aspect-[4/3]");
    });
  });
});
