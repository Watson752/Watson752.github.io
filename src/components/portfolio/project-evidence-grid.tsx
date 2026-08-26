import { ProjectEvidencePanel } from "@/components/portfolio/project-evidence-panel";
import {
  getProjectMatchReason,
  hasEvidenceSelection,
  sortProjectsForEvidence,
} from "@/lib/project-evidence";
import { cn } from "@/lib/utils";
import type { DomainCategory, Note } from "@/types/portfolio";

export type ProjectEvidenceGridProps = {
  projects: Note[];
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
  const hasSelection = hasEvidenceSelection(query, activeProjectIds, activeDomains);

  const ranked = sortProjectsForEvidence(projects, activeProjectIds, activeDomains, hasSelection);

  if (projects.length === 0) {
    return (
      <div className={cn("state-empty", className)}>
        <p className="font-terminal mb-1.5 text-[10px] text-foreground/70">
          no published notes yet
        </p>
        <p>
          Write a project note in <code>vault/public/projects/</code> with{" "}
          <code>publish: true</code>, then run <code>npm run export:vault</code>.
        </p>
      </div>
    );
  }

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
