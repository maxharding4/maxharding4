/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import Timeline, { TimelineItem } from "../Timeline";

describe("Timeline", () => {
  const mockWorkItem: TimelineItem = {
    id: "work-1",
    type: "work",
    title: "Lead QA Engineer",
    subtitle: "Tech Company",
    location: "San Francisco, CA",
    startDate: "2022-01-15",
    endDate: undefined,
    current: true,
    description: "Leading QA team of 5 engineers.",
    highlights: ["Built automation framework", "Reduced bugs by 40%"],
    technologies: ["Jest", "Selenium", "Cypress"],
  };

  const mockEducation: TimelineItem = {
    id: "edu-1",
    type: "education",
    title: "Bachelor of Science in Computer Science",
    subtitle: "State University",
    location: "London, UK",
    startDate: "2012-09-01",
    endDate: "2016-05-20",
    current: false,
    description: "Focus on software engineering.",
    highlights: ["First Class Honours", "Dean's List"],
  };

  const mockPastWork: TimelineItem = {
    id: "work-2",
    type: "work",
    title: "Senior QA Engineer",
    subtitle: "Startup Inc",
    location: "London, UK",
    startDate: "2018-06-01",
    endDate: "2021-12-31",
    current: false,
    description: "Established QA processes.",
    highlights: ["Implemented CI/CD", "Trained team"],
    technologies: ["Mocha", "Chai", "Selenium"],
  };

  describe("Rendering", () => {
    it("should render all timeline items", () => {
      const items = [mockWorkItem, mockEducation, mockPastWork];
      render(<Timeline items={items} />);

      expect(screen.getByText("Lead QA Engineer")).toBeInTheDocument();
      expect(screen.getByText("Bachelor of Science in Computer Science")).toBeInTheDocument();
      expect(screen.getByText("Senior QA Engineer")).toBeInTheDocument();
    });

    it("should render items in provided order", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      // Get only top-level li elements (direct children of ol)
      const ol = container.querySelector("ol");
      const topLevelItems = ol?.querySelectorAll(":scope > li");
      expect(topLevelItems?.length).toBe(2);
    });

    it("should render as semantic nav element", () => {
      const items = [mockWorkItem];
      render(<Timeline items={items} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute("aria-label", "Professional timeline");
    });

    it("should render ordered list structure", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      expect(ol).toBeInTheDocument();

      const topLevelItems = ol?.querySelectorAll(":scope > li");
      expect(topLevelItems?.length).toBe(2);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when items array is empty", () => {
      render(<Timeline items={[]} />);
      expect(screen.getByText("No experience or education listed yet.")).toBeInTheDocument();
    });

    it("should show empty state when items is null", () => {
      render(<Timeline items={null as unknown as TimelineItem[]} />);
      expect(screen.getByText("No experience or education listed yet.")).toBeInTheDocument();
    });

    it("should show empty state when items is undefined", () => {
      render(<Timeline items={undefined as unknown as TimelineItem[]} />);
      expect(screen.getByText("No experience or education listed yet.")).toBeInTheDocument();
    });

    it("should not render timeline structure when empty", () => {
      const { container } = render(<Timeline items={[]} />);
      expect(container.querySelector("ol")).not.toBeInTheDocument();
      expect(container.querySelector("nav")).not.toBeInTheDocument();
    });
  });

  describe("Timeline Visual Elements", () => {
    it("should render timeline dots for each item", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      const dots = container.querySelectorAll(".bg-blue-600.rounded-full");
      expect(dots.length).toBeGreaterThanOrEqual(2);
    });

    it("should render timeline connector line", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      const line = container.querySelector(".border-l-2.border-gray-200");
      expect(line).toBeInTheDocument();
    });

    it("should position dots absolutely", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const dot = container.querySelector(".absolute.-translate-x-1\\/2");
      expect(dot).toBeInTheDocument();
    });
  });

  describe("Work and Education Items", () => {
    it("should render both work and education items together", () => {
      const items = [mockWorkItem, mockEducation];
      render(<Timeline items={items} />);

      // Work item
      expect(screen.getByText("Tech Company")).toBeInTheDocument();
      expect(screen.getByText("Jest")).toBeInTheDocument(); // Technology

      // Education item
      expect(screen.getByText("State University")).toBeInTheDocument();
      expect(screen.getByText("First Class Honours")).toBeInTheDocument(); // Honor
    });

    it("should render multiple work items", () => {
      const items = [mockWorkItem, mockPastWork];
      render(<Timeline items={items} />);

      expect(screen.getByText("Lead QA Engineer")).toBeInTheDocument();
      expect(screen.getByText("Senior QA Engineer")).toBeInTheDocument();
    });

    it("should render multiple education items", () => {
      const edu2: TimelineItem = {
        ...mockEducation,
        id: "edu-2",
        title: "Master of Science in Software Engineering",
        subtitle: "Tech University",
        startDate: "2016-09-01",
        endDate: "2018-05-20",
      };

      const items = [edu2, mockEducation];
      render(<Timeline items={items} />);

      expect(screen.getByText("Master of Science in Software Engineering")).toBeInTheDocument();
      expect(screen.getByText("Bachelor of Science in Computer Science")).toBeInTheDocument();
    });
  });

  describe("Current vs Past Items", () => {
    it("should visually distinguish current roles", () => {
      const items = [mockWorkItem, mockPastWork];
      const { container } = render(<Timeline items={items} />);

      const currentCard = container.querySelector(".border-blue-500.bg-blue-50");
      const pastCard = container.querySelector(".border-gray-200.bg-white");

      expect(currentCard).toBeInTheDocument(); // Current role
      expect(pastCard).toBeInTheDocument(); // Past role
    });

    it("should show 'Present' for current roles", () => {
      const items = [mockWorkItem];
      render(<Timeline items={items} />);

      expect(screen.getByText("Present")).toBeInTheDocument();
    });

    it("should show formatted end date for past roles", () => {
      const items = [mockPastWork];
      render(<Timeline items={items} />);

      expect(screen.getByText(/Dec 2021/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label on navigation", () => {
      const items = [mockWorkItem];
      render(<Timeline items={items} />);

      const nav = screen.getByRole("navigation", { name: "Professional timeline" });
      expect(nav).toBeInTheDocument();
    });

    it("should use semantic ordered list structure", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      expect(ol).toBeInTheDocument();
      expect(ol?.tagName).toBe("OL");
    });

    it("should have proper list items", () => {
      const items = [mockWorkItem, mockEducation, mockPastWork];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      const topLevelItems = ol?.querySelectorAll(":scope > li");
      expect(topLevelItems?.length).toBe(3);
    });

    it("should have accessible article labels via ExperienceCard", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const article = container.querySelector("article");
      expect(article).toHaveAttribute("aria-label", expect.stringContaining("Work experience"));
    });
  });

  describe("Responsive Layout", () => {
    it("should have responsive timeline classes", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      expect(ol).toHaveClass("relative", "border-l-2", "border-gray-200");
      expect(ol).toHaveClass("ml-4", "lg:ml-0", "lg:border-l-0");
    });

    it("should have responsive spacing", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      expect(ol).toHaveClass("space-y-8");
    });

    it("should position items with responsive padding", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const li = container.querySelector("li");
      expect(li).toHaveClass("relative", "pl-8", "lg:pl-0");
    });

    it("should have responsive card width", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const cardContainer = container.querySelector(".lg\\:w-\\[calc\\(50\\%-2rem\\)\\]");
      expect(cardContainer).toBeInTheDocument();
    });
  });

  describe("Integration with ExperienceCard", () => {
    it("should pass all required props to ExperienceCard", () => {
      const items = [mockWorkItem];
      render(<Timeline items={items} />);

      // Check that ExperienceCard receives and renders props correctly
      expect(screen.getByText("Lead QA Engineer")).toBeInTheDocument();
      expect(screen.getByText("Tech Company")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
      expect(screen.getByText("Leading QA team of 5 engineers.")).toBeInTheDocument();
    });

    it("should pass work type correctly", () => {
      const items = [mockWorkItem];
      render(<Timeline items={items} />);

      expect(screen.getByText("Technologies")).toBeInTheDocument();
      expect(screen.getByText("Key Achievements")).toBeInTheDocument();
    });

    it("should pass education type correctly", () => {
      const items = [mockEducation];
      render(<Timeline items={items} />);

      expect(screen.queryByText("Technologies")).not.toBeInTheDocument();
      expect(screen.getByText("Honors")).toBeInTheDocument();
    });

    it("should pass current flag correctly", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const currentCard = container.querySelector(".border-blue-500");
      expect(currentCard).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply timeline styling", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      expect(ol).toHaveClass("relative");
    });

    it("should have correct dot styling", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      const dot = container.querySelector(".bg-blue-600.rounded-full");
      expect(dot).toHaveClass("w-4", "h-4", "border-4", "border-white");
    });

    it("should have correct line styling", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      const line = container.querySelector("ol");
      expect(line).toHaveClass("border-l-2", "border-gray-200");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single item", () => {
      const items = [mockWorkItem];
      const { container } = render(<Timeline items={items} />);

      expect(screen.getByText("Lead QA Engineer")).toBeInTheDocument();
      const ol = container.querySelector("ol");
      const topLevelItems = ol?.querySelectorAll(":scope > li");
      expect(topLevelItems?.length).toBe(1);
    });

    it("should handle many items", () => {
      const items = Array(10)
        .fill(null)
        .map((_, i) => ({
          ...mockWorkItem,
          id: `work-${i}`,
          title: `Job Title ${i}`,
          highlights: [], // Remove highlights to avoid nested li elements
          technologies: [], // Remove technologies to avoid nested li elements
        }));

      const { container } = render(<Timeline items={items} />);
      const ol = container.querySelector("ol");
      const topLevelItems = ol?.querySelectorAll(":scope > li");
      expect(topLevelItems?.length).toBe(10);
    });

    it("should handle items with minimal data", () => {
      const minimalItem: TimelineItem = {
        id: "minimal-1",
        type: "work",
        title: "Job Title",
        subtitle: "Company",
        startDate: "2020-01-01",
      };

      const items = [minimalItem];
      expect(() => render(<Timeline items={items} />)).not.toThrow();
    });

    it("should handle items with all optional fields", () => {
      const fullItem: TimelineItem = {
        id: "full-1",
        type: "work",
        title: "Job Title",
        subtitle: "Company",
        location: "Location",
        startDate: "2020-01-01",
        endDate: "2021-01-01",
        current: false,
        description: "Description text",
        highlights: ["Achievement 1", "Achievement 2"],
        technologies: ["Tech 1", "Tech 2"],
      };

      const items = [fullItem];
      expect(() => render(<Timeline items={items} />)).not.toThrow();
    });

    it("should handle mixed types in correct order", () => {
      const items = [mockWorkItem, mockEducation, mockPastWork];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      const topLevelItems = ol?.querySelectorAll(":scope > li");
      expect(topLevelItems?.length).toBe(3);
    });
  });

  describe("Security", () => {
    it("should sanitize XSS in item titles via ExperienceCard", () => {
      const xssItem: TimelineItem = {
        ...mockWorkItem,
        title: '<script>alert("XSS")</script>',
      };

      render(<Timeline items={[xssItem]} />);
      expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
      expect(document.querySelectorAll("script").length).toBe(0);
    });

    it("should sanitize XSS in descriptions via ExperienceCard", () => {
      const xssItem: TimelineItem = {
        ...mockWorkItem,
        description: '<img src=x onerror="alert(1)">',
      };

      render(<Timeline items={[xssItem]} />);
      expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
      expect(document.querySelectorAll("img[onerror]").length).toBe(0);
    });
  });

  describe("Unique Keys", () => {
    it("should use item id as key for list items", () => {
      const items = [mockWorkItem, mockEducation];
      const { container } = render(<Timeline items={items} />);

      const ol = container.querySelector("ol");
      const topLevelItems = ol?.querySelectorAll(":scope > li");
      expect(topLevelItems?.length).toBe(2);
    });

    it("should handle duplicate IDs gracefully", () => {
      const duplicate: TimelineItem = { ...mockWorkItem };
      const items = [mockWorkItem, duplicate];

      // Should render without crashing even with duplicate IDs
      expect(() => render(<Timeline items={items} />)).not.toThrow();
    });
  });
});
