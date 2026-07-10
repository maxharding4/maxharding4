import { ExperienceCard } from "maxharding4";

export const CurrentRole = () => (
  <ExperienceCard
    type="work"
    title="Senior Software Engineer"
    subtitle="Wolf & Badger"
    location="London, UK"
    startDate="2022-01-15"
    current
    description="Leading frontend architecture across the customer site and internal tooling."
    highlights={[
      "Cut page load times by 40% through rendering and bundle optimisation",
      "Mentored four engineers and established the team's testing standards",
    ]}
    technologies={["TypeScript", "React", "Next.js", "GraphQL", "AWS"]}
  />
);

export const PastRole = () => (
  <ExperienceCard
    type="work"
    title="Software Engineer"
    subtitle="Acme Corp"
    location="Manchester, UK"
    startDate="2018-06-01"
    endDate="2021-12-31"
    description="Built and maintained customer-facing web applications."
    technologies={["JavaScript", "Vue", "Node.js"]}
  />
);

export const Education = () => (
  <ExperienceCard
    type="education"
    title="BSc Computer Science"
    subtitle="University of Leeds"
    location="Leeds, UK"
    startDate="2014-09-01"
    endDate="2018-06-01"
    highlights={["First Class Honours", "Dean's List, 2016–2018"]}
  />
);
