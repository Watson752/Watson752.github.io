import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/portfolio";

export type ProjectLinkBarProps = {
  project: Project;
  className?: string;
  variant?: "footer" | "inline";
};

type LinkItem = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

function buildLinks(project: Project): LinkItem[] {
  const items: LinkItem[] = [];

  const caseStudy =
    project.links.docs && project.links.docs !== "#"
      ? project.links.docs
      : `/projects/${project.slug}`;

  items.push({ id: "case-study", label: "case study", href: caseStudy });

  if (project.links.repo) {
    items.push({
      id: "github",
      label: "github",
      href: project.links.repo,
      external: true,
    });
  }

  if (project.links.demo && project.links.demo !== "#") {
    items.push({
      id: "demo",
      label: "live demo",
      href: project.links.demo,
      external: true,
    });
  }

  return items;
}

export function ProjectLinkBar({
  project,
  className,
  variant = "inline",
}: ProjectLinkBarProps) {
  const links = buildLinks(project);

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
          "hover:border-border hover:bg-surface hover:text-accent-cyan",
        );

        if (link.external) {
          return (
            <a
              key={link.id}
              href={link.href}
              className={classNames}
              target="_blank"
              rel="noopener noreferrer"
            >
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
