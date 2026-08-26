import { graphEdges, graphNodes, graphNodesById } from "@/data/graph";
import { notes } from "@/data/notes";
import type { DomainCategory, GraphNode, NoteType, QueryMatch } from "@/types/portfolio";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function scoreKeywordHits(query: string, keywords: string[]): number {
  let score = 0;
  for (const keyword of keywords) {
    const normalized = normalize(keyword);
    if (!normalized) continue;
    if (query === normalized) {
      score += normalized.length > 5 ? 4 : 3;
    } else if (query.includes(normalized)) {
      score += normalized.length > 6 ? 2 : 1;
    }
  }
  return score;
}

type ScoredNode = { node: GraphNode; score: number };

function scoreGraphNodes(query: string): ScoredNode[] {
  return graphNodes
    .map((node) => ({
      node,
      score: scoreKeywordHits(query, [...node.keywords, node.label, node.id, node.category]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function scoreNotes(query: string) {
  return notes
    .map((note) => ({
      note,
      score: scoreKeywordHits(query, [
        note.title,
        note.summary,
        note.slug,
        ...note.domains,
        ...note.tags,
        ...(note.stack ?? []),
      ]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function expandGraphNodesFromProjects(projectSlugs: string[]): string[] {
  const ids = new Set<string>();
  for (const node of graphNodes) {
    if (node.relatedProjectIds.some((id) => projectSlugs.includes(id))) {
      ids.add(node.id);
    }
  }
  return [...ids];
}

function domainsFromGraphNodes(nodeIds: string[]): DomainCategory[] {
  return unique(
    nodeIds
      .map((id) => graphNodesById[id]?.category)
      .filter((c): c is DomainCategory => c != null),
  );
}

function buildResponse(
  domains: DomainCategory[],
  projectSlugs: string[],
  topNodes: ScoredNode[],
): string {
  const domainText = domains.length > 0 ? domains.join(", ") : "general";

  const projectTitles = projectSlugs
    .map((slug) => notes.find((n) => n.slug === slug)?.title)
    .filter(Boolean)
    .slice(0, 3);

  const nodeLabels = topNodes.slice(0, 3).map((n) => n.node.label);

  const parts: string[] = [`Matched context: ${domainText}.`];

  if (projectTitles.length > 0) {
    parts.push(`Relevant projects: ${projectTitles.join(", ")}.`);
  }

  if (nodeLabels.length > 0) {
    parts.push(`Graph focus: ${nodeLabels.join(" · ")}.`);
  }

  return parts.join(" ");
}

const NO_NOTES_RESPONSE =
  "No published notes yet. Once real vault notes go live (npm run export:vault), queries will match against them here.";

const NO_MATCH_RESPONSE =
  "No strong match. Try a domain name (e.g. AI/ML, Full Stack) or keywords from a project.";

/**
 * Deterministic local query matcher — no LLM, DB, or vector search. Scores
 * free text against published vault notes and graph nodes only.
 */
export function matchQuery(rawQuery: string): QueryMatch {
  const query = normalize(rawQuery);

  if (!query) {
    return {
      query: rawQuery,
      matchedDomains: [],
      matchedProjectIds: [],
      matchedGraphNodeIds: [],
      response: "Enter a question about projects or domains—then press Enter.",
      confidence: "default",
    };
  }

  const scoredNodes = scoreGraphNodes(query);
  const scoredNotes = scoreNotes(query);

  const projectSlugs = unique(
    scoredNotes
      .filter((entry) => entry.note.type === "project")
      .slice(0, 4)
      .map((entry) => entry.note.slug),
  );

  const graphNodeIds = unique([
    ...scoredNodes.slice(0, 6).map((entry) => entry.node.id),
    ...expandGraphNodesFromProjects(projectSlugs),
  ]);

  const domains = unique([
    ...domainsFromGraphNodes(graphNodeIds),
    ...scoredNotes.flatMap((entry) => entry.note.domains),
  ]);

  const hasSignal = projectSlugs.length > 0 || graphNodeIds.length > 0 || domains.length > 0;

  if (!hasSignal) {
    return {
      query: rawQuery,
      matchedDomains: [],
      matchedProjectIds: [],
      matchedGraphNodeIds: [],
      response: notes.length === 0 ? NO_NOTES_RESPONSE : NO_MATCH_RESPONSE,
      confidence: "default",
    };
  }

  return {
    query: rawQuery,
    matchedDomains: domains,
    matchedProjectIds: projectSlugs,
    matchedGraphNodeIds: graphNodeIds,
    response: buildResponse(domains, projectSlugs, scoredNodes),
    confidence: "keyword",
  };
}

const NODE_TYPE_COPY: Record<NoteType, string> = {
  project: "Focused on {label}. See evidence cards below for stack and case study.",
  note: "{label} — a published note. Related items are highlighted in the graph.",
  role: "{label} — a role/position. Related projects and domains are surfaced for review.",
};

/** Focus portfolio state from a graph node click */
export function matchFromGraphNode(nodeId: string): QueryMatch {
  const node = graphNodesById[nodeId];
  if (!node) {
    return {
      query: "",
      matchedDomains: [],
      matchedProjectIds: [],
      matchedGraphNodeIds: [],
      response: "Unknown graph node.",
      confidence: "default",
    };
  }

  const neighborIds = graphEdges
    .filter((e) => e.source === nodeId || e.target === nodeId)
    .map((e) => (e.source === nodeId ? e.target : e.source));

  const matchedGraphNodeIds = unique([nodeId, ...neighborIds.slice(0, 6)]);

  const matchedProjectIds = unique([
    ...node.relatedProjectIds,
    ...neighborIds.flatMap((id) => graphNodesById[id]?.relatedProjectIds ?? []),
  ]).slice(0, 4);

  return {
    query: node.label,
    matchedDomains: unique([
      node.category,
      ...neighborIds
        .map((id) => graphNodesById[id]?.category)
        .filter((c): c is DomainCategory => c != null),
    ]),
    matchedProjectIds,
    matchedGraphNodeIds,
    response: NODE_TYPE_COPY[node.type].replace("{label}", node.label),
    confidence: "keyword",
  };
}
