import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/portfolio";

export type ProjectLinkBarProps = {
  project: Note;
  className?: string;
  variant?: "footer" | "inline";
};

type LinkItem = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

function buildLinks(project: Note): LinkItem[] {
  const items: LinkItem[] = [];

  if (project.externalLinks?.repo) {
    items.push({ id: "github", label: "github", href: project.externalLinks.repo, external: true });
  }

  if (project.externalLinks?.demo) {
    items.push({ id: "demo", label: "live demo", href: project.externalLinks.demo, external: true });
  }

  if (project.externalLinks?.docs) {
    items.push({ id: "docs", label: "docs", href: project.externalLinks.docs, external: true });
  }

  return items;
}

export function ProjectLinkBar({ project, className, variant = "inline" }: ProjectLinkBarProps) {
  const links = buildLinks(project);
  if (links.length === 0) return null;

  return (
    <nav
      className={cn(
        "flex flex-wrap gap-2",
        variant === "footer" && "border-t border-border-subtle pt-3",
        className,
      )}
      aria-label="Project links"
    >
      {links.map((link) => {
        const classNames = cn(
          "touch-target font-terminal inline-flex items-center gap-1 rounded border border-border-subtle px-3 py-2 text-[10px] text-muted-foreground transition-colors sm:px-2.5 sm:py-1",
          "hover:border-border hover:bg-surface hover:text-foreground",
        );

        if (link.external) {
          return (
            <a key={link.id} href={link.href} className={classNames} target="_blank" rel="noopener noreferrer">
              {link.label}
              <ExternalLink className="size-2.5" strokeWidth={1.75} />
            </a>
          );
        }

        return (
          <Link key={link.id} href={link.href} className={classNames}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
