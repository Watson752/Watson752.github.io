declare global {
  interface Window {
    __introDecided?: boolean;
  }
}

/**
 * Whether IntroGate has already made its "should I show?" decision once
 * before in this tab's JS runtime. Read live (not cached) — IntroGate can
 * mount more than once per SPA session, e.g. going project detail -> "/"
 * -> a project again -> "/" again, each via client-side navigation. The
 * first call in a fresh tab always sees `false` and immediately flips the
 * flag to `true`, so every later mount (any later visit to "/") sees `true`
 * and skips the intro. A real page reload gets a fresh `window`, so this
 * naturally resets.
 *
 * This intentionally only cares about IntroGate's own first mount, not
 * "has any page in the app mounted" — an earlier version tried to track the
 * latter via a separate always-mounted component (AppMountTracker) so a
 * project detail page loaded first would also suppress a later intro visit.
 * That added an eager-import ordering dependency for no real benefit (there
 * is nothing wrong with still showing the intro the first time someone
 * actually lands on "/", even if a project page was the tab's first-ever
 * page) and does not need it.
 */
export function hasIntroBeenDecidedBefore(): boolean {
  if (typeof window === "undefined") return false;
  const decidedBefore = window.__introDecided === true;
  window.__introDecided = true;
  return decidedBefore;
}
