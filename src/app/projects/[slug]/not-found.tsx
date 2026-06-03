import Link from "next/link";
import { Panel } from "@/components/terminal/panel";
import { TerminalBackdrop } from "@/components/background/terminal-backdrop";

export default function ProjectNotFound() {
  return (
    <TerminalBackdrop className="flex min-h-dvh items-center justify-center overflow-x-hidden p-4 sm:p-6">
      <Panel padding="md" className="max-w-md space-y-3 text-center">
        <p className="font-terminal text-[11px] text-accent-cyan">404</p>
        <h1 className="text-lg font-medium">Case file not found</h1>
        <p className="text-sm text-muted-foreground">
          No project matches that slug in projects.ts.
        </p>
        <Link
          href="/"
          className="font-terminal inline-block text-[11px] text-muted-foreground hover:text-accent-cyan"
        >
          ← return to portfolio.os
        </Link>
      </Panel>
    </TerminalBackdrop>
  );
}
