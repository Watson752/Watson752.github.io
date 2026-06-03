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
}: SectionShellProps) {
  const hasHeader = title ?? description ?? kicker ?? actions;

  return (
    <section
      id={id}
      className={cn(
        "flex min-w-0 flex-col gap-4 border-t border-border-subtle/80 pt-6 sm:gap-5 sm:pt-8",
        className,
      )}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            {kicker && <p className="text-kicker">{kicker}</p>}
            {title && (
              <h2 className="text-[15px] font-medium tracking-tight text-foreground">
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
      {children}
    </section>
  );
}
