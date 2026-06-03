import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Panel } from "@/components/terminal/panel";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { ProjectStatusReadout } from "@/components/portfolio/project-status-readout";
import { cn } from "@/lib/utils";
import type { Project, ProjectCardVisualState } from "@/types/portfolio";

export type ProjectEvidencePanelProps = {
  project: Project;
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

function buildEvidenceLinks(project: Project): EvidenceLink[] {
  const links: EvidenceLink[] = [];
  const caseStudy =
    project.links.docs && project.links.docs !== "#"
      ? project.links.docs
      : `/projects/${project.slug}`;

  links.push({ id: "case-study", label: "case study", href: caseStudy });

  if (project.links.repo) {
    links.push({
      id: "github",
      label: "github",
      href: project.links.repo,
      external: true,
    });
  }

  if (project.links.demo && project.links.demo !== "#") {
    links.push({
      id: "demo",
      label: "live demo",
      href: project.links.demo,
      external: true,
    });
  }

  return links;
}

function metricEntries(project: Project): [string, string][] {
  return Object.entries(project.metrics).slice(0, 4);
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
  const metrics = metricEntries(project);

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
          isActive && "border-accent-cyan/25 glow-accent-cyan",
          isDim && "opacity-[0.42]",
          !isActive && !isDim && "hover:border-border/90",
        )}
      >
        <div className="titlebar-chrome flex items-center justify-between gap-2 px-3 py-2">
          <span className="font-terminal min-w-0 truncate text-[10px] text-titlebar-foreground">
            evidence/
            <span className="text-foreground/80">{project.slug}</span>
          </span>
          <ProjectStatusReadout status={project.status} />
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
                  isActive
                    ? "text-accent-cyan"
                    : "text-muted-foreground group-hover:text-accent-cyan",
                )}
                aria-hidden
              />
            </div>

            <p className="break-anywhere text-sm leading-relaxed text-muted-foreground">
              {project.shortDescription}
            </p>

            <dl className="font-terminal space-y-1.5 text-[11px] leading-relaxed">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <dt className="text-muted-foreground">domains</dt>
                <dd className="text-foreground/90">
                  {project.domains.join(" · ")}
                </dd>
              </div>
              {project.signals.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">signals</dt>
                  <dd className="mt-0.5 text-foreground/85">
                    {project.signals[0]}
                  </dd>
                </div>
              )}
            </dl>

            <div
              className={cn(
                "font-terminal max-h-0 space-y-2 overflow-hidden text-[10px] leading-relaxed transition-all duration-300",
                "group-hover:max-h-40 group-hover:opacity-100 group-focus-within:max-h-40",
                "opacity-0",
              )}
            >
              {project.signals.length > 1 && (
                <ul className="space-y-1 text-muted-foreground">
                  {project.signals.slice(1).map((signal) => (
                    <li key={signal}>
                      <span className="text-accent-cyan">›</span> {signal}
                    </li>
                  ))}
                </ul>
              )}
              {metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-border-subtle pt-2">
                  {metrics.map(([key, value]) => (
                    <div key={key}>
                      <span className="text-muted-foreground">{key}</span>
                      <span className="ml-1 text-foreground/90">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-muted-foreground/90">
                id={project.id} · featured=
                {project.featured ? "true" : "false"}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <TerminalBadge
                  key={tech}
                  variant={isActive ? "accent" : "default"}
                >
                  {tech}
                </TerminalBadge>
              ))}
            </div>

            {metrics.length > 0 && (
              <div className="font-terminal flex flex-wrap gap-3 border-t border-border-subtle pt-2 text-[10px] group-hover:hidden">
                {metrics.slice(0, 2).map(([key, value]) => (
                  <span key={key} className="text-muted-foreground">
                    {key}
                    <span className="ml-1 text-foreground/85">{value}</span>
                  </span>
                ))}
              </div>
            )}

            {matchReason && (
              <p
                className={cn(
                  "font-terminal break-anywhere border-t border-border-subtle pt-2 text-[10px] leading-relaxed",
                  isActive ? "text-accent-cyan/90" : "text-muted-foreground",
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
              "hover:border-border hover:bg-surface hover:text-accent-cyan",
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
