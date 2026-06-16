import { Breadcrumb } from "new-site";

export const TravelTrail = () => (
  <Breadcrumb
    items={[
      { label: "Home", href: "/" },
      { label: "Travel", href: "/travel" },
      { label: "Italy", href: "/travel/italy" },
      { label: "Florence" },
    ]}
  />
);

export const TwoLevel = () => (
  <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "CV" }]} />
);
