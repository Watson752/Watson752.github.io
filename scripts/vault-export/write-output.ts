import fs from "node:fs";
import path from "node:path";
import { OUTPUT_DIR } from "./config";

export function writeJson(filename: string, data: unknown): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
