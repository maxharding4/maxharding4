// Explicit bundle entry for design-sync (cfg.entry). Re-exports ONLY the
// reusable presentational components, as named exports, so the converter
// bundles just these (and their deps) into window.PersonalSite — bypassing
// synth-entry, which would `export *` every file in src/ and drag in
// app/layout.tsx -> globals.css and the Contentful/server code.
export { default as Breadcrumb } from "../src/components/Breadcrumb";
export { default as ContactInfo } from "../src/components/ContactInfo";
export { default as ExperienceCard } from "../src/components/ExperienceCard";
export { default as NavigationCard } from "../src/components/NavigationCard";
export { default as SkillsSection } from "../src/components/SkillsSection";
export { default as Timeline } from "../src/components/Timeline";
