#!/usr/bin/env bun
/**
 * Generate herdr-plugin.toml from the tool registry (src/tools.ts).
 *
 * Usage: bun run scripts/generate-plugin-toml.ts
 *
 * Reads TOOLS from src/tools.ts (single source of truth) and
 * writes out herdr-plugin.toml with both [[actions]] and [[panes]] sections.
 *
 * NOTE: Generation exists so herdr-plugin.toml never drifts from src/tools.ts.
 */

import { TOOLS, type ToolDef } from "@/tools";

const PLUGIN_ID = "herdr-helpr";
const PLUGIN_NAME = "Herdr Helpr";
const PLUGIN_VERSION = "0.1.0";
const MIN_HERDR_VERSION = "0.7.0";
const PLUGIN_DESCRIPTION =
  "A swiss-army knife of herdr helpers: create/rename workspaces and tabs, switch workspaces, close other tabs/panes, toggle zoom, and more.";

function tomlQuote(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
}

const PANE_TOOLS = TOOLS.filter((t): t is ToolDef & { module: string } => !!t.module);

function generate(): string {
  const lines: string[] = [];

  lines.push(`# WARNING: Auto-generated from src/tools.ts\n`);
  lines.push(`id = ${tomlQuote(PLUGIN_ID)}`);
  lines.push(`name = ${tomlQuote(PLUGIN_NAME)}`);
  lines.push(`version = ${tomlQuote(PLUGIN_VERSION)}`);
  lines.push(`min_herdr_version = ${tomlQuote(MIN_HERDR_VERSION)}`);
  lines.push(`description = ${tomlQuote(PLUGIN_DESCRIPTION)}`);
  lines.push(`platforms = [${tomlQuote("linux")}, ${tomlQuote("macos")}]`);
  lines.push("");

  lines.push("[[build]]");
  lines.push(`command = [${tomlQuote("bun")}, ${tomlQuote("install")}]`);
  lines.push("");

  for (const tool of TOOLS) {
    lines.push("[[actions]]");
    lines.push(`id = ${tomlQuote(tool.id)}`);
    lines.push(`title = ${tomlQuote(tool.title)}`);
    lines.push(
      `command = [${tomlQuote("bun")}, ${tomlQuote("run")}, ${tomlQuote("src/actions.ts")}, ${tomlQuote(tool.id)}]`,
    );
    lines.push("");
  }

  if (PANE_TOOLS.length > 0) {
    for (const tool of PANE_TOOLS) {
      lines.push("[[panes]]");
      lines.push(`id = ${tomlQuote(tool.id)}`);
      lines.push(`title = ${tomlQuote(tool.title)}`);
      lines.push(`placement = ${tomlQuote("overlay")}`);
      lines.push(
        `command = [${tomlQuote("bun")}, ${tomlQuote("run")}, ${tomlQuote(`src/features/${tool.module}.tsx`)}]`,
      );
      lines.push("");
    }
  }

  return lines.join("\n");
}

const tomlPath = new URL("../herdr-plugin.toml", import.meta.url).pathname;
const content = generate();
await Bun.write(tomlPath, content);
console.log(`Generated ${tomlPath}`);
console.log(`  ${TOOLS.length} actions`);
console.log(`  ${PANE_TOOLS.length} panes`);
