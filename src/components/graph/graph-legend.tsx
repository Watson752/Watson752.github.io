import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";

const legendItems = [
  { type: "domain", label: "domain", variant: "accent" as const },
  { type: "skill", label: "skill", variant: "accent" as const },
  { type: "project", label: "project", variant: "violet" as const },
  { type: "tool", label: "tool", variant: "violet" as const },
  { type: "idea", label: "idea", variant: "default" as const },
];

export type GraphLegendProps = {
  activeCount?: number;
  className?: string;
};

export function GraphLegend({ activeCount = 0, className }: GraphLegendProps) {
  return (
    <div
      className={cn(
        "pointer-events-none flex flex-wrap items-center gap-2",
        className,
      )}
    >
      {legendItems.map((item) => (
        <TerminalBadge key={item.type} variant={item.variant}>
          {item.label}
        </TerminalBadge>
      ))}
      {activeCount > 0 && (
        <span className="font-terminal text-[10px] text-accent-cyan/80">
          {activeCount} active
        </span>
      )}
    </div>
  );
}
