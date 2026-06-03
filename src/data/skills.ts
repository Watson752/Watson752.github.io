import type { Skill } from "@/types/portfolio";

export const skills: Skill[] = [
  {
    id: "skill-system-design",
    name: "System design",
    category: "platform",
    confidenceLevel: "primary",
    relatedProjects: ["event-ingestion-api", "rag-ops-console"],
    description:
      "API contracts, failure modes, and operability—designing systems that stay debuggable after launch.",
  },
  {
    id: "skill-rag-evals",
    name: "RAG & evals",
    category: "ai",
    confidenceLevel: "primary",
    relatedProjects: ["rag-ops-console", "agent-workflow-kit"],
    description:
      "Retrieval pipelines, golden datasets, and regression workflows for production-minded AI features.",
  },
  {
    id: "skill-data-modeling",
    name: "Data modeling",
    category: "data",
    confidenceLevel: "strong",
    relatedProjects: [
      "metrics-semantic-layer",
      "event-ingestion-api",
      "civic-analytics-dashboard",
    ],
    description:
      "Schemas, semantic layers, and analytics contracts that keep metrics trustworthy across teams.",
  },
  {
    id: "skill-product-frontend",
    name: "Product frontend",
    category: "frontend",
    confidenceLevel: "strong",
    relatedProjects: ["terminal-portfolio", "rag-ops-console"],
    description:
      "Dense, keyboard-friendly UIs with custom design systems—not generic component dumps.",
  },
  {
    id: "skill-typescript",
    name: "TypeScript",
    category: "backend",
    confidenceLevel: "primary",
    relatedProjects: [
      "rag-ops-console",
      "event-ingestion-api",
      "terminal-portfolio",
    ],
    description: "End-to-end typed services and UI with strict boundaries.",
  },
  {
    id: "skill-technical-leadership",
    name: "Technical leadership",
    category: "leadership",
    confidenceLevel: "working",
    relatedProjects: ["metrics-semantic-layer", "event-ingestion-api"],
    description:
      "Aligning stakeholders on definitions, scope, and incremental delivery.",
  },
];

export const skillsById = Object.fromEntries(
  skills.map((skill) => [skill.id, skill]),
) as Record<string, Skill>;
