import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3-force";
import type { Domain, NoteType } from "./config";

export type GraphSourceNote = {
  slug: string;
  title: string;
  type: NoteType;
  domains: Domain[];
  tags: string[];
  linkedSlugs: string[];
};

export type GraphNode = {
  id: string;
  label: string;
  type: NoteType;
  category: Domain;
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
  /** Domain(s) this edge represents (empty for a purely editorial "linked" edge with no shared domain). */
  domains: Domain[];
};

const LAYOUT_EXTENT = 2.4;
const LAYOUT_ITERATIONS = 300;
// The 3D graph renders nodes as spheres up to ~0.22 world units in radius
// (see MAX_RADIUS_3D in src/lib/graph-visual.ts) inside a group scaled by
// SCENE_SCALE — both the position and the radius live in that same scaled
// space, so a fixed separation here (independent of any layout rescale)
// reliably keeps rendered spheres from touching, with room to spare.
const MIN_NODE_SEPARATION = 0.7;

export function buildGraph(notes: GraphSourceNote[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const slugSet = new Set(notes.map((n) => n.slug));
  const notesBySlug = new Map(notes.map((n) => [n.slug, n]));

  const edgeByKey = new Map<
    string,
    { source: string; target: string; strength: number; relationshipLabels: Set<string>; domains: Set<Domain> }
  >();

  function addEdge(a: string, b: string, relationshipLabel: string, domain?: Domain) {
    if (a === b) return;
    const key = [a, b].sort().join("::");
    let entry = edgeByKey.get(key);
    if (!entry) {
      entry = { source: a, target: b, strength: 0, relationshipLabels: new Set(), domains: new Set() };
      edgeByKey.set(key, entry);
    }
    entry.strength += 1;
    entry.relationshipLabels.add(relationshipLabel);
    if (domain) entry.domains.add(domain);
  }

  for (const note of notes) {
    for (const target of note.linkedSlugs) {
      if (target === note.slug || !slugSet.has(target)) continue;
      addEdge(note.slug, target, "linked");
    }
  }

  // Notes that share ANY domain tag are connected too (not just each note's
  // primary domain) — the graph is meant to read as a map of domain
  // clusters, not just editorial cross-references, and most notes carry
  // more than one domain (e.g. a project tagged both Cloud and Data
  // Analytics should connect into both of those clusters).
  const byDomain = new Map<Domain, string[]>();
  for (const note of notes) {
    for (const domain of note.domains) {
      const group = byDomain.get(domain) ?? [];
      group.push(note.slug);
      byDomain.set(domain, group);
    }
  }
  for (const [domain, slugs] of byDomain.entries()) {
    for (let i = 0; i < slugs.length; i += 1) {
      for (let j = i + 1; j < slugs.length; j += 1) {
        addEdge(slugs[i], slugs[j], "same-domain", domain);
      }
    }
  }

  const edges: GraphEdge[] = [...edgeByKey.values()].map((e) => ({
    source: e.source,
    target: e.target,
    strength: e.strength,
    relationshipLabel: [...e.relationshipLabels].join("+"),
    domains: [...e.domains],
  }));

  const degree = new Map<string, number>();
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const positions = computeLayout(notes.map((n) => n.slug), edges);

  const nodes: GraphNode[] = notes.map((note) => {
    const position = positions.get(note.slug) ?? { x: 0, y: 0 };
    return {
      id: note.slug,
      label: note.title,
      type: note.type,
      category: note.domains[0],
      strength: degree.get(note.slug) ?? 0,
      position: { x: position.x, y: position.y, z: 0 },
      relatedProjectIds: [
        ...(note.type === "project" ? [note.slug] : []),
        ...note.linkedSlugs.filter((slug) => notesBySlug.get(slug)?.type === "project"),
      ],
      keywords: [...note.domains, ...note.tags].map((k) => k.toLowerCase()),
    };
  });

  return { nodes, edges };
}

/** Deterministic static 2D force-directed layout, computed once at build time (not client-side). */
function computeLayout(
  slugs: string[],
  edges: GraphEdge[],
): Map<string, { x: number; y: number }> {
  type SimNode = { id: string; x?: number; y?: number };
  const simNodes: SimNode[] = slugs.map((id) => ({ id }));
  const simLinks = edges.map((e) => ({ source: e.source, target: e.target }));

  const simulation = forceSimulation(simNodes)
    .force(
      "link",
      forceLink(simLinks)
        .id((d) => (d as SimNode).id)
        .distance(1.1)
        .strength(0.5),
    )
    .force("charge", forceManyBody().strength(-40))
    .force("center", forceCenter(0, 0))
    .force("collide", forceCollide(1.0))
    .stop();

  for (let i = 0; i < LAYOUT_ITERATIONS; i += 1) {
    simulation.tick();
  }

  const maxAbs = simNodes.reduce(
    (max, n) => Math.max(max, Math.abs(n.x ?? 0), Math.abs(n.y ?? 0)),
    1e-6,
  );
  const scale = LAYOUT_EXTENT / maxAbs;

  const positions = new Map(
    simNodes.map((n) => [n.id, { x: (n.x ?? 0) * scale, y: (n.y ?? 0) * scale }]),
  );

  // d3-force's collision radius resists overlap during the simulation, but
  // the `maxAbs`-based rescale above is a uniform shrink driven by whichever
  // node ends up furthest out — a stronger collision force pushes every node
  // further apart (including that outlier), so `scale` shrinks by roughly
  // the same factor and the benefit cancels out. The 3D node meshes render
  // at a fixed radius that isn't part of this rescale at all, so tightly
  // linked pairs (e.g. same-domain nodes) can still end up rendered as
  // visibly overlapping spheres. Enforce a real minimum separation directly
  // on the final positions instead of trying to fight that cancellation
  // through the simulation's forces.
  resolveOverlaps(positions, MIN_NODE_SEPARATION);

  return positions;
}

/**
 * Pushes any pair of positions closer than `minSeparation` apart along their
 * connecting line, in a few relaxation passes. Small, fixed node count (a
 * handful of portfolio notes) makes an O(n^2) pass per iteration cheap.
 */
function resolveOverlaps(
  positions: Map<string, { x: number; y: number }>,
  minSeparation: number,
  iterations = 50,
): void {
  const ids = [...positions.keys()];
  for (let iter = 0; iter < iterations; iter += 1) {
    let moved = false;
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const a = positions.get(ids[i])!;
        const b = positions.get(ids[j])!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1e-4;
        if (dist < minSeparation) {
          const push = (minSeparation - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          a.x -= ux * push;
          a.y -= uy * push;
          b.x += ux * push;
          b.y += uy * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}
