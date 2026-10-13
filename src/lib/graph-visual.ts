import type { GraphNode } from "@/types/portfolio";

export type NodeVisualState = "active" | "dim" | "hovered" | "selected";

const MIN_RADIUS = 5;
const MAX_RADIUS = 15;

/** Node radius scales with its connection count (degree), not its type. */
export function getNodeRadius(
  degree: number,
  maxDegree: number,
  state: NodeVisualState,
): number {
  const t = maxDegree > 0 ? degree / maxDegree : 0;
  const base = MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS);
  return state === "hovered" || state === "selected" ? base * 1.2 : base;
}

export function getNodeOpacity(state: NodeVisualState): number {
  return state === "dim" ? 0.35 : 1;
}

export function getEdgeOpacity(
  sourceActive: boolean,
  targetActive: boolean,
  hovered: boolean,
): number {
  if (hovered) return 0.7;
  if (sourceActive && targetActive) return 0.5;
  if (sourceActive || targetActive) return 0.28;
  return 0.12;
}

/** 3D scene scale applied to the whole node/edge group in graph-scene-3d.tsx. */
export const SCENE_SCALE = 1.15;

export function nodeToPosition(node: GraphNode): [number, number, number] {
  return [node.position.x, node.position.y, node.position.z];
}

const MIN_RADIUS_3D = 0.09;
const MAX_RADIUS_3D = 0.22;

export type Node3DVisuals = {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  opacity: number;
  radius: number;
};

/** Neutral node color — nodes read as white by default; domain color is reserved
 *  for when a node is actually being highlighted (its domain is filtered in,
 *  or it's hovered/selected). */

/**
 * Sphere size/lighting for a graph node. Nodes are white at rest; they only
 * take on their domain's color when `domainHighlighted` is true (the
 * legend's domain filter matches this node) or the node is hovered/selected.
 * Edges carry the domain coloring unconditionally — see GraphEdgeLine.
 */
export function getNode3DVisuals(
  domainHex: string,
  degree: number,
  maxDegree: number,
  state: NodeVisualState,
  domainHighlighted: boolean,
  /** Resting (non-domain) node color — light on the dark theme, dark on light. */
  neutralHex: string,
): Node3DVisuals {
  const t = maxDegree > 0 ? degree / maxDegree : 0;
  const base = MIN_RADIUS_3D + t * (MAX_RADIUS_3D - MIN_RADIUS_3D);
  const radius = state === "hovered" || state === "selected" ? base * 1.2 : base;
  const emissiveIntensity =
    state === "selected" ? 0.85 : state === "hovered" ? 0.65 : state === "active" ? 0.4 : 0;

  const showDomainColor = domainHighlighted || state === "hovered" || state === "selected";
  const color = showDomainColor ? domainHex : neutralHex;

  return {
    color,
    emissive: showDomainColor ? domainHex : "#000000",
    emissiveIntensity: showDomainColor ? emissiveIntensity : 0,
    opacity: state === "dim" ? 0.35 : 1,
    radius,
  };
}
