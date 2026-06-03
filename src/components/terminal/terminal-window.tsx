import { cn } from "@/lib/utils";
import { Panel } from "@/components/terminal/panel";

export type TerminalWindowProps = {
  className?: string;
  children: React.ReactNode;
  title?: string;
  /** Path or tab label in titlebar */
  path?: string;
  actions?: React.ReactNode;
  active?: boolean;
};

/**
 * Window chrome with titlebar — Warp/Raycast-adjacent, not macOS skeuomorphism.
 */
export function TerminalWindow({
  className,
  children,
  title = "terminal",
  path,
  actions,
  active = true,
}: TerminalWindowProps) {
  return (
    <Panel
      padding="none"
      variant="elevated"
      className={cn(
        "overflow-hidden",
        active && "ring-1 ring-border-subtle",
        className,
      )}
    >
      <div className="flex h-8 items-center justify-between gap-3 border-b border-border-subtle bg-titlebar px-3">
        <div className="flex min-w-0 items-center gap-3">
          <WindowDots />
          <div className="font-terminal flex min-w-0 items-center gap-2 truncate text-[11px] text-titlebar-foreground">
            <span className="text-foreground/80">{title}</span>
            {path && (
              <>
                <span className="text-border" aria-hidden>
                  /
                </span>
                <span className="truncate text-muted-foreground">{path}</span>
              </>
            )}
          </div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="min-h-0">{children}</div>
    </Panel>
  );
}

function WindowDots() {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-hidden
    >
      <span className="size-2 rounded-full bg-border" />
      <span className="size-2 rounded-full bg-border-subtle" />
      <span className="size-2 rounded-full bg-border-subtle" />
    </div>
  );
}
