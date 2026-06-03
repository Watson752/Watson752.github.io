import type { Project } from "@/types/portfolio";
import { projectCaseFiles } from "@/data/project-case-files";

const projectRecords: Omit<Project, "caseFile">[] = [
  {
    id: "rag-ops-console",
    slug: "rag-ops-console",
    title: "RAG Ops Console",
    shortDescription:
      "Internal console for retrieval quality, eval batches, and prompt versioning.",
    longDescription:
      "A control plane for RAG systems: trace ingestion, regression suites, and side-by-side prompt diffs. Built for operators who need reproducible evals—not one-off playground demos.",
    status: "shipped",
    domains: ["ai", "platform", "backend"],
    stack: ["TypeScript", "Next.js", "Postgres", "OpenTelemetry"],
    signals: [
      "Eval batches linked to production traces",
      "Human review queue for low-confidence answers",
    ],
    metrics: {
      "triage time": "−40% vs spreadsheet workflow",
      "eval coverage": "120+ golden cases/version",
    },
    links: {
      demo: "#",
      repo: "https://github.com/Watson752",
      docs: "#",
    },
    previewType: "image",
    previewImage: "/previews/rag-ops.png",
    featured: true,
  },
  {
    id: "event-ingestion-api",
    slug: "event-ingestion-api",
    title: "Event Ingestion API",
    shortDescription:
      "Idempotent ingestion with schema registry, DLQ, and replay-safe consumers.",
    longDescription:
      "HTTP and streaming ingress for product events with versioned schemas, backpressure, and operator dashboards for lag and poison messages.",
    status: "shipped",
    domains: ["backend", "data", "platform"],
    stack: ["Node.js", "Kafka", "Postgres", "Redis"],
    signals: [
      "Idempotency keys on all write paths",
      "Schema compatibility checks in CI",
    ],
    metrics: {
      peak: "12k events/s sustained",
      replay: "Zero duplicate side-effects in soak tests",
    },
    links: {
      repo: "https://github.com/Watson752",
    },
    previewType: "none",
    featured: true,
  },
  {
    id: "metrics-semantic-layer",
    slug: "metrics-semantic-layer",
    title: "Metrics Semantic Layer",
    shortDescription:
      "Curated metric definitions shared by product, ops, and leadership.",
    longDescription:
      "dbt-style semantic models with documented grain, ownership, and activation/retention definitions so dashboards stop arguing about numbers.",
    status: "shipped",
    domains: ["data", "backend"],
    stack: ["SQL", "dbt", "BigQuery", "Looker"],
    signals: [
      "Single source of truth for activation",
      "Lineage tags on every exposed field",
    ],
    metrics: {
      definitions: "48 core metrics",
      adoption: "6 teams on shared layer",
    },
    links: {
      docs: "#",
    },
    previewType: "image",
    previewImage: "/previews/metrics-layer.png",
    featured: false,
  },
  {
    id: "terminal-portfolio",
    slug: "terminal-portfolio",
    title: "Terminal Portfolio",
    shortDescription:
      "Command-driven portfolio with local query intelligence and domain graph.",
    longDescription:
      "This site: explore evidence through a terminal shell, deterministic query matching, and a Zettelkasten graph—no CMS, no LLM backend in v0.",
    status: "in-progress",
    domains: ["frontend", "ai", "platform"],
    stack: ["Next.js", "React Three Fiber", "Tailwind", "TypeScript"],
    signals: [
      "Local match-query engine",
      "Editor-grade design system",
    ],
    metrics: {
      bundle: "Static-first App Router",
      latency: "No external AI round-trip",
    },
    links: {
      repo: "https://github.com/Watson752/Watson752.github.io",
    },
    previewType: "iframe",
    featured: true,
  },
  {
    id: "robotics-telemetry-hub",
    slug: "robotics-telemetry-hub",
    title: "Robotics Telemetry Hub",
    shortDescription:
      "Stream processing hub for sensor frames, state snapshots, and operator alerts.",
    longDescription:
      "Ingests high-frequency telemetry from robotics prototypes, normalizes units, and exposes query APIs for debugging runs—built with the same reliability patterns as production event systems.",
    status: "experiment",
    domains: ["platform", "backend", "data"],
    stack: ["Python", "Kafka", "TimescaleDB", "gRPC"],
    signals: [
      "Backpressure-aware ingest workers",
      "Run-scoped retention policies",
    ],
    metrics: {
      streams: "8 sensor channels/run",
      latency: "p95 ingest < 120ms",
    },
    links: {
      repo: "https://github.com/Watson752",
    },
    previewType: "none",
    featured: false,
  },
  {
    id: "civic-analytics-dashboard",
    slug: "civic-analytics-dashboard",
    title: "Civic Analytics Dashboard",
    shortDescription:
      "Program metrics dashboard for public-sector stakeholders with exportable views.",
    longDescription:
      "Curated KPIs with documented grain, role-based views, and export paths suitable for reporting cycles—paired with a semantic metrics layer for consistent definitions.",
    status: "shipped",
    domains: ["data", "leadership", "frontend"],
    stack: ["SQL", "Next.js", "BigQuery", "Looker"],
    signals: [
      "Metric definitions owned by data team",
      "Audit-friendly export logs",
    ],
    metrics: {
      programs: "4 tracked initiatives",
      refresh: "Daily certified snapshots",
    },
    links: {
      docs: "#",
    },
    previewType: "image",
    previewImage: "/previews/civic-analytics.png",
    featured: false,
  },
  {
    id: "agent-workflow-kit",
    slug: "agent-workflow-kit",
    title: "Agent Workflow Kit",
    shortDescription:
      "Composable tool steps and guardrails for internal agent prototypes.",
    longDescription:
      "Lightweight orchestration for tool-using agents: typed tool contracts, step budgets, and structured logging for post-hoc review.",
    status: "experiment",
    domains: ["ai", "backend"],
    stack: ["Python", "TypeScript", "Pydantic"],
    signals: [
      "Tool schemas validated before execution",
      "Step budget enforced per session",
    ],
    metrics: {
      prototypes: "3 internal pilots",
    },
    links: {
      repo: "https://github.com/Watson752",
    },
    previewType: "none",
    featured: false,
  },
];

export const projects: Project[] = projectRecords.map((record) => {
  const caseFile = projectCaseFiles[record.id];
  if (!caseFile) {
    throw new Error(`Missing case file for project: ${record.id}`);
  }
  return { ...record, caseFile };
});

export const projectsBySlug = Object.fromEntries(
  projects.map((project) => [project.slug, project]),
) as Record<string, Project>;

export const projectsById = Object.fromEntries(
  projects.map((project) => [project.id, project]),
) as Record<string, Project>;
