import type { SiteProfile } from "@/types/portfolio";

export const siteProfile: SiteProfile = {
  name: "Watson",
  role: "Software Engineer · AI & Data Systems",
  systemLabel: "portfolio.os / v0.1",
  headline: "Ask this terminal what I've built.",
  subheading:
    "Explore projects, technical domains, and evidence through a command-driven developer portfolio.",
  status: "online",
  nav: [
    { label: "projects", href: "#projects" },
    { label: "domains", href: "#graph" },
    { label: "github", href: "https://github.com/Watson752" },
    { label: "contact", href: "mailto:hello@example.com" },
  ],
};
