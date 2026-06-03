import { graphEdges, graphNodes } from "@/data/graph";
import { GraphOverlay } from "@/components/graph/graph-overlay";
import { GraphLegend } from "@/components/graph/graph-legend";
import { cn } from "@/lib/utils";

function toPercent(value: number, axis: "x" | "y"): string {
  const center = 50;
  const scale = axis === "x" ? 22 : 28;
  return `${center + value * scale}%`;
}

export type GraphFallbackProps = {
  activeNodeIds?: string[];
  className?: string;
  loading?: boolean;
};

/** 2D projection for mobile and reduced-motion */
export function GraphFallback({
  activeNodeIds = [],
  className,
  loading,
}: GraphFallbackProps) {
  const activeSet = new Set(activeNodeIds);
  const nodeById = Object.fromEntries(graphNodes.map((n) => [n.id, n]));

  return (
    <GraphOverlay
      className={className}
      subtitle={loading ? "loading 3d…" : "2d map · compact"}
      legend={
        <GraphLegend activeCount={activeNodeIds.length} />
      }
    >
      <div className="relative h-full min-h-[200px] p-3 lg:min-h-[300px]">
        <svg
          className="absolute inset-0 size-full text-border-subtle"
          aria-hidden
        >
          <defs>
            <pattern
              id="graph-fallback-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.35"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-fallback-grid)" />
          {graphEdges.map((edge) => {
            const source = nodeById[edge.source];
            const target = nodeById[edge.target];
            if (!source || !target) return null;
            const lit =
              activeSet.has(edge.source) && activeSet.has(edge.target);
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={toPercent(source.position.x, "x")}
                y1={toPercent(source.position.y, "y")}
                x2={toPercent(target.position.x, "x")}
                y2={toPercent(target.position.y, "y")}
                stroke="currentColor"
                strokeOpacity={lit ? 0.45 : 0.15}
              />
            );
          })}
        </svg>
        <div className="relative h-full">
          {graphNodes.map((node) => {
            const active = activeSet.has(node.id);
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-1 font-terminal text-[10px]",
                  active
                    ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan glow-accent-cyan"
                    : "border-border-subtle bg-surface/90 text-muted-foreground opacity-65",
                )}
                style={{
                  left: toPercent(node.position.x, "x"),
                  top: toPercent(node.position.y, "y"),
                }}
              >
                {node.label}
              </div>
            );
          })}
        </div>
      </div>
    </GraphOverlay>
  );
}
