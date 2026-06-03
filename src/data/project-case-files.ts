import type { ProjectCaseFile } from "@/types/portfolio";

/** Case file bodies — merged into projects in projects.ts */
export const projectCaseFiles: Record<string, ProjectCaseFile> = {
  "rag-ops-console": {
    overview:
      "Operator console for RAG systems: trace-linked eval batches, prompt versioning, and human review queues in one editor-grade UI.",
    problem:
      "Teams ran evals in spreadsheets with no trace linkage. Regressions were slow to triage and prompts drifted without version discipline.",
    built: [
      "Eval batch runner tied to production trace IDs",
      "Side-by-side prompt diff viewer with version tags",
      "Review queue for sub-threshold answers",
      "OpenTelemetry hooks on retrieval and generation paths",
    ],
    architecture:
      "Next.js UI over a typed API layer. Postgres stores eval definitions, batch runs, and prompt versions. Workers pull golden sets and write scored results back with trace foreign keys.",
    architectureNotes: [
      {
        component: "console-ui",
        responsibility: "Batch orchestration, diff views, reviewer workflows",
      },
      {
        component: "eval-worker",
        responsibility: "Runs retrieval + scoring pipelines asynchronously",
      },
      {
        component: "trace-store",
        responsibility: "Immutable references to production spans",
      },
    ],
    decisions: [
      {
        title: "Trace-linked eval batches",
        detail:
          "Every batch references production traces so operators reproduce context—not synthetic-only fixtures.",
      },
      {
        title: "Human review as first-class queue",
        detail:
          "Low-confidence rows route to reviewers instead of hiding behind aggregate scores.",
      },
    ],
    challenges: [
      {
        title: "Scoring consistency across model versions",
        detail:
          "Normalized rubrics and frozen golden sets per prompt version to avoid apples-to-oranges comparisons.",
      },
    ],
    results: [
      { label: "triage time", value: "−40% vs spreadsheet workflow" },
      { label: "eval coverage", value: "120+ golden cases per version" },
    ],
    learned: [
      "Operators need trace IDs in the UI, not just in logs.",
      "Prompt diffs matter as much as aggregate metrics.",
    ],
  },
  "event-ingestion-api": {
    overview:
      "Idempotent HTTP/stream ingress for product events with schema registry enforcement and replay-safe consumers.",
    problem:
      "Multiple producers emitted incompatible payloads. Duplicates and schema drift caused downstream analytics incidents.",
    built: [
      "Versioned schema registry with CI compatibility checks",
      "Idempotency keys on all write paths",
      "DLQ with replay tooling for poison messages",
      "Lag and error budgets on operator dashboards",
    ],
    architecture:
      "Stateless ingest nodes front Kafka topics. Postgres holds schema versions and idempotency keys. Consumers use at-least-once with dedupe tables.",
    architectureNotes: [
      {
        component: "ingest-api",
        responsibility: "Validate, dedupe, publish to topic",
      },
      {
        component: "schema-registry",
        responsibility: "Compatibility gates and version metadata",
      },
      {
        component: "replay-worker",
        responsibility: "Safe DLQ reprocessing with audit trail",
      },
    ],
    decisions: [
      {
        title: "Idempotency at the edge",
        detail: "Keys enforced before publish so consumers stay simple and replay-safe.",
      },
      {
        title: "Schema checks in CI",
        detail: "Breaking changes fail builds—not production dashboards.",
      },
    ],
    challenges: [
      {
        title: "Burst traffic without duplicate side-effects",
        detail: "Backpressure + partition scaling with dedupe store hot keys mitigated via sharding.",
      },
    ],
    results: [
      { label: "peak throughput", value: "12k events/s sustained" },
      { label: "replay safety", value: "Zero duplicate side-effects in soak tests" },
    ],
    learned: [
      "Invest in registry ergonomics early—producer self-service reduces ops load.",
    ],
  },
  "metrics-semantic-layer": {
    overview:
      "Shared semantic layer for product, ops, and leadership metrics with documented grain and lineage.",
    problem:
      "Teams defined activation and retention differently. Dashboards disagreed and decisions stalled.",
    built: [
      "48 core metrics with owners and grain docs",
      "dbt models with lineage tags on exposed fields",
      "Looker explores bound to semantic definitions",
    ],
    architecture:
      "Warehouse-native models (BigQuery) orchestrated by dbt. Exposures map to BI layers with enforced naming and tests on grain.",
    architectureNotes: [
      {
        component: "semantic-models",
        responsibility: "Canonical SQL for each KPI",
      },
      {
        component: "lineage-tags",
        responsibility: "Trace fields to source events",
      },
    ],
    decisions: [
      {
        title: "Single activation definition",
        detail: "One blessed metric with changelog discipline across teams.",
      },
    ],
    challenges: [
      {
        title: "Migrating legacy dashboards",
        detail: "Parallel-run period with diff alerts before cutover.",
      },
    ],
    results: [
      { label: "definitions", value: "48 core metrics" },
      { label: "adoption", value: "6 teams on shared layer" },
    ],
    learned: ["Metric ownership matters more than metric count."],
  },
  "terminal-portfolio": {
    overview:
      "Command-driven portfolio shell with local query intelligence, 3D knowledge graph, and evidence readouts—this site.",
    problem:
      "Traditional portfolio grids hide domain relationships and require scrolling past marketing copy to find evidence.",
    built: [
      "Terminal shell with deterministic match-query engine",
      "Zettelkasten graph with query-driven highlights",
      "Project case files with split-screen documentation",
      "Custom design system (not default shadcn)",
    ],
    architecture:
      "Next.js App Router static pages. Client islands for graph and command state. Typed data modules—no CMS, no LLM round-trip in v0.",
    architectureNotes: [
      {
        component: "match-query",
        responsibility: "Preset + keyword routing to domains/projects/nodes",
      },
      {
        component: "graph-scene",
        responsibility: "R3F visualization of graph.ts positions",
      },
      {
        component: "case-file-routes",
        responsibility: "SSG project detail from projects.ts",
      },
    ],
    decisions: [
      {
        title: "Local intelligence first",
        detail: "Curated presets and keyword scoring before any external AI API.",
      },
      {
        title: "Split-screen case files",
        detail: "Preview + docs mirror IDE layout, not blog templates.",
      },
    ],
    challenges: [
      {
        title: "Graph readability without chaos",
        detail: "Controlled motion, dim non-matches, 2D fallback on mobile.",
      },
    ],
    results: [
      { label: "delivery", value: "Static-first, no AI latency" },
      { label: "bundle", value: "3D chunk dynamically imported" },
    ],
    learned: [
      "Portfolio UX can be exploratory without being noisy.",
      "Typed data files are enough until content volume demands MDX.",
    ],
  },
  "robotics-telemetry-hub": {
    overview:
      "Prototype hub ingesting robotics sensor streams with run-scoped retention and operator query APIs.",
    problem:
      "Debugging robotics runs required ad-hoc log pulls with inconsistent units and timestamps.",
    built: [
      "Kafka ingest with backpressure",
      "TimescaleDB for high-frequency samples",
      "gRPC query API for run snapshots",
    ],
    architecture:
      "Ingest workers normalize units at the edge. Storage partitioned by run_id. Query layer exposes frame ranges and alert thresholds.",
    architectureNotes: [
      {
        component: "ingest-worker",
        responsibility: "Normalize, validate, publish",
      },
      {
        component: "timescale",
        responsibility: "Time-series retention per run",
      },
    ],
    decisions: [
      {
        title: "Run-scoped retention",
        detail: "TTL policies per experiment to control storage costs.",
      },
    ],
    challenges: [
      {
        title: "High-frequency bursty streams",
        detail: "Batching and bounded queues prevent OOM on ingest nodes.",
      },
    ],
    results: [
      { label: "streams", value: "8 sensor channels/run" },
      { label: "latency", value: "p95 ingest < 120ms" },
    ],
    learned: ["Reuse production event patterns for prototypes—less surprise at scale."],
  },
  "civic-analytics-dashboard": {
    overview:
      "Stakeholder dashboard for public-sector program KPIs with certified daily snapshots and exportable views.",
    problem:
      "Program reporting cycles required manual exports with inconsistent definitions and weak audit trails.",
    built: [
      "Role-based KPI views",
      "Export logs for audit",
      "Integration with semantic metrics layer",
    ],
    architecture:
      "Next.js front end on BigQuery models. Looker-backed explores for analysts; simplified views for stakeholders.",
    architectureNotes: [
      {
        component: "stakeholder-views",
        responsibility: "Curated KPIs with grain tooltips",
      },
      {
        component: "export-service",
        responsibility: "Logged CSV/PDF generation",
      },
    ],
    decisions: [
      {
        title: "Certified snapshots",
        detail: "Daily jobs freeze numbers used in reports—no live-query drift mid-cycle.",
      },
    ],
    challenges: [
      {
        title: "Balancing simplicity vs drill-down",
        detail: "Layered navigation: summary first, analyst mode behind roles.",
      },
    ],
    results: [
      { label: "programs", value: "4 tracked initiatives" },
      { label: "refresh", value: "Daily certified snapshots" },
    ],
    learned: ["Audit logs are a feature, not paperwork."],
  },
  "agent-workflow-kit": {
    overview:
      "Internal kit for composable agent tool steps with schemas, budgets, and structured session logs.",
    problem:
      "Agent prototypes duplicated tool wiring and lacked guardrails on step count and side-effects.",
    built: [
      "Pydantic-validated tool contracts",
      "Step budget per session",
      "Structured JSON logs for review",
    ],
    architecture:
      "Python orchestrator calls typed tools. TypeScript SDK for UI demos. Logs written append-only for post-hoc review.",
    architectureNotes: [
      {
        component: "tool-registry",
        responsibility: "Schema validation before invoke",
      },
      {
        component: "session-log",
        responsibility: "Immutable step trace",
      },
    ],
    decisions: [
      {
        title: "Schema-first tools",
        detail: "Invalid args fail before execution—no silent coercion.",
      },
    ],
    challenges: [
      {
        title: "Bounding agent autonomy",
        detail: "Step budgets and allow-listed tools per workflow profile.",
      },
    ],
    results: [{ label: "pilots", value: "3 internal prototypes" }],
    learned: ["Guardrails enable faster experimentation, not slower."],
  },
};
