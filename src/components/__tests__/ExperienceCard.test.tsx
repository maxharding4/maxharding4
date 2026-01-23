/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import ExperienceCard from "../ExperienceCard";

describe("ExperienceCard", () => {
  const mockWorkExperience = {
    title: "Lead QA Engineer",
    subtitle: "Tech Company",
    location: "San Francisco, CA",
    startDate: "2022-01-15",
    endDate: undefined,
    current: true,
    description: "Leading QA team of 5 engineers, establishing testing standards.",
    highlights: ["Built automation framework", "Reduced bugs by 40%"],
    technologies: ["Jest", "Selenium", "Cypress"],
    type: "work" as const,
  };

  const mockEducation = {
    title: "Bachelor of Science in Computer Science",
    subtitle: "State University",
    location: "London, UK",
    startDate: "2012-09-01",
    endDate: "2016-05-20",
    current: false,
    description: "Focus on software engineering and algorithms.",
    highlights: ["First Class Honours", "Dean's List"],
    technologies: undefined,
    type: "education" as const,
  };

  describe("Rendering", () => {
    it("should render work experience card", () => {
      render(<ExperienceCard {...mockWorkExperience} />);

      expect(screen.getByText("Lead QA Engineer")).toBeInTheDocument();
      expect(screen.getByText("Tech Company")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    });

    it("should render education card", () => {
      render(<ExperienceCard {...mockEducation} />);

      expect(screen.getByText("Bachelor of Science in Computer Science")).toBeInTheDocument();
      expect(screen.getByText("State University")).toBeInTheDocument();
      expect(screen.getByText("London, UK")).toBeInTheDocument();
    });

    it("should render as article element", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const article = container.querySelector("article");
      expect(article).toBeInTheDocument();
    });

    it("should have semantic h3 heading for title", () => {
      render(<ExperienceCard {...mockWorkExperience} />);
      const heading = screen.getByRole("heading", { level: 3, name: "Lead QA Engineer" });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should format dates as MMM YYYY", () => {
      render(<ExperienceCard {...mockEducation} />);

      // The exact format depends on locale, but should include year
      expect(screen.getByText(/Sep 2012/i)).toBeInTheDocument();
      expect(screen.getByText(/May 2016/i)).toBeInTheDocument();
    });

    it("should display 'Present' for current roles", () => {
      render(<ExperienceCard {...mockWorkExperience} />);
      expect(screen.getByText("Present")).toBeInTheDocument();
    });

    it("should display 'Present' when endDate is undefined and current is true", () => {
      render(<ExperienceCard {...mockWorkExperience} current={true} endDate={undefined} />);
      expect(screen.getByText("Present")).toBeInTheDocument();
    });

    it("should use semantic time elements for dates", () => {
      const { container } = render(<ExperienceCard {...mockEducation} />);
      const timeElements = container.querySelectorAll("time");

      expect(timeElements.length).toBeGreaterThanOrEqual(2); // Start and end date
      expect(timeElements[0]).toHaveAttribute("datetime", "2012-09-01");
    });

    it("should handle invalid date formats gracefully", () => {
      render(<ExperienceCard {...mockWorkExperience} startDate="invalid-date" />);
      // Should render without crashing
      expect(screen.getByText("Tech Company")).toBeInTheDocument();
    });
  });

  describe("Current Role Highlighting", () => {
    it("should have blue border for current roles", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} current={true} />);
      const article = container.querySelector("article");
      expect(article).toHaveClass("border-blue-500", "bg-blue-50");
    });

    it("should have gray border for past roles", () => {
      const { container } = render(<ExperienceCard {...mockEducation} current={false} />);
      const article = container.querySelector("article");
      expect(article).toHaveClass("border-gray-200", "bg-white");
    });

    it("should have blue badge for current roles", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} current={true} />);
      const badge = container.querySelector(".bg-blue-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-blue-800");
    });

    it("should have gray badge for past roles", () => {
      const { container } = render(<ExperienceCard {...mockEducation} current={false} />);
      const badge = container.querySelector(".bg-gray-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-gray-700");
    });
  });

  describe("Technologies (Work Only)", () => {
    it("should render technologies for work experience", () => {
      render(<ExperienceCard {...mockWorkExperience} />);

      expect(screen.getByText("Technologies")).toBeInTheDocument();
      expect(screen.getByText("Jest")).toBeInTheDocument();
      expect(screen.getByText("Selenium")).toBeInTheDocument();
      expect(screen.getByText("Cypress")).toBeInTheDocument();
    });

    it("should not render technologies section for education", () => {
      render(<ExperienceCard {...mockEducation} />);
      expect(screen.queryByText("Technologies")).not.toBeInTheDocument();
    });

    it("should render technologies as pills/badges", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const techBadges = container.querySelectorAll(".bg-gray-100.text-gray-700");

      expect(techBadges.length).toBeGreaterThanOrEqual(3);
    });

    it("should not render technologies section when array is empty", () => {
      render(<ExperienceCard {...mockWorkExperience} technologies={[]} />);
      expect(screen.queryByText("Technologies")).not.toBeInTheDocument();
    });

    it("should not render technologies section when undefined", () => {
      render(<ExperienceCard {...mockWorkExperience} technologies={undefined} />);
      expect(screen.queryByText("Technologies")).not.toBeInTheDocument();
    });
  });

  describe("Highlights and Achievements", () => {
    it("should render 'Key Achievements' heading for work experience", () => {
      render(<ExperienceCard {...mockWorkExperience} />);
      expect(screen.getByText("Key Achievements")).toBeInTheDocument();
    });

    it("should render 'Honors' heading for education", () => {
      render(<ExperienceCard {...mockEducation} />);
      expect(screen.getByText("Honors")).toBeInTheDocument();
    });

    it("should render all highlights as list items", () => {
      render(<ExperienceCard {...mockWorkExperience} />);

      expect(screen.getByText("Built automation framework")).toBeInTheDocument();
      expect(screen.getByText("Reduced bugs by 40%")).toBeInTheDocument();
    });

    it("should not render highlights section when array is empty", () => {
      render(<ExperienceCard {...mockWorkExperience} highlights={[]} />);
      expect(screen.queryByText("Key Achievements")).not.toBeInTheDocument();
    });

    it("should not render highlights section when undefined", () => {
      render(<ExperienceCard {...mockWorkExperience} highlights={undefined} />);
      expect(screen.queryByText("Key Achievements")).not.toBeInTheDocument();
    });
  });

  describe("Description", () => {
    it("should render description when provided", () => {
      render(<ExperienceCard {...mockWorkExperience} />);
      expect(screen.getByText("Leading QA team of 5 engineers, establishing testing standards.")).toBeInTheDocument();
    });

    it("should not render description when undefined", () => {
      render(<ExperienceCard {...mockWorkExperience} description={undefined} />);
      const descriptions = screen.queryByText("Leading QA team of 5 engineers, establishing testing standards.");
      expect(descriptions).not.toBeInTheDocument();
    });

    it("should render description with proper styling", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const description = container.querySelector(".text-base.text-gray-600");
      expect(description).toBeInTheDocument();
    });
  });

  describe("Location", () => {
    it("should render location with icon", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const svg = container.querySelector("svg");

      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
      expect(svg).toBeInTheDocument();
    });

    it("should not render location when undefined", () => {
      render(<ExperienceCard {...mockWorkExperience} location={undefined} />);
      expect(screen.queryByText("San Francisco, CA")).not.toBeInTheDocument();
    });

    it("should hide location icon from screen readers", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const svg = container.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have descriptive aria-label for work experience", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const article = container.querySelector("article");

      expect(article).toHaveAttribute(
        "aria-label",
        "Work experience: Lead QA Engineer at Tech Company"
      );
    });

    it("should have descriptive aria-label for education", () => {
      const { container } = render(<ExperienceCard {...mockEducation} />);
      const article = container.querySelector("article");

      expect(article).toHaveAttribute(
        "aria-label",
        "Education: Bachelor of Science in Computer Science at State University"
      );
    });

    it("should use semantic HTML structure", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);

      expect(container.querySelector("article")).toBeInTheDocument();
      expect(container.querySelector("h3")).toBeInTheDocument();
      expect(container.querySelector("time")).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(<ExperienceCard {...mockWorkExperience} />);

      const h3 = screen.getByRole("heading", { level: 3 });
      const h4s = screen.getAllByRole("heading", { level: 4 });

      expect(h3).toBeInTheDocument(); // Title
      expect(h4s.length).toBeGreaterThanOrEqual(1); // "Key Achievements" and/or "Technologies"
    });
  });

  describe("Styling", () => {
    it("should apply card styling", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const article = container.querySelector("article");

      expect(article).toHaveClass(
        "rounded-lg",
        "border",
        "p-6",
        "shadow-sm",
        "hover:shadow-md",
        "transition-all",
        "duration-300"
      );
    });

    it("should have responsive text sizing", () => {
      const { container } = render(<ExperienceCard {...mockWorkExperience} />);
      const h3 = container.querySelector("h3");

      expect(h3).toHaveClass("text-xl", "sm:text-2xl");
    });
  });

  describe("Security", () => {
    it("should sanitize XSS attempts in title", () => {
      render(<ExperienceCard {...mockWorkExperience} title='<script>alert("XSS")</script>' />);
      expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
      expect(document.querySelectorAll("script").length).toBe(0);
    });

    it("should sanitize XSS attempts in description", () => {
      const xssDescription = '<img src=x onerror="alert(1)">';
      render(<ExperienceCard {...mockWorkExperience} description={xssDescription} />);
      expect(screen.getByText(xssDescription)).toBeInTheDocument();
      expect(document.querySelectorAll("img[onerror]").length).toBe(0);
    });

    it("should sanitize XSS attempts in highlights", () => {
      const xssHighlights = ['<svg onload="alert(1)">Achievement'];
      render(<ExperienceCard {...mockWorkExperience} highlights={xssHighlights} />);
      expect(screen.getByText('<svg onload="alert(1)">Achievement')).toBeInTheDocument();
      expect(document.querySelectorAll("svg[onload]").length).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long titles", () => {
      const longTitle = "A".repeat(200);
      render(<ExperienceCard {...mockWorkExperience} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle very long descriptions", () => {
      const longDescription = "Lorem ipsum dolor sit amet. ".repeat(50);
      render(<ExperienceCard {...mockWorkExperience} description={longDescription} />);
      // Check that the description contains the repeated text
      expect(screen.getByText(/Lorem ipsum dolor sit amet\./i)).toBeInTheDocument();
    });

    it("should handle empty highlights array", () => {
      render(<ExperienceCard {...mockWorkExperience} highlights={[]} />);
      expect(screen.queryByText("Key Achievements")).not.toBeInTheDocument();
    });

    it("should handle empty technologies array", () => {
      render(<ExperienceCard {...mockWorkExperience} technologies={[]} />);
      expect(screen.queryByText("Technologies")).not.toBeInTheDocument();
    });

    it("should handle special characters in location", () => {
      render(<ExperienceCard {...mockWorkExperience} location="São Paulo, Brasil" />);
      expect(screen.getByText("São Paulo, Brasil")).toBeInTheDocument();
    });

    it("should handle missing optional fields", () => {
      const minimalProps = {
        title: "Job Title",
        subtitle: "Company",
        startDate: "2020-01-01",
        type: "work" as const,
      };

      expect(() => render(<ExperienceCard {...minimalProps} />)).not.toThrow();
    });
  });
});
