import Link from "next/link";
import { siteProfile } from "@/data/site";
import { SiteDock } from "@/components/portfolio/site-dock";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { NoteDoc } from "@/components/project/note-doc";
import type { Note } from "@/types/portfolio";

export type ProjectDetailChromeProps = {
  project: Note;
};

export function ProjectDetailChrome({ project }: ProjectDetailChromeProps) {
  const basePath = project.type === "project" ? "projects" : "notes";

  return (
    <>
      <TerminalShell
        className="min-h-dvh pb-24"
        header={
          <header className="titlebar-chrome mb-4 flex min-w-0 items-center justify-between gap-3 rounded-md px-3 py-2.5 sm:mb-5">
            <Link
              href="/#projects"
              className="touch-target font-terminal inline-flex items-center text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              ← portfolio.os
            </Link>
            <span className="font-terminal truncate text-[10px] text-titlebar-foreground">
              / {basePath} / {project.slug}
            </span>
          </header>
        }
      >
        <NoteDoc note={project} />
      </TerminalShell>

      <SiteDock name={siteProfile.name} status={siteProfile.status} nav={siteProfile.nav} />
    </>
  );
}
