"use client";

import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { CommandInput } from "@/components/command/command-input";
import { CommandSuggestions } from "@/components/command/command-suggestions";
import { QuerySuggestions } from "@/components/command/query-suggestions";
import { cn } from "@/lib/utils";
import type { CommandDefinition } from "@/lib/commands";

export type CommandHeroProps = {
  systemLabel: string;
  headline: string;
  subheading: string;
  query: string;
  suggestions: string[];
  commandMatches: CommandDefinition[];
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onSuggestionSelect: (suggestion: string) => void;
  onCommandSelect: (name: string) => void;
  logoSrc?: string;
  className?: string;
};

export function CommandHero({
  systemLabel,
  headline,
  subheading,
  query,
  suggestions,
  commandMatches,
  onQueryChange,
  onSubmit,
  onSuggestionSelect,
  onCommandSelect,
  logoSrc,
  className,
}: CommandHeroProps) {
  const isCommandMode = query.trim().startsWith("/");
  return (
    <section className={cn("space-y-6 sm:space-y-7", className)}>
      <TerminalBadge variant="muted">{systemLabel}</TerminalBadge>

      <div className="space-y-3.5">
        <h1 className="max-w-2xl text-balance text-xl font-medium tracking-[-0.02em] text-foreground sm:text-2xl md:text-[1.75rem] md:leading-[1.2]">
          {headline}
        </h1>
        <p className="max-w-3xl text-prose">
          {subheading}
        </p>
      </div>

      <div className="overflow-hidden rounded-md border border-border-subtle/50 bg-surface/30">
        <div className="titlebar-chrome flex items-center justify-between px-3.5 py-2 sm:px-4">
          <span className="font-terminal text-[10px] text-titlebar-foreground">
            prompt / <span className="text-foreground/75">command</span>
          </span>
          <TerminalBadge variant="muted">local</TerminalBadge>
        </div>
        <div className="space-y-3.5 p-3.5 sm:space-y-4 sm:p-4">
          <CommandInput
            value={query}
            onChange={onQueryChange}
            onSubmit={onSubmit}
            logoSrc={logoSrc}
          />
          {isCommandMode && (
            <CommandSuggestions
              commands={commandMatches}
              onSelect={onCommandSelect}
            />
          )}
          <QuerySuggestions
            suggestions={suggestions}
            onSelect={onSuggestionSelect}
            activeQuery={query}
          />
        </div>
      </div>
    </section>
  );
}
