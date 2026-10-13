import { cn } from "@/lib/utils";
import { NeonFlow } from "@/components/background/neon-flow";

export type TerminalBackdropProps = {
  className?: string;
  children?: React.ReactNode;
  /** Draw the neon snake that flows down the page; "intro" waits for the intro splash first. */
  flow?: boolean | "intro";
};

/**
 * Near-black base with a faint grid — no glow.
 */
export function TerminalBackdrop({ className, children, flow = false }: TerminalBackdropProps) {
  return (
    <div
      className={cn(
        "relative min-h-dvh w-full max-w-[100vw] overflow-x-hidden bg-terminal-grid",
        className,
      )}
      aria-hidden={children ? undefined : true}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-background/40"
        aria-hidden
      />
      {flow && <NeonFlow waitForIntro={flow === "intro"} />}
      {children && (
        <div className="relative z-0 min-w-0 w-full max-w-full">{children}</div>
      )}
    </div>
  );
}
