"use client";

import { Panel } from "@/components/terminal/panel";
import { cn } from "@/lib/utils";
import type { CommandDefinition } from "@/lib/commands";

export type CommandSuggestionsProps = {
  commands: CommandDefinition[];
  onSelect: (name: string) => void;
  className?: string;
};

/**
 * Inline "/" autocomplete list — additive alongside QuerySuggestions, shown
 * only while the command input starts with "/".
 */
export function CommandSuggestions({
  commands,
  onSelect,
  className,
}: CommandSuggestionsProps) {
  if (commands.length === 0) {
    return (
      <Panel variant="inset" padding="sm" className={cn("min-w-0", className)}>
        <p className="font-terminal text-[11px] text-muted-foreground">
          No matching commands. Try /help.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      variant="inset"
      padding="sm"
      className={cn("min-w-0 space-y-1", className)}
    >
      <ul role="list" className="space-y-0.5">
        {commands.map((command) => (
          <li key={command.name}>
            <button
              type="button"
              onClick={() => onSelect(command.name)}
              className={cn(
                "touch-target font-terminal flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px]",
                "text-secondary-foreground transition-colors duration-150",
                "hover:bg-surface-elevated hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
              )}
            >
              <span className="text-foreground">/{command.name}</span>
              <span className="text-muted-foreground">
                — {command.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
