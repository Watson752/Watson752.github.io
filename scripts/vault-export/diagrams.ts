import fs from "node:fs";
import path from "node:path";
import { DIAGRAM_SOURCES_DIR, DIAGRAMS_DIR, SITE_ATTACHMENTS_DIR } from "./config";

/**
 * Puts each project's GitDiagram architecture picture into
 * public/vault-attachments/diagrams so the case study page can show it
 * without hotlinking. Only public GitHub repos are eligible.
 *
 * Sources, in order of preference:
 *   1. content/diagrams/{slug}.png — a full diagram exported
 *      by hand from gitdiagram.com (richer than the summary card)
 *   2. gitdiagram.com/{owner}/{repo}/diagram.png — the auto-generated summary
 *      card, which only exists for public repos with a generated diagram
 *
 * Network failures fall back to whatever image is already on disk, so an
 * offline export never drops a diagram. `offline: true` (used by watch mode)
 * skips the network entirely.
 */

export type ProjectDiagram = {
  /** Site-relative path to the saved image */
  src: string;
  /** Interactive diagram on gitdiagram.com */
  href: string;
  width: number;
  height: number;
};

export type DiagramResult =
  | { status: "saved"; diagram: ProjectDiagram }
  | { status: "cached"; diagram: ProjectDiagram }
  | { status: "private" }
  | { status: "not-generated"; href: string }
  | { status: "no-repo" };

const GITHUB_REPO_PATTERN = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i;
const REQUEST_TIMEOUT_MS = 15_000;

function parseRepo(repoUrl: string | undefined): { owner: string; repo: string } | null {
  const match = repoUrl?.match(GITHUB_REPO_PATTERN);
  if (!match) return null;
  return { owner: match[1].toLowerCase(), repo: match[2].toLowerCase() };
}

function diagramFile(slug: string): string {
  return path.join(DIAGRAMS_DIR, `${slug}.png`);
}

/** Width/height straight from the PNG IHDR chunk, so the page can reserve space without layout shift. */
function pngSize(filePath: string): { width: number; height: number } {
  const header = Buffer.alloc(24);
  const fd = fs.openSync(filePath, "r");
  try {
    fs.readSync(fd, header, 0, 24, 0);
  } finally {
    fs.closeSync(fd);
  }
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

function toDiagram(slug: string, href: string): ProjectDiagram {
  const file = diagramFile(slug);
  const relative = path.relative(path.dirname(SITE_ATTACHMENTS_DIR), file);
  return { src: `/${relative.split(path.sep).join("/")}`, href, ...pngSize(file) };
}

function removeStale(slug: string): void {
  fs.rmSync(diagramFile(slug), { force: true });
}

function cachedOr(slug: string, href: string, fallback: DiagramResult): DiagramResult {
  return fs.existsSync(diagramFile(slug))
    ? { status: "cached", diagram: toDiagram(slug, href) }
    : fallback;
}

/** Copies a hand-exported diagram from content/diagrams, if there is one. */
function useLocalDiagram(slug: string, href: string): DiagramResult | null {
  const source = path.join(DIAGRAM_SOURCES_DIR, `${slug}.png`);
  if (!fs.existsSync(source)) return null;
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
  fs.copyFileSync(source, diagramFile(slug));
  return { status: "saved", diagram: toDiagram(slug, href) };
}

export async function syncProjectDiagram(
  slug: string,
  repoUrl: string | undefined,
  options: { offline: boolean },
): Promise<DiagramResult> {
  const parsed = parseRepo(repoUrl);
  if (!parsed) {
    removeStale(slug);
    return { status: "no-repo" };
  }

  const href = `https://gitdiagram.com/${parsed.owner}/${parsed.repo}`;
  const notGenerated: DiagramResult = { status: "not-generated", href };
  if (options.offline) return useLocalDiagram(slug, href) ?? cachedOr(slug, href, notGenerated);

  try {
    // Unauthenticated on purpose: a private repo returns 404 here.
    const github = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "portfolio-vault-export" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (github.status === 404) {
      removeStale(slug);
      return { status: "private" };
    }

    const fromLocal = useLocalDiagram(slug, href);
    if (fromLocal) return fromLocal;

    // Rate limits and outages shouldn't wipe a diagram we already have.
    if (!github.ok) return cachedOr(slug, href, notGenerated);

    const picture = await fetch(`${href}/diagram.png`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (picture.status === 404) {
      removeStale(slug);
      return notGenerated;
    }
    if (!picture.ok || !picture.headers.get("content-type")?.startsWith("image/png")) {
      return cachedOr(slug, href, notGenerated);
    }

    fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
    fs.writeFileSync(diagramFile(slug), Buffer.from(await picture.arrayBuffer()));
    return { status: "saved", diagram: toDiagram(slug, href) };
  } catch {
    return useLocalDiagram(slug, href) ?? cachedOr(slug, href, notGenerated);
  }
}
