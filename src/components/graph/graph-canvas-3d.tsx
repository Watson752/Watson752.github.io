"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GraphScene3D, type GraphScene3DProps } from "@/components/graph/graph-scene-3d";
import { cn } from "@/lib/utils";
import { canvasColors } from "@/lib/theme/tokens";
import { readTheme } from "@/lib/theme/theme";

export type GraphCanvas3DProps = GraphScene3DProps & {
  className?: string;
  onFallbackRequest?: () => void;
};

export function GraphCanvas3D({
  className,
  onFallbackRequest,
  ...sceneProps
}: GraphCanvas3DProps) {
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (webglFailed) onFallbackRequest?.();
  }, [webglFailed, onFallbackRequest]);

  if (webglFailed) return null;

  return (
    <Canvas
      className={cn(sceneProps.coarsePointer ? "touch-pan-y" : "touch-none", className)}
      camera={{ position: [0, 0.3, 8.5], fov: 42, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        try {
          gl.setClearColor(canvasColors[readTheme()].surfaceInset);
        } catch {
          setWebglFailed(true);
        }
      }}
      onError={() => setWebglFailed(true)}
    >
      <Suspense fallback={null}>
        <GraphScene3D {...sceneProps} />
      </Suspense>
    </Canvas>
  );
}
