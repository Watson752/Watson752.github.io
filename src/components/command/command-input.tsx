"use client";

import { CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type CommandInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function CommandInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask about projects, domains, or skills…",
  className,
  disabled,
}: CommandInputProps) {
  return (
    <form
      className={cn("relative w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="portfolio-command" className="sr-only">
        Portfolio command
      </label>
      <div
        className={cn(
          "input-terminal flex min-h-11 items-center gap-2.5 px-3.5 py-2.5 sm:min-h-10 sm:px-3 sm:py-2",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span
          className="font-terminal shrink-0 text-[13px] text-accent-cyan select-none sm:text-sm"
          aria-hidden
        >
          &gt;
        </span>
        <input
          id="portfolio-command"
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "font-terminal min-w-0 flex-1 bg-transparent text-base text-foreground outline-none",
            "caret-accent-cyan placeholder:text-muted-foreground/50 sm:text-[13px]",
          )}
        />
        <kbd
          className="font-terminal hidden shrink-0 items-center gap-1 rounded border border-border-subtle bg-surface/90 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex"
          aria-hidden
        >
          enter
          <CornerDownLeft className="size-3 opacity-60" strokeWidth={1.75} />
        </kbd>
      </div>
    </form>
  );
}
