import { cn } from "@/lib/utils";

export type SectionShellProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Monospace label shown in the section chrome */
  kicker?: string;
  actions?: React.ReactNode;
  /** Full-viewport landing panel: min one screen tall, snap target, reveal-on-scroll. */
  panel?: boolean;
  /** Panel only — whether the section has scrolled into view (triggers the reveal). */
  visible?: boolean;
  /** Panel only — the section currently in focus; the others recede slightly. */
  active?: boolean;
  /** Panel only — scale the content up 25% on laptop/desktop screens (see `.section-enlarge`). */
  enlarge?: boolean;
};

/**
 * Vertical section wrapper with optional editor-style header.
 */
export function SectionShell({
  id,
  className,
  children,
  title,
  description,
  kicker,
  actions,
  panel = false,
  visible = false,
  active = false,
  enlarge = false,
}: SectionShellProps) {
  const hasHeader = title ?? description ?? kicker ?? actions;

  return (
    <section
      id={id}
      data-visible={panel ? visible : undefined}
      data-active={panel ? active : undefined}
      className={cn(
        "flex min-w-0 flex-col gap-4 sm:gap-5",
        panel
          ? cn(
              "section-reveal min-h-dvh snap-start justify-center pt-16 pr-8 pb-28 sm:pr-12 sm:pb-24 lg:pr-16",
              enlarge && "section-enlarge",
            )
          : "border-t border-border-subtle/80 pt-6 sm:pt-8",
        className,
      )}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="min-w-0 space-y-1.5">
            {kicker && <p className="text-kicker">{kicker}</p>}
            {title && (
              <h2 className="text-xl font-medium tracking-[-0.02em] text-foreground sm:text-2xl md:text-[1.75rem] md:leading-[1.2]">
                {title}
              </h2>
            )}
            {description && (
              <p className="max-w-prose break-anywhere text-prose">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      {panel ? (
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5" style={{ "--i": 1 } as React.CSSProperties}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
