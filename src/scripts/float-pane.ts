#!/usr/bin/env bun
/**
 * Toggle a floating terminal pane.
 *
 * First call  → creates a split pane with a shell (60% ratio, right split)
 * Second call → closes that pane (if it still exists)
 *
 * The pane ID is persisted in /tmp/herdr-float-pane-float so repeated
 * invocations act as a toggle.
 */

import {
  clearFloatTarget,
  getPane,
  listPanes,
  readFloatTarget,
  writeFloatTarget,
} from "@/lib/float.ts";

const TOOL_ID = "pane:float";

async function main() {
  const existingId = await readFloatTarget(TOOL_ID);

  // ---- Close existing floating pane ----
  if (existingId) {
    const pane = await getPane(existingId);
    if (pane) {
      const close = Bun.spawn(["herdr", "pane", "close", existingId], {
        stdout: "pipe",
        stderr: "pipe",
      });
      await close.exited;
      clearFloatTarget(TOOL_ID);
      console.log(`Floating pane closed`);
      process.exit(0);
    }
    // Stale file — pane no longer exists, fall through to create.
    clearFloatTarget(TOOL_ID);
  }

  // ---- Create new floating pane ----
  // Split the current pane to create a new terminal.
  const splitProc = Bun.spawn(
    ["herdr", "pane", "split", "--direction", "right", "--ratio", "0.6", "--focus"],
    { stdout: "pipe", stderr: "pipe" },
  );
  const out = await new Response(splitProc.stdout).text();
  const exitCode = await splitProc.exited;

  if (exitCode !== 0) {
    console.error("Failed to create floating pane");
    process.exit(1);
  }

  let paneId: string | undefined;
  try {
    const parsed = JSON.parse(out);
    paneId = parsed?.result?.pane?.pane_id;
  } catch {
    // fallback: get the focused pane from the list
    const panes = await listPanes();
    const focused = panes.find((p) => p.focused);
    paneId = focused?.pane_id;
  }

  if (!paneId) {
    console.error("Could not determine new pane ID");
    process.exit(1);
  }

  writeFloatTarget(TOOL_ID, paneId);
  console.log(`Floating pane opened (${paneId})`);
}

await main();
