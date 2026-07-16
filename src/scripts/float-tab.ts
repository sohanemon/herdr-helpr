#!/usr/bin/env bun
/**
 * Toggle a floating scratch tab.
 *
 * First call  → creates a new tab labelled "⌄ float" with a shell
 * Second call → closes that tab (if it still exists)
 *
 * The tab ID is persisted in /tmp/herdr-float-tab-float so repeated
 * invocations act as a toggle.
 */

import { clearFloatTarget, getTab, readFloatTarget, writeFloatTarget } from "@/lib/float.ts";

const TOOL_ID = "tab:float";

async function main() {
  const existingId = await readFloatTarget(TOOL_ID);

  // ---- Close existing floating tab ----
  if (existingId) {
    const tab = await getTab(existingId);
    if (tab) {
      const close = Bun.spawn(["herdr", "tab", "close", existingId], {
        stdout: "pipe",
        stderr: "pipe",
      });
      await close.exited;
      clearFloatTarget(TOOL_ID);
      console.log(`Floating tab closed`);
      process.exit(0);
    }
    // Stale file — tab no longer exists, fall through to create.
    clearFloatTarget(TOOL_ID);
  }

  // ---- Create new floating tab ----
  const createProc = Bun.spawn(["herdr", "tab", "create", "--label", "\u2302 float", "--focus"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(createProc.stdout).text();
  const exitCode = await createProc.exited;

  if (exitCode !== 0) {
    console.error("Failed to create floating tab");
    process.exit(1);
  }

  let tabId: string | undefined;
  try {
    const parsed = JSON.parse(out);
    tabId = parsed?.result?.tab?.tab_id;
  } catch {
    console.error("Could not parse tab creation output");
    process.exit(1);
  }

  if (!tabId) {
    console.error("Could not determine new tab ID");
    process.exit(1);
  }

  writeFloatTarget(TOOL_ID, tabId);
  console.log(`Floating tab opened (${tabId})`);
}

await main();
