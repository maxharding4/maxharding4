/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import Breadcrumb from "../Breadcrumb";
import React from "react";

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe("Breadcrumb", () => {
  describe("Rendering", () => {
    it("should render a single breadcrumb item", () => {
      render(<Breadcrumb items={[{ label: "Home" }]} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("should render multiple breadcrumb items", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel", href: "/travel" },
            { label: "Spain" },
          ]}
        />
      );
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Travel")).toBeInTheDocument();
      expect(screen.getByText("Spain")).toBeInTheDocument();
    });

    it("should render links for items with href", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel", href: "/travel" },
            { label: "Spain" },
          ]}
        />
      );
      const homeLink = screen.getByRole("link", { name: "Home" });
      const travelLink = screen.getByRole("link", { name: "Travel" });
      expect(homeLink).toHaveAttribute("href", "/");
      expect(travelLink).toHaveAttribute("href", "/travel");
    });

    it("should render last item as text, not link", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current Page" },
          ]}
        />
      );
      const currentPage = screen.getByText("Current Page");
      expect(currentPage.tagName).toBe("SPAN");
    });

    it("should not render link for last item even if href provided", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current Page", href: "/current" },
          ]}
        />
      );
      // Last item should be a span, not a link
      const currentPage = screen.getByText("Current Page");
      expect(currentPage.tagName).toBe("SPAN");
    });

    it("should render separator between items", () => {
      const { container } = render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      // There should be one separator between two items
      const separators = container.querySelectorAll("svg");
      expect(separators).toHaveLength(1);
    });

    it("should not render separator before first item", () => {
      const { container } = render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      // First list item should not have a separator
      const firstItem = container.querySelector("li");
      const svgInFirstItem = firstItem?.querySelector("svg");
      expect(svgInFirstItem).not.toBeInTheDocument();
    });

    it("should render correct number of separators", () => {
      const { container } = render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel", href: "/travel" },
            { label: "Spain", href: "/travel/spain" },
            { label: "Barcelona" },
          ]}
        />
      );
      // 4 items = 3 separators
      const separators = container.querySelectorAll("svg");
      expect(separators).toHaveLength(3);
    });

    it("should handle empty items array", () => {
      const { container } = render(<Breadcrumb items={[]} />);
      const listItems = container.querySelectorAll("li");
      expect(listItems).toHaveLength(0);
    });

    it("should render item without href as span (non-last)", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home" },
            { label: "Travel", href: "/travel" },
            { label: "Spain" },
          ]}
        />
      );
      // First item has no href and is not last, should be span
      const home = screen.getByText("Home");
      expect(home.tagName).toBe("SPAN");
    });
  });

  describe("Accessibility", () => {
    it("should have nav element with aria-label", () => {
      render(<Breadcrumb items={[{ label: "Home" }]} />);
      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
    });

    it("should use ordered list for semantic structure", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      const list = screen.getByRole("list");
      expect(list.tagName).toBe("OL");
    });

    it("should have aria-current on last item", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current Page" },
          ]}
        />
      );
      const currentPage = screen.getByText("Current Page");
      expect(currentPage).toHaveAttribute("aria-current", "page");
    });

    it("should not have aria-current on non-last items", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel", href: "/travel" },
            { label: "Spain" },
          ]}
        />
      );
      const home = screen.getByText("Home");
      const travel = screen.getByText("Travel");
      expect(home).not.toHaveAttribute("aria-current");
      expect(travel).not.toHaveAttribute("aria-current");
    });

    it("should have aria-hidden on separator icons", () => {
      const { container } = render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      const separator = container.querySelector("svg");
      expect(separator).toHaveAttribute("aria-hidden", "true");
    });

    it("should have accessible link names", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel", href: "/travel" },
            { label: "Spain" },
          ]}
        />
      );
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Travel" })).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should have correct styling for last item", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current Page" },
          ]}
        />
      );
      const lastItem = screen.getByText("Current Page");
      expect(lastItem.className).toContain("font-medium");
      expect(lastItem.className).toContain("text-gray-900");
    });

    it("should have correct styling for non-last text items", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home" },
            { label: "Travel" },
            { label: "Spain" },
          ]}
        />
      );
      const home = screen.getByText("Home");
      expect(home.className).toContain("text-gray-500");
    });

    it("should have hover styles on links", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      const link = screen.getByRole("link", { name: "Home" });
      expect(link.className).toContain("hover:text-blue-600");
      expect(link.className).toContain("transition-colors");
    });

    it("should have proper flex layout", () => {
      const { container } = render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      const list = container.querySelector("ol");
      expect(list?.className).toContain("flex");
      expect(list?.className).toContain("flex-wrap");
      expect(list?.className).toContain("items-center");
    });

    it("should have margin bottom on nav", () => {
      render(<Breadcrumb items={[{ label: "Home" }]} />);
      const nav = screen.getByRole("navigation");
      expect(nav.className).toContain("mb-6");
    });

    it("should have small text size", () => {
      const { container } = render(
        <Breadcrumb items={[{ label: "Home" }]} />
      );
      const list = container.querySelector("ol");
      expect(list?.className).toContain("text-sm");
    });

    it("should have gap between items", () => {
      const { container } = render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      const list = container.querySelector("ol");
      expect(list?.className).toContain("gap-2");
    });
  });

  describe("Security", () => {
    it("should not execute script tags in labels", () => {
      render(
        <Breadcrumb
          items={[
            { label: '<script>alert("xss")</script>Home', href: "/" },
            { label: "Travel" },
          ]}
        />
      );
      // React automatically escapes content
      expect(screen.getByText(/Home/)).toBeInTheDocument();
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should safely handle special characters in href", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Malicious", href: "javascript:alert('xss')" },
            { label: "Current" },
          ]}
        />
      );
      const link = screen.getByRole("link", { name: "Malicious" });
      // React blocks javascript: URLs as a security precaution
      expect(link).toHaveAttribute("href");
      // The link should either be blocked or sanitized by React
      const href = link.getAttribute("href") || "";
      expect(href).not.toContain("alert");
    });

    it("should handle HTML entities in labels", () => {
      render(
        <Breadcrumb
          items={[
            { label: "A & B", href: "/" },
            { label: "C < D" },
          ]}
        />
      );
      expect(screen.getByText("A & B")).toBeInTheDocument();
      expect(screen.getByText("C < D")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long labels", () => {
      const longLabel = "A".repeat(200);
      render(
        <Breadcrumb
          items={[
            { label: longLabel, href: "/" },
            { label: "Current" },
          ]}
        />
      );
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle unicode characters in labels", () => {
      render(
        <Breadcrumb
          items={[
            { label: "日本", href: "/japan" },
            { label: "東京" },
          ]}
        />
      );
      expect(screen.getByText("日本")).toBeInTheDocument();
      expect(screen.getByText("東京")).toBeInTheDocument();
    });

    it("should handle emoji in labels", () => {
      render(
        <Breadcrumb
          items={[
            { label: "🌍 World", href: "/" },
            { label: "🇪🇸 Spain" },
          ]}
        />
      );
      expect(screen.getByText("🌍 World")).toBeInTheDocument();
      expect(screen.getByText("🇪🇸 Spain")).toBeInTheDocument();
    });

    it("should handle empty string labels", () => {
      render(
        <Breadcrumb
          items={[
            { label: "", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      expect(screen.getByText("Current")).toBeInTheDocument();
    });

    it("should handle whitespace-only labels", () => {
      render(
        <Breadcrumb
          items={[
            { label: "   ", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      expect(screen.getByText("Current")).toBeInTheDocument();
    });

    it("should handle deeply nested paths", () => {
      render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Level 1", href: "/a" },
            { label: "Level 2", href: "/a/b" },
            { label: "Level 3", href: "/a/b/c" },
            { label: "Level 4", href: "/a/b/c/d" },
            { label: "Current" },
          ]}
        />
      );
      expect(screen.getAllByRole("link")).toHaveLength(5);
      expect(screen.getByText("Current")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have flex-wrap for responsive wrapping", () => {
      const { container } = render(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Travel", href: "/travel" },
            { label: "Spain" },
          ]}
        />
      );
      const list = container.querySelector("ol");
      expect(list?.className).toContain("flex-wrap");
    });
  });
});
