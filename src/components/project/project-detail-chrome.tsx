import Link from "next/link";
import { StatusBar } from "@/components/terminal/status-bar";
import { TerminalShell } from "@/components/terminal/terminal-shell";
import { ProjectSplitView } from "@/components/project/project-split-view";
import type { Project } from "@/types/portfolio";

export type ProjectDetailChromeProps = {
  project: Project;
};

export function ProjectDetailChrome({ project }: ProjectDetailChromeProps) {
  return (
    <TerminalShell
      className="min-h-dvh"
      header={
        <header className="titlebar-chrome mb-4 flex min-w-0 items-center justify-between gap-3 rounded-md px-3 py-2.5 sm:mb-5">
          <Link
            href="/"
            className="touch-target font-terminal inline-flex items-center text-[11px] text-muted-foreground transition-colors hover:text-accent-cyan"
          >
            ← portfolio.os
          </Link>
          <span className="font-terminal truncate text-[10px] text-titlebar-foreground">
            case_file :: {project.slug}
          </span>
        </header>
      }
      footer={
        <StatusBar
          items={[
            {
              id: "view",
              label: "view",
              value: "split",
              tone: "accent",
            },
            {
              id: "status",
              label: "status",
              value: project.status,
            },
          ]}
          right={
            <span className="block max-w-full truncate text-titlebar-foreground sm:max-w-[14rem]">
              {project.domains.join(" · ")}
            </span>
          }
        />
      }
    >
      <ProjectSplitView project={project} />
    </TerminalShell>
  );
}
