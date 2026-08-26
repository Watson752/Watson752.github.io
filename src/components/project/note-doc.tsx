import { Panel } from "@/components/terminal/panel";
import { DomainBadge } from "@/components/portfolio/domain-badge";
import { ProjectStatusReadout } from "@/components/portfolio/project-status-readout";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { ProjectLinkBar } from "@/components/project/project-link-bar";
import { StackReadout } from "@/components/project/stack-readout";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/portfolio";

export type NoteDocProps = {
  note: Note;
  className?: string;
};

export function NoteDoc({ note, className }: NoteDocProps) {
  const stack = note.stack ?? [];

  return (
    <div className={cn("grid min-w-0 gap-5 lg:grid-cols-[1fr_16rem] lg:gap-6", className)}>
      <Panel padding="none" variant="elevated" className="min-w-0 overflow-hidden">
        <div className="titlebar-chrome px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-terminal text-[10px] text-titlebar-foreground">
                {note.type} / {note.slug}
              </p>
              <h1 className="mt-1 break-anywhere text-base font-medium tracking-tight text-foreground sm:text-lg">
                {note.title}
              </h1>
            </div>
            {note.status && <ProjectStatusReadout status={note.status} />}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {note.domains.map((domain) => (
              <DomainBadge key={domain} domain={domain} />
            ))}
            {note.org && <TerminalBadge variant="muted">{note.org}</TerminalBadge>}
            {note.dates && <TerminalBadge variant="muted">{note.dates}</TerminalBadge>}
          </div>
        </div>

        <div
          className="prose-note min-w-0 px-4 py-5 sm:px-5 sm:py-6"
          // Sanitized at export time (scripts/vault-export/markdown.ts, rehype-sanitize)
          dangerouslySetInnerHTML={{ __html: note.html }}
        />

        <ProjectLinkBar project={note} variant="footer" className="px-4 pb-4 sm:px-5" />
      </Panel>

      <aside className="flex min-w-0 flex-col gap-4">
        {stack.length > 0 && (
          <Panel padding="sm">
            <StackReadout stack={stack} />
          </Panel>
        )}

        {note.tags.length > 0 && (
          <Panel padding="sm">
            <p className="font-terminal text-[10px] uppercase tracking-widest text-muted-foreground">
              tags
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <TerminalBadge key={tag} variant="default">
                  {tag}
                </TerminalBadge>
              ))}
            </div>
          </Panel>
        )}

        <Panel padding="sm">
          <p className="font-terminal text-[10px] text-muted-foreground">updated {note.updated}</p>
        </Panel>
      </aside>
    </div>
  );
}
