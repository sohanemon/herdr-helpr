#!/usr/bin/env bun
import { herdrRun } from "@/lib/herdr";

const id = process.argv[2];
if (!id) {
  console.error("Usage: herdr-helpr <action-id>");
  process.exit(1);
}

// INFO: Direct commands — no UI, run immediately
const DIRECT_COMMANDS: Record<string, string[]> = {
  "pane:zoom-toggle": ["pane", "zoom", "--toggle"],
};

const command = DIRECT_COMMANDS[id];
if (command) {
  await herdrRun(...command);
  process.exit(0);
}

// INFO: Pane overlays — open the interactive TUI
await herdrRun("plugin", "pane", "open", "--plugin", "herdr-helpr", "--entrypoint", id);
