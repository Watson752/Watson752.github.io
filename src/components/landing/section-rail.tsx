"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type SectionRailItem = { id: string; label: string };

export type SectionRailProps = {
  sections: readonly SectionRailItem[];
  activeId: string;
  className?: string;
};

/** Spacing between circle centers, in px — keep in sync with the `gap-*` below. */
const STEP_PX = 28;

/** Content must be hidden by more than this (px) before a key press pages instead of jumping. */
const EDGE_SLACK_PX = 24;
/** Bottom strip covered by the fixed SiteDock. */
const DOCK_CLEARANCE_PX = 80;
/** Share of the viewport one key press pages through inside a tall section. */
const PAGE_FRACTION = 0.85;

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/**
 * The one-line "Ask this terminal" prompt: ↑/↓ have no use inside it, so they
 * still move between sections (and leave the prompt) instead of being eaten.
 */
const PASS_THROUGH_INPUT_ID = "portfolio-command";

function isPassThroughArrow(event: KeyboardEvent): boolean {
  return (
    event.target instanceof HTMLInputElement &&
    event.target.id === PASS_THROUGH_INPUT_ID &&
    (event.key === "ArrowDown" || event.key === "ArrowUp")
  );
}

/** Keys typed into a field (or used by a widget) must not move the page. */
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return target.closest("input, textarea, select, [role='listbox'], [role='slider'], [role='menu']") !== null;
}

/**
 * Fixed vertical rail with one circle per landing section. The fill on the
 * track grows down to the active circle; clicking a circle scrolls to it.
 * ArrowUp/ArrowDown, PageUp/PageDown and Space/Shift+Space move section to section — a
 * section taller than the screen is paged through first, so none of its
 * content is skipped.
 */
export function SectionRail({ sections, activeId, className }: SectionRailProps) {
  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === activeId),
  );

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() });
  }

  useEffect(() => {
    /** The section under the viewport's middle line, measured at key-press time. */
    function currentIndex(): number {
      const middle = window.innerHeight / 2;
      let best = 0;
      let bestDistance = Infinity;
      sections.forEach((section, index) => {
        const rect = document.getElementById(section.id)?.getBoundingClientRect();
        if (!rect) return;
        const distance = rect.top > middle ? rect.top - middle : rect.bottom < middle ? middle - rect.bottom : 0;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    }

    function keyDirection(event: KeyboardEvent): -1 | 0 | 1 {
      if (event.altKey || event.ctrlKey || event.metaKey) return 0;
      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          return event.shiftKey ? 0 : 1;
        case "ArrowUp":
        case "PageUp":
          return event.shiftKey ? 0 : -1;
        case " ":
          // Space activates a focused button/link — leave that alone.
          if (event.target instanceof HTMLElement && event.target.closest("button, a, summary")) return 0;
          return event.shiftKey ? -1 : 1;
        default:
          return 0;
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      // Escape leaves the prompt so the section keys take over again.
      if (
        event.key === "Escape" &&
        event.target instanceof HTMLInputElement &&
        event.target.id === PASS_THROUGH_INPUT_ID
      ) {
        event.target.blur();
        return;
      }

      const direction = keyDirection(event);
      if (direction === 0) return;
      const passThrough = isPassThroughArrow(event);
      if (!passThrough && isInteractiveTarget(event.target)) return;
      // The intro splash is a modal on top of the page — don't scroll behind it.
      if (document.querySelector('[aria-modal="true"]')) {
        event.preventDefault();
        return;
      }

      const index = currentIndex();
      const current = document.getElementById(sections[index]?.id ?? "");
      if (!current) return;
      event.preventDefault();
      if (passThrough) (event.target as HTMLInputElement).blur();

      // Measure the section's content (header + body), not the padded panel —
      // a min-h-dvh panel always pokes a few px past the fold, and paging by
      // that sliver would look like the key did nothing.
      const first = current.firstElementChild ?? current;
      const last = current.lastElementChild ?? current;
      const contentTop = first.getBoundingClientRect().top;
      const contentBottom = last.getBoundingClientRect().bottom;
      const visibleBottom = window.innerHeight - DOCK_CLEARANCE_PX;
      const page = window.innerHeight * PAGE_FRACTION;

      if (direction === 1 && contentBottom > visibleBottom + EDGE_SLACK_PX) {
        const hidden = contentBottom - visibleBottom + EDGE_SLACK_PX;
        window.scrollBy({ top: Math.min(hidden, page), behavior: scrollBehavior() });
        return;
      }
      if (direction === -1 && contentTop < -EDGE_SLACK_PX) {
        const hidden = -contentTop + EDGE_SLACK_PX;
        window.scrollBy({ top: -Math.min(hidden, page), behavior: scrollBehavior() });
        return;
      }

      const next = sections[index + direction];
      if (next) jumpTo(next.id);
    }

    // Capture phase: runs before any component can stopPropagation() the key.
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [sections]);

  return (
    <nav
      aria-label="Sections"
      aria-keyshortcuts="ArrowUp ArrowDown PageUp PageDown Space Shift+Space"
      className={cn(
        "fixed right-0 top-1/2 z-30 -translate-y-1/2 sm:right-2 lg:right-4",
        className,
      )}
    >
      <ol className="relative flex flex-col items-end">
        {/* Track + progress fill, centered on the circles' column. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-[21px] top-[22px] w-px bg-border-subtle"
          style={{ height: STEP_PX * (sections.length - 1) }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-[21px] top-[22px] w-px bg-foreground/70 transition-[height] duration-500 ease-out motion-reduce:transition-none"
          style={{ height: STEP_PX * activeIndex }}
        />

        {sections.map((section, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          return (
            <li key={section.id} className="-my-[8px] first:mt-0 last:mb-0">
              <button
                type="button"
                onClick={() => jumpTo(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
                className="group touch-target relative flex items-center justify-end focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "font-terminal pointer-events-none absolute right-11 hidden whitespace-nowrap rounded border border-border-subtle bg-titlebar/95 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground opacity-0 shadow-elevated transition-opacity duration-200 lg:block",
                    "group-hover:opacity-100 group-focus-visible:opacity-100",
                  )}
                >
                  / {section.label}
                </span>
                <span className="flex size-[44px] items-center justify-center">
                  <span
                    className={cn(
                      "block rounded-full border transition-all duration-300 ease-out motion-reduce:transition-none",
                      isActive
                        ? "size-2.5 border-foreground bg-foreground ring-4 ring-foreground/10 sm:size-3"
                        : isPast
                          ? "size-2 border-foreground/70 bg-foreground/70 sm:size-2.5"
                          : "size-2 border-border bg-background group-hover:border-foreground/60 sm:size-2.5",
                      "group-focus-visible:ring-2 group-focus-visible:ring-ring/50",
                    )}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
