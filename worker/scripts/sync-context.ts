import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { experiences, siteProfile } from "../../src/data/site";

const here = path.dirname(fileURLToPath(import.meta.url));
const notesPath = path.resolve(here, "../../src/data/generated/notes.json");
const outPath = path.resolve(here, "../src/context.json");

type SourceNote = {
  title: string;
  type: "project" | "note" | "role";
  domains: string[];
  tags: string[];
  summary: string;
  html?: string;
  stack?: string[];
  status?: string;
  externalLinks?: Record<string, string>;
  org?: string;
  dates?: string;
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
};

/** Flatten rendered note HTML into compact plain text the model can read. */
function htmlToText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, "")
    .replace(/<h[1-6][^>]*>/gi, "\n## ")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|h[1-6]|li|ul|ol|pre|blockquote|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#?\w+);/g, (match, name: string) => {
      if (name in ENTITIES) return ENTITIES[name];
      if (name.startsWith("#")) {
        const code = name[1] === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
        return Number.isNaN(code) ? match : String.fromCodePoint(code);
      }
      return match;
    })
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function trimNote(note: SourceNote) {
  const trimmed: Record<string, unknown> = {
    title: note.title,
    type: note.type,
    domains: note.domains,
    tags: note.tags,
    summary: note.summary,
  };
  if (note.stack) trimmed.stack = note.stack;
  if (note.status) trimmed.status = note.status;
  if (note.externalLinks) trimmed.externalLinks = note.externalLinks;
  if (note.org) trimmed.org = note.org;
  if (note.dates) trimmed.dates = note.dates;
  if (note.html) trimmed.body = htmlToText(note.html);
  return trimmed;
}

function main() {
  if (!fs.existsSync(notesPath)) {
    console.error(
      `notes.json not found at ${notesPath} — run "npm run export:vault" in the repo root first.`,
    );
    process.exit(1);
  }

  const notes: SourceNote[] = JSON.parse(fs.readFileSync(notesPath, "utf8"));

  const context = {
    name: siteProfile.name,
    role: siteProfile.role,
    quote: siteProfile.quote,
    availability: siteProfile.availability,
    experience: experiences.map(({ title, org, employmentType, start, end, location, mode, skills, highlights }) => ({
      title,
      org,
      employmentType,
      start,
      end,
      location,
      mode,
      skills,
      highlights,
    })),
    notes: notes.map(trimNote),
  };

  const serialized = JSON.stringify(context, null, 2) + "\n";
  fs.writeFileSync(outPath, serialized);
  console.log(
    `wrote ${notes.length} note(s) and ${experiences.length} role(s) to ${path.relative(process.cwd(), outPath)} ` +
      `(~${Math.round(serialized.length / 4).toLocaleString()} tokens)`,
  );
}

main();
