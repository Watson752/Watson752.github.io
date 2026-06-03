import { cn } from "@/lib/utils";
import type { ProjectDocSectionId } from "@/types/portfolio";

export type DocSectionProps = {
  id: ProjectDocSectionId;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function DocSection({ id, title, children, className }: DocSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 border-b border-border-subtle/70 pb-7 last:border-0 sm:scroll-mt-24 sm:pb-8",
        className,
      )}
    >
      <h2 className="mb-3.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-kicker">{id}</span>
        <span className="text-[15px] font-medium tracking-tight text-foreground">
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}
