import { TerminalBadge } from "@/components/portfolio/terminal-badge";
import { cn } from "@/lib/utils";

export type StackReadoutProps = {
  stack: string[];
  className?: string;
};

export function StackReadout({ stack, className }: StackReadoutProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="font-terminal text-[10px] uppercase tracking-widest text-muted-foreground">
        stack.readout
      </p>
      <ul className="space-y-1.5" role="list">
        {stack.map((item, index) => (
          <li
            key={item}
            className="font-terminal flex items-center gap-2 text-[11px] text-foreground/90"
          >
            <span className="text-accent-cyan/70">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {stack.map((item) => (
          <TerminalBadge key={item} variant="default">
            {item}
          </TerminalBadge>
        ))}
      </div>
    </div>
  );
}
