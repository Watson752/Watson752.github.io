import { graphEdges, graphNodes, graphNodesById } from "@/data/graph";
import { projects } from "@/data/projects";
import { defaultQueryResponse, queryPresets } from "@/data/queries";
import { skills } from "@/data/skills";
import type {
  DomainCategory,
  GraphNode,
  QueryMatch,
  QueryPreset,
} from "@/types/portfolio";

const DOMAIN_LABELS: Record<DomainCategory, string> = {
  ai: "AI",
  backend: "Backend",
  data: "Data",
  frontend: "Frontend",
  platform: "Platform",
  leadership: "Leadership",
};

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

function findPreset(query: string): QueryPreset | undefined {
  const exact = queryPresets.find(
    (preset) =>
      normalize(preset.query) === query || normalize(preset.label) === query,
  );
  if (exact) return exact;

  let best: QueryPreset | undefined;
  let bestScore = 0;

  for (const preset of queryPresets) {
    const terms = [
      preset.label,
      preset.query,
      ...(preset.keywords ?? []),
    ];
    const score = scoreKeywordHits(query, terms);
    if (score > bestScore) {
      bestScore = score;
      best = preset;
    }
  }

  return bestScore >= 2 ? best : undefined;
}

type ScoredNode = { node: GraphNode; score: number };

