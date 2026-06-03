import { Panel } from "@/components/terminal/panel";
import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/portfolio";

export type ProjectPreviewPaneProps = {
  project: Project;
  className?: string;
};

function PreviewPlaceholder({ project }: { project: Project }) {
  const lines = [
    `preview :: ${project.previewType}`,
    `slug     :: ${project.slug}`,
    `status   :: ${project.status}`,
    `domains  :: ${project.domains.join(" | ")}`,
  ];

  return (
    <div className="flex h-full min-h-[200px] flex-col justify-center gap-2 p-4 font-terminal text-[11px] leading-relaxed text-muted-foreground sm:min-h-[280px] sm:p-6 lg:min-h-[480px]">
      {lines.map((line) => (
        <p key={line}>
          <span className="text-accent-cyan">›</span> {line}
        </p>
      ))}
      <p className="mt-4 text-[10px] text-titlebar-foreground">
        Attach previewImage, demo URL, or iframe src in projects.ts
      </p>
    </div>
  );
}

export function ProjectPreviewPane({
  project,
  className,
}: ProjectPreviewPaneProps) {
  const showImage =
    project.previewType === "image" && project.previewImage != null;
  const showIframe = project.previewType === "iframe";

  return (
    <Panel
      padding="none"
      variant="inset"
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <div className="titlebar-chrome flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5">
        <TerminalBadge variant="accent">preview.pane</TerminalBadge>
        <span className="font-terminal text-[10px] text-muted-foreground">
          {project.previewType}
        </span>
      </div>

      <div className="relative flex-1 bg-surface-inset">
        {showImage ? (
          <div
            className="flex h-full min-h-[200px] items-center justify-center bg-[linear-gradient(135deg,hsl(var(--surface))_0%,hsl(var(--surface-inset))_100%)] sm:min-h-[280px] lg:min-h-[480px]"
            role="img"
            aria-label={`${project.title} preview`}
          >
            <div className="text-center">
              <p className="font-terminal text-[10px] text-muted-foreground">
                screenshot / {project.previewImage}
              </p>
              <p className="mt-2 text-sm text-foreground/80">{project.title}</p>
            </div>
          </div>
        ) : showIframe ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 p-4 sm:min-h-[280px] sm:p-6 lg:min-h-[480px]">
            <p className="font-terminal text-[11px] text-muted-foreground">
              live demo embed region
            </p>
            {project.links.demo && project.links.demo !== "#" ? (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="font-terminal text-xs text-accent-cyan hover:underline"
              >
                open demo →
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">
                Set links.demo in projects.ts
              </p>
            )}
          </div>
        ) : (
          <PreviewPlaceholder project={project} />
        )}
      </div>
    </Panel>
  );
}
