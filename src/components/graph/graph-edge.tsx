"use client";

import { Line } from "@react-three/drei";
import { graphNodesById } from "@/data/graph";
import type { GraphEdge as GraphEdgeData } from "@/types/portfolio";
import { getEdgeOpacity, nodeToPosition } from "@/lib/graph-visual";
import { terminalTheme } from "@/lib/theme/tokens";

export type GraphEdgeLineProps = {
  edge: GraphEdgeData;
  activeNodeIds: Set<string>;
  hoveredNodeId: string | null;
};

export function GraphEdgeLine({
  edge,
  activeNodeIds,
  hoveredNodeId,
}: GraphEdgeLineProps) {
  const source = graphNodesById[edge.source];
  const target = graphNodesById[edge.target];
  if (!source || !target) return null;

  const sourceActive = activeNodeIds.has(edge.source);
  const targetActive = activeNodeIds.has(edge.target);
  const hovered =
    hoveredNodeId === edge.source || hoveredNodeId === edge.target;

  const opacity = getEdgeOpacity(sourceActive, targetActive, hovered);
  const highlight = sourceActive && targetActive;

  return (
    <Line
      points={[nodeToPosition(source), nodeToPosition(target)]}
      color={highlight ? terminalTheme.colors.accent : terminalTheme.colors.muted}
      lineWidth={highlight ? 1.2 : 0.6}
      transparent
      opacity={opacity}
    />
  );
}
