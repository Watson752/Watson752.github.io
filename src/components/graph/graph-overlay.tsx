import { Panel } from "@/components/terminal/panel";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";

export type GraphOverlayProps = {
  children: React.ReactNode;
  legend?: React.ReactNode;
  className?: string;
  subtitle?: string;
};

export function GraphOverlay({
  children,
  legend,
  className,
  subtitle,
}: GraphOverlayProps) {
  return (
    <Panel
      id="graph"
      variant="elevated"
      padding="none"
      className={cn(
        "interactive-panel flex h-full min-h-[200px] w-full max-w-full flex-col overflow-hidden sm:min-h-[260px] md:min-h-[300px] lg:min-h-[360px]",
        className,
      )}
    >
      <div className="titlebar-chrome flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5">
        <TerminalBadge variant="accent">zettelkasten.graph</TerminalBadge>
        <span className="font-terminal max-w-[55%] truncate text-right text-[10px] text-muted-foreground">
          {subtitle ?? "knowledge map"}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 bg-surface-inset">
        {children}
        {legend && (
          <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 rounded-md border border-border-subtle/50 bg-surface/80 px-2 py-1.5 backdrop-blur-[2px]">
            {legend}
          </div>
        )}
      </div>
    </Panel>
  );
}
