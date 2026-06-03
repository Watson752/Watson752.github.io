"use client";

import { useMemo, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { graphEdges, graphNodes } from "@/data/graph";
import { GraphEdgeLine } from "@/components/graph/graph-edge";
import { GraphLabel } from "@/components/graph/graph-label";
import { GraphNodeMesh } from "@/components/graph/graph-node";
import type { NodeVisualState } from "@/lib/graph-visual";
import { SCENE_SCALE } from "@/lib/graph-visual";
import { terminalTheme } from "@/lib/theme/tokens";

export type ZettelkastenSceneProps = {
  activeNodeIds: string[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  enableRotation?: boolean;
};

export function ZettelkastenScene({
  activeNodeIds,
  selectedNodeId,
  onNodeSelect,
  enableRotation = true,
}: ZettelkastenSceneProps) {
  const groupRef = useRef<Group>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const activeSet = useMemo(() => new Set(activeNodeIds), [activeNodeIds]);

  useFrame((_, delta) => {
    if (!groupRef.current || !enableRotation) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  const resolveState = (nodeId: string): NodeVisualState => {
    if (selectedNodeId === nodeId) return "selected";
    if (hoveredNodeId === nodeId) return "hovered";
    if (activeSet.has(nodeId)) return "active";
    return "dim";
  };

  const labelNodeId = hoveredNodeId ?? selectedNodeId;

  return (
    <>
      <color attach="background" args={[terminalTheme.colors.surfaceInset]} />
      <fog attach="fog" args={[terminalTheme.colors.background, 4, 14]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 2, 3]} intensity={0.55} color="#c8e8f0" />
      <pointLight
        position={[-2, -1, 2]}
        intensity={0.35}
        color={terminalTheme.colors.accentViolet}
      />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.2}
        maxDistance={7.5}
        rotateSpeed={0.35}
        zoomSpeed={0.5}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.25}
      />

      <group ref={groupRef} scale={SCENE_SCALE}>
        {graphEdges.map((edge) => (
          <GraphEdgeLine
            key={`${edge.source}-${edge.target}`}
            edge={edge}
            activeNodeIds={activeSet}
            hoveredNodeId={hoveredNodeId}
          />
        ))}

        {graphNodes.map((node, index) => (
          <GraphNodeMesh
            key={node.id}
            node={node}
            state={resolveState(node.id)}
            floatPhase={index * 0.7}
            onHover={setHoveredNodeId}
            onSelect={onNodeSelect}
          />
        ))}

        <GraphLabel nodeId={labelNodeId} />
      </group>
    </>
  );
}
