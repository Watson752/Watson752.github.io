"use client";

import { useEffect, useState } from "react";

export type GraphViewportMode = "3d" | "fallback";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * 3D everywhere (phones included) unless the visitor prefers reduced motion
 * or the device has no WebGL. `coarsePointer` lets the canvas trade pinch-zoom
 * for page scrolling on touch screens.
 */
export function useGraphViewport(): {
  mode: GraphViewportMode;
  prefersReducedMotion: boolean;
  coarsePointer: boolean;
} {
  const [mode, setMode] = useState<GraphViewportMode>("3d");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const webgl = hasWebGL();

    const update = () => {
      setPrefersReducedMotion(motionMq.matches);
      setCoarsePointer(coarseMq.matches);
      setMode(motionMq.matches || !webgl ? "fallback" : "3d");
    };

    update();
    motionMq.addEventListener("change", update);
    coarseMq.addEventListener("change", update);
    return () => {
      motionMq.removeEventListener("change", update);
      coarseMq.removeEventListener("change", update);
    };
  }, []);

  return { mode, prefersReducedMotion, coarsePointer };
}
