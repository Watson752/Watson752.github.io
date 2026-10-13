import path from "node:path";

export const DOMAIN_TAXONOMY = [
  "UI/UX",
  "Full Stack",
  "Data Analytics",
  "Hardware/Firmware",
  "Cloud",
  "AI/ML",
  "Leadership",
] as const;

export type Domain = (typeof DOMAIN_TAXONOMY)[number];

export const NOTE_TYPES = ["project", "note", "role"] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

export const PROJECT_STATUSES = [
  "shipped",
  "in-progress",
  "experiment",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/**
 * Path segments that are never eligible for export even if they somehow end
 * up under the public root — a second, independent gate alongside the
 * publish:true frontmatter flag (see vault/PUBLISHING.md).
 */
export const DENYLIST_SEGMENTS = [
  "private",
  "drafts",
  "draft",
  "personal",
  "journal",
];

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");

export const VAULT_ROOT = path.resolve(
  REPO_ROOT,
  process.env.VAULT_PATH ?? "vault",
);
export const PUBLIC_ROOT = path.join(VAULT_ROOT, "public");
export const ATTACHMENTS_ROOT = path.join(PUBLIC_ROOT, "attachments");

export const OUTPUT_DIR = path.join(REPO_ROOT, "src", "data", "generated");
export const SITE_ATTACHMENTS_DIR = path.join(
  REPO_ROOT,
  "public",
  "vault-attachments",
);
export const DIAGRAMS_DIR = path.join(SITE_ATTACHMENTS_DIR, "diagrams");
/**
 * Hand-exported GitDiagram pictures, named {slug}.png — preferred over the auto
 * summary card. Lives in the repo (not the gitignored vault) so it's versioned.
 */
export const DIAGRAM_SOURCES_DIR = path.join(REPO_ROOT, "content", "diagrams");
