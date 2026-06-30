#!/usr/bin/env bun
/**
 * herdr-helpr — CLI entry point
 *
 * Usage:
 *   herdr-helpr                  List available tools
 *   herdr-helpr <action-id>      Run a specific tool
 *   herdr-helpr --help           Show help
 *
 * Examples:
 *   herdr-helpr                  # list everything
 *   herdr-helpr workspace:create # create a workspace
 *   herdr-helpr pane:zoom-toggle # toggle zoom
 */

import { herdrRun } from "./lib/herdr.ts";
import { TOOLS } from "./tools.ts";

const arg = process.argv[2];

if (!arg || arg === "--help" || arg === "-h") {
  console.log("herdr-helpr — a swiss-army knife of herdr helpers\n");
  console.log("Usage:");
  console.log("  herdr-helpr                        List available tools");
  console.log("  herdr-helpr <action-id>             Run a specific tool");
  console.log("  herdr-helpr --help                  Show this help\n");
  console.log("Available tools:");
  for (const tool of TOOLS) {
    console.log(`  ${tool.id.padEnd(25)} ${tool.title}`);
  }
  console.log("\nInstall as a herdr plugin:");
  console.log("  herdr plugin install sohanemon/herdr-helpr");
  process.exit(0);
}

const tool = TOOLS.find((t) => t.id === arg);
if (!tool) {
  console.error(`Unknown tool: ${arg}`);
  console.error("Run 'herdr-helpr' to see available tools.");
  process.exit(1);
}

// NOTE: Direct commands (e.g. pane:zoom-toggle) run synchronously, no overlay.
if (tool.directCommand) {
  await herdrRun(...tool.directCommand);
  process.exit(0);
}

// NOTE: Pane overlays use herdr's built-in overlay mechanism for interactive TUI.
await herdrRun("plugin", "pane", "open", "--plugin", "herdr-helpr", "--entrypoint", arg);
