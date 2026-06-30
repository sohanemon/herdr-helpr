#!/usr/bin/env bun
/**
 * Generate the tools table section of README.md from the tool registry.
 *
 * Usage: bun run scripts/generate-readme.ts
 *
 * Reads TOOLS from src/tools.ts and replaces the content between
 * <!-- GENERATED:TOOLS --> markers in README.md.
 */

import { TOOLS } from "@/tools";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const readmePath = resolve(__dirname, "../README.md");

const featuresTable = TOOLS.map(
  (t) => `| **${t.title}** | ${t.module ? "pane" : "action"} | ${t.description} |`,
).join("\n");

const usageTable = TOOLS.map(
  (t) => `| \`${t.id}\` | ${t.description} |`,
).join("\n");

const generated = `<!-- GENERATED:TOOLS -->
${TOOLS.map(
  (t) =>
    `| \`${t.id}\` | ${t.module ? "pane" : "action"} | ${t.title} | ${t.description} |`,
).join("\n")}
<!-- /GENERATED:TOOLS -->`;

const readme = readFileSync(readmePath, "utf-8");
const startMarker = "<!-- GENERATED:TOOLS -->";
const endMarker = "<!-- /GENERATED:TOOLS -->";

const startIdx = readme.indexOf(startMarker);
const endIdx = readme.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  // No markers found — append the generated block before "## Development"
  const devIdx = readme.indexOf("## Development");
  if (devIdx === -1) throw new Error("Could not find '## Development' section in README");

  const updated =
    readme.slice(0, devIdx).trimEnd() +
    "\n\n" +
    generated +
    "\n\n" +
    readme.slice(devIdx);
  writeFileSync(readmePath, updated);
  console.log("Added GENERATED:TOOLS section before Development");
} else {
  const updated =
    readme.slice(0, startIdx) +
    generated +
    readme.slice(endIdx + endMarker.length);
  writeFileSync(readmePath, updated);
  console.log("Updated GENERATED:TOOLS section");
}
