"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { siteProfile } from "@/data/site";
import { EnterButton } from "@/components/intro/enter-button";
import { useIntroVisibility } from "@/components/intro/use-intro-visibility";
import { markIntroDone } from "@/components/intro/intro-session";
import { cn } from "@/lib/utils";
import { FALL_DURATION_MS } from "@/components/intro/intro-constants";
import type { IntroPhase } from "@/components/intro/painting-scene";

// Deferred so the three.js chunk only downloads when the intro is actually
// going to render.
const PaintingScene = dynamic(
  () => import("@/components/intro/painting-scene").then((mod) => mod.PaintingScene),
  { ssr: false },
);

export function IntroGate() {
  const { shouldShow, reducedMotion, dismiss } = useIntroVisibility();
  const [phase, setPhase] = useState<IntroPhase>("idle");

  const enter = useCallback(() => {
    setPhase((current) => {
      if (current !== "idle") return current;
      window.setTimeout(() => {
        setPhase("done");
        dismiss();
        markIntroDone();
      }, FALL_DURATION_MS);
      return "falling";
    });
  }, [dismiss]);

  // Skipped intro (later visits in this tab): nothing to wait for.
  useEffect(() => {
    if (!shouldShow) markIntroDone();
  }, [shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") enter();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldShow, enter]);

  if (!shouldShow || phase === "done") return null;

  return (
    <div
      className="bg-terminal-grid fixed inset-0 z-[100] flex touch-none items-center justify-center overflow-hidden overscroll-none"
      role="dialog"
      aria-modal="true"
      aria-label="Site introduction"
    >
      <div className="pointer-events-none absolute inset-0 bg-background/40" aria-hidden />
      <PaintingScene phase={phase} reducedMotion={reducedMotion} className="absolute inset-0" />

      <div
        className={cn(
          "relative z-10 flex flex-col items-center gap-5 px-6 text-center transition-all duration-500 sm:gap-6",
          phase === "falling" ? "translate-y-2 opacity-0" : "opacity-100",
        )}
      >
        <div className="max-w-[min(34rem,calc(100vw-3rem))] space-y-2.5 rounded-md bg-background/35 px-4 py-4 backdrop-blur-sm sm:space-y-3 sm:px-6 sm:py-5">
          <h1 className="font-terminal whitespace-nowrap text-[clamp(1.25rem,6vw,2.25rem)] font-medium tracking-[-0.02em] text-foreground">
            {siteProfile.name}
          </h1>
          <p className="text-sm italic leading-[1.65] text-foreground/80">
            &ldquo;{siteProfile.quote}&rdquo;
          </p>
        </div>
        <EnterButton onActivate={enter} />
      </div>
    </div>
  );
}
