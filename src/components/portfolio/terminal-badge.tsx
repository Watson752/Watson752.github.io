import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const terminalBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-terminal text-[10px] uppercase tracking-[0.12em] leading-none",
  {
    variants: {
      variant: {
        default:
          "border-border-subtle bg-surface/80 text-muted-foreground",
        accent:
          "border-accent-cyan/20 bg-accent-cyan/6 text-accent-cyan",
        violet:
          "border-accent-violet/20 bg-accent-violet/6 text-accent-violet",
        muted:
          "border-border-subtle/60 bg-surface-inset text-titlebar-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type TerminalBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof terminalBadgeVariants>;

export function TerminalBadge({
  className,
  variant,
  ...props
}: TerminalBadgeProps) {
  return (
    <span
      className={cn(terminalBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}
