/** Portfolio knowledge graph domain buckets */
export type DomainCategory =
  | "ai"
  | "backend"
  | "data"
  | "frontend"
  | "platform"
  | "leadership";

export type ProjectStatus = "shipped" | "in-progress" | "experiment" | "archived";

export type PreviewType = "image" | "iframe" | "video" | "none";

export type ProjectLinks = {
  demo?: string;
  repo?: string;
  docs?: string;
};

export type ArchitectureNote = {
  component: string;
  responsibility: string;
};

export type TechnicalDecision = {
  title: string;
  detail: string;
};

export type ProjectCaseFile = {
  overview: string;
  problem: string;
  built: string[];
  architecture: string;
  architectureNotes: ArchitectureNote[];
  decisions: TechnicalDecision[];
  challenges: TechnicalDecision[];
  results: { label: string; value: string }[];
  learned: string[];
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: ProjectStatus;
  domains: DomainCategory[];
  stack: string[];
  signals: string[];
  metrics: Record<string, string>;
  links: ProjectLinks;
  previewType: PreviewType;
  previewImage?: string;
  featured: boolean;
  caseFile: ProjectCaseFile;
};

export type ProjectDocSectionId =
  | "overview"
  | "problem"
  | "built"
  | "stack"
  | "architecture"
  | "decisions"
  | "challenges"
  | "results"
  | "learned"
  | "links";

export type SkillConfidence = "primary" | "strong" | "working";

export type Skill = {
  id: string;
  name: string;
  category: DomainCategory;
  confidenceLevel: SkillConfidence;
  relatedProjects: string[];
  description: string;
};

export type GraphNodeType = "domain" | "skill" | "project" | "tool" | "idea";

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
};

export type QueryPreset = {
  id: string;
  label: string;
  query: string;
  matchedDomains: DomainCategory[];
  matchedProjects: string[];
  /** Extra terms for deterministic preset routing */
  keywords?: string[];
  /** Curated assistant copy for this preset */
  response: string;
};

export type PortfolioSelectionSource = "query" | "graph" | null;

export type ProjectCardVisualState = "idle" | "active" | "dim";

export type RankedProject = {
  project: Project;
  state: ProjectCardVisualState;
  /** Higher = sorted first among cards */
  rank: number;
};

export type QueryMatchConfidence = "preset" | "keyword" | "default";

export type QueryMatch = {
  query: string;
  matchedDomains: DomainCategory[];
  matchedProjectIds: string[];
  matchedGraphNodeIds: string[];
  response: string;
  confidence: QueryMatchConfidence;
  presetId?: string;
};

export type SiteProfile = {
  name: string;
  role: string;
  systemLabel: string;
  headline: string;
  subheading: string;
  status: "online" | "idle" | "busy";
  nav: { label: string; href: string }[];
};
