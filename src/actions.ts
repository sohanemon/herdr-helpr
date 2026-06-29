#!/usr/bin/env bun
import { actions, promptEntrypoint } from "@/lib/actions";
/**
 * herdr-helpr — action dispatcher (background)
 *
 * Opens the appropriate overlay pane.
 */
import { herdrRun } from "@/lib/herdr";

const cmd = process.argv[2];
if (!cmd) {
  console.error("Usage: herdr-helpr <action>");
  process.exit(1);
}

const validIds = new Set(actions.map((a) => a.id));

if (validIds.has(cmd)) {
  await herdrRun(
    "plugin",
    "pane",
    "open",
    "--plugin",
    "herdr-helpr",
    "--entrypoint",
    promptEntrypoint(cmd),
  );
} else {
  console.error("Unknown action:", cmd);
  process.exit(1);
}
