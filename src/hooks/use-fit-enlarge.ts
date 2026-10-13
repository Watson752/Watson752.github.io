"use client";

import { useEffect } from "react";

const MAX_ENLARGE = 1.25;
const DESKTOP_QUERY = "(min-width: 1024px)";
/** Panel top padding (pt-16) + bottom clearance for the SiteDock (sm:pb-24). */
const VERTICAL_CHROME_PX = 64 + 96;

/**
 * Sets `--enlarge` on every `.section-enlarge` panel: as close to 1.25× as
 * still fits the content in one screen above the dock, never below 1×.
 * Measured with zoom reset to 1 and via offset* (which ignore the reveal /
 * float transforms), all within one task so nothing flashes. Re-fit on
 * resize and once web fonts have loaded.
 */
export function useFitEnlarge() {
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    let frame = 0;

    function fit() {
      const panels = Array.from(document.querySelectorAll<HTMLElement>(".section-enlarge"));
      if (!desktop.matches) {
        panels.forEach((panel) => panel.style.removeProperty("--enlarge"));
        return;
      }
      panels.forEach((panel) => panel.style.setProperty("--enlarge", "1"));
      const available = window.innerHeight - VERTICAL_CHROME_PX;
      const scales = panels.map((panel) => {
        const first = panel.firstElementChild as HTMLElement | null;
        const last = panel.lastElementChild as HTMLElement | null;
        if (!first || !last) return 1;
        const natural = last.offsetTop + last.offsetHeight - first.offsetTop;
        if (natural <= 0) return 1;
        return Math.min(MAX_ENLARGE, Math.max(1, Math.floor((available / natural) * 100) / 100));
      });
      panels.forEach((panel, i) => panel.style.setProperty("--enlarge", String(scales[i])));
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    }

    fit();
    document.fonts?.ready.then(schedule).catch(() => {});
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, []);
}
