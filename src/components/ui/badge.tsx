import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2 py-0.5 font-terminal text-[10px] uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-border-subtle bg-surface text-muted-foreground",
        accent:
          "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
        violet:
          "border-accent-violet/30 bg-accent-violet/10 text-accent-violet",
        success:
          "border-success/30 bg-success/10 text-success",
        warning:
          "border-warning/30 bg-warning/10 text-warning",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
