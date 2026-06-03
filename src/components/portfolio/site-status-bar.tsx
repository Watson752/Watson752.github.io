import Link from "next/link";
import { StatusBar } from "@/components/terminal/status-bar";
import {
  StatusIndicator,
  type SystemStatus,
} from "@/components/portfolio/status-indicator";
import { cn } from "@/lib/utils";

export type SiteStatusBarProps = {
  name: string;
  role: string;
  status: SystemStatus;
  nav: { label: string; href: string }[];
  className?: string;
};

const navLinkClass = cn(
  "touch-target font-terminal inline-flex shrink-0 items-center justify-center rounded px-3 py-2 text-[11px] text-titlebar-foreground transition-colors",
  "hover:bg-surface hover:text-accent-cyan active:bg-surface-elevated",
);

export function SiteStatusBar({
  name,
  role,
  status,
  nav,
  className,
}: SiteStatusBarProps) {
  return (
    <StatusBar
      placement="top"
      className={className}
      left={
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <span className="truncate text-foreground sm:max-w-none">{name}</span>
          <span className="hidden text-border sm:inline" aria-hidden>
            |
          </span>
          <span className="hidden truncate text-muted-foreground md:inline">
            {role}
          </span>
        </div>
      }
      right={
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:gap-3">
          <StatusIndicator status={status} className="shrink-0" />
          <nav
            className="scrollbar-terminal -mr-3 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain pr-3 sm:mr-0 sm:gap-1 sm:pr-0"
            aria-label="Primary"
          >
            {nav.map((item) => {
              const isExternal =
                item.href.startsWith("http") ||
                item.href.startsWith("mailto:");

              if (isExternal) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={navLinkClass}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link key={item.label} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      }
    />
  );
}
