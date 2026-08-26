import { ALL_DOMAINS, getDomainStyle } from "@/lib/domain-colors";
import type { DomainCategory } from "@/types/portfolio";
import { cn } from "@/lib/utils";

export type GraphLegendProps = {
  nodeCount: number;
  edgeCount: number;
  activeDomains: Set<DomainCategory>;
  onToggleDomain: (domain: DomainCategory) => void;
  className?: string;
};

export function GraphLegend({
  nodeCount,
  edgeCount,
  activeDomains,
  onToggleDomain,
  className,
}: GraphLegendProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="font-terminal text-[10px] text-muted-foreground">
        {nodeCount} node{nodeCount === 1 ? "" : "s"} · {edgeCount} edge
        {edgeCount === 1 ? "" : "s"}
      </span>
      <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
        {ALL_DOMAINS.map((domain) => {
          const style = getDomainStyle(domain);
          const isActive = activeDomains.size === 0 || activeDomains.has(domain);
          return (
            <button
              key={domain}
              type="button"
              onClick={() => onToggleDomain(domain)}
              className={cn(
                "font-terminal inline-flex items-center gap-1.5 rounded border border-border-subtle px-1.5 py-0.5 text-[10px] leading-none transition-opacity",
                isActive ? "opacity-100" : "opacity-40",
              )}
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />
              <span className="text-muted-foreground">{domain}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
