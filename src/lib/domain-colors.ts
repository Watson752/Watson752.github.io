import type { DomainCategory } from "@/types/portfolio";

export type DomainStyle = {
  text: string;
  bg: string;
  border: string;
  dot: string;
  fill: string;
  stroke: string;
  hex: string;
};

/**
 * One fixed, muted color per domain (vault/PUBLISHING.md taxonomy). Deliberately a
 * lookup of literal Tailwind class names — never construct `domain-${slug}` at
 * runtime, or Tailwind's compiler won't see the class and will drop it.
 */
export const DOMAIN_STYLES: Record<DomainCategory, DomainStyle> = {
  "UI/UX": {
    text: "text-domain-ui-ux",
    bg: "bg-domain-ui-ux/10",
    border: "border-domain-ui-ux/35",
    dot: "bg-domain-ui-ux",
    fill: "fill-domain-ui-ux",
    stroke: "stroke-domain-ui-ux",
    hex: "#c98098",
  },
  "Full Stack": {
    text: "text-domain-full-stack",
    bg: "bg-domain-full-stack/10",
    border: "border-domain-full-stack/35",
    dot: "bg-domain-full-stack",
    fill: "fill-domain-full-stack",
    stroke: "stroke-domain-full-stack",
    hex: "#7ba3cc",
  },
  "Data Analytics": {
    text: "text-domain-data-analytics",
    bg: "bg-domain-data-analytics/10",
    border: "border-domain-data-analytics/35",
    dot: "bg-domain-data-analytics",
    fill: "fill-domain-data-analytics",
    stroke: "stroke-domain-data-analytics",
    hex: "#6cb89b",
  },
  Cloud: {
    text: "text-domain-cloud",
    bg: "bg-domain-cloud/10",
    border: "border-domain-cloud/35",
    dot: "bg-domain-cloud",
    fill: "fill-domain-cloud",
    stroke: "stroke-domain-cloud",
    hex: "#6ba9bd",
  },
  "AI/ML": {
    text: "text-domain-ai-ml",
    bg: "bg-domain-ai-ml/10",
    border: "border-domain-ai-ml/35",
    dot: "bg-domain-ai-ml",
    fill: "fill-domain-ai-ml",
    stroke: "stroke-domain-ai-ml",
    hex: "#a48fce",
  },
};

export function getDomainStyle(domain: DomainCategory): DomainStyle {
  return DOMAIN_STYLES[domain];
}

export const ALL_DOMAINS = Object.keys(DOMAIN_STYLES) as DomainCategory[];
