/** Portfolio knowledge graph domain buckets — fixed taxonomy, see vault/PUBLISHING.md */
export type DomainCategory =
  | "UI/UX"
  | "Full Stack"
  | "Data Analytics"
  | "Cloud"
  | "AI/ML"
  // In the vault taxonomy (vault/PUBLISHING.md) but without a site color yet;
  // rendered with the neutral fallback style in lib/domain-colors.ts.
  | "Hardware/Firmware"
  | "Leadership";

/** Matches vault/PUBLISHING.md's frontmatter `type` field */
export type NoteType = "project" | "note" | "role";

export type ProjectStatus = "shipped" | "in-progress" | "experiment" | "archived";

export type ExternalLinks = {
  demo?: string;
  repo?: string;
  docs?: string;
};

export type ProjectDiagram = {
  /** Site-relative path to the saved image */
  src: string;
  /** Interactive diagram on gitdiagram.com */
  href: string;
  width: number;
  height: number;
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
  /** GitDiagram architecture picture, saved at export time (public repos only) */
  diagram?: ProjectDiagram;
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

export type WorkMode = "On-site" | "Hybrid" | "Remote";

/** A role shown in the landing page's experience log. */
export type Experience = {
  /** Short slug, shown as the git-log "ref" label */
  id: string;
  title: string;
  org: string;
  employmentType: string;
  /** ISO month, e.g. "2026-09" */
  start: string;
  /** ISO month (may be in the future for a fixed-term role), or null while open-ended */
  end: string | null;
  location: string;
  mode: WorkMode;
  skills: string[];
  highlights: string[];
};

export type SiteProfile = {
  name: string;
  role: string;
  systemLabel: string;
  headline: string;
  subheading: string;
  /** Personal quote shown under the name on the intro gate. */
  quote: string;
  /** Shown above the experience log, e.g. "Available for Summer 2027 Internships". */
  availability?: string;
  status: "online" | "idle" | "busy";
  nav: { label: string; href: string }[];
};
