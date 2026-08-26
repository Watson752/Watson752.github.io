"use client";

import { useEffect, useRef, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { CommandLogo } from "@/components/command/command-logo";
import { cn } from "@/lib/utils";

export type CommandInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  logoSrc?: string;
};

export function CommandInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask about projects, domains, or notes…",
  className,
  disabled,
  logoSrc,
}: CommandInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        <CommandLogo src={logoSrc} />
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id="portfolio-command"
            type="text"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "font-terminal w-full min-w-0 bg-transparent pl-3 text-base text-foreground outline-none",
              "caret-foreground placeholder:text-muted-foreground/50 sm:text-[13px]",
            )}
          />
          {value === "" && !isFocused && (
            <span
              className="terminal-cursor-blink pointer-events-none absolute inset-y-0 left-0 flex items-center text-foreground"
              aria-hidden
            >
              ▍
            </span>
          )}
        </div>
        <kbd
          className="font-terminal hidden shrink-0 items-center gap-1 rounded border border-border-subtle bg-surface/90 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex"
          aria-hidden
        >
          {"⌘K / enter"}
          <CornerDownLeft className="size-3 opacity-60" strokeWidth={1.75} />
        </kbd>
      </div>
    </form>
  );
}
