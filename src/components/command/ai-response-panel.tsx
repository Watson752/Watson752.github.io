"use client";

import { Panel } from "@/components/terminal/panel";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";
import type { PortfolioSelectionSource, QueryMatch } from "@/types/portfolio";

export type AIResponsePanelProps = {
  match: QueryMatch | null;
  displayQuery: string;
  hasSelection: boolean;
  responseKey: string;
  className?: string;
  isThinking?: boolean;
  selectionSource?: PortfolioSelectionSource;
};

const confidenceLabels: Record<QueryMatch["confidence"], string> = {
  preset: "match: preset",
  keyword: "match: keyword",
  default: "match: fallback",
};

export function AIResponsePanel({
  match,
  displayQuery,
  hasSelection,
  responseKey,
  className,
  isThinking,
  selectionSource,
}: AIResponsePanelProps) {
  return (
    <Panel
      variant="inset"
      padding="none"
      className={cn(
        "min-w-0 overflow-hidden",
        hasSelection && "glow-accent-cyan",
        className,
      )}
      aria-live="polite"
      aria-busy={isThinking}
    >
      <div className="titlebar-chrome flex items-center justify-between px-3.5 py-2 sm:px-4">
        <span className="font-terminal text-[10px] text-titlebar-foreground">
          stdout / <span className="text-foreground/75">assistant</span>
        </span>
        <TerminalBadge variant="accent" className="normal-case tracking-normal">
          local
        </TerminalBadge>
      </div>

      <div className="space-y-3 px-3.5 py-3.5 sm:px-4 sm:py-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {hasSelection && match && (
            <TerminalBadge variant="muted">
              {confidenceLabels[match.confidence]}
            </TerminalBadge>
          )}
          {selectionSource === "graph" && (
            <TerminalBadge variant="violet">source: graph</TerminalBadge>
          )}
          {hasSelection && match && match.matchedDomains.length > 0 && (
            <TerminalBadge
              variant="violet"
              className="max-w-full sm:max-w-none"
            >
              <span className="truncate">
                {match.matchedDomains.join(" · ")}
              </span>
            </TerminalBadge>
          )}
          {hasSelection && match && match.matchedProjectIds.length > 0 && (
            <TerminalBadge variant="accent">
              {match.matchedProjectIds.length} projects
            </TerminalBadge>
          )}
        </div>

        {isThinking ? (
          <p className="font-terminal text-sm text-muted-foreground">
            <span className="text-accent-cyan terminal-cursor-blink">▍</span>{" "}
            synthesizing response…
          </p>
        ) : !hasSelection ? (
          <div className="state-empty">
            <p className="font-terminal mb-1.5 text-[10px] text-accent-cyan/80">
              awaiting command
            </p>
            <p>
              Run a query or tap a suggestion. Graph node clicks update this
              panel and project evidence below.
            </p>
          </div>
        ) : (
          <div
            key={responseKey}
            className="portfolio-response-enter min-w-0 space-y-2.5"
          >
            {displayQuery && (
              <p className="font-terminal break-anywhere rounded border border-border-subtle/60 bg-surface/40 px-2 py-1.5 text-[11px] text-muted-foreground">
                <span className="text-accent-cyan">&gt;</span> {displayQuery}
              </p>
            )}
            <p className="break-anywhere text-prose-strong">
              {match?.response}
            </p>
          </div>
        )}
      </div>
    </Panel>
  );
}
