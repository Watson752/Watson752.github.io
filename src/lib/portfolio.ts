import { projects, projectsById } from "@/data/projects";
import { queryPresets } from "@/data/queries";
import type {
  DomainCategory,
  Project,
  ProjectCardVisualState,
  QueryMatch,
  RankedProject,
} from "@/types/portfolio";

export function getQuerySuggestionLabels(): string[] {
  return queryPresets.map((preset) => preset.label);
}

export function getProjectsByIds(ids: string[]): Project[] {
  const ordered: Project[] = [];
  for (const id of ids) {
    const project = projectsById[id];
    if (project) ordered.push(project);
  }
  return ordered;
}

/** Map domain category to graph node id used in graph.ts */
export function domainToGraphNodeId(domain: DomainCategory): string {
  const map: Record<DomainCategory, string> = {
    ai: "domain-ai",
    backend: "domain-backend",
    data: "domain-data",
    frontend: "domain-frontend",
    platform: "domain-platform",
    leadership: "domain-leadership",
  };
  return map[domain];
}

export function resolveActiveGraphNodeIds(
  match: QueryMatch | null,
  selectedNodeId?: string | null,
): string[] {
  const fromMatch =
    match == null
      ? []
      : match.matchedGraphNodeIds.length > 0
        ? match.matchedGraphNodeIds
        : match.matchedDomains.map(domainToGraphNodeId);

  if (!selectedNodeId) return fromMatch;
  if (fromMatch.includes(selectedNodeId)) return fromMatch;
  return [selectedNodeId, ...fromMatch];
}

function projectMatchScore(
  project: Project,
  matchedIds: Set<string>,
  matchedDomains: DomainCategory[],
): number {
  if (matchedIds.has(project.id)) return 100 + (project.featured ? 10 : 0);
  const domainOverlap = project.domains.filter((d) =>
    matchedDomains.includes(d),
  ).length;
  if (domainOverlap > 0) return 40 + domainOverlap * 10;
  return 0;
}

/**
 * All projects ranked for display: active matches first, dim non-matches lower.
 */
export function rankProjectsForMatch(match: QueryMatch | null): RankedProject[] {
  if (!match || match.matchedProjectIds.length === 0 && match.matchedDomains.length === 0) {
    return projects
      .slice()
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .map((project) => ({
        project,
        state: "idle" as ProjectCardVisualState,
        rank: project.featured ? 1 : 0,
      }));
  }

  const matchedIds = new Set(match.matchedProjectIds);
  const ranked = projects.map((project) => {
    const score = projectMatchScore(
      project,
      matchedIds,
      match.matchedDomains,
    );
    const state: ProjectCardVisualState =
      score >= 40 ? "active" : "dim";
    return { project, state, rank: score };
  });

  return ranked.sort((a, b) => b.rank - a.rank);
}

/** @deprecated Use rankProjectsForMatch — kept for narrow lists */
export function resolveProjectsForMatch(
  match: QueryMatch | null,
  limit = 3,
): Project[] {
  return rankProjectsForMatch(match)
    .filter((r) => r.state !== "dim")
    .slice(0, limit)
    .map((r) => r.project);
}
