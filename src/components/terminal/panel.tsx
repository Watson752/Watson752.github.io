import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const panelVariants = cva(
  "border-terminal rounded-md border bg-surface text-foreground transition-[border-color,box-shadow] duration-200",
  {
    variants: {
      variant: {
        default: "shadow-panel",
        inset:
          "border-border-subtle/90 bg-surface-inset shadow-[inset_0_1px_0_0_hsl(var(--highlight-top))]",
        elevated: "bg-surface-elevated shadow-elevated",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      padding: {
        none: "p-0",
        sm: "p-3.5",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export type PanelProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof panelVariants>;

/**
 * Primary surface container — editor panel, not a generic card.
 */
export function Panel({
  className,
  variant,
  padding,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(panelVariants({ variant, padding }), className)}
      {...props}
    />
  );
}
