#!/usr/bin/env bun
/**
 * herdr-helpr — TUI entry point
 *
 * Renders Ink-based floating panel UIs inside herdr overlay panes.
 *
 * Usage: herdr-helpr <command>
 *   prompt-new-workspace       Create workspace with name prompt
 *   prompt-rename-workspace    Rename current workspace
 *   close-other-tabs           Close all tabs except focused
 *   close-other-panes          Close all panes except focused
 */
import React, { useState, useEffect } from "react";
import { render, Box, Text, useStdout } from "ink";
import { Panel, Input } from "./components.js";

const HERDR = process.env.HERDR_BIN_PATH || "herdr";

// ── Helpers ──────────────────────────────────────────

async function herdr(...args: string[]) {
  const proc = Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return JSON.parse(out);
}

async function herdrRun(...args: string[]) {
  await Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
}

// ── New Workspace Prompt ────────────────────────────

function NewWorkspacePrompt() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"input" | "creating" | "done" | "error">(
    "input"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setPhase("creating");
    try {
      const args = name.trim()
        ? ["workspace", "create", "--label", name.trim(), "--focus"]
        : ["workspace", "create", "--focus"];
      await herdrRun(...args);
      setPhase("done");
      // Auto-close after a moment
      setTimeout(() => process.exit(0), 800);
    } catch (e: any) {
      setErrorMsg(e.message || String(e));
      setPhase("error");
    }
  };

  const handleCancel = () => {
    process.exit(0);
  };

  if (phase === "creating") {
    return (
      <Panel title="New Workspace">
        <Text color="#9ece6a">◆ Creating workspace...</Text>
        {name.trim() && (
          <Box>
            <Text color="#565f89">  Name: </Text>
            <Text>{name.trim()}</Text>
          </Box>
        )}
      </Panel>
    );
  }

  if (phase === "done") {
    return (
      <Panel title="New Workspace">
        <Text color="#9ece6a">✓ Workspace created</Text>
        {name.trim() && (
          <Box>
            <Text color="#565f89">  Name: </Text>
            <Text color="#c0caf5">{name.trim()}</Text>
          </Box>
        )}
      </Panel>
    );
  }

  if (phase === "error") {
    return (
      <Panel title="New Workspace">
        <Text color="#f7768e">✗ Failed: {errorMsg}</Text>
        <Text color="#565f89">  Press any key to exit</Text>
      </Panel>
    );
  }

  return (
    <Panel title="New Workspace">
      <Input
        label="Workspace name"
        placeholder="my-project (empty = default name)"
        value={name}
        onChange={setName}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Panel>
  );
}

// ── Rename Workspace Prompt ─────────────────────────

function RenameWorkspacePrompt() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"loading" | "input" | "renaming" | "done" | "error">("loading");
  const [currentLabel, setCurrentLabel] = useState("");
  const [wsId, setWsId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const info = await herdr("workspace", "list");
        const ws = info?.result?.workspaces?.find((w: any) => w.focused);
        if (ws) {
          setCurrentLabel(ws.label);
          setWsId(ws.workspace_id);
          setPhase("input");
        } else {
          setErrorMsg("No focused workspace");
          setPhase("error");
        }
      } catch (e: any) {
        setErrorMsg(e.message || String(e));
        setPhase("error");
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setPhase("renaming");
    try {
      await herdrRun("workspace", "rename", wsId, name.trim());
      setPhase("done");
      setTimeout(() => process.exit(0), 800);
    } catch (e: any) {
      setErrorMsg(e.message || String(e));
      setPhase("error");
    }
  };

  const handleCancel = () => process.exit(0);

  if (phase === "loading") {
    return (
      <Panel title="Rename Workspace">
        <Text color="#565f89">Loading...</Text>
      </Panel>
    );
  }

  if (phase === "renaming") {
    return (
      <Panel title="Rename Workspace">
        <Text color="#9ece6a">◆ Renaming workspace...</Text>
        <Box>
          <Text color="#565f89">  New name: </Text>
          <Text color="#c0caf5">{name.trim()}</Text>
        </Box>
      </Panel>
    );
  }

  if (phase === "done") {
    return (
      <Panel title="Rename Workspace">
        <Text color="#9ece6a">✓ Workspace renamed</Text>
        <Box>
          <Text color="#565f89">  Name: </Text>
          <Text color="#c0caf5">{name.trim()}</Text>
        </Box>
      </Panel>
    );
  }

  if (phase === "error") {
    return (
      <Panel title="Rename Workspace">
        <Text color="#f7768e">✗ {errorMsg}</Text>
        <Text color="#565f89">  Press any key to exit</Text>
      </Panel>
    );
  }

  return (
    <Panel title="Rename Workspace">
      <Box>
        <Text color="#565f89">Current: </Text>
        <Text bold color="#c0caf5">{currentLabel}</Text>
      </Box>
      <Box marginTop={1}>
        <Input
          label="New name"
          placeholder={currentLabel}
          value={name}
          onChange={setName}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Box>
    </Panel>
  );
}

