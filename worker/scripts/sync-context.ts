import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteProfile } from "../../src/data/site";

const here = path.dirname(fileURLToPath(import.meta.url));
const notesPath = path.resolve(here, "../../src/data/generated/notes.json");
const outPath = path.resolve(here, "../src/context.json");

type SourceNote = {
  title: string;
  type: "project" | "note" | "role";
  domains: string[];
  tags: string[];
  summary: string;
  stack?: string[];
  status?: string;
  externalLinks?: Record<string, string>;
  org?: string;
  dates?: string;
};

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
    notes: notes.map(trimNote),
  };

  fs.writeFileSync(outPath, JSON.stringify(context, null, 2) + "\n");
  console.log(`wrote ${notes.length} note(s) to ${path.relative(process.cwd(), outPath)}`);
}

main();
