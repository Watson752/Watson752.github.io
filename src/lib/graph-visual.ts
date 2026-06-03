import type { GraphNode, GraphNodeType } from "@/types/portfolio";
import { terminalTheme } from "@/lib/theme/tokens";

export type NodeVisualState = "active" | "dim" | "hovered" | "selected";

const typeRadius: Record<GraphNodeType, number> = {
  domain: 0.13,
  skill: 0.095,
  project: 0.105,
  tool: 0.08,
  idea: 0.088,
};

export function getNodeRadius(type: GraphNodeType, state: NodeVisualState): number {
  const base = typeRadius[type];
  if (state === "hovered" || state === "selected") return base * 1.18;
  return base;
}

export function getNodeColors(
  type: GraphNodeType,
  state: NodeVisualState,
): { color: string; emissive: string; emissiveIntensity: number; opacity: number } {
  const palette = {
    domain: { base: "#5a6a7d", active: terminalTheme.colors.accent, emissive: "#1a7a8f" },
    skill: { base: "#4d5a6a", active: terminalTheme.colors.accent, emissive: "#1a7a8f" },
    project: { base: "#566078", active: "#9bb4d4", emissive: terminalTheme.colors.accentVioletMuted },
    tool: { base: "#454f5c", active: terminalTheme.colors.accentViolet, emissive: "#4a3f8f" },
    idea: { base: "#4a5360", active: terminalTheme.colors.accentViolet, emissive: "#5a4fb8" },
  }[type];

  const isLit = state === "active" || state === "hovered" || state === "selected";

  return {
    color: isLit ? palette.active : palette.base,
    emissive: isLit ? palette.emissive : "#000000",
    emissiveIntensity: isLit ? (state === "selected" ? 0.85 : 0.55) : 0,
    opacity: isLit ? 1 : 0.38,
  };
}

export function getEdgeOpacity(
  sourceActive: boolean,
  targetActive: boolean,
  hovered: boolean,
): number {
  if (hovered) return 0.7;
  if (sourceActive && targetActive) return 0.55;
  if (sourceActive || targetActive) return 0.32;
  return 0.12;
}

export function nodeToPosition(node: GraphNode): [number, number, number] {
  return [node.position.x, node.position.y, node.position.z];
}

export const SCENE_SCALE = 1.15;
