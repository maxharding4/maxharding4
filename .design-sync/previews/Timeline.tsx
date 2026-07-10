import { Timeline } from "maxharding4";

export const CareerTimeline = () => (
  <Timeline
    items={[
      {
        id: "1",
        type: "work",
        title: "Senior Software Engineer",
        subtitle: "Wolf & Badger",
        location: "London, UK",
        startDate: "2022-01-15",
        current: true,
        description:
          "Leading frontend architecture across the customer site and internal tooling.",
        highlights: ["Cut page load times by 40%", "Mentored four engineers"],
        technologies: ["TypeScript", "React", "Next.js"],
      },
      {
        id: "2",
        type: "work",
        title: "Software Engineer",
        subtitle: "Acme Corp",
        location: "Manchester, UK",
        startDate: "2018-06-01",
        endDate: "2021-12-31",
        description: "Built and maintained customer-facing web applications.",
        technologies: ["JavaScript", "Vue", "Node.js"],
      },
      {
        id: "3",
        type: "education",
        title: "BSc Computer Science",
        subtitle: "University of Leeds",
        location: "Leeds, UK",
        startDate: "2014-09-01",
        endDate: "2018-06-01",
        highlights: ["First Class Honours"],
      },
    ]}
  />
);
