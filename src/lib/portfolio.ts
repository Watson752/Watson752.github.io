import { notesBySlug, projectNotes } from "@/data/notes";
import { ALL_DOMAINS } from "@/lib/domain-colors";
import type { Note, ProjectCardVisualState, QueryMatch, RankedProject } from "@/types/portfolio";

/** Domain names double as the query suggestion chips — no separate hand-curated preset content. */
export function getQuerySuggestionLabels(): string[] {
  return ALL_DOMAINS;
}

export function getProjectsByIds(slugs: string[]): Note[] {
  const ordered: Note[] = [];
  for (const slug of slugs) {
    const note = notesBySlug[slug];
    if (note) ordered.push(note);
  }
  return ordered;
}

export function resolveActiveGraphNodeIds(
  match: QueryMatch | null,
  selectedNodeId?: string | null,
): string[] {
  const fromMatch = match?.matchedGraphNodeIds ?? [];
  if (!selectedNodeId) return fromMatch;
  if (fromMatch.includes(selectedNodeId)) return fromMatch;
  return [selectedNodeId, ...fromMatch];
}

function projectMatchScore(project: Note, matchedIds: Set<string>, matchedDomains: string[]): number {
  if (matchedIds.has(project.slug)) return 100;
  const domainOverlap = project.domains.filter((d) => matchedDomains.includes(d)).length;
  if (domainOverlap > 0) return 40 + domainOverlap * 10;
  return 0;
}

/**
 * All project notes ranked for display: active matches first, dim non-matches lower.
 */
export function rankProjectsForMatch(match: QueryMatch | null): RankedProject[] {
  if (!match || (match.matchedProjectIds.length === 0 && match.matchedDomains.length === 0)) {
    return projectNotes
      .slice()
      .sort((a, b) => b.updated.localeCompare(a.updated))
      .map((project) => ({ project, state: "idle" as ProjectCardVisualState, rank: 0 }));
  }

  const matchedIds = new Set(match.matchedProjectIds);
  const ranked = projectNotes.map((project) => {
    const score = projectMatchScore(project, matchedIds, match.matchedDomains);
    const state: ProjectCardVisualState = score >= 40 ? "active" : "dim";
    return { project, state, rank: score };
  });

  return ranked.sort((a, b) => b.rank - a.rank);
}
