"use client";

import { Html } from "@react-three/drei";
import { graphNodesById } from "@/data/graph";
import { nodeToPosition } from "@/lib/graph-visual";

export type GraphLabelProps = {
  nodeId: string | null;
};

export function GraphLabel({ nodeId }: GraphLabelProps) {
  if (!nodeId) return null;
  const node = graphNodesById[nodeId];
  if (!node) return null;

  const [x, y, z] = nodeToPosition(node);

  return (
    <Html
      position={[x, y + 0.22, z]}
      center
      distanceFactor={6}
      style={{ pointerEvents: "none" }}
    >
      <div className="font-terminal whitespace-nowrap rounded border border-border-subtle bg-surface-elevated/95 px-2 py-1 text-[10px] text-foreground shadow-panel backdrop-blur-sm">
        <span className="text-accent-cyan">{node.type}</span>
        <span className="text-muted-foreground"> · </span>
        {node.label}
      </div>
    </Html>
  );
}
