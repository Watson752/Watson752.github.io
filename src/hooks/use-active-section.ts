"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which of the given section ids sits at the middle of the viewport
 * (`activeId`, drives the side rail) and which have scrolled into view at
 * least once (`visibleIds`, drives the one-shot reveal animation).
 */
export function useActiveSection(ids: readonly string[]) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set());
  const idsKey = ids.join(",");

  useEffect(() => {
    const elements = idsKey
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const activeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        const revealed = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (revealed.length === 0) return;
        setVisibleIds((prev) => {
          if (revealed.every((id) => prev.has(id))) return prev;
          const next = new Set(prev);
          revealed.forEach((id) => next.add(id));
          return next;
        });
        revealed.forEach((id) => {
          const el = document.getElementById(id);
          if (el) revealObserver.unobserve(el);
        });
      },
      { threshold: 0.15 },
    );

    elements.forEach((el) => {
      activeObserver.observe(el);
      revealObserver.observe(el);
    });

    return () => {
      activeObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [idsKey]);

  return { activeId, visibleIds };
}
