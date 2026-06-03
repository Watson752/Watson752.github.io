import { ProjectEvidencePanel } from "@/components/portfolio/project-evidence-panel";
import {
  getProjectMatchReason,
  hasEvidenceSelection,
  sortProjectsForEvidence,
} from "@/lib/project-evidence";
import { cn } from "@/lib/utils";
import type { DomainCategory, Project } from "@/types/portfolio";

export type ProjectEvidenceGridProps = {
  projects: Project[];
  activeProjectIds: string[];
  activeDomains: DomainCategory[];
  query: string;
  className?: string;
};

export function ProjectEvidenceGrid({
  projects,
  activeProjectIds,
  activeDomains,
  query,
  className,
}: ProjectEvidenceGridProps) {
  const hasSelection = hasEvidenceSelection(
    query,
    activeProjectIds,
    activeDomains,
  );

  const ranked = sortProjectsForEvidence(
    projects,
    activeProjectIds,
    activeDomains,
    hasSelection,
  );

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-4 lg:grid-cols-3",
        className,
      )}
      role="list"
    >
      {ranked.map(({ project, state, rank }) => (
        <ProjectEvidencePanel
          key={project.id}
          project={project}
          visualState={state}
          rank={rank}
          matchReason={getProjectMatchReason(project, {
            query,
            activeProjectIds,
            activeDomains,
            hasSelection,
          })}
        />
      ))}
    </div>
  );
}