function scoreGraphNodes(query: string): ScoredNode[] {
  return graphNodes
    .map((node) => ({
      node,
      score: scoreKeywordHits(query, [
        ...node.keywords,
        node.label,
        node.id,
        node.category,
      ]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function scoreProjects(query: string) {
  return projects
    .map((project) => {
      const score = scoreKeywordHits(query, [
        project.title,
        project.shortDescription,
        project.slug,
        ...project.domains,
        ...project.stack,
        ...project.signals,
        ...Object.keys(project.metrics),
        ...Object.values(project.metrics),
      ]);
      return { project, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function scoreSkills(query: string) {
  return skills
    .map((skill) => ({
      skill,
      score: scoreKeywordHits(query, [
        skill.name,
        skill.description,
        skill.category,
        skill.id,
      ]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function expandGraphNodesFromProjects(projectIds: string[]): string[] {
  const ids = new Set<string>();
  for (const node of graphNodes) {
    if (node.relatedProjectIds.some((id) => projectIds.includes(id))) {
      ids.add(node.id);
    }
  }
  for (const projectId of projectIds) {
    const projectNode = graphNodes.find(
      (n) => n.type === "project" && n.relatedProjectIds.includes(projectId),
    );
    if (projectNode) ids.add(projectNode.id);
  }
  return [...ids];
}

function domainsFromGraphNodes(nodeIds: string[]): DomainCategory[] {
  return unique(
    nodeIds
      .map((id) => graphNodes.find((n) => n.id === id)?.category)
      .filter((c): c is DomainCategory => c != null),
  );
}

function buildKeywordResponse(
  domains: DomainCategory[],
  projectIds: string[],
  topNodes: ScoredNode[],
  topSkills: ReturnType<typeof scoreSkills>,
): string {
  const domainText =
    domains.length > 0
      ? domains.map((d) => DOMAIN_LABELS[d]).join(", ")
      : "general";

  const projectTitles = projectIds
    .map((id) => projects.find((p) => p.id === id)?.title)
    .filter(Boolean)
    .slice(0, 3);

  const skillNames = topSkills.slice(0, 2).map((s) => s.skill.name);
  const nodeLabels = topNodes.slice(0, 3).map((n) => n.node.label);

  const parts: string[] = [
    `Matched context: ${domainText}.`,
  ];

  if (projectTitles.length > 0) {
    parts.push(
      `Relevant projects: ${projectTitles.join(", ")}.`,
    );
  }

  if (skillNames.length > 0) {
    parts.push(`Skills surfaced: ${skillNames.join(", ")}.`);
  }

  if (nodeLabels.length > 0) {
    parts.push(`Graph focus: ${nodeLabels.join(" · ")}.`);
  }

  return parts.join(" ");
}

/**
 * Deterministic local query matcher — no LLM, DB, or vector search.
 */
export function matchQuery(rawQuery: string): QueryMatch {
  const query = normalize(rawQuery);

  if (!query) {
    return {
      query: rawQuery,
      matchedDomains: [],
      matchedProjectIds: [],
      matchedGraphNodeIds: [],
      response:
        "Enter a question about projects, domains, or skills—then press Enter.",
      confidence: "default",
    };
  }

  const preset = findPreset(query);
  if (preset) {
    const graphIds = unique([
      ...expandGraphNodesFromProjects(preset.matchedProjects),
      ...graphNodes
        .filter(
          (n) =>
            n.type === "domain" &&
            preset.matchedDomains.includes(n.category),
        )
        .map((n) => n.id),
    ]);

    return {
      query: rawQuery,
      matchedDomains: preset.matchedDomains,
      matchedProjectIds: preset.matchedProjects,
      matchedGraphNodeIds: graphIds,
      response: preset.response,
      confidence: "preset",
      presetId: preset.id,
    };
  }

  const scoredNodes = scoreGraphNodes(query);
  const scoredProjects = scoreProjects(query);
  const scoredSkills = scoreSkills(query);

  const projectIds = unique([
    ...scoredProjects.slice(0, 4).map((e) => e.project.id),
    ...scoredSkills.flatMap((e) => e.skill.relatedProjects),
  ]);

  const graphNodeIds = unique([
    ...scoredNodes.slice(0, 6).map((e) => e.node.id),
    ...expandGraphNodesFromProjects(projectIds),
  ]);

  const domains = unique([
    ...domainsFromGraphNodes(graphNodeIds),
    ...scoredProjects.flatMap((e) => e.project.domains),
    ...scoredSkills.map((e) => e.skill.category),
  ]);

  const hasSignal =
    projectIds.length > 0 ||
    graphNodeIds.length > 0 ||
    domains.length > 0;

  if (!hasSignal) {
    const featured = projects.filter((p) => p.featured).map((p) => p.id);
    const fallbackDomains: DomainCategory[] = ["ai", "backend", "frontend"];
    return {
      query: rawQuery,
      matchedDomains: fallbackDomains,
      matchedProjectIds: featured.slice(0, 3),
      matchedGraphNodeIds: graphNodes
        .filter((n) => n.type === "domain" && fallbackDomains.includes(n.category))
        .map((n) => n.id),
      response: defaultQueryResponse,
      confidence: "default",
    };
  }

  return {
    query: rawQuery,
    matchedDomains: domains,
    matchedProjectIds: projectIds.slice(0, 4),
    matchedGraphNodeIds: graphNodeIds,
    response: buildKeywordResponse(
      domains,
      projectIds,
      scoredNodes,
      scoredSkills,
    ),
    confidence: "keyword",
  };
}

function domainNodeId(category: DomainCategory): string {
  const map: Record<DomainCategory, string> = {
    ai: "domain-ai",
    backend: "domain-backend",
    data: "domain-data",
    frontend: "domain-frontend",
    platform: "domain-platform",
    leadership: "domain-leadership",
  };
  return map[category];
}

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
    .flatMap((e) => (e.source === nodeId ? e.target : e.source));

  const matchedGraphNodeIds = unique([
    nodeId,
    domainNodeId(node.category),
    ...neighborIds.slice(0, 5),
  ]);

  const matchedProjectIds = unique([
    ...node.relatedProjectIds,
    ...neighborIds
      .map((id) => graphNodesById[id])
      .filter(Boolean)
      .flatMap((n) => n.relatedProjectIds),
  ]).slice(0, 4);

  const typeCopy: Record<GraphNode["type"], string> = {
    domain: `Exploring the ${node.label} domain—connected skills, tools, and evidence are highlighted in the graph and project row.`,
    skill: `${node.label} is a core skill area. Related projects and domains are surfaced for review.`,
    project: `Focused on ${node.label}. See evidence cards for stack, signals, and outcomes.`,
    tool: `${node.label} appears across selected projects—useful context for how systems are built.`,
    idea: `${node.label} is a product/UX concept tied to frontend work—see the terminal portfolio for the implementation direction.`,
  };

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
    response: typeCopy[node.type],
    confidence: "keyword",
  };
}
