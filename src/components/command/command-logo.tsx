import { cn } from "@/lib/utils";

export type CommandLogoProps = {
  /** Real logo asset path, e.g. "/logo.svg" — swap in once available. */
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * Prompt-leading mark for the command input — a small icon badge, the same
 * layout pattern Claude Code's CLI uses. Renders a real logo once one
 * exists; until then, falls back to a generic (not Anthropic's) spark mark.
 */
export function CommandLogo({ src, alt = "", className }: CommandLogoProps) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        "border border-border-subtle bg-surface-elevated",
        className,
      )}
      aria-hidden
    >
      {src ? (
        <img src={src} alt={alt} className="size-3.5 object-contain" />
      ) : (
        <SparkGlyph className="size-3.5 text-foreground" />
      )}
    </span>
  );
}

function SparkGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2 L14.4 9.6 L22 12 L14.4 14.4 L12 22 L9.6 14.4 L2 12 L9.6 9.6 Z" />
    </svg>
  );
}
