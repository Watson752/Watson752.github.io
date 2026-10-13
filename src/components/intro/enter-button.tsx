"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type EnterButtonProps = {
  onActivate: () => void;
  className?: string;
};

export function EnterButton({ onActivate, className }: EnterButtonProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <button
        type="button"
        onClick={onActivate}
        className={cn(
          "font-terminal touch-target inline-flex items-center gap-2.5 rounded-md border border-border",
          "bg-black px-6 py-3 text-sm tracking-[0.1em] text-white uppercase",
          "transition-colors duration-200 hover:bg-black/80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
        )}
      >
        Enter
        <ArrowRight className="size-4" strokeWidth={1.75} />
      </button>
      <p className="font-terminal text-[10px] uppercase tracking-[0.14em] text-white">
        <span className="pointer-coarse:hidden">Press Enter or click to continue</span>
        <span className="hidden pointer-coarse:inline">Tap to continue</span>
      </p>
    </div>
  );
}
