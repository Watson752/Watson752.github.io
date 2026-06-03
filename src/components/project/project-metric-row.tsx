import { cn } from "@/lib/utils";

export type ProjectMetricRowProps = {
  label: string;
  value: string;
  className?: string;
};

export function ProjectMetricRow({
  label,
  value,
  className,
}: ProjectMetricRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 border-b border-border-subtle py-2 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <span className="font-terminal text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="font-terminal break-anywhere text-[11px] text-foreground/90 sm:text-right">
        {value}
      </span>
    </div>
  );
}
