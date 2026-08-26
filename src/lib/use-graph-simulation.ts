"use client";

import { useRef } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import type { GraphEdge, GraphNode } from "@/types/portfolio";

export type SimNode = SimulationNodeDatum & { id: string };

export type GraphSimulation = {
  simulation: Simulation<SimNode, undefined>;
  nodesById: Map<string, SimNode>;
  /** Advances the simulation one step and keeps it within MAX_NODE_RADIUS. */
  tick: () => void;
};

// Force-directed layouts have no natural upper bound on how far a
// low-degree node can drift — nothing but a weak centering force resists
// d3-force's charge (repulsion), which has effectively unlimited range. The
// build-time layout sidesteps this by rescaling its result to fit
// LAYOUT_EXTENT after the fact; a live simulation can't do that same
// after-the-fact rescale every frame without every distance (including
// deliberate ones like MIN_NODE_SEPARATION) shifting too. Clamping each
// node's distance from the origin every tick is a simple, always-correct
// safety net regardless of how precisely the forces below are tuned.
const MAX_NODE_RADIUS = 3.2;

/**
 * A live, continuously-ticked force simulation for the 3D graph (Obsidian
 * graph view-style) — seeded from the build-time layout (`node.position`,
 * already domain-clustered and non-overlapping) so the first frame still
 * reads correctly, then left running so nodes settle and can be dragged.
 *
 * Force magnitudes are tuned for this graph's compact coordinate space
 * (nodes spread roughly within +/-2.5 units, per LAYOUT_EXTENT in
 * scripts/vault-export/graph.ts) rather than d3-force's typical much larger
 * defaults — the goal is to stay near where the static layout already put
 * things, not to recompute a wildly different arrangement.
 */
export function useGraphSimulation(nodes: GraphNode[], edges: GraphEdge[]): GraphSimulation {
  const ref = useRef<GraphSimulation | null>(null);

  if (!ref.current) {
    const simNodes: SimNode[] = nodes.map((node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    }));
    const nodesById = new Map(simNodes.map((node) => [node.id, node]));

    const simLinks: SimulationLinkDatum<SimNode>[] = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));

    const simulation = forceSimulation(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimulationLinkDatum<SimNode>>(simLinks)
          .id((node) => node.id)
          .distance(1.0)
          .strength(0.6),
      )
      .force("charge", forceManyBody().strength(-1.2).distanceMax(3))
      .force("collide", forceCollide(0.42))
      .force("center", forceCenter(0, 0))
      // Gentle pull toward the origin for every node, not just linked ones —
      // without this, a low-degree node has nothing but the (much weaker,
      // non-per-node) forceCenter resisting charge's unbounded-range
      // repulsion, and drifts off indefinitely.
      .force("x", forceX(0).strength(0.03))
      .force("y", forceY(0).strength(0.03))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    function tick() {
      simulation.tick();
      for (const node of simNodes) {
        // Don't fight the user — a node being actively dragged (fx/fy set)
        // should go exactly where they put it, even past MAX_NODE_RADIUS.
        if (node.fx != null) continue;
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const r = Math.hypot(x, y);
        if (r > MAX_NODE_RADIUS) {
          const scale = MAX_NODE_RADIUS / r;
          node.x = x * scale;
          node.y = y * scale;
        }
      }
    }

    ref.current = { simulation, nodesById, tick };
  }

  return ref.current;
}
