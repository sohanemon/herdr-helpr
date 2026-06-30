#!/usr/bin/env bun
/**
 * herdr-helpr action dispatcher.
 *
 * Called by herdr for every [[actions]] entry.
 * Reads the tool ID from argv[2], looks it up in TOOLS (src/tools.ts),
 * then either runs it as a direct command or opens the pane overlay.
 */

import { TOOLS } from "@/tools";

const id = process.argv[2];
if (!id) {
  console.error("Usage: herdr-helpr <action-id>");
  process.exit(1);
}

const tool = TOOLS.find((t) => t.id === id);
if (!tool) {
  console.error(`Unknown action: ${id}`);
  process.exit(1);
}

// NOTE: Direct commands (e.g. pane:zoom-toggle) run herdr subcommands immediately with no UI.
if (tool.directCommand) {
  const { herdrRun } = await import("@/lib/herdr");
  await herdrRun(...tool.directCommand);
  process.exit(0);
}

const { herdrRun } = await import("@/lib/herdr");
await herdrRun("plugin", "pane", "open", "--plugin", "herdr-helpr", "--entrypoint", id);
