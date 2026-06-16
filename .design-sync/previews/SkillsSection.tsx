import { SkillsSection } from "new-site";

export const MixedStack = () => (
  <SkillsSection
    skills={[
      "TypeScript",
      "JavaScript",
      "Python",
      "React",
      "Next.js",
      "Node.js",
      "Jest",
      "Playwright",
      "Docker",
      "GraphQL",
    ]}
  />
);

export const FrontendFocus = () => (
  <SkillsSection skills={["React", "Vue", "Svelte", "Tailwind CSS"]} />
);
