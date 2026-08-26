"use client";

import { useCallback, useState } from "react";
import { hasIntroBeenDecidedBefore } from "@/components/intro/intro-session";

function computeInitialShouldShow(): boolean {
  if (typeof window === "undefined") return false;
  if (hasIntroBeenDecidedBefore()) return false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return !reducedMotion;
}

/**
 * Shows the intro splash only the first time IntroGate itself mounts in
 * this tab's JS runtime — skipped for prefers-reduced-motion, and skipped
 * on every later mount (e.g. navigating away to a project and back to "/").
 * Computed via a lazy useState initializer (not an effect) so there's no
 * render where the wrong value briefly shows.
 */
export function useIntroVisibility() {
  const [shouldShow, setShouldShow] = useState(computeInitialShouldShow);

  const dismiss = useCallback(() => {
    setShouldShow(false);
  }, []);

  return { shouldShow, dismiss };
}
