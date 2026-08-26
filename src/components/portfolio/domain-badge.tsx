import { getDomainStyle } from "@/lib/domain-colors";
import { cn } from "@/lib/utils";
import type { DomainCategory } from "@/types/portfolio";

export type DomainBadgeProps = {
  domain: DomainCategory;
  className?: string;
};

export function DomainBadge({ domain, className }: DomainBadgeProps) {
  const style = getDomainStyle(domain);
  return (
    <span
      className={cn(
        "font-terminal inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] leading-none",
        style.border,
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />
      {domain}
    </span>
  );
}
