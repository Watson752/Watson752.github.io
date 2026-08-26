"use client";

import type { ThreeEvent } from "@react-three/fiber";

export type GraphDragPlaneProps = {
  active: boolean;
  onDragMove: (x: number, y: number) => void;
};

/**
 * A large, fully transparent plane used only to raycast the drag pointer's
 * world position onto the graph's z=0 plane. Must stay `visible` (not
 * `visible={false}`) since three.js skips raycasting on invisible objects —
 * `opacity={0}` is what actually hides it.
 */
export function GraphDragPlane({ active, onDragMove }: GraphDragPlaneProps) {
  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (!active) return;
    onDragMove(event.point.x, event.point.y);
  }

  return (
    <mesh position={[0, 0, 0]} onPointerMove={handlePointerMove}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
