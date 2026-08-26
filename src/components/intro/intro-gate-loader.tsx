"use client";

import dynamic from "next/dynamic";

// `ssr: false` requires a Client Component boundary — kept separate from
// intro-gate.tsx so page.tsx (a Server Component) can import a plain
// component rather than calling next/dynamic itself.
const IntroGate = dynamic(
  () => import("@/components/intro/intro-gate").then((mod) => mod.IntroGate),
  { ssr: false },
);

export function IntroGateLoader() {
  return <IntroGate />;
}
