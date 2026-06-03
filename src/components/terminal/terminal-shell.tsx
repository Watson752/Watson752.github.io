import { cn } from "@/lib/utils";
import { TerminalBackdrop } from "@/components/background/terminal-backdrop";

export type TerminalShellProps = {
  className?: string;
  children: React.ReactNode;
  /** Optional slot above main content (e.g. future command bar) */
  header?: React.ReactNode;
  /** Optional bottom status region */
  footer?: React.ReactNode;
};

/**
 * Root editor/terminal chrome — full viewport shell with backdrop.
 */
export function TerminalShell({
  className,
  children,
  header,
  footer,
}: TerminalShellProps) {
  return (
    <TerminalBackdrop className="flex flex-col">
      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-dvh w-full min-w-0 max-w-[1600px] flex-col overflow-x-hidden px-3 py-2 sm:px-5 sm:py-3 lg:px-6",
          "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
          className,
        )}
      >
        {header}
        <main className="flex min-w-0 flex-1 flex-col gap-5 overflow-x-hidden sm:gap-6">
          {children}
        </main>
        {footer}
      </div>
    </TerminalBackdrop>
  );
}
