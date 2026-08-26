import fs from "node:fs";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { ATTACHMENTS_ROOT, SITE_ATTACHMENTS_DIR } from "./config";

const WIKILINK_RE = /(!)?\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "title"],
  },
};

export type SlugTarget = { slug: string; type: "project" | "note" | "role" };

export type WikilinkContext = {
  /** note title/filename (lowercased) → published note, for resolving [[links]] */
  titleToTarget: Map<string, SlugTarget>;
  notePath: string;
  warn: (message: string) => void;
};

const copiedAttachments = new Set<string>();

function resolveAttachment(rawTarget: string): string | null {
  const filename = path.basename(rawTarget.trim());
  const candidate = path.join(ATTACHMENTS_ROOT, filename);
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    return null;
  }
  const publicUrl = `/vault-attachments/${filename}`;
  if (!copiedAttachments.has(filename)) {
    fs.mkdirSync(SITE_ATTACHMENTS_DIR, { recursive: true });
    fs.copyFileSync(candidate, path.join(SITE_ATTACHMENTS_DIR, filename));
    copiedAttachments.add(filename);
  }
  return publicUrl;
}

function targetHref(target: SlugTarget): string {
  return target.type === "project" ? `/projects/${target.slug}` : `/notes/${target.slug}`;
}

/**
 * Rewrites Obsidian [[wikilinks]]/![[embeds]] into plain markdown, dropping
 * anything that points at an unpublished note or a disallowed attachment.
 * Links to unpublished targets are stripped entirely (not just un-linked) —
 * the whole point is that a private note's title must never surface as
 * visible text on a public note that happened to link to it.
 */
export function resolveWikilinks(body: string, ctx: WikilinkContext): { text: string; linkedSlugs: string[] } {
  const linkedSlugs = new Set<string>();

  const text = body.replace(WIKILINK_RE, (_match, embedFlag: string | undefined, rawTarget: string, alias: string | undefined) => {
    if (embedFlag === "!") {
      const publicUrl = resolveAttachment(rawTarget);
      if (!publicUrl) {
        ctx.warn(`dropped embed ![[${rawTarget}]] in ${ctx.notePath} — not found under vault/public/attachments/`);
        return "";
      }
      const altText = (alias ?? path.basename(rawTarget.trim())).replace(/[[\]]/g, "");
      return `![${altText}](${publicUrl})`;
    }

    const key = rawTarget.trim().toLowerCase();
    const target = ctx.titleToTarget.get(key);
    if (!target) {
      ctx.warn(`stripped link [[${rawTarget}]] in ${ctx.notePath} — target not published`);
      return "";
    }
    linkedSlugs.add(target.slug);
    const displayText = (alias ?? rawTarget.trim()).replace(/[[\]]/g, "");
    return `[${displayText}](${targetHref(target)})`;
  });

  return { text, linkedSlugs: [...linkedSlugs] };
}

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

/** Best-effort plaintext excerpt of the first real paragraph, used when frontmatter has no `summary`. */
export function deriveSummary(markdown: string, maxLength = 220): string {
  const paragraphs = markdown.split(/\n\s*\n/).map((p) => p.trim());
  const first = paragraphs.find((p) => p.length > 0 && !p.startsWith("#") && !p.startsWith("!"));
  if (!first) return "";
  const plain = first
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/[*_>#-]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength - 1).trimEnd()}…` : plain;
}
