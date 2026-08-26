import { siteProfile } from "@/data/site";

export type CommandAction =
  | { kind: "scroll"; targetHref: string }
  | { kind: "open"; href: string }
  | { kind: "help" }
  | { kind: "placeholder"; message: string };

export type CommandDefinition = {
  /** Without the leading slash, e.g. "help" not "/help". */
  name: string;
  description: string;
  action: CommandAction;
};

function navHref(label: string): string {
  const item = siteProfile.nav.find((entry) => entry.label === label);
  if (!item) {
    throw new Error(`commands.ts: no siteProfile.nav entry labeled "${label}"`);
  }
  return item.href;
}

export const COMMANDS: CommandDefinition[] = [
  {
    name: "help",
    description: "List available commands",
    action: { kind: "help" },
  },
  {
    name: "projects",
    description: "Jump to project evidence",
    action: { kind: "scroll", targetHref: navHref("projects") },
  },
  {
    name: "graph",
    description: "Jump to the domain graph",
    // Not sourced from siteProfile.nav — "domains" isn't a dock nav item.
    action: { kind: "scroll", targetHref: "#graph" },
  },
  {
    name: "resume",
    description: "View résumé (coming soon)",
    action: { kind: "placeholder", message: "Resume link coming soon." },
  },
  {
    name: "contact",
    description: "Open email client",
    action: { kind: "open", href: navHref("contact") },
  },
];

export function findCommand(name: string): CommandDefinition | undefined {
  return COMMANDS.find((command) => command.name === name.toLowerCase());
}

/** Commands whose name starts with the given (slash-stripped) prefix. */
export function filterCommands(prefix: string): CommandDefinition[] {
  const normalized = prefix.toLowerCase();
  if (!normalized) return COMMANDS;
  return COMMANDS.filter((command) => command.name.startsWith(normalized));
}

export type ParsedSlashCommand = {
  name: string;
  args: string;
};

/** Parses "/name rest of input" from raw text starting with "/". Returns null if not a slash command. */
export function parseSlashCommand(rawInput: string): ParsedSlashCommand | null {
  const trimmed = rawInput.trim();
  if (!trimmed.startsWith("/")) return null;
  const withoutSlash = trimmed.slice(1);
  const [name, ...rest] = withoutSlash.split(/\s+/);
  return { name: (name ?? "").toLowerCase(), args: rest.join(" ") };
}
