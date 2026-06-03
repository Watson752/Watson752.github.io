"use client";

import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { CommandInput } from "@/components/command/command-input";
import { QuerySuggestions } from "@/components/command/query-suggestions";
import { cn } from "@/lib/utils";

export type CommandHeroProps = {
  systemLabel: string;
  headline: string;
  subheading: string;
  query: string;
  suggestions: string[];
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  className?: string;
};

export function CommandHero({
  systemLabel,
  headline,
  subheading,
  query,
  suggestions,
  onQueryChange,
  onSubmit,
  onSuggestionSelect,
  className,
}: CommandHeroProps) {
  return (
    <section className={cn("space-y-6 sm:space-y-7", className)}>
      <TerminalBadge variant="muted">{systemLabel}</TerminalBadge>

      <div className="space-y-3.5">
        <h1 className="max-w-2xl text-balance text-xl font-medium tracking-[-0.02em] text-foreground sm:text-2xl md:text-[1.75rem] md:leading-[1.2]">
          {headline}
        </h1>
        <p className="max-w-xl text-prose md:max-w-lg">
          {subheading}
        </p>
      </div>

      <div className="space-y-3.5 rounded-md border border-border-subtle/50 bg-surface/30 p-3.5 sm:space-y-4 sm:p-4">
        <p className="text-kicker">command line</p>
        <CommandInput
          value={query}
          onChange={onQueryChange}
          onSubmit={onSubmit}
        />
        <QuerySuggestions
          suggestions={suggestions}
          onSelect={onSuggestionSelect}
          activeQuery={query}
        />
      </div>
    </section>
  );
}
