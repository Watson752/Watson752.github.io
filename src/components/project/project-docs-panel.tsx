import { Panel } from "@/components/terminal/panel";
import { DocSection } from "@/components/project/doc-section";
import { ArchitectureNotes } from "@/components/project/architecture-notes";
import { ProjectLinkBar } from "@/components/project/project-link-bar";
import { ProjectMetricRow } from "@/components/project/project-metric-row";
import { StackReadout } from "@/components/project/stack-readout";
import { ProjectStatusReadout } from "@/components/portfolio/project-status-readout";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";
import type { Project, ProjectDocSectionId } from "@/types/portfolio";

const SECTION_NAV: { id: ProjectDocSectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "built", label: "What I built" },
  { id: "stack", label: "Stack" },
  { id: "architecture", label: "Architecture" },
  { id: "decisions", label: "Decisions" },
  { id: "challenges", label: "Challenges" },
  { id: "results", label: "Results" },
  { id: "learned", label: "Learned" },
  { id: "links", label: "Links" },
];

export type ProjectDocsPanelProps = {
  project: Project;
  className?: string;
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground" role="list">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="font-terminal shrink-0 text-accent-cyan">›</span>
          <span className="break-anywhere">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DecisionList({
  items,
}: {
  items: { title: string; detail: string }[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-md border border-border-subtle bg-surface-inset/60 px-3 py-2"
        >
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ProjectDocsPanel({ project, className }: ProjectDocsPanelProps) {
  const { caseFile: doc } = project;
  const metricRows = [
    ...doc.results,
    ...Object.entries(project.metrics).map(([label, value]) => ({
      label,
      value,
    })),
  ];

  const uniqueMetrics = metricRows.filter(
    (row, index, arr) =>
      arr.findIndex((r) => r.label === row.label) === index,
  );

  return (
    <Panel
      padding="none"
      variant="elevated"
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden",
        className,
      )}
    >
      <div className="titlebar-chrome px-4 py-3 sm:px-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-terminal text-[10px] text-titlebar-foreground">
              case_file / {project.slug}
            </p>
            <h1 className="mt-1 break-anywhere text-base font-medium tracking-tight text-foreground sm:text-lg">
              {project.title}
            </h1>
          </div>
          <ProjectStatusReadout status={project.status} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {project.domains.map((domain) => (
            <TerminalBadge key={domain} variant="violet">
              {domain}
            </TerminalBadge>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-border-subtle bg-surface-inset/50 px-3 py-3 lg:w-44 lg:border-b-0 lg:border-r">
          <p className="font-terminal mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            sections
          </p>
          <ul className="scrollbar-terminal flex gap-1 overflow-x-auto overscroll-x-contain pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTION_NAV.map((section) => (
              <li key={section.id} className="shrink-0 lg:shrink">
                <a
                  href={`#${section.id}`}
                  className="touch-target font-terminal block rounded px-3 py-2 text-[10px] text-muted-foreground transition-colors hover:bg-surface hover:text-accent-cyan lg:px-2 lg:py-1.5"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 sm:py-5">
          <DocSection id="overview" title="Overview">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {doc.overview}
            </p>
          </DocSection>

          <DocSection id="problem" title="Problem">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {doc.problem}
            </p>
          </DocSection>

          <DocSection id="built" title="What I built">
            <BulletList items={doc.built} />
          </DocSection>

          <DocSection id="stack" title="Stack">
            <StackReadout stack={project.stack} />
          </DocSection>

          <DocSection id="architecture" title="Architecture">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {doc.architecture}
            </p>
            <ArchitectureNotes notes={doc.architectureNotes} />
          </DocSection>

          <DocSection id="decisions" title="Key technical decisions">
            <DecisionList items={doc.decisions} />
          </DocSection>

          <DocSection id="challenges" title="Challenges">
            <DecisionList items={doc.challenges} />
          </DocSection>

          <DocSection id="results" title="Results / metrics">
            <div className="rounded-md border border-border-subtle bg-surface-inset px-3 py-1">
              {uniqueMetrics.map((row) => (
                <ProjectMetricRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </div>
          </DocSection>

          <DocSection id="learned" title="What I learned">
            <BulletList items={doc.learned} />
          </DocSection>

          <DocSection id="links" title="Links">
            <ProjectLinkBar project={project} variant="footer" />
          </DocSection>
        </div>
      </div>
    </Panel>
  );
}
