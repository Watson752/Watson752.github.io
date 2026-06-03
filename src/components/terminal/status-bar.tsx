import { cn } from "@/lib/utils";

export type StatusBarItem = {
  id: string;
  label: string;
  value?: string;
  tone?: "default" | "accent" | "success" | "warning";
  /** Hide on viewports below `sm` */
  hideOnMobile?: boolean;
};

export type StatusBarProps = {
  className?: string;
  items?: StatusBarItem[];
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Top editor chrome vs bottom status strip */
  placement?: "top" | "bottom";
};

const toneClasses: Record<NonNullable<StatusBarItem["tone"]>, string> = {
  default: "text-muted-foreground",
  accent: "text-accent-cyan",
  success: "text-success",
  warning: "text-warning",
};

/**
 * VS Code–style bottom status strip — monospace readouts.
 */
export function StatusBar({
  className,
  items,
  left,
  right,
  placement = "bottom",
}: StatusBarProps) {
  const isTop = placement === "top";
  const Tag = isTop ? "header" : "footer";

  return (
    <Tag
      className={cn(
        "font-terminal flex w-full min-w-0 shrink-0 gap-2 border-border-subtle bg-titlebar text-[11px] leading-none tracking-wide",
        isTop
          ? "min-h-0 flex-col items-stretch border-b px-0 py-0 sm:min-h-8 sm:flex-row sm:items-center sm:px-3 sm:py-0"
          : "min-h-0 flex-wrap items-center border-t px-3 py-2 sm:h-7 sm:flex-nowrap sm:py-0",
        className,
      )}
      role="status"
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-3 overflow-hidden",
          isTop ? "border-b border-border-subtle px-3 py-2 sm:border-b-0 sm:py-0" : "gap-4",
        )}
      >
        {left}
        {items?.map((item) => (
          <span
            key={item.id}
            className={cn(
              "flex shrink-0 items-center gap-1.5",
              item.hideOnMobile && "hidden sm:flex",
            )}
          >
            <span className="text-titlebar-foreground">{item.label}</span>
            {item.value != null && (
              <span className={cn(toneClasses[item.tone ?? "default"])}>
                {item.value}
              </span>
            )}
          </span>
        ))}
      </div>
      {right && (
        <div
          className={cn(
            "flex min-w-0 items-center sm:shrink-0",
            isTop ? "px-3 pb-2 pt-0 sm:px-0 sm:pb-0 sm:pt-0" : "w-full sm:w-auto",
          )}
        >
          {right}
        </div>
      )}
    </Tag>
  );
}
