#!/usr/bin/env bun
/**
 * herdr-helpr — action dispatcher (background)
 *
 * Opens the appropriate overlay pane.
 */
import { herdrRun } from "@/lib/herdr";

const cmd = process.argv[2];

switch (cmd) {
  case "new-workspace":
  case "rename-workspace":
  case "close-other-tabs":
  case "close-other-panes": {
    const paneId = `prompt-${cmd}`;
    await herdrRun("plugin", "pane", "open", "--plugin", "herdr-helpr", "--entrypoint", paneId);
    break;
  }
  default:
    console.error("Unknown action:", cmd);
    process.exit(1);
}
