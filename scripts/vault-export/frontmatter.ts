import matter from "gray-matter";
import { z } from "zod";
import { DOMAIN_TAXONOMY, PROJECT_STATUSES } from "./config";

const SLUG_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const linksSchema = z
  .object({
    demo: z.string().url().optional(),
    repo: z.string().url().optional(),
    docs: z.string().url().optional(),
  })
  .partial();

const baseSchema = z.object({
  title: z.string().min(1, "title is required"),
  slug: z
    .string()
    .regex(SLUG_PATTERN, "slug must be snake_case (lowercase letters, numbers, underscores)"),
  publish: z.literal(true),
  domains: z
    .array(z.enum(DOMAIN_TAXONOMY))
    .min(1, "at least one domain is required"),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  updated: z.string().optional(),
  /** Set false to keep this note out of the knowledge graph (it still exports to notes.json) */
  graph: z.boolean().default(true),
});

const projectFrontmatterSchema = baseSchema.extend({
  type: z.literal("project"),
  status: z.enum(PROJECT_STATUSES).default("shipped"),
  links: linksSchema.optional(),
  stack: z.array(z.string()).default([]),
  /** Set false to hide the GitDiagram architecture picture for this project */
  diagram: z.boolean().default(true),
});

const noteFrontmatterSchema = baseSchema.extend({
  type: z.literal("note"),
});

const roleFrontmatterSchema = baseSchema.extend({
  type: z.literal("role"),
  org: z.string().min(1, "org is required for role notes"),
  dates: z.string().min(1, "dates is required for role notes"),
});

export const frontmatterSchema = z.discriminatedUnion("type", [
  projectFrontmatterSchema,
  noteFrontmatterSchema,
  roleFrontmatterSchema,
]);

export type ValidatedFrontmatter = z.infer<typeof frontmatterSchema>;

export type ParsedCandidate = {
  filePath: string;
  rawData: Record<string, unknown>;
  body: string;
};

export type ValidationResult =
  | { ok: true; frontmatter: ValidatedFrontmatter; body: string }
  | { ok: false; errors: string[] };

/** Reads frontmatter + body without validating — used to decide if a note is even a publish candidate. */
export function readCandidate(filePath: string, source: string): ParsedCandidate {
  const { data, content } = matter(source);
  return { filePath, rawData: data, body: content };
}

export function validateCandidate(candidate: ParsedCandidate): ValidationResult {
  const result = frontmatterSchema.safeParse(candidate.rawData);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${candidate.filePath}: ${issue.path.join(".") || "(root)"} — ${issue.message}`,
    );
    return { ok: false, errors };
  }
  return { ok: true, frontmatter: result.data, body: candidate.body };
}
