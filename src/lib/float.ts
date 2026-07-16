/**
 * Shared utilities for floating pane/tab toggle.
 *
 * Design:
 *   First invocation  → create a floating terminal pane/tab
 *   Second invocation → close the existing floating pane/tab
 *
 * The float target ID (pane_id or tab_id) is persisted to a well-known temp
 * file so we can toggle across invocations.  We verify the target is still
 * alive before closing; a stale file is cleaned up silently.
 */

// NOTE: KEEP IN SYNC with ToolDef.id for float tools — used as the file-name
//       component so different tools never collide.
export const FLOAT_PANE_ID = "pane:float";
export const FLOAT_TAB_ID = "tab:float";

// ---------------------------------------------------------------------------
// Helpers

/** Well-known temp file for a given tool id (one per tool, no collision). */
function statePath(toolId: string): string {
  return `/tmp/herdr-float-${toolId.replace(":", "-")}`;
}

/** Read the persisted float target id (if any). */
export async function readFloatTarget(toolId: string): Promise<string | null> {
  try {
    const raw = await Bun.file(statePath(toolId)).text();
    const val = raw?.trim();
    return val || null;
  } catch {
    return null;
  }
}

/** Persist a float target id. */
export function writeFloatTarget(toolId: string, targetId: string): void {
  Bun.write(statePath(toolId), targetId);
}

/** Remove the persisted float target (clean up on close). */
export function clearFloatTarget(toolId: string): void {
  try {
    Bun.spawnSync(["rm", "-f", statePath(toolId)]);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Pane helpers

export interface PaneInfo {
  pane_id?: string;
  tab_id?: string;
  workspace_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface PaneListResult {
  result?: {
    panes?: PaneInfo[];
  };
}

export async function listPanes(): Promise<PaneInfo[]> {
  const proc = Bun.spawn(["herdr", "pane", "list"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  const parsed = JSON.parse(out) as PaneListResult;
  return parsed?.result?.panes ?? [];
}

export interface PaneGetResult {
  result?: {
    pane?: PaneInfo;
  };
  error?: { message: string };
}

/** Check if a pane still exists. Returns the pane info or null. */
export async function getPane(paneId: string): Promise<PaneInfo | null> {
  const proc = Bun.spawn(["herdr", "pane", "get", paneId], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  try {
    const parsed = JSON.parse(out) as PaneGetResult;
    if (parsed.result?.pane?.pane_id) return parsed.result.pane;
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Tab helpers

export interface TabInfo {
  tab_id?: string;
  workspace_id?: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TabListResult {
  result?: {
    tabs?: TabInfo[];
  };
}

export async function listTabs(): Promise<TabInfo[]> {
  const proc = Bun.spawn(["herdr", "tab", "list"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  const parsed = JSON.parse(out) as TabListResult;
  return parsed?.result?.tabs ?? [];
}

export interface TabGetResult {
  result?: {
    tab?: TabInfo;
  };
  error?: { message: string };
}

export interface TabCreateResult {
  result?: {
    tab?: TabInfo;
    root_pane?: PaneInfo;
  };
}

/** Check if a tab still exists. */
export async function getTab(tabId: string): Promise<TabInfo | null> {
  const proc = Bun.spawn(["herdr", "tab", "get", tabId], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  try {
    const parsed = JSON.parse(out) as TabGetResult;
    if (parsed.result?.tab?.tab_id) return parsed.result.tab;
    return null;
  } catch {
    return null;
  }
}
