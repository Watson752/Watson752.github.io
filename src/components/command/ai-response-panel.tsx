"use client";

import { Panel } from "@/components/terminal/panel";
import { DomainBadge } from "@/components/portfolio/domain-badge";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";
import type { CommandResult, PortfolioSelectionSource, QueryMatch } from "@/types/portfolio";

export type AIResponsePanelProps = {
  match: QueryMatch | null;
  commandResult?: CommandResult | null;
  displayQuery: string;
  hasSelection: boolean;
  responseKey: string;
  className?: string;
  isThinking?: boolean;
  aiError?: string | null;
  selectionSource?: PortfolioSelectionSource;
};

const confidenceLabels: Record<QueryMatch["confidence"], string> = {
  keyword: "match: keyword",
  default: "match: fallback",
  ai: "match: ai",
};

export function AIResponsePanel({
  match,
  commandResult,
  displayQuery,
  hasSelection,
  responseKey,
  className,
  isThinking,
  aiError,
  selectionSource,
}: AIResponsePanelProps) {
  return (
    <Panel
      variant="inset"
      padding="none"
      className={cn("min-w-0 overflow-hidden", className)}
      aria-live="polite"
      aria-busy={isThinking}
    >
      <div className="titlebar-chrome flex items-center justify-between px-3.5 py-2 sm:px-4">
        <span className="font-terminal text-[10px] text-titlebar-foreground">
          stdout / <span className="text-foreground/75">assistant</span>
        </span>
        <TerminalBadge variant="emphasis" className="normal-case tracking-normal">
          {match?.confidence === "ai" ? "ai" : "local"}
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
            <TerminalBadge variant="default">source: graph</TerminalBadge>
          )}
          {hasSelection &&
            match &&
            match.matchedDomains.map((domain) => <DomainBadge key={domain} domain={domain} />)}
          {hasSelection && match && match.matchedProjectIds.length > 0 && (
            <TerminalBadge variant="emphasis">
              {match.matchedProjectIds.length} projects
            </TerminalBadge>
          )}
        </div>

        {isThinking ? (
          <p className="font-terminal text-sm text-muted-foreground">
            <span className="text-foreground terminal-cursor-blink">▍</span>{" "}
            asking claude…
          </p>
        ) : !hasSelection ? (
          <div className="state-empty">
            <p className="font-terminal mb-1.5 text-[10px] text-foreground/70">
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
                <span className="text-foreground">&gt;</span> {displayQuery}
              </p>
            )}
            {commandResult ? (
              <ul className="space-y-1">
                {commandResult.lines.map((line, index) => (
                  <li
                    key={index}
                    className="font-terminal break-anywhere text-[13px] leading-[1.65] text-foreground/92"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="break-anywhere text-prose-strong">
                {match?.response}
              </p>
            )}
            {aiError && (
              <p className="font-terminal text-[11px] text-muted-foreground">{aiError}</p>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
