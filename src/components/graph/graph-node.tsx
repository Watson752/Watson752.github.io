"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { GraphNode as GraphNodeData } from "@/types/portfolio";
import {
  getNodeColors,
  getNodeRadius,
  nodeToPosition,
  type NodeVisualState,
} from "@/lib/graph-visual";

export type GraphNodeMeshProps = {
  node: GraphNodeData;
  state: NodeVisualState;
  floatPhase: number;
  onHover: (nodeId: string | null) => void;
  onSelect: (nodeId: string) => void;
};

export function GraphNodeMesh({
  node,
  state,
  floatPhase,
  onHover,
  onSelect,
}: GraphNodeMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const base = nodeToPosition(node);
  const { color, emissive, emissiveIntensity, opacity } = getNodeColors(
    node.type,
    state,
  );
  const radius = getNodeRadius(node.type, state);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = base[1] + Math.sin(t * 0.55 + floatPhase) * 0.03;
  });

  return (
    <mesh
      ref={meshRef}
      position={base}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(node.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      <sphereGeometry args={[radius, 20, 20]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={opacity}
        roughness={0.45}
        metalness={0.15}
      />
    </mesh>
  );
}
