"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { GraphFallback } from "@/components/graph/graph-fallback";
import { useGraphViewport } from "@/components/graph/use-graph-viewport";
import { cn } from "@/lib/utils";

const ZettelkastenCanvas = dynamic(
  () =>
    import("@/components/graph/zettelkasten-canvas").then(
      (mod) => mod.ZettelkastenCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <GraphFallback loading activeNodeIds={[]} />
    ),
  },
);

export type ZettelkastenGraphProps = {
  activeNodeIds?: string[];
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
};

export function ZettelkastenGraph({
  activeNodeIds = [],
  selectedNodeId = null,
  onNodeSelect,
  className,
}: ZettelkastenGraphProps) {
  const { mode } = useGraphViewport();
  const [forceFallback, setForceFallback] = useState(false);

  const handleFallbackRequest = useCallback(() => {
    setForceFallback(true);
  }, []);

  if (mode === "fallback" || forceFallback) {
    return (
      <GraphFallback
        activeNodeIds={activeNodeIds}
        className={className}
      />
    );
  }

  return (
    <div className={cn("h-full min-w-0 w-full max-w-full", className)}>
      <ZettelkastenCanvas
        activeNodeIds={activeNodeIds}
        selectedNodeId={selectedNodeId}
        onNodeSelect={onNodeSelect ?? (() => {})}
        className={className}
        onFallbackRequest={handleFallbackRequest}
      />
    </div>
  );
}
