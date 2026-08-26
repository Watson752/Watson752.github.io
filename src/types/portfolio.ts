/** Portfolio knowledge graph domain buckets — fixed taxonomy, see vault/PUBLISHING.md */
export type DomainCategory =
  | "UI/UX"
  | "Full Stack"
  | "Data Analytics"
  | "Cloud"
  | "AI/ML";

/** Matches vault/PUBLISHING.md's frontmatter `type` field */
export type NoteType = "project" | "note" | "role";

export type ProjectStatus = "shipped" | "in-progress" | "experiment" | "archived";

export type ExternalLinks = {
  demo?: string;
  repo?: string;
  docs?: string;
};

/**
 * A published vault note, as written by scripts/vault-export to
 * src/data/generated/notes.json. `html` is pre-sanitized at export time.
 */
export type Note = {
  id: string;
  slug: string;
  title: string;
  type: NoteType;
  domains: DomainCategory[];
  tags: string[];
  summary: string;
  html: string;
  /** Slugs of other published notes this one links to */
  links: string[];
  updated: string;
  /** project notes only */
  status?: ProjectStatus;
  stack?: string[];
  externalLinks?: ExternalLinks;
  /** role notes only */
  org?: string;
  dates?: string;
};

export type GraphNodeType = NoteType;

export type GraphNode = {
  id: string;
  label: string;
  type: GraphNodeType;
  category: DomainCategory;
  strength: number;
  position: { x: number; y: number; z: number };
  relatedProjectIds: string[];
  keywords: string[];
};

export type GraphEdge = {
  source: string;
  target: string;
  strength: number;
  relationshipLabel: string;
  /** Domain(s) this edge represents (empty for a purely editorial link with no shared domain). */
  domains: DomainCategory[];
};

export type PortfolioSelectionSource = "query" | "graph" | null;

export type ProjectCardVisualState = "idle" | "active" | "dim";

export type RankedProject = {
  project: Note;
  state: ProjectCardVisualState;
  /** Higher = sorted first among cards */
  rank: number;
};

export type QueryMatchConfidence = "keyword" | "default" | "ai";

export type QueryMatch = {
  query: string;
  matchedDomains: DomainCategory[];
  matchedProjectIds: string[];
  matchedGraphNodeIds: string[];
  response: string;
  confidence: QueryMatchConfidence;
};

/** Structured output of a slash command (e.g. /help), rendered as a list rather than prose. */
export type CommandResult = {
  kind: "command";
  commandName: string;
  lines: string[];
};

export type SiteProfile = {
  name: string;
  role: string;
  systemLabel: string;
  headline: string;
  subheading: string;
  /** Short availability caption shown on the intro gate, e.g. "Available for Fall 2026". */
  availability: string;
  status: "online" | "idle" | "busy";
  nav: { label: string; href: string }[];
};
