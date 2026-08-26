import type { DomainCategory, Note, ProjectCardVisualState, RankedProject } from "@/types/portfolio";

export function hasEvidenceSelection(
  query: string,
  activeProjectIds: string[],
  activeDomains: DomainCategory[],
): boolean {
  return (
    query.trim().length > 0 ||
    activeProjectIds.length > 0 ||
    activeDomains.length > 0
  );
}

export function getProjectVisualState(
  project: Note,
  activeProjectIds: string[],
  activeDomains: DomainCategory[],
  hasSelection: boolean,
): ProjectCardVisualState {
  if (!hasSelection) return "idle";

  const matchedIds = new Set(activeProjectIds);
  if (matchedIds.has(project.slug)) return "active";

  const domainOverlap = project.domains.some((d) => activeDomains.includes(d));
  return domainOverlap ? "active" : "dim";
}

export function getProjectMatchRank(
  project: Note,
  activeProjectIds: string[],
  activeDomains: DomainCategory[],
): number {
  const matchedIds = new Set(activeProjectIds);
  if (matchedIds.has(project.slug)) return 100;
  const overlap = project.domains.filter((d) => activeDomains.includes(d)).length;
  if (overlap > 0) return 40 + overlap * 10;
  return 0;
}

export function getProjectMatchReason(
  project: Note,
  options: {
    query: string;
    activeProjectIds: string[];
    activeDomains: DomainCategory[];
    hasSelection: boolean;
  },
): string | null {
  const { query, activeProjectIds, activeDomains, hasSelection } = options;
  if (!hasSelection) return null;

  const matchedIds = new Set(activeProjectIds);
  const q = query.trim();

  if (matchedIds.has(project.slug)) {
    if (q) {
      return `direct_hit :: matched query "${q.length > 36 ? `${q.slice(0, 36)}…` : q}"`;
    }
    return "direct_hit :: graph selection";
  }

  const overlap = project.domains.filter((d) => activeDomains.includes(d));
  if (overlap.length > 0) {
    return `domain_overlap :: ${overlap.join(" + ")}`;
  }

  return "subdued :: outside active match set";
}

export function sortProjectsForEvidence(
  projects: Note[],
  activeProjectIds: string[],
  activeDomains: DomainCategory[],
  hasSelection: boolean,
): RankedProject[] {
  if (!hasSelection) {
    return projects
      .slice()
      .sort((a, b) => b.updated.localeCompare(a.updated))
      .map((project) => ({ project, state: "idle" as ProjectCardVisualState, rank: 0 }));
  }

  return projects
    .map((project) => ({
      project,
      state: getProjectVisualState(project, activeProjectIds, activeDomains, hasSelection),
      rank: getProjectMatchRank(project, activeProjectIds, activeDomains),
    }))
    .sort((a, b) => b.rank - a.rank);
}