// ── Close Other Tabs ────────────────────────────────

function CloseOtherTabsPrompt() {
  const [phase, setPhase] = useState<"running" | "done" | "error">("running");
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await herdr("tab", "list");
        const focused = list?.result?.tabs?.find((t: any) => t.focused)?.tab_id;
        if (!focused) { setMsg("No focused tab"); setPhase("done"); return; }

        // Count tabs per workspace, don't close last tab
        const wsCount: Record<string, number> = {};
        for (const t of list.result.tabs) {
          const wsKey = t.tab_id.split(":")[0];
          wsCount[wsKey] = (wsCount[wsKey] || 0) + 1;
        }

        let closed = 0;
        for (const tab of list.result.tabs) {
          if (tab.tab_id === focused) continue;
          const wsKey = tab.tab_id.split(":")[0];
          if (wsCount[wsKey] <= 1) continue;
          wsCount[wsKey]--;
          await herdrRun("tab", "close", tab.tab_id);
          closed++;
        }

        setCount(closed);
        setPhase("done");
        setTimeout(() => process.exit(0), 1200);
      } catch (e: any) {
        setMsg(e.message || String(e));
        setPhase("error");
      }
    })();
  }, []);

  if (phase === "running") {
    return (
      <Panel title="Close Tabs">
        <Text color="#e0af68">⋯ Closing other tabs...</Text>
      </Panel>
    );
  }

  if (phase === "error") {
    return (
      <Panel title="Close Tabs">
        <Text color="#f7768e">✗ {msg}</Text>
      </Panel>
    );
  }

  return (
    <Panel title="Close Tabs">
      <Text color="#9ece6a">✓ Closed {count} tab{count !== 1 ? "s" : ""}</Text>
    </Panel>
  );
}

// ── Close Other Panes ────────────────────────────────

function CloseOtherPanesPrompt() {
  const [phase, setPhase] = useState<"running" | "done" | "error">("running");
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await herdr("pane", "list");
        const focused = list?.result?.panes?.find((p: any) => p.focused)?.pane_id;
        if (!focused) { setMsg("No focused pane"); setPhase("done"); return; }

        let closed = 0;
        for (const pane of list.result.panes) {
          if (pane.pane_id !== focused) {
            await herdrRun("pane", "close", pane.pane_id);
            closed++;
          }
        }

        setCount(closed);
        setPhase("done");
        setTimeout(() => process.exit(0), 1200);
      } catch (e: any) {
        setMsg(e.message || String(e));
        setPhase("error");
      }
    })();
  }, []);

  if (phase === "running") {
    return (
      <Panel title="Close Panes">
        <Text color="#e0af68">⋯ Closing other panes...</Text>
      </Panel>
    );
  }

  if (phase === "error") {
    return (
      <Panel title="Close Panes">
        <Text color="#f7768e">✗ {msg}</Text>
      </Panel>
    );
  }

  return (
    <Panel title="Close Panes">
      <Text color="#9ece6a">✓ Closed {count} pane{count !== 1 ? "s" : ""}</Text>
    </Panel>
  );
}

// ── Vertical Center Layout ─────────────────────────

function CenterLayout({ children }: { children: React.ReactNode }) {
  const { stdout } = useStdout();
  const rows = stdout?.rows ?? 24;

  return (
    <Box
      flexDirection="column"
      minHeight={rows}
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </Box>
  );
}

// ── Main ─────────────────────────────────────────────

const cmd = process.argv[2] || "help";

function Main() {
  switch (cmd) {
    case "prompt-new-workspace":
      return <NewWorkspacePrompt />;
    case "prompt-rename-workspace":
      return <RenameWorkspacePrompt />;
    case "prompt-close-other-tabs":
      return <CloseOtherTabsPrompt />;
    case "prompt-close-other-panes":
      return <CloseOtherPanesPrompt />;
    default:
      return (
        <Panel title="herdr-helpr">
          <Text>Available commands:</Text>
          <Text>  prompt-new-workspace</Text>
          <Text>  prompt-rename-workspace</Text>
          <Text>  close-other-tabs</Text>
          <Text>  close-other-panes</Text>
        </Panel>
      );
  }
}

function App() {
  return (
    <CenterLayout>
      <Main />
    </CenterLayout>
  );
}

// Wrap in async to handle Ink's render lifecycle
(async () => {
  const { waitUntilExit } = render(<App />);
  await waitUntilExit;
})();
