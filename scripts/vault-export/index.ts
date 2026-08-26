import fs from "node:fs";
import path from "node:path";
import { DENYLIST_SEGMENTS, PUBLIC_ROOT, VAULT_ROOT, type Domain } from "./config";
import { readCandidate, validateCandidate, type ValidatedFrontmatter } from "./frontmatter";
import { deriveSummary, renderMarkdownToHtml, resolveWikilinks, type SlugTarget } from "./markdown";
import { buildGraph, type GraphSourceNote } from "./graph";
import { writeJson } from "./write-output";

type PublishedCandidate = {
  filePath: string;
  relPath: string;
  frontmatter: ValidatedFrontmatter;
  body: string;
};

/** Never follows symlinks — a directory walk that could escape vault/public via a symlink is exactly the kind of bug the folder allowlist exists to prevent. */
function walkMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

function isDenylisted(relPath: string): boolean {
  const segments = relPath.toLowerCase().split(path.sep);
  return segments.some((segment) => DENYLIST_SEGMENTS.includes(segment));
}

async function main() {
  const generatedAt = new Date().toISOString();
  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(message);

  if (!fs.existsSync(PUBLIC_ROOT)) {
    console.error(`vault/public not found at ${path.relative(process.cwd(), PUBLIC_ROOT)} — nothing to export.`);
    process.exit(1);
  }

  const allFiles = walkMarkdownFiles(PUBLIC_ROOT).sort();

  let skippedPrivateCount = 0;
  let skippedDenylistCount = 0;
  const validationErrors: string[] = [];
  const slugOwners = new Map<string, string>();
  const published: PublishedCandidate[] = [];

  for (const filePath of allFiles) {
    const relPath = path.relative(PUBLIC_ROOT, filePath);

    // Defense in depth: the walk itself can't escape vault/public (no symlink
    // following), but assert it anyway so a future refactor fails loudly
    // instead of silently widening the export surface.
    if (relPath.startsWith("..") || path.isAbsolute(relPath)) {
      throw new Error(`refusing to export a file outside vault/public: ${filePath}`);
    }

    if (isDenylisted(relPath)) {
      skippedDenylistCount += 1;
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");
    const candidate = readCandidate(path.join("vault", "public", relPath), source);

    if (candidate.rawData.publish !== true) {
      skippedPrivateCount += 1;
      continue;
    }

    const result = validateCandidate(candidate);
    if (!result.ok) {
      validationErrors.push(...result.errors);
      continue;
    }

    const existingOwner = slugOwners.get(result.frontmatter.slug);
    if (existingOwner) {
      validationErrors.push(
        `${relPath}: slug "${result.frontmatter.slug}" is already used by ${existingOwner}`,
      );
      continue;
    }
    slugOwners.set(result.frontmatter.slug, relPath);

    published.push({ filePath, relPath, frontmatter: result.frontmatter, body: result.body });
  }

  if (validationErrors.length > 0) {
    console.error(`\nvault export failed — ${validationErrors.length} note(s) marked publish:true are invalid:\n`);
    for (const error of validationErrors) console.error(`  ✗ ${error}`);
    console.error("\nFix the frontmatter above (see vault/PUBLISHING.md) and re-run.");
    process.exit(1);
  }

  const titleToTarget = new Map<string, SlugTarget>();
  for (const note of published) {
    const target: SlugTarget = { slug: note.frontmatter.slug, type: note.frontmatter.type };
    titleToTarget.set(note.frontmatter.title.toLowerCase(), target);
    titleToTarget.set(path.basename(note.filePath, ".md").toLowerCase(), target);
  }

  const notesJson: Record<string, unknown>[] = [];
  const graphSourceNotes: GraphSourceNote[] = [];

  for (const note of published) {
    const { frontmatter, body, relPath } = note;
    const { text: resolvedBody, linkedSlugs } = resolveWikilinks(body, {
      titleToTarget,
      notePath: path.join("vault", "public", relPath),
      warn,
    });
    const html = await renderMarkdownToHtml(resolvedBody);
    const summary = frontmatter.summary?.trim() || deriveSummary(resolvedBody);
    const updated = frontmatter.updated ?? fs.statSync(note.filePath).mtime.toISOString().slice(0, 10);

    const record: Record<string, unknown> = {
      id: frontmatter.slug,
      slug: frontmatter.slug,
      title: frontmatter.title,
      type: frontmatter.type,
      domains: frontmatter.domains,
      tags: frontmatter.tags,
      summary,
      html,
      links: linkedSlugs,
      updated,
    };

    if (frontmatter.type === "project") {
      record.status = frontmatter.status;
      record.stack = frontmatter.stack;
      record.externalLinks = frontmatter.links ?? {};
    } else if (frontmatter.type === "role") {
      record.org = frontmatter.org;
      record.dates = frontmatter.dates;
    }

    notesJson.push(record);
    graphSourceNotes.push({
      slug: frontmatter.slug,
      title: frontmatter.title,
      type: frontmatter.type,
      domains: frontmatter.domains as Domain[],
      tags: frontmatter.tags,
      linkedSlugs,
    });
  }

  notesJson.sort((a, b) => (a.slug as string).localeCompare(b.slug as string));
  graphSourceNotes.sort((a, b) => a.slug.localeCompare(b.slug));

  const graph = buildGraph(graphSourceNotes);

  const domainsUsed = [...new Set(graphSourceNotes.flatMap((n) => n.domains))].sort();

  writeJson("notes.json", notesJson);
  writeJson("graph.json", graph);
  writeJson("manifest.json", {
    generatedAt,
    noteType: "project | note | role",
    totalCandidates: allFiles.length,
    publishedCount: published.length,
    skippedPrivateCount,
    skippedDenylistCount,
    domainsUsed,
    allowlistedRoot: path.relative(VAULT_ROOT, PUBLIC_ROOT) || ".",
    denylistSegments: DENYLIST_SEGMENTS,
    warnings,
  });

  console.log(`vault export complete: ${published.length} note(s) published, ${skippedPrivateCount} skipped (not publish:true), ${skippedDenylistCount} skipped (denylisted folder).`);
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const warning of warnings) console.log(`  ! ${warning}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
