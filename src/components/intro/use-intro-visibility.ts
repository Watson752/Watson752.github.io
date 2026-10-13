"use client";

import { useCallback, useState } from "react";
import { hasIntroBeenDecidedBefore } from "@/components/intro/intro-session";

function computeInitialShouldShow(): boolean {
  if (typeof window === "undefined") return false;
  return !hasIntroBeenDecidedBefore();
}

function computeReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Shows the intro splash only the first time IntroGate itself mounts in
 * this tab's JS runtime — skipped on every later mount (e.g. navigating away to a project and back to "/").
 * Computed via a lazy useState initializer (not an effect) so there's no
 * render where the wrong value briefly shows. prefers-reduced-motion no
 * longer skips the intro (many phones ship with it on); it's reported as
 * `reducedMotion` so the scene can render a static painting instead.
 */
export function useIntroVisibility() {
  const [shouldShow, setShouldShow] = useState(computeInitialShouldShow);
  const [reducedMotion] = useState(computeReducedMotion);

  const dismiss = useCallback(() => {
    setShouldShow(false);
  }, []);

  return { shouldShow, reducedMotion, dismiss };
}
