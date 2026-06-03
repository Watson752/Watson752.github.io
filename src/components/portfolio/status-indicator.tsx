import { cn } from "@/lib/utils";

export type SystemStatus = "online" | "idle" | "busy";

const statusConfig: Record<
  SystemStatus,
  { label: string; dot: string; text: string }
> = {
  online: {
    label: "system online",
    dot: "bg-success shadow-[0_0_8px_hsl(var(--success)/0.55)]",
    text: "text-success",
  },
  idle: {
    label: "system idle",
    dot: "bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.4)]",
    text: "text-warning",
  },
  busy: {
    label: "system busy",
    dot: "bg-accent-cyan shadow-[0_0_8px_hsl(var(--accent-cyan)/0.45)]",
    text: "text-accent-cyan",
  },
};

export type StatusIndicatorProps = {
  status: SystemStatus;
  className?: string;
  showLabel?: boolean;
};

export function StatusIndicator({
  status,
  className,
  showLabel = true,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "font-terminal inline-flex items-center gap-2 text-[11px]",
        className,
      )}
      role="status"
      aria-label={config.label}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", config.dot)}
        aria-hidden
      />
      {showLabel && (
        <span className={cn("hidden sm:inline", config.text)}>
          {config.label}
        </span>
      )}
    </span>
  );
}
