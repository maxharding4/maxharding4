/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import SkillsSection from "../SkillsSection";

describe("SkillsSection", () => {
  describe("Rendering", () => {
    it("should render all skills as pills", () => {
      const skills = ["JavaScript", "React", "Jest", "Design"];
      render(<SkillsSection skills={skills} />);

      expect(screen.getByText("JavaScript")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("Jest")).toBeInTheDocument();
      expect(screen.getByText("Design")).toBeInTheDocument();
    });

    it("should render skills in a flex wrap container", () => {
      const skills = ["TypeScript", "Node.js"];
      const { container } = render(<SkillsSection skills={skills} />);

      const flexContainer = container.querySelector(".flex.flex-wrap");
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass("gap-2");
    });

    it("should render nothing when skills array is empty", () => {
      const { container } = render(<SkillsSection skills={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render nothing when skills is null", () => {
      const { container } = render(<SkillsSection skills={null as unknown as string[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render nothing when skills is undefined", () => {
      const { container } = render(<SkillsSection skills={undefined as unknown as string[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Color Coding - Languages (Blue)", () => {
    it("should apply blue color to JavaScript", () => {
      const { container } = render(<SkillsSection skills={["JavaScript"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("should apply blue color to TypeScript", () => {
      const { container } = render(<SkillsSection skills={["TypeScript"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("should apply blue color to Python", () => {
      const { container } = render(<SkillsSection skills={["Python"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("should apply blue color to Java", () => {
      const { container } = render(<SkillsSection skills={["Java"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-blue-100", "text-blue-800");
    });

    it("should be case insensitive for language detection", () => {
      const { container } = render(<SkillsSection skills={["javascript", "TYPESCRIPT", "PyThOn"]} />);
      const pills = container.querySelectorAll("span");
      pills.forEach((pill) => {
        expect(pill).toHaveClass("bg-blue-100", "text-blue-800");
      });
    });
  });

  describe("Color Coding - Frameworks (Green)", () => {
    it("should apply green color to React", () => {
      const { container } = render(<SkillsSection skills={["React"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-green-100", "text-green-800");
    });

    it("should apply green color to Next.js", () => {
      const { container } = render(<SkillsSection skills={["Next.js"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-green-100", "text-green-800");
    });

    it("should apply green color to Vue", () => {
      const { container } = render(<SkillsSection skills={["Vue"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-green-100", "text-green-800");
    });

    it("should apply green color to Angular", () => {
      const { container } = render(<SkillsSection skills={["Angular"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-green-100", "text-green-800");
    });

    it("should apply green color to Node.js", () => {
      const { container } = render(<SkillsSection skills={["Node.js"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-green-100", "text-green-800");
    });
  });

  describe("Color Coding - Tools/Testing (Purple)", () => {
    it("should apply purple color to Jest", () => {
      const { container } = render(<SkillsSection skills={["Jest"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-purple-100", "text-purple-800");
    });

    it("should apply purple color to Selenium", () => {
      const { container } = render(<SkillsSection skills={["Selenium"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-purple-100", "text-purple-800");
    });

    it("should apply purple color to Cypress", () => {
      const { container } = render(<SkillsSection skills={["Cypress"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-purple-100", "text-purple-800");
    });

    it("should apply purple color to Git", () => {
      const { container } = render(<SkillsSection skills={["Git"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-purple-100", "text-purple-800");
    });

    it("should apply purple color to Docker", () => {
      const { container } = render(<SkillsSection skills={["Docker"]} />);
      const pill = container.querySelector("span");
      expect(pill).toHaveClass("bg-purple-100", "text-purple-800");
    });
  });

  describe("Color Coding - Default (Gray)", () => {
    it("should apply gray color to unrecognized skills", () => {
      const { container } = render(<SkillsSection skills={["Communication", "Design"]} />);
      const pills = container.querySelectorAll("span");
      pills.forEach((pill) => {
        expect(pill).toHaveClass("bg-gray-100", "text-gray-800");
      });
    });

    it("should apply gray color to soft skills", () => {
      const { container } = render(<SkillsSection skills={["Leadership", "Problem Solving"]} />);
      const pills = container.querySelectorAll("span");
      pills.forEach((pill) => {
        expect(pill).toHaveClass("bg-gray-100", "text-gray-800");
      });
    });
  });

  describe("Styling", () => {
    it("should apply consistent pill styling to all skills", () => {
      const skills = ["JavaScript", "React", "Jest"];
      const { container } = render(<SkillsSection skills={skills} />);
      const pills = container.querySelectorAll("span");

      pills.forEach((pill) => {
        expect(pill).toHaveClass("px-3", "py-1", "rounded-full", "text-sm", "font-medium");
      });
    });

    it("should have proper spacing between pills", () => {
      const skills = ["TypeScript", "Node.js"];
      const { container } = render(<SkillsSection skills={skills} />);
      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toHaveClass("gap-2");
    });
  });

  describe("Security", () => {
    it("should sanitize XSS attempts in skill names", () => {
      const maliciousSkills = ['<script>alert("XSS")</script>', "JavaScript"];
      render(<SkillsSection skills={maliciousSkills} />);

      // React automatically escapes text content
      expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
      expect(document.querySelectorAll("script").length).toBe(0);
    });

    it("should handle HTML injection attempts", () => {
      const maliciousSkills = ['<img src="x" onerror="alert(1)">', "React"];
      render(<SkillsSection skills={maliciousSkills} />);

      expect(screen.getByText('<img src="x" onerror="alert(1)">')).toBeInTheDocument();
      expect(document.querySelectorAll("img[onerror]").length).toBe(0);
    });

    it("should handle event handler injection attempts", () => {
      const maliciousSkills = ['" onclick="alert(\'XSS\')" data-test="'];
      const { container } = render(<SkillsSection skills={maliciousSkills} />);
      const pill = container.querySelector("span");
      expect(pill?.getAttribute("onclick")).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long skill names", () => {
      const longSkill = "A".repeat(100);
      const { container } = render(<SkillsSection skills={[longSkill]} />);
      const pill = container.querySelector("span");
      expect(pill).toBeInTheDocument();
      expect(pill?.textContent).toBe(longSkill);
    });

    it("should handle empty string skills", () => {
      const skills = ["", "JavaScript", ""];
      render(<SkillsSection skills={skills} />);
      const pills = screen.getAllByText(/^(JavaScript)?$/);
      expect(pills.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle special characters in skill names", () => {
      const skills = ["C++", "C#", ".NET", "Vue.js"];
      render(<SkillsSection skills={skills} />);

      expect(screen.getByText("C++")).toBeInTheDocument();
      expect(screen.getByText("C#")).toBeInTheDocument();
      expect(screen.getByText(".NET")).toBeInTheDocument();
      expect(screen.getByText("Vue.js")).toBeInTheDocument();
    });

    it("should handle Unicode characters", () => {
      const skills = ["日本語", "Español", "Français"];
      render(<SkillsSection skills={skills} />);

      expect(screen.getByText("日本語")).toBeInTheDocument();
      expect(screen.getByText("Español")).toBeInTheDocument();
      expect(screen.getByText("Français")).toBeInTheDocument();
    });

    it("should handle skills with numbers", () => {
      const skills = ["React 18", "Node.js 20", "ES2023"];
      render(<SkillsSection skills={skills} />);

      expect(screen.getByText("React 18")).toBeInTheDocument();
      expect(screen.getByText("Node.js 20")).toBeInTheDocument();
      expect(screen.getByText("ES2023")).toBeInTheDocument();
    });

    it("should handle duplicate skills", () => {
      const skills = ["JavaScript", "JavaScript", "React"];
      const { container } = render(<SkillsSection skills={skills} />);
      const pills = container.querySelectorAll("span");
      expect(pills.length).toBe(3);
    });
  });

  describe("Mixed Skills", () => {
    it("should correctly color a mix of different skill categories", () => {
      const skills = ["JavaScript", "React", "Jest", "Communication"];
      const { container } = render(<SkillsSection skills={skills} />);
      const pills = container.querySelectorAll("span");

      expect(pills[0]).toHaveClass("bg-blue-100"); // JavaScript (language)
      expect(pills[1]).toHaveClass("bg-green-100"); // React (framework)
      expect(pills[2]).toHaveClass("bg-purple-100"); // Jest (tool)
      expect(pills[3]).toHaveClass("bg-gray-100"); // Communication (default)
    });

    it("should handle large skill sets", () => {
      const skills = [
        "JavaScript",
        "TypeScript",
        "Python",
        "React",
        "Next.js",
        "Vue",
        "Jest",
        "Cypress",
        "Git",
        "Docker",
        "Communication",
        "Leadership",
      ];
      const { container } = render(<SkillsSection skills={skills} />);
      const pills = container.querySelectorAll("span");
      expect(pills.length).toBe(12);
    });
  });

  describe("Responsive Design", () => {
    it("should use flex wrap for responsive layout", () => {
      const skills = Array(20).fill("JavaScript");
      const { container } = render(<SkillsSection skills={skills} />);
      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toHaveClass("flex-wrap");
    });
  });
});
