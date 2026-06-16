/// <reference types="@testing-library/jest-dom" />
import { render, screen } from "@testing-library/react";
import CVPage, { generateMetadata } from "../page";
import * as contentful from "@/lib/contentful";
import { Entry, EntryCollection } from "contentful";
import {
  CVResumeSkeleton,
  WorkExperienceSkeleton,
  EducationSkeleton,
} from "@/types/contentful";
import React from "react";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

// Mock the contentful module
jest.mock("@/lib/contentful");

describe("CV Page", () => {
  const mockWorkExperience1: Entry<WorkExperienceSkeleton> = {
    sys: {
      id: "work-1",
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: {
        sys: { id: "workExperience", type: "Link", linkType: "ContentType" },
      },
      revision: 1,
    },
    fields: {
      jobTitle: "Lead QA Engineer",
      company: "Tech Company",
      location: "San Francisco, CA",
      startDate: "2022-01-15",
      endDate: null,
      currentRole: true,
      description: "Leading QA team of 5 engineers.",
      achievements: ["Built automation framework", "Reduced bugs by 40%"],
      technologies: ["Jest", "Selenium", "Cypress"],
    },
    metadata: { tags: [] },
  } as unknown as Entry<WorkExperienceSkeleton>;

  const mockWorkExperience2: Entry<WorkExperienceSkeleton> = {
    sys: {
      id: "work-2",
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: {
        sys: { id: "workExperience", type: "Link", linkType: "ContentType" },
      },
      revision: 1,
    },
    fields: {
      jobTitle: "Senior QA Engineer",
      company: "Startup Inc",
      location: "London, UK",
      startDate: "2018-06-01",
      endDate: "2021-12-31",
      currentRole: false,
      description: "Established QA processes.",
      achievements: ["Implemented CI/CD", "Trained team"],
      technologies: ["Mocha", "Chai", "Selenium"],
    },
    metadata: { tags: [] },
  } as unknown as Entry<WorkExperienceSkeleton>;

  const mockEducation: Entry<EducationSkeleton> = {
    sys: {
      id: "edu-1",
      type: "Entry",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      locale: "en-US",
      contentType: {
        sys: { id: "education", type: "Link", linkType: "ContentType" },
      },
      revision: 1,
    },
    fields: {
      institution: "State University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2012-09-01",
      endDate: "2016-05-20",
      current: false,
      location: "London, UK",
      honors: ["First Class Honours", "Dean's List"],
      description: "Focus on software engineering.",
    },
    metadata: { tags: [] },
  } as unknown as Entry<EducationSkeleton>;

  const mockCVData: EntryCollection<CVResumeSkeleton> = {
    items: [
      {
        sys: {
          id: "cv-main",
          type: "Entry",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          locale: "en-US",
          contentType: {
            sys: { id: "cvResume", type: "Link", linkType: "ContentType" },
          },
          revision: 1,
        },
        fields: {
          fullName: "Max Harding",
          slug: "main",
          professionalTitle: "Lead QA Engineer & Travel Photographer",
          bio: "Experienced QA professional with 10+ years in test automation. Passionate about building robust testing frameworks.",
          profilePhoto: {
            sys: {
              id: "photo-id",
              type: "Asset",
              createdAt: "2024-01-01T00:00:00Z",
              updatedAt: "2024-01-01T00:00:00Z",
              locale: "en-US",
              revision: 1,
            },
            fields: {
              title: "Profile Photo",
              file: {
                url: "//images.ctfassets.net/profile.jpg",
                details: {
                  size: 12345,
                  image: { width: 800, height: 800 },
                },
                fileName: "profile.jpg",
                contentType: "image/jpeg",
              },
            },
            metadata: { tags: [] },
          },
          email: "test@example.com",
          phone: "+44 1234 567890",
          location: "London, UK",
          linkedin: "https://linkedin.com/in/maxharding",
          github: "https://github.com/maxharding",
          website: "https://maxharding.com",
          skills: ["JavaScript", "TypeScript", "React", "Jest", "Selenium"],
          workExperience: [mockWorkExperience1, mockWorkExperience2],
          education: [mockEducation],
        },
        metadata: { tags: [] },
      },
    ] as unknown as Entry<CVResumeSkeleton>[],
    total: 1,
    skip: 0,
    limit: 1,
    sys: { type: "Array" },
  };

  const mockEmptyCV: EntryCollection<CVResumeSkeleton> = {
    items: [],
    total: 0,
    skip: 0,
    limit: 1,
    sys: { type: "Array" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render CV page with all sections", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      expect(container).toBeInTheDocument();
    });

    it("should render header with name and title", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Max Harding")).toBeInTheDocument();
      expect(
        screen.getByText("Lead QA Engineer & Travel Photographer")
      ).toBeInTheDocument();
    });

    it("should render profile photo when provided", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const profileImage = container.querySelector('img[alt="Max Harding"]');
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute(
        "src",
        expect.stringContaining("profile.jpg")
      );
    });

    it("should render bio/professional summary", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      expect(
        screen.getByText(/Experienced QA professional with 10\+ years/i)
      ).toBeInTheDocument();
    });

    it("should render contact information section", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("+44 1234 567890")).toBeInTheDocument();
    });

    it("should render timeline with work experience and education", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Experience & Education")).toBeInTheDocument();
      expect(screen.getByText("Lead QA Engineer")).toBeInTheDocument();
      expect(screen.getByText("State University")).toBeInTheDocument();
    });

    it("should render skills section when skills provided", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Skills")).toBeInTheDocument();
      expect(screen.getByText("JavaScript")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
    });

    it("should render print button", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Print CV")).toBeInTheDocument();
    });
  });

  describe("Fallback Content", () => {
    it("should render with fallback data when Contentful fails", async () => {
      (contentful.getEntriesByType as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Max Harding")).toBeInTheDocument();
      expect(
        screen.getByText("Lead QA Engineer & Travel Photographer")
      ).toBeInTheDocument();
    });

    it("should render with fallback when no CV entries", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockEmptyCV);

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Max Harding")).toBeInTheDocument();
      expect(
        screen.getByText("Lead QA Engineer & Travel Photographer")
      ).toBeInTheDocument();
    });

    it("should show empty state message when no experience or education", async () => {
      const emptyExperienceCV = {
        ...mockCVData,
        items: [
          {
            ...mockCVData.items[0],
            fields: {
              ...mockCVData.items[0].fields,
              workExperience: [],
              education: [],
            },
          },
        ],
      };

      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(
        emptyExperienceCV
      );

      const page = await CVPage();
      render(page);

      expect(
        screen.getByText("No experience or education listed yet.")
      ).toBeInTheDocument();
    });

    it("should not render skills section when no skills", async () => {
      const noSkillsCV = {
        ...mockCVData,
        items: [
          {
            ...mockCVData.items[0],
            fields: {
              ...mockCVData.items[0].fields,
              skills: [],
            },
          },
        ],
      };

      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(noSkillsCV);

      const page = await CVPage();
      render(page);

      expect(screen.queryByText("Skills")).not.toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch first CV Resume entry", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      await CVPage();

      expect(contentful.getEntriesByType).toHaveBeenCalledWith("cvResume", {
        limit: 1,
        include: 2,
      });
    });

    it("should fetch with include=2 for linked entries", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      await CVPage();

      expect(contentful.getEntriesByType).toHaveBeenCalledWith(
        "cvResume",
        expect.objectContaining({ include: 2 })
      );
    });

    it("should handle API errors gracefully", async () => {
      (contentful.getEntriesByType as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(CVPage()).resolves.not.toThrow();
    });
  });

  describe("Timeline Sorting", () => {
    it("should sort timeline items by date (most recent first)", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const ol = container.querySelector("ol");
      const topLevelItems = ol?.querySelectorAll(":scope > li");

      // First item should be the most recent (Lead QA Engineer - 2022)
      expect(topLevelItems?.[0].textContent).toContain("Lead QA Engineer");
    });
  });

  describe("Metadata Generation", () => {
    it("should generate metadata with CV information", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Max Harding - CV & Resume");
      expect(metadata.description).toContain("Experienced QA professional");
    });

    it("should include OpenGraph metadata", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const metadata = await generateMetadata();

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.title).toBe(
        "Max Harding - Lead QA Engineer & Travel Photographer"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((metadata.openGraph as any)?.type).toBe("profile");
      expect(metadata.openGraph?.url).toBe("/cv");
    });

    it("should include Twitter Card metadata", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const metadata = await generateMetadata();

      expect(metadata.twitter).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((metadata.twitter as any)?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toBe(
        "Max Harding - Lead QA Engineer & Travel Photographer"
      );
    });

    it("should include profile photo in OpenGraph images", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const metadata = await generateMetadata();

      expect(metadata.openGraph?.images).toBeDefined();
      const images = Array.isArray(metadata.openGraph?.images)
        ? metadata.openGraph?.images
        : [metadata.openGraph?.images];
      expect(images[0]).toMatchObject({
        url: expect.stringContaining("profile.jpg"),
        width: 1200,
        height: 630,
      });
    });

    it("should return fallback metadata when Contentful fails", async () => {
      (contentful.getEntriesByType as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );

      const metadata = await generateMetadata();

      expect(metadata.title).toBe("Max Harding - CV & Resume");
      expect(metadata.description).toBe("Professional CV and work experience");
    });
  });

  describe("Structured Data (JSON-LD)", () => {
    it("should include Person structured data schema", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeInTheDocument();

      const jsonLD = JSON.parse(script?.textContent || "{}");
      expect(jsonLD["@context"]).toBe("https://schema.org");
      expect(jsonLD["@type"]).toBe("Person");
    });

    it("should include correct person data in structured data", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLD = JSON.parse(script?.textContent || "{}");

      expect(jsonLD.name).toBe("Max Harding");
      expect(jsonLD.jobTitle).toBe("Lead QA Engineer & Travel Photographer");
      expect(jsonLD.email).toBe("test@example.com");
      expect(jsonLD.telephone).toBe("+44 1234 567890");
      expect(jsonLD.url).toBe("https://maxharding.com");
    });

    it("should include social media profiles in sameAs array", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLD = JSON.parse(script?.textContent || "{}");

      expect(jsonLD.sameAs).toContain("https://linkedin.com/in/maxharding");
      expect(jsonLD.sameAs).toContain("https://github.com/maxharding");
    });
  });

  describe("Accessibility", () => {
    it("should have exactly one h1 heading", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      const h1Elements = screen.getAllByRole("heading", { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent("Max Harding");
    });

    it("should have proper heading hierarchy", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const h1 = container.querySelector("h1");
      const h2s = container.querySelectorAll("h2");

      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    it("should have sr-only text for Professional Summary heading", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      render(page);

      expect(screen.getByText("Professional Summary")).toHaveClass("sr-only");
    });

    it("should use semantic HTML structure", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      expect(container.querySelector("header")).toBeInTheDocument();
      expect(container.querySelectorAll("section").length).toBeGreaterThan(0);
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive container padding", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const mainContainer = container.querySelector(".container");
      expect(mainContainer).toHaveClass("px-4", "sm:px-6", "lg:px-8");
    });

    it("should have responsive header spacing", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      // Top spacing is standardized on the content container so the hero
      // lands at the same height on every non-breadcrumb page.
      const contentContainer = container.querySelector(".container");
      expect(contentContainer).toHaveClass("pt-12", "sm:pt-16");
    });

    it("should have responsive typography for name", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const h1 = container.querySelector("h1");
      // Hero titles share one scale across every page (see .heading-hero).
      expect(h1).toHaveClass("heading-hero");
    });

    it("should have centered layout for header", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const header = container.querySelector("header");
      expect(header).toHaveClass("text-center");
    });
  });

  describe("Security", () => {
    it("should handle XSS attempts in bio field", async () => {
      const xssCV = {
        ...mockCVData,
        items: [
          {
            ...mockCVData.items[0],
            fields: {
              ...mockCVData.items[0].fields,
              bio: '<script>alert("XSS")</script>Malicious bio',
            },
          },
        ],
      };

      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(xssCV);

      const page = await CVPage();
      render(page);

      expect(screen.getByText(/Malicious bio/)).toBeInTheDocument();
      // Check that malicious script was not rendered (only JSON-LD script should exist)
      const scripts = document.querySelectorAll("script");
      const maliciousScripts = Array.from(scripts).filter(s =>
        s.type !== "application/ld+json" && s.textContent?.includes("alert")
      );
      expect(maliciousScripts.length).toBe(0);
    });

    it("should handle XSS attempts in name field", async () => {
      const xssCV = {
        ...mockCVData,
        items: [
          {
            ...mockCVData.items[0],
            fields: {
              ...mockCVData.items[0].fields,
              fullName: '<img src=x onerror="alert(1)">',
            },
          },
        ],
      };

      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(xssCV);

      const page = await CVPage();
      render(page);

      expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument();
      expect(document.querySelectorAll("img[onerror]").length).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing optional fields gracefully", async () => {
      const minimalCV = {
        items: [
          {
            sys: mockCVData.items[0].sys,
            fields: {
              fullName: "John Doe",
              slug: "main",
              professionalTitle: "Developer",
              bio: "Developer bio",
            },
            metadata: { tags: [] },
          },
        ],
        total: 1,
        skip: 0,
        limit: 1,
        sys: { type: "Array" },
      };

      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(minimalCV);

      await expect(CVPage()).resolves.not.toThrow();
    });

    it("should handle null values in fields", async () => {
      const nullFieldsCV = {
        ...mockCVData,
        items: [
          {
            ...mockCVData.items[0],
            fields: {
              ...mockCVData.items[0].fields,
              email: null,
              phone: null,
              location: null,
              profilePhoto: null,
            },
          },
        ],
      };

      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(nullFieldsCV);

      await expect(CVPage()).resolves.not.toThrow();
    });
  });

  describe("Styling", () => {
    it("should have gradient background", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const mainDiv = container.querySelector(".min-h-screen");
      expect(mainDiv).toHaveClass("page-canvas");
    });

    it("should have proper section margins", async () => {
      (contentful.getEntriesByType as jest.Mock).mockResolvedValue(mockCVData);

      const page = await CVPage();
      const { container } = render(page);

      const sections = container.querySelectorAll("section.mb-12");
      expect(sections.length).toBeGreaterThan(0);
    });
  });
});
