import { ExternalLink, Github, Linkedin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type ContactLink = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  external: boolean;
  disabled?: boolean;
};

const LINKS: ContactLink[] = [
  {
    id: "github",
    label: "github.com/Watson752",
    href: "https://github.com/Watson752",
    icon: Github,
    external: true,
  },
  {
    id: "email",
    label: "watson.cu.28@gmail.com",
    href: "mailto:watson.cu.28@gmail.com",
    icon: Mail,
    external: false,
  },
  {
    id: "linkedin",
    label: "linkedin",
    href: "https://www.linkedin.com/in/srivathsan-murali/",
    icon: Linkedin,
    external: true,
  },
];

export function ContactLinks({ className }: { className?: string }) {
  return (
    <nav
      className={cn("flex flex-wrap gap-2", className)}
      aria-label="Contact links"
    >
      {LINKS.map((link) => {
        const Icon = link.icon;
        const classNames = cn(
          "touch-target font-terminal inline-flex items-center gap-2 rounded border border-border-subtle px-3 py-2 text-[11px] text-muted-foreground transition-colors sm:px-3 sm:py-1.5",
          link.disabled
            ? "pointer-events-none opacity-40"
            : "hover:border-border hover:bg-surface hover:text-foreground",
        );

        return (
          <a
            key={link.id}
            href={link.href}
            className={classNames}
            aria-disabled={link.disabled}
            {...(link.external && !link.disabled
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <Icon className="size-3" strokeWidth={1.75} />
            {link.label}
            {link.external && !link.disabled && (
              <ExternalLink className="size-2.5" strokeWidth={1.75} />
            )}
          </a>
        );
      })}
    </nav>
  );
}
