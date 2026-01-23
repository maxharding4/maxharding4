/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import NavigationCard from "../NavigationCard";
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

describe("NavigationCard", () => {
  const defaultProps = {
    title: "Professional CV",
    description: "View my work experience, skills, and professional background",
    href: "/cv",
  };

  describe("Rendering", () => {
    it("should render title correctly", () => {
      render(<NavigationCard {...defaultProps} />);
      expect(screen.getByText("Professional CV")).toBeInTheDocument();
    });

    it("should render description correctly", () => {
      render(<NavigationCard {...defaultProps} />);
      expect(
        screen.getByText(
          "View my work experience, skills, and professional background"
        )
      ).toBeInTheDocument();
    });

    it("should render link with correct href", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/cv");
    });

    it("should render Explore call-to-action", () => {
      render(<NavigationCard {...defaultProps} />);
      expect(screen.getByText("Explore")).toBeInTheDocument();
    });

    it("should render arrow icon", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Gradient Backgrounds", () => {
    it("should use default gradient when not specified", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const article = container.querySelector("article");
      expect(article?.className).toContain("from-gray-50");
      expect(article?.className).toContain("to-gray-100");
    });

    it("should use custom gradient when provided", () => {
      const { container } = render(
        <NavigationCard
          {...defaultProps}
          gradient="from-blue-50 to-blue-100"
        />
      );
      const article = container.querySelector("article");
      expect(article?.className).toContain("from-blue-50");
      expect(article?.className).toContain("to-blue-100");
    });

    it("should apply gradient with bg-gradient-to-br direction", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const article = container.querySelector("article");
      expect(article?.className).toContain("bg-gradient-to-br");
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic HTML structure with article", () => {
      render(<NavigationCard {...defaultProps} />);
      const article = screen.getByRole("article");
      expect(article).toBeInTheDocument();
    });

    it("should have accessible link with proper href", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/cv");
    });

    it("should have keyboard focus styles on link", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("focus:outline-none");
      expect(link.className).toContain("focus:ring-2");
      expect(link.className).toContain("focus:ring-blue-500");
      expect(link.className).toContain("focus:ring-offset-2");
    });

    it("should use heading level 3 for title", () => {
      render(<NavigationCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Professional CV");
    });

    it("should have descriptive link text (not just 'click here')", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      // The card title provides context for the link
      expect(link.textContent).toContain("Professional CV");
    });

    it("should have aria-hidden on decorative arrow icon", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("should be keyboard accessible with tab key", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      // Link should be focusable by default
      expect(link).not.toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Security", () => {
    it("should not execute script tags in title", () => {
      render(
        <NavigationCard
          {...defaultProps}
          title='<script>alert("xss")</script>CV'
        />
      );
      expect(screen.getByText(/CV/)).toBeInTheDocument();
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should not execute script tags in description", () => {
      render(
        <NavigationCard
          {...defaultProps}
          description='<script>alert("xss")</script>View my work'
        />
      );
      expect(screen.getByText(/View my work/)).toBeInTheDocument();
      expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("should safely handle special characters in href", () => {
      render(
        <NavigationCard
          {...defaultProps}
          href="/cv/../../../etc/passwd"
        />
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/cv/../../../etc/passwd");
    });

    it("should escape HTML entities in title", () => {
      render(
        <NavigationCard {...defaultProps} title="CV & Resume <strong>Bold</strong>" />
      );
      // React escapes HTML by default
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toBe("CV & Resume <strong>Bold</strong>");
      expect(heading.querySelector("strong")).not.toBeInTheDocument();
    });
  });

  describe("Styling and UX", () => {
    it("should have hover effects classes", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("hover:shadow-md");
      expect(link.className).toContain("hover:scale-105");
    });

    it("should have transition classes for smooth animations", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("transition-all");
      expect(link.className).toContain("duration-200");
    });

    it("should have border and shadow styling", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("border");
      expect(link.className).toContain("border-gray-200");
      expect(link.className).toContain("shadow-sm");
      expect(link.className).toContain("rounded-lg");
    });

    it("should have padding on article element", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const article = container.querySelector("article");
      expect(article?.className).toContain("p-6");
    });

    it("should have minimum height to ensure consistent card sizing", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const article = container.querySelector("article");
      expect(article?.className).toContain("min-h-[160px]");
    });

    it("should use flexbox for vertical spacing", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const article = container.querySelector("article");
      expect(article?.className).toContain("flex");
      expect(article?.className).toContain("flex-col");
      expect(article?.className).toContain("justify-between");
    });

    it("should have hover effect on arrow indicator", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const arrowContainer = container.querySelector(".group-hover\\:translate-x-1");
      expect(arrowContainer).toBeInTheDocument();
    });

    it("should have hover color change on title", () => {
      render(<NavigationCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.className).toContain("group-hover:text-blue-600");
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive title sizing", () => {
      render(<NavigationCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.className).toContain("text-xl");
      expect(heading.className).toContain("sm:text-2xl");
    });

    it("should be a block element for full-width in grid", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("block");
    });

    it("should have responsive description typography", () => {
      render(<NavigationCard {...defaultProps} />);
      const description = screen.getByText(/View my work experience/);
      expect(description.className).toContain("text-base");
      expect(description.className).toContain("leading-relaxed");
    });
  });

  describe("Content Variations", () => {
    it("should handle long titles gracefully", () => {
      render(
        <NavigationCard
          {...defaultProps}
          title="Professional CV, Resume, and Portfolio Showcase with Detailed Work History"
        />
      );
      expect(
        screen.getByText(
          "Professional CV, Resume, and Portfolio Showcase with Detailed Work History"
        )
      ).toBeInTheDocument();
    });

    it("should handle long descriptions gracefully", () => {
      const longDescription =
        "View my comprehensive work experience spanning over a decade in qa engineering, including detailed project descriptions, technical skills, professional certifications, education background, and notable achievements in various industries.";
      render(
        <NavigationCard {...defaultProps} description={longDescription} />
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("should handle Travel Gallery variation", () => {
      render(
        <NavigationCard
          title="Travel Gallery"
          description="Explore photos from my adventures around the world"
          href="/travel"
          gradient="from-green-50 to-green-100"
        />
      );
      expect(screen.getByText("Travel Gallery")).toBeInTheDocument();
      expect(
        screen.getByText("Explore photos from my adventures around the world")
      ).toBeInTheDocument();
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/travel");
    });
  });

  describe("Error Handling", () => {
    it("should handle empty title gracefully", () => {
      expect(() => {
        render(<NavigationCard {...defaultProps} title="" />);
      }).not.toThrow();
    });

    it("should handle empty description gracefully", () => {
      expect(() => {
        render(<NavigationCard {...defaultProps} description="" />);
      }).not.toThrow();
    });

    it("should handle empty href gracefully", () => {
      expect(() => {
        render(<NavigationCard {...defaultProps} href="" />);
      }).not.toThrow();
      // Empty href may not create accessible link role, but component should still render
      expect(screen.getByText("Professional CV")).toBeInTheDocument();
    });

    it("should handle special characters in href", () => {
      render(
        <NavigationCard
          {...defaultProps}
          href="/cv?sort=date&filter=all#section"
        />
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/cv?sort=date&filter=all#section");
    });
  });

  describe("Visual Hierarchy", () => {
    it("should have proper spacing between title and description", () => {
      render(<NavigationCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.className).toContain("mb-3");
    });

    it("should have proper spacing before arrow indicator", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const arrowContainer = container.querySelector(".mt-4");
      expect(arrowContainer).toBeInTheDocument();
    });

    it("should use semibold font weight for title", () => {
      render(<NavigationCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.className).toContain("font-semibold");
    });

    it("should use medium font weight for Explore text", () => {
      render(<NavigationCard {...defaultProps} />);
      const exploreText = screen.getByText("Explore");
      expect(exploreText.parentElement?.className).toContain("font-medium");
    });
  });

  describe("Color Scheme", () => {
    it("should use gray-900 for title text", () => {
      render(<NavigationCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.className).toContain("text-gray-900");
    });

    it("should use gray-600 for description text", () => {
      render(<NavigationCard {...defaultProps} />);
      const description = screen.getByText(/View my work experience/);
      expect(description.className).toContain("text-gray-600");
    });

    it("should use blue-600 for Explore indicator", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const exploreContainer = container.querySelector(".text-blue-600");
      expect(exploreContainer).toBeInTheDocument();
    });

    it("should use gray-200 for card border", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("border-gray-200");
    });
  });

  describe("Group Hover Effects", () => {
    it("should have group class on link for coordinated hover", () => {
      render(<NavigationCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link.className).toContain("group");
    });

    it("should change title color on hover", () => {
      render(<NavigationCard {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.className).toContain("group-hover:text-blue-600");
      expect(heading.className).toContain("transition-colors");
    });

    it("should translate arrow on hover", () => {
      const { container } = render(<NavigationCard {...defaultProps} />);
      const arrowContainer = container.querySelector(".group-hover\\:translate-x-1");
      expect(arrowContainer).toBeInTheDocument();
      expect(arrowContainer?.className).toContain("transition-transform");
    });
  });
});
