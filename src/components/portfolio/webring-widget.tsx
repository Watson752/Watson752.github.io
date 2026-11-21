"use client";

import { useEffect } from "react";

const WIDGET_SRC = "https://www.613webring.ca/widget.js";

/** 613 Webring embed: the widget script fills #webring-613 with prev/random/next links. */
export function WebringWidget({ show = true }: { show?: boolean }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <footer
      aria-hidden={!show}
      className={`pointer-events-none fixed inset-x-0 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-3 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className={show ? "pointer-events-auto" : "pointer-events-none"}>
        {/* 613 Webring */}
        <div id="webring-613" />
        <noscript>
          <a href="https://www.613webring.ca">613 Webring</a>
        </noscript>
      </div>
    </footer>
  );
}
