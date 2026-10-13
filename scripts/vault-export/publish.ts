import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { DIAGRAM_SOURCES_DIR, OUTPUT_DIR, SITE_ATTACHMENTS_DIR } from "./config";

/**
 * Exports the vault, then commits and pushes only the generated content so
 * GitHub Pages redeploys with the latest Obsidian edits. The vault itself is
 * gitignored; the generated JSON is what ships.
 */

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: REPO_ROOT, encoding: "utf8" });
}

execFileSync(process.execPath, [...process.execArgv, path.join(import.meta.dirname, "index.ts")], {
  stdio: "inherit",
});

const contentPaths = [OUTPUT_DIR, SITE_ATTACHMENTS_DIR, DIAGRAM_SOURCES_DIR]
  .filter((dir) => fs.existsSync(dir))
  .map((dir) => path.relative(REPO_ROOT, dir));

// manifest.json carries a fresh generatedAt on every run, so it alone doesn't
// count as a content change.
const changed = git("status", "--porcelain", "--", ...contentPaths)
  .split("\n")
  .filter((line) => line.trim() && !line.endsWith("manifest.json"));

if (changed.length === 0) {
  git("checkout", "--", path.relative(REPO_ROOT, path.join(OUTPUT_DIR, "manifest.json")));
  console.log("\nno vault content changes to publish.");
  process.exit(0);
}

git("add", "--", ...contentPaths);
execFileSync("git", ["commit", "-m", "Update portfolio content from vault", "--", ...contentPaths], {
  cwd: REPO_ROOT,
  stdio: "inherit",
});
execFileSync("git", ["push"], { cwd: REPO_ROOT, stdio: "inherit" });

console.log("\npushed — GitHub Pages will redeploy in a minute or two.");
