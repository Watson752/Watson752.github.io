import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Panel } from "@/components/terminal/panel";
import { DomainBadge } from "@/components/portfolio/domain-badge";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { ProjectStatusReadout } from "@/components/portfolio/project-status-readout";
import { cn } from "@/lib/utils";
import type { Note, ProjectCardVisualState } from "@/types/portfolio";

export type ProjectEvidencePanelProps = {
  project: Note;
  visualState?: ProjectCardVisualState;
  rank?: number;
  matchReason?: string | null;
  className?: string;
};

type EvidenceLink = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

function buildEvidenceLinks(project: Note): EvidenceLink[] {
  const links: EvidenceLink[] = [
    { id: "case-study", label: "case study", href: `/projects/${project.slug}` },
  ];

  if (project.externalLinks?.repo) {
    links.push({ id: "github", label: "github", href: project.externalLinks.repo, external: true });
  }

  if (project.externalLinks?.demo) {
    links.push({ id: "demo", label: "live demo", href: project.externalLinks.demo, external: true });
  }

  return links;
}

export function ProjectEvidencePanel({
  project,
  visualState = "idle",
  rank = 0,
  matchReason,
  className,
}: ProjectEvidencePanelProps) {
  const isActive = visualState === "active";
  const isDim = visualState === "dim";
  const detailHref = `/projects/${project.slug}`;
  const evidenceLinks = buildEvidenceLinks(project);
  const stack = project.stack ?? [];

  return (
    <article
      className={cn(
        "group relative flex h-full min-w-0 flex-col transition-opacity duration-200",
        isDim && "saturate-[0.9] hover:opacity-60",
        className,
      )}
      style={{ order: isDim ? rank + 100 : rank }}
    >
      <Panel
        padding="none"
        variant={isActive ? "elevated" : "default"}
        className={cn(
          "interactive-panel flex h-full flex-col overflow-hidden",
          isActive && "border-foreground/25 shadow-elevated",
          isDim && "opacity-[0.42]",
          !isActive && !isDim && "hover:border-border/90",
        )}
      >
        <div className="titlebar-chrome flex items-center justify-between gap-2 px-3 py-2">
          <span className="font-terminal min-w-0 truncate text-[10px] text-titlebar-foreground">
            evidence/
            <span className="text-foreground/80">{project.slug}</span>
          </span>
          {project.status && <ProjectStatusReadout status={project.status} />}
        </div>

        <Link href={detailHref} className="flex flex-1 flex-col outline-none">
          <div className="flex flex-1 flex-col gap-3.5 p-4 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium leading-snug tracking-tight text-foreground">
                {project.title}
              </h3>
              <ArrowUpRight
                className={cn(
                  "size-3.5 shrink-0 transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
                aria-hidden
              />
            </div>

            <p className="break-anywhere text-sm leading-relaxed text-muted-foreground">
              {project.summary}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {project.domains.map((domain) => (
                <DomainBadge key={domain} domain={domain} />
              ))}
            </div>

            {stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {stack.map((tech) => (
                  <TerminalBadge key={tech} variant={isActive ? "emphasis" : "default"}>
                    {tech}
                  </TerminalBadge>
                ))}
              </div>
            )}

            {matchReason && (
              <p
                className={cn(
                  "font-terminal break-anywhere mt-auto border-t border-border-subtle pt-2 text-[10px] leading-relaxed",
                  isActive ? "text-foreground/90" : "text-muted-foreground",
                )}
              >
                match :: {matchReason}
              </p>
            )}
          </div>
        </Link>

        <nav
          className="flex flex-wrap gap-2 border-t border-border-subtle bg-surface-inset px-3 py-2"
          aria-label={`${project.title} links`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {evidenceLinks.map((link) => {
            const className = cn(
              "touch-target font-terminal inline-flex items-center gap-1 rounded border border-border-subtle px-2.5 py-2 text-[10px] text-muted-foreground transition-colors sm:px-2 sm:py-1",
              "hover:border-border hover:bg-surface hover:text-foreground",
            );

            if (link.external) {
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={className}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <ExternalLink className="size-2.5" strokeWidth={1.75} />
                </a>
              );
            }

            return (
              <Link key={link.id} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </Panel>
    </article>
  );
}
