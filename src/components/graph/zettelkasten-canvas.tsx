"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { GraphLegend } from "@/components/graph/graph-legend";
import { GraphOverlay } from "@/components/graph/graph-overlay";
import { ZettelkastenScene } from "@/components/graph/zettelkasten-scene";
import { terminalTheme } from "@/lib/theme/tokens";

export type ZettelkastenCanvasProps = {
  activeNodeIds: string[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  className?: string;
  onFallbackRequest?: () => void;
};

function CanvasLoader() {
  return (
    <div className="flex size-full items-center justify-center">
      <p className="font-terminal text-[11px] text-muted-foreground">
        <span className="text-accent-cyan terminal-cursor-blink">▍</span>{" "}
        initializing graph…
      </p>
    </div>
  );
}

export function ZettelkastenCanvas({
  activeNodeIds,
  selectedNodeId,
  onNodeSelect,
  className,
  onFallbackRequest,
}: ZettelkastenCanvasProps) {
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (webglFailed) onFallbackRequest?.();
  }, [webglFailed, onFallbackRequest]);

  if (webglFailed) return null;

  return (
    <GraphOverlay
      className={className}
      subtitle={`${activeNodeIds.length} nodes · drag to orbit`}
      legend={<GraphLegend activeCount={activeNodeIds.length} />}
    >
      <Canvas
        className="size-full max-w-full min-h-[200px] touch-none sm:min-h-[240px] lg:min-h-[320px]"
        camera={{ position: [0, 0.2, 5.2], fov: 42, near: 0.1, far: 30 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          try {
            gl.setClearColor(terminalTheme.colors.surfaceInset);
          } catch {
            setWebglFailed(true);
          }
        }}
        onError={() => setWebglFailed(true)}
      >
        <Suspense fallback={null}>
          <ZettelkastenScene
            activeNodeIds={activeNodeIds}
            selectedNodeId={selectedNodeId}
            onNodeSelect={onNodeSelect}
          />
        </Suspense>
      </Canvas>
    </GraphOverlay>
  );
}

export { CanvasLoader };
