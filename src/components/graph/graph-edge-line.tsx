"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { SimNode } from "@/lib/use-graph-simulation";

export type GraphEdgeLineProps = {
  sourceNode: SimNode;
  targetNode: SimNode;
  /** Color representing the domain this edge connects nodes through. */
  color: string;
  opacity: number;
  highlight: boolean;
};

/**
 * Points are only used for the initial geometry — position updates happen
 * imperatively via the ref each frame (`geometry.setPositions`), bypassing
 * drei's `points`-prop reactivity so a moving/dragged graph doesn't rebuild
 * a new LineGeometry every frame for every edge.
 */
export function GraphEdgeLine({ sourceNode, targetNode, color, opacity, highlight }: GraphEdgeLineProps) {
  const lineRef = useRef<React.ComponentRef<typeof Line>>(null);

  useFrame(() => {
    const line = lineRef.current;
    if (!line) return;
    line.geometry.setPositions([
      sourceNode.x ?? 0,
      sourceNode.y ?? 0,
      0,
      targetNode.x ?? 0,
      targetNode.y ?? 0,
      0,
    ]);
  });

  return (
    <Line
      ref={lineRef}
      points={[
        [sourceNode.x ?? 0, sourceNode.y ?? 0, 0],
        [targetNode.x ?? 0, targetNode.y ?? 0, 0],
      ]}
      color={color}
      lineWidth={highlight ? 1.4 : 0.8}
      transparent
      opacity={opacity}
    />
  );
}
