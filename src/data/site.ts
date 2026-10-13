import type { Experience, SiteProfile } from "@/types/portfolio";

export const siteProfile: SiteProfile = {
  name: "Srivathsan Murali",
  role: "Software Engineer · AI & Data Systems",
  systemLabel: "portfolio.os / v0.1",
  headline: "Ask this terminal what I've built.",
  subheading:
    "Explore projects, technical domains, and evidence through a command-driven developer portfolio.",
  quote: "God sets the stage, and I dance",
  availability: "Available for Summer 2027 Internships / Co-ops",
  status: "online",
  nav: [
    { label: "experience", href: "#experience" },
    { label: "projects", href: "#projects" },
    { label: "resume", href: "/resume.pdf" },
    { label: "contact", href: "#contact" },
  ],
};

/** Newest first. */
export const experiences: Experience[] = [
  {
    id: "cgi",
    title: "AI Developer",
    org: "CGI – Conseillers en gestion et informatique",
    employmentType: "Co-op",
    start: "2026-09",
    end: "2027-04",
    location: "Toronto, ON",
    mode: "On-site",
    skills: [],
    highlights: [],
  },
  {
    id: "bco",
    title: "Automation & Outreach Specialist",
    org: "BCO – Builders Collective Ottawa",
    employmentType: "Volunteering",
    start: "2026-08",
    end: null,
    location: "Ottawa, ON",
    mode: "Hybrid",
    skills: [
      "n8n",
      "Workflow Automation",
      "Lead Generation",
      "Sponsorship Outreach",
      "Docker",
    ],
    highlights: [
      "Built a lead list of 500+ Ottawa-area sponsorship and collaboration prospects, and generated curated outreach emails tailored to each company.",
      "Setting up events in Ottawa with 50–100 attendees, such as the Cursor event and our upcoming Grokbot event.",
    ],
  },
  {
    id: "atj",
    title: "Full Stack Engineer",
    org: "ATJ Consulting",
    employmentType: "Internship",
    start: "2026-02",
    end: "2026-09",
    location: "Ottawa, ON",
    mode: "Remote",
    skills: [
      "Next.js",
      "TypeScript",
      "Front-End Development",
      "Back-End Web Development",
      "API Integration",
    ],
    highlights: [
      "Architected and developed Happyhourinmycity.com from the ground up using Next.js, TypeScript and shadcn/ui, translating product requirements into a responsive restaurant discovery platform with 400+ restaurants and 500 visitors a month.",
    ],
  },
  {
    id: "cra",
    title: "Data & AI Analyst",
    org: "Canada Revenue Agency",
    employmentType: "Co-op",
    start: "2026-05",
    end: "2026-08",
    location: "Ottawa, ON",
    mode: "On-site",
    skills: [
      "Python",
      "SQL",
      "R",
      "Statistical Analysis",
      "Retrieval-Augmented Generation (RAG)",
    ],
    highlights: [
      "Accelerated stakeholder reporting by 30+ hours per reporting cycle by producing KPI summaries, year-over-year comparisons, and interactive visualisations across 14,000+ cases over 8 years.",
      "Improved data reliability for compliance and audit risk analysis by developing automated workflows in Python, SQL, and R to clean, merge, and validate multi-source internal datasets across 30+ records.",
      "Explored AI-enabled workflows using LLMs and RAG to support research, summarization, and automation within a security- and privacy-focused federal environment.",
    ],
  },
  {
    id: "arc",
    title: "Software Developer",
    org: "ARC – Autonomous Robotics Carleton",
    employmentType: "Volunteering",
    start: "2025-09",
    end: "2026-04",
    location: "Ottawa, ON",
    mode: "Hybrid",
    skills: [
      "Robot Operating System (ROS)",
      "Docker",
      "Git",
      "Software Architecture",
      "Open-Source Software",
    ],
    highlights: [
      "Developed and tested ROS 2-based perception and navigation components in Linux and Docker environments, validating communication between sensors, software nodes, and robotic subsystems.",
      "Collaborated with a multidisciplinary robotics team of 200+.",
    ],
  },
];
