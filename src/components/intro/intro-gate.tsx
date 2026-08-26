"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { siteProfile } from "@/data/site";
import { EnterButton } from "@/components/intro/enter-button";
import { useIntroVisibility } from "@/components/intro/use-intro-visibility";
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
  const { shouldShow, dismiss } = useIntroVisibility();
  const [phase, setPhase] = useState<IntroPhase>("idle");

  const enter = useCallback(() => {
    setPhase((current) => {
      if (current !== "idle") return current;
      window.setTimeout(() => {
        setPhase("done");
        dismiss();
      }, FALL_DURATION_MS);
      return "falling";
    });
  }, [dismiss]);

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
      className="bg-terminal-grid fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Site introduction"
    >
      <div className="pointer-events-none absolute inset-0 bg-background/40" aria-hidden />
      <PaintingScene phase={phase} className="absolute inset-0" />

      <div
        className={cn(
          "relative z-10 flex flex-col items-center gap-6 px-6 text-center transition-all duration-500",
          phase === "falling" ? "translate-y-2 opacity-0" : "opacity-100",
        )}
      >
        <div className="space-y-3 rounded-md bg-background/30 px-6 py-5 backdrop-blur-sm">
          <h1 className="font-terminal text-3xl font-medium tracking-[-0.02em] text-foreground sm:text-4xl">
            {siteProfile.name}
          </h1>
          <p className="text-sm leading-[1.65] text-white">{siteProfile.availability}</p>
        </div>
        <EnterButton onActivate={enter} />
      </div>
    </div>
  );
}
