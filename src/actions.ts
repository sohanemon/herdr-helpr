#!/usr/bin/env bun
/**
 * herdr-helpr — action dispatcher (background)
 *
 * Opens the appropriate overlay pane.
 */
const HERDR = process.env.HERDR_BIN_PATH || "herdr";
const cmd = process.argv[2];

switch (cmd) {
  case "new-workspace":
  case "rename-workspace":
  case "close-other-tabs":
  case "close-other-panes": {
    const paneId = `prompt-${cmd}`;
    await Bun.spawn([
      HERDR, "plugin", "pane", "open",
      "--plugin", "herdr-helpr",
      "--entrypoint", paneId,
    ]);
    break;
  }
  default:
    console.error("Unknown action:", cmd);
    process.exit(1);
}
