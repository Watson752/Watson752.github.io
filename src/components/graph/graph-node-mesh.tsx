"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";
import type { GraphNode as GraphNodeData } from "@/types/portfolio";
import { getDomainStyle } from "@/lib/domain-colors";
import { getNode3DVisuals, type NodeVisualState } from "@/lib/graph-visual";
import { canvasColors } from "@/lib/theme/tokens";
import { useTheme } from "@/hooks/use-theme";
import type { SimNode } from "@/lib/use-graph-simulation";

export type GraphNodeMeshProps = {
  node: GraphNodeData;
  simNode: SimNode;
  degree: number;
  maxDegree: number;
  state: NodeVisualState;
  domainHighlighted: boolean;
  floatPhase: number;
  onHover: (nodeId: string | null) => void;
  onSelect: (nodeId: string) => void;
  onDragStart: (nodeId: string) => void;
};

export function GraphNodeMesh({
  node,
  simNode,
  degree,
  maxDegree,
  state,
  domainHighlighted,
  floatPhase,
  onHover,
  onSelect,
  onDragStart,
}: GraphNodeMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const { theme } = useTheme();
  const domainHex = getDomainStyle(node.category).hex;
  const { color, emissive, emissiveIntensity, opacity, radius } = getNode3DVisuals(
    domainHex,
    degree,
    maxDegree,
    state,
    domainHighlighted,
    canvasColors[theme].node,
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.x = simNode.x ?? 0;
    meshRef.current.position.y = simNode.y ?? 0;
    // Idle bob lives on z (always 0 in the live layout) so it never fights
    // with the simulation's own x/y motion.
    meshRef.current.position.z = Math.sin(t * 0.55 + floatPhase) * 0.05;
  });

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    onDragStart(node.id);
  }

  return (
    <mesh
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(node.id);
        document.body.style.cursor = "grab";
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
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={opacity}
        roughness={0.4}
        metalness={0.1}
      />
      {state === "hovered" && (
        <Html
          position={[0, radius + 0.18, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: "none" }}
        >
          <div className="font-terminal whitespace-nowrap rounded border border-border-subtle bg-surface-elevated/95 px-2 py-1 text-[10px] text-foreground shadow-panel backdrop-blur-sm">
            <span style={{ color: domainHex }}>{node.category}</span>
            <span className="text-muted-foreground"> · </span>
            {node.label}
          </div>
        </Html>
      )}
    </mesh>
  );
}
