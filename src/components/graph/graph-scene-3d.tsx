"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { graphEdges, graphNodes, graphNodesById } from "@/data/graph";
import { GraphDragPlane } from "@/components/graph/graph-drag-plane";
import { GraphEdgeLine } from "@/components/graph/graph-edge-line";
import { GraphNodeMesh } from "@/components/graph/graph-node-mesh";
import { getDomainStyle } from "@/lib/domain-colors";
import { getEdgeOpacity, SCENE_SCALE, type NodeVisualState } from "@/lib/graph-visual";
import { canvasColors } from "@/lib/theme/tokens";
import { useTheme } from "@/hooks/use-theme";
import { useGraphSimulation } from "@/lib/use-graph-simulation";
import type { DomainCategory, GraphNode } from "@/types/portfolio";

export type GraphScene3DProps = {
  resolveState: (node: GraphNode) => NodeVisualState;
  degreeById: Map<string, number>;
  maxDegree: number;
  filterDomains: Set<DomainCategory>;
  hoveredNodeId: string | null;
  onHoverNode: (nodeId: string | null) => void;
  onNodeSelect: (nodeId: string) => void;
  /** Touch screens: vertical swipes scroll the page, horizontal drags rotate; no pinch-zoom. */
  coarsePointer?: boolean;
};

export function GraphScene3D({
  resolveState,
  degreeById,
  maxDegree,
  filterDomains,
  hoveredNodeId,
  onHoverNode,
  onNodeSelect,
  coarsePointer = false,
}: GraphScene3DProps) {
  const { simulation, nodesById, tick } = useGraphSimulation(graphNodes, graphEdges);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const draggingNodeIdRef = useRef<string | null>(null);
  const { theme } = useTheme();
  const colors = canvasColors[theme];

  function endDrag() {
    const draggingId = draggingNodeIdRef.current;
    if (!draggingId) return;
    const simNode = nodesById.get(draggingId);
    if (simNode) {
      simNode.fx = null;
      simNode.fy = null;
    }
    draggingNodeIdRef.current = null;
    simulation.alphaTarget(0);
    if (controlsRef.current) controlsRef.current.enabled = true;
  }

  useEffect(() => {
    window.addEventListener("pointerup", endDrag);
    return () => window.removeEventListener("pointerup", endDrag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startDrag(nodeId: string) {
    const simNode = nodesById.get(nodeId);
    if (!simNode) return;
    draggingNodeIdRef.current = nodeId;
    simNode.fx = simNode.x;
    simNode.fy = simNode.y;
    simulation.alphaTarget(0.3).restart();
    if (controlsRef.current) controlsRef.current.enabled = false;
    onHoverNode(nodeId);
  }

  function handleDragMove(worldX: number, worldY: number) {
    const draggingId = draggingNodeIdRef.current;
    if (!draggingId) return;
    const simNode = nodesById.get(draggingId);
    if (!simNode) return;
    simNode.fx = worldX / SCENE_SCALE;
    simNode.fy = worldY / SCENE_SCALE;
  }

  // OrbitControls pins `touch-action: none` inline on its element when it
  // connects, which would trap page scrolling on a full-width phone canvas.
  useEffect(() => {
    const element = controlsRef.current?.domElement;
    if (element) element.style.touchAction = coarsePointer ? "pan-y" : "none";
  }, [coarsePointer]);

  useFrame(() => {
    tick();
  });

  return (
    <>
      <color key={`bg-${theme}`} attach="background" args={[colors.surfaceInset]} />
      <fog key={`fog-${theme}`} attach="fog" args={[colors.background, 6, 22]} />
      {/* Brighter fill on the light theme so resting nodes read mid-grey, not black. */}
      <ambientLight intensity={theme === "light" ? 1.3 : 0.4} />
      <pointLight position={[2, 2, 3]} intensity={0.65} color="#c8e8f0" />
      <pointLight position={[-2, -1, 2]} intensity={0.45} color="#cbb8f0" />
      <pointLight position={[0, 2.5, -2]} intensity={0.3} color="#f5f5f5" />

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={!coarsePointer}
        minDistance={5.5}
        maxDistance={13}
        rotateSpeed={0.35}
        zoomSpeed={0.5}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.25}
      />

      <group scale={SCENE_SCALE}>
        <GraphDragPlane active={draggingNodeIdRef.current !== null} onDragMove={handleDragMove} />

        {graphEdges.map((edge) => {
          const source = nodesById.get(edge.source);
          const target = nodesById.get(edge.target);
          const sourceGraphNode = graphNodesById[edge.source];
          const targetGraphNode = graphNodesById[edge.target];
          if (!source || !target || !sourceGraphNode || !targetGraphNode) return null;
          const sourceActive = resolveState(sourceGraphNode) !== "dim";
          const targetActive = resolveState(targetGraphNode) !== "dim";
          const hovered =
            hoveredNodeId === edge.source || hoveredNodeId === edge.target;
          const edgeDomain = edge.domains[0];
          const color = edgeDomain
            ? getDomainStyle(edgeDomain).hex
            : colors.muted;
          return (
            <GraphEdgeLine
              key={`${edge.source}-${edge.target}`}
              sourceNode={source}
              targetNode={target}
              color={color}
              opacity={getEdgeOpacity(sourceActive, targetActive, hovered)}
              highlight={sourceActive && targetActive}
            />
          );
        })}

        {graphNodes.map((node, index) => {
          const simNode = nodesById.get(node.id);
          if (!simNode) return null;
          return (
            <GraphNodeMesh
              key={node.id}
              node={node}
              simNode={simNode}
              degree={degreeById.get(node.id) ?? 0}
              maxDegree={maxDegree}
              state={resolveState(node)}
              domainHighlighted={filterDomains.size > 0 && filterDomains.has(node.category)}
              floatPhase={index * 0.7}
              onHover={onHoverNode}
              onSelect={onNodeSelect}
              onDragStart={startDrag}
            />
          );
        })}
      </group>
    </>
  );
}
