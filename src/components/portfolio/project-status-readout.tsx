import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/portfolio";

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  shipped: {
    label: "shipped",
    className: "border-success/30 bg-success/10 text-success",
  },
  "in-progress": {
    label: "in-progress",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  experiment: {
    label: "experiment",
    className: "border-border bg-surface-elevated text-foreground/75",
  },
  archived: {
    label: "archived",
    className: "border-border-subtle bg-surface text-muted-foreground",
  },
};

export function ProjectStatusReadout({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "font-terminal rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
