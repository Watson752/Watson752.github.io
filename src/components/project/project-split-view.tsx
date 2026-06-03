import { ProjectDocsPanel } from "@/components/project/project-docs-panel";
import { ProjectPreviewPane } from "@/components/project/project-preview-pane";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/portfolio";

export type ProjectSplitViewProps = {
  project: Project;
  className?: string;
};

export function ProjectSplitView({ project, className }: ProjectSplitViewProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border-subtle lg:shadow-panel",
        className,
      )}
    >
      <div className="min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-8rem)] lg:overflow-hidden lg:border-r lg:border-border-subtle">
        <ProjectPreviewPane
          project={project}
          className="lg:h-full lg:min-h-0"
        />
      </div>
      <div className="min-w-0 lg:max-h-[calc(100dvh-8rem)] lg:overflow-hidden">
        <ProjectDocsPanel project={project} className="lg:h-full" />
      </div>
    </div>
  );
}
