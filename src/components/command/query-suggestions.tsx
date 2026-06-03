"use client";

import { cn } from "@/lib/utils";

export type QuerySuggestionsProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  className?: string;
  activeQuery?: string;
};

export function QuerySuggestions({
  suggestions,
  onSelect,
  className,
  activeQuery,
}: QuerySuggestionsProps) {
  return (
    <div className={cn("min-w-0 space-y-2.5", className)}>
      <p className="text-kicker">suggested queries</p>
      <ul
        className="scrollbar-terminal -mx-0.5 flex gap-2 overflow-x-auto overscroll-x-contain px-0.5 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0"
        role="list"
      >
        {suggestions.map((suggestion) => {
          const isActive =
            activeQuery != null &&
            activeQuery.trim().toLowerCase() === suggestion.toLowerCase();

          return (
            <li key={suggestion} className="shrink-0 sm:shrink">
              <button
                type="button"
                onClick={() => onSelect(suggestion)}
                className={cn(
                  "touch-target rounded-md border px-3 py-2 text-left text-xs leading-snug transition-[border-color,background-color,color,box-shadow] duration-200 sm:px-2.5 sm:py-1.5",
                  "border-border-subtle bg-surface text-secondary-foreground",
                  "hover:border-border hover:bg-surface-elevated hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                  "max-w-[min(100%,16rem)] sm:max-w-none",
                  isActive &&
                    "border-accent-cyan/30 bg-accent-cyan/6 text-foreground glow-accent-cyan",
                )}
              >
                <span className="whitespace-nowrap sm:whitespace-normal">
                  {suggestion}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
