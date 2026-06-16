import { ContactInfo } from "new-site";

export const FullContact = () => (
  <ContactInfo
    email="max@example.com"
    phone="+44 20 7946 0958"
    location="London, UK"
    linkedin="https://www.linkedin.com/in/example"
    github="https://github.com/example"
    website="https://example.com"
  />
);

export const Minimal = () => (
  <ContactInfo email="max@example.com" location="London, UK" />
);
