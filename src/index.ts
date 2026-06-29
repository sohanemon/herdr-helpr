#!/usr/bin/env bun
/**
 * herdr-helpr — main entry point
 *
 * Usage: herdr-helpr <command>
 */
import {
  intro,
  outro,
  text,
  select,
  confirm,
  note,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";

const HERDR = process.env.HERDR_BIN_PATH || "herdr";
const cmd = process.argv[2] || "help";

/** Run a herdr CLI command and return parsed JSON. */
async function herdr(...args: string[]) {
  const proc = Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  if (!out) return null;
  return JSON.parse(out);
}

/** Run a herdr CLI command (fire-and-forget, quiet). */
async function herdrRun(...args: string[]) {
  await Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
}

async function main() {
  switch (cmd) {
    // ── Actions (open overlay pane for interactive) ──

    case "new-workspace": {
      await herdrRun(
        "plugin", "pane", "open",
        "--plugin", "herdr-helpr",
        "--entrypoint", "prompt-new-workspace"
      );
      break;
    }

    case "rename-workspace": {
      await herdrRun(
        "plugin", "pane", "open",
        "--plugin", "herdr-helpr",
        "--entrypoint", "prompt-rename-workspace"
      );
      break;
    }

    // ── Actions (non-interactive) ────────────────────

    case "close-other-tabs": {
      const list = await herdr("tab", "list");
      const focused = list?.result?.tabs?.find((t: any) => t.focused)?.tab_id;
      if (!focused) break;
      // Group tabs by workspace so we never close the last tab in any workspace
      const wsTabCount: Record<string, number> = {};
      for (const t of list.result.tabs) {
        const wsKey = t.tab_id.split(":")[0]; // e.g. "w1" from "w1:t3"
        wsTabCount[wsKey] = (wsTabCount[wsKey] || 0) + 1;
      }
      for (const tab of list.result.tabs) {
        if (tab.tab_id === focused) continue;
        const wsKey = tab.tab_id.split(":")[0];
        if (wsTabCount[wsKey] <= 1) continue; // don't close last tab
        wsTabCount[wsKey]--;
        await herdrRun("tab", "close", tab.tab_id);
      }
      break;
    }

    case "close-other-panes": {
      const list = await herdr("pane", "list");
      const focused = list?.result?.panes?.find((p: any) => p.focused)?.pane_id;
      if (!focused) break;
      for (const pane of list.result.panes) {
        if (pane.pane_id !== focused) {
          try { await herdrRun("pane", "close", pane.pane_id); } catch {}
        }
      }
      break;
    }

    // ── Panes (interactive overlays with clack) ─────

    case "prompt-new-workspace": {
      intro(" New Workspace ");

      const name = await text({
        message: "Enter a name for the new workspace",
        placeholder: "my-project (leave empty for default)",
      });

      if (isCancel(name)) {
        cancel("Cancelled");
        process.exit(0);
      }

      const s = spinner();
      s.start("Creating workspace...");

      const wsArgs = name
        ? [HERDR, "workspace", "create", "--label", name as string, "--focus"]
        : [HERDR, "workspace", "create", "--focus"];

      const wsCreate = Bun.spawn(wsArgs, { stdout: "pipe" });
      const wsResult = await new Response(wsCreate.stdout).text();
      const wsId = JSON.parse(wsResult).result.workspace.workspace_id;

      s.stop("Created!");

      outro(name ? `Workspace "${name}" ready` : "Workspace ready");
      break;
    }

    case "prompt-rename-workspace": {
      const wsInfo = await herdr("workspace", "list");
      const ws = wsInfo?.result?.workspaces?.find((w: any) => w.focused);
      if (!ws) {
        console.error("No focused workspace");
        process.exit(1);
      }

      intro(" Rename Workspace ");

      note(`Current name: ${ws.label}`, "Workspace");

      const name = await text({
        message: "New name for this workspace",
        placeholder: ws.label,
        validate: (v) => {
          if (!v || !v.trim()) return "Name cannot be empty";
        },
      });

      if (isCancel(name)) {
        cancel("Cancelled");
        process.exit(0);
      }

      const s = spinner();
      s.start("Renaming...");

      await herdrRun("workspace", "rename", ws.workspace_id, name as string);

      s.stop("Renamed!");
      outro(`Workspace renamed to "${name}"`);
      break;
    }

    // ── Usage ────────────────────────────────────────

    default:
      console.log(
        `herdr-helpr — helpful herdr tools\n\n` +
        `Commands:\n` +
        `  new-workspace       Create workspace with name prompt\n` +
        `  rename-workspace    Rename current workspace\n` +
        `  close-other-tabs    Close all tabs except focused\n` +
        `  close-other-panes   Close all panes except focused\n`
      );
  }
}

main().catch((err) => {
  console.error("herdr-helpr error:", err);
  process.exit(1);
});
