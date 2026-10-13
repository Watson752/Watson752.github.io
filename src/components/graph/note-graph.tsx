"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List, Share2 } from "lucide-react";
import { graphEdges, graphNodes } from "@/data/graph";
import { GraphOverlay } from "@/components/graph/graph-overlay";
import { GraphLegend } from "@/components/graph/graph-legend";
import { useGraphViewport } from "@/components/graph/use-graph-viewport";
import { getDomainStyle } from "@/lib/domain-colors";
import type { NodeVisualState } from "@/lib/graph-visual";
import { cn } from "@/lib/utils";
import type { DomainCategory, GraphNode } from "@/types/portfolio";

const GraphCanvas3D = dynamic(
  () =>
    import("@/components/graph/graph-canvas-3d").then((mod) => mod.GraphCanvas3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center">
        <p className="font-terminal text-[11px] text-muted-foreground">
          <span className="terminal-cursor-blink">▍</span> initializing graph…
        </p>
      </div>
    ),
  },
);

export type NoteGraphProps = {
  activeNodeIds?: string[];
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
};

export function NoteGraph({
  activeNodeIds = [],
  selectedNodeId = null,
  onNodeSelect,
  className,
}: NoteGraphProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterDomains, setFilterDomains] = useState<Set<DomainCategory>>(
    () => new Set(),
  );
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const { mode: viewportMode, coarsePointer } = useGraphViewport();
  const effectiveViewMode = viewportMode === "fallback" ? "list" : viewMode;

  const activeSet = useMemo(() => new Set(activeNodeIds), [activeNodeIds]);

  const degreeById = useMemo(() => {
    const map = new Map<string, number>();
    for (const edge of graphEdges) {
      map.set(edge.source, (map.get(edge.source) ?? 0) + 1);
      map.set(edge.target, (map.get(edge.target) ?? 0) + 1);
    }
    return map;
  }, []);

  const maxDegree = useMemo(
    () => graphNodes.reduce((max, n) => Math.max(max, degreeById.get(n.id) ?? 0), 1),
    [degreeById],
  );

  function resolveState(node: GraphNode): NodeVisualState {
    if (selectedNodeId === node.id) return "selected";
    if (hoveredNodeId === node.id) return "hovered";
    if (filterDomains.size > 0 && !filterDomains.has(node.category)) return "dim";
    if (activeSet.size > 0 && !activeSet.has(node.id)) return "dim";
    return "active";
  }

  function toggleDomain(domain: DomainCategory) {
    setFilterDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  const select = (nodeId: string) => onNodeSelect?.(nodeId);

  const sortedByDegree = useMemo(
    () =>
      [...graphNodes].sort(
        (a, b) => (degreeById.get(b.id) ?? 0) - (degreeById.get(a.id) ?? 0),
      ),
    [degreeById],
  );

  return (
    <GraphOverlay
      className={className}
      subtitle={effectiveViewMode === "graph" ? "3d map" : "list view"}
      legend={
        <div className="flex items-start justify-between gap-2">
          <GraphLegend
            nodeCount={graphNodes.length}
            edgeCount={graphEdges.length}
            activeDomains={filterDomains}
            onToggleDomain={toggleDomain}
          />
          {viewportMode === "3d" && (
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === "graph" ? "list" : "graph"))}
              className="pointer-events-auto shrink-0 rounded border border-border-subtle p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                viewMode === "graph" ? "Switch to list view" : "Switch to graph view"
              }
            >
              {viewMode === "graph" ? (
                <List className="size-3.5" />
              ) : (
                <Share2 className="size-3.5" />
              )}
            </button>
          )}
        </div>
      }
    >
      {effectiveViewMode === "list" ? (
        <ul className="scrollbar-terminal h-full min-h-[200px] overflow-y-auto p-2 lg:min-h-[300px]">
          {sortedByDegree.map((node) => {
            const style = getDomainStyle(node.category);
            const state = resolveState(node);
            return (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => select(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left font-terminal text-[11px] transition-colors hover:bg-surface",
                    state === "dim" ? "opacity-40" : "opacity-100",
                    state === "selected" && "bg-surface-elevated",
                  )}
                >
                  <span className={cn("size-2 shrink-0 rounded-full", style.dot)} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-foreground">{node.label}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {degreeById.get(node.id) ?? 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="relative h-full min-h-[200px] lg:min-h-[300px]">
          <GraphCanvas3D
            className="absolute inset-0 size-full min-h-[200px] lg:min-h-[300px]"
            resolveState={resolveState}
            degreeById={degreeById}
            maxDegree={maxDegree}
            filterDomains={filterDomains}
            hoveredNodeId={hoveredNodeId}
            onHoverNode={setHoveredNodeId}
            onNodeSelect={select}
            coarsePointer={coarsePointer}
          />
        </div>
      )}
    </GraphOverlay>
  );
}
