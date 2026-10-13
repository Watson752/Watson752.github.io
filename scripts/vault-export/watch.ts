import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { DIAGRAM_SOURCES_DIR, PUBLIC_ROOT } from "./config";

/**
 * Re-runs the vault export whenever anything under vault/public changes, so
 * Obsidian edits show up in `npm run dev` without a manual export. Runs the
 * export as a child process because index.ts exits the process on failure.
 */

const EXPORT_SCRIPT = path.join(import.meta.dirname, "index.ts");
const DEBOUNCE_MS = 300;

let timer: NodeJS.Timeout | undefined;
let running = false;
let pending = false;

function runExport() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  // Reuse diagrams already on disk instead of hitting GitHub/GitDiagram on every save.
  const child = spawn(process.execPath, [...process.execArgv, EXPORT_SCRIPT], {
    stdio: "inherit",
    env: { ...process.env, VAULT_DIAGRAMS: "offline" },
  });
  child.on("exit", () => {
    running = false;
    if (pending) {
      pending = false;
      runExport();
    }
  });
}

if (!fs.existsSync(PUBLIC_ROOT)) {
  console.error(`vault/public not found at ${path.relative(process.cwd(), PUBLIC_ROOT)} — nothing to watch.`);
  process.exit(1);
}

runExport();

const watchedDirs = [PUBLIC_ROOT, DIAGRAM_SOURCES_DIR].filter((dir) => fs.existsSync(dir));

for (const dir of watchedDirs) {
  fs.watch(dir, { recursive: true }, (_event, filename) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`\nchange detected (${filename ?? "unknown file"}), re-exporting…`);
      runExport();
    }, DEBOUNCE_MS);
  });
}

console.log(`watching ${watchedDirs.map((dir) => path.relative(process.cwd(), dir)).join(", ")} for changes…`);
