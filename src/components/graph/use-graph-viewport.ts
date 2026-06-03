"use client";

import { useEffect, useState } from "react";

export type GraphViewportMode = "3d" | "fallback";

export function useGraphViewport(): {
  mode: GraphViewportMode;
  prefersReducedMotion: boolean;
} {
  const [mode, setMode] = useState<GraphViewportMode>("3d");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMq = window.matchMedia("(max-width: 1023px)");

    const update = () => {
      setPrefersReducedMotion(motionMq.matches);
      setMode(compactMq.matches || motionMq.matches ? "fallback" : "3d");
    };

    update();
    motionMq.addEventListener("change", update);
    compactMq.addEventListener("change", update);
    return () => {
      motionMq.removeEventListener("change", update);
      compactMq.removeEventListener("change", update);
    };
  }, []);

  return { mode, prefersReducedMotion };
}
