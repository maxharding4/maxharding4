import { NavigationCard } from "new-site";

export const Travel = () => (
  <NavigationCard
    title="Travel"
    description="Photo galleries from cities and countries around the world."
    href="/travel"
    gradient="from-sky-50 to-indigo-100"
  />
);

export const CV = () => (
  <NavigationCard
    title="CV"
    description="Professional experience, education, and skills."
    href="/cv"
    gradient="from-amber-50 to-rose-100"
  />
);

export const DefaultGradient = () => (
  <NavigationCard
    title="About"
    description="A little background on who I am and what I do."
    href="/about"
  />
);
