import type { QueryPreset } from "@/types/portfolio";

export const queryPresets: QueryPreset[] = [
  {
    id: "ai-ml",
    label: "AI + ML",
    query: "AI + ML",
    matchedDomains: ["ai", "platform", "backend"],
    matchedProjects: [
      "rag-ops-console",
      "agent-workflow-kit",
      "terminal-portfolio",
    ],
    keywords: [
      "ai",
      "ml",
      "machine learning",
      "llm",
      "rag",
      "genai",
      "agents",
      "model",
    ],
    response:
      "AI/ML work focuses on production-minded systems: RAG ops with eval batches, agent workflows with tool guardrails, and observable pipelines—not one-off demos. Retrieval quality, regression coverage, and human review are first-class.",
  },
  {
    id: "web-apps",
    label: "Web apps",
    query: "Web apps",
    matchedDomains: ["frontend", "platform"],
    matchedProjects: ["terminal-portfolio", "rag-ops-console"],
    keywords: ["web", "apps", "frontend", "react", "next", "ui", "product"],
    response:
      "Web app work emphasizes editor-grade UX: this terminal portfolio (command shell, local intelligence) and the RAG ops console. Dense layouts, keyboard-friendly flows, and custom design tokens over generic templates.",
  },
  {
    id: "backend-data",
    label: "Backend/data",
    query: "Backend/data",
    matchedDomains: ["backend", "data", "platform"],
    matchedProjects: [
      "event-ingestion-api",
      "metrics-semantic-layer",
      "rag-ops-console",
    ],
    keywords: [
      "backend",
      "data",
      "api",
      "pipeline",
      "postgres",
      "sql",
      "etl",
      "warehouse",
    ],
    response:
      "Backend and data: idempotent event ingestion with schema registry and DLQ, a shared metrics semantic layer, and instrumented AI services. Clear contracts, replay-safe consumers, and single definitions for core metrics.",
  },
  {
    id: "robotics-systems",
    label: "Robotics/systems",
    query: "Robotics/systems",
    matchedDomains: ["platform", "backend", "data"],
    matchedProjects: [
      "robotics-telemetry-hub",
      "event-ingestion-api",
    ],
    keywords: [
      "robotics",
      "systems",
      "telemetry",
      "embedded",
      "real-time",
      "sensors",
      "controls",
    ],
    response:
      "Robotics/systems experience maps to reliable telemetry and control pipelines: a robotics telemetry hub for sensor streams and state, plus event ingestion patterns built for burst traffic and replay-safe processing.",
  },
  {
    id: "developer-tools",
    label: "Developer tools",
    query: "Developer tools",
    matchedDomains: ["platform", "frontend", "ai"],
    matchedProjects: [
      "terminal-portfolio",
      "rag-ops-console",
      "agent-workflow-kit",
    ],
    keywords: [
      "developer tools",
      "devtools",
      "cli",
      "sdk",
      "dx",
      "tooling",
      "console",
    ],
    response:
      "Developer tools span internal consoles and kits: RAG ops for eval/trace workflows, agent workflow primitives, and this portfolio as a DX surface—typed contracts, fast feedback, and operator-visible behavior.",
  },
  {
    id: "gov-data-analytics",
    label: "Government/data analytics",
    query: "Government/data analytics",
    matchedDomains: ["data", "leadership", "backend"],
    matchedProjects: [
      "civic-analytics-dashboard",
      "metrics-semantic-layer",
      "event-ingestion-api",
    ],
    keywords: [
      "government",
      "civic",
      "public sector",
      "analytics",
      "reporting",
      "compliance",
      "metrics",
    ],
    response:
      "Government/data analytics work stresses trustworthy reporting: a civic analytics dashboard for program metrics, a semantic layer for shared definitions, and ingestion APIs that keep lineage and audit-friendly event history.",
  },
];

export const defaultQueryResponse =
  "No strong preset match. I scanned domains, skills, tools, and projects—try a suggestion chip or keywords like rag, postgres, robotics, or civic analytics.";
