"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StatusIndicator, type SystemStatus } from "@/components/portfolio/status-indicator";
import { ThemeToggle } from "@/components/portfolio/theme-toggle";
import { cn } from "@/lib/utils";

export type SiteDockProps = {
  name: string;
  status: SystemStatus;
  nav: { label: string; href: string }[];
  className?: string;
};

function isExternal(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function SiteDock({ name, status, nav, className }: SiteDockProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "font-terminal fixed inset-x-0 bottom-3 z-40 flex justify-center px-3",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-titlebar/95 px-2 py-1.5 shadow-elevated backdrop-blur-sm">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] text-foreground"
        >
          <StatusIndicator status={status} showLabel={false} />
          {name}
        </Link>
        <span className="text-border" aria-hidden>
          |
        </span>
        {nav.map((item) => {
          const active = !isExternal(item.href) && pathname === item.href;
          const linkClass = cn(
            "touch-target inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[11px] transition-colors",
            active
              ? "bg-surface-elevated text-foreground"
              : "text-muted-foreground hover:text-foreground",
          );

          if (isExternal(item.href)) {
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={linkClass}
              >
                {item.label}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          );
        })}
        <span className="text-border" aria-hidden>
          |
        </span>
        <ThemeToggle />
      </div>
    </nav>
  );
}
