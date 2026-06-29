#!/usr/bin/env bun
import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { Select, type SelectOption } from "@/components/ui/select";
import { TaskError } from "@/components/ui/task-result";
import { TaskRunning } from "@/components/ui/task-running";
import { herdrJson, herdrRun } from "@/lib/herdr";
import { renderPrompt } from "@/lib/render";
import { formatError } from "@/lib/utils";

export function WorkspaceSwitchPrompt() {
  const [phase, setPhase] = useState<"loading" | "select" | "done" | "error">("loading");
  const [workspaces, setWorkspaces] = useState<SelectOption<string>[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const info = await herdrJson<{
          result?: { workspaces?: { workspace_id: string; label: string; focused?: boolean }[] };
        }>("workspace", "list");
        const list = info?.result?.workspaces;
        if (!list || list.length === 0) {
          setErrorMsg("No workspaces");
          setPhase("error");
          return;
        }
        setWorkspaces(
          list.map((ws) => ({
            value: ws.workspace_id,
            label: ws.label || ws.workspace_id.slice(0, 8),
            hint: ws.focused ? "current" : undefined,
          })),
        );
        setPhase("select");
      } catch (e: unknown) {
        setErrorMsg(formatError(e));
        setPhase("error");
      }
    })();
  }, []);

  const handleSubmit = async (value: string) => {
    setPhase("done");
    await herdrRun("workspace", "focus", value);
    process.exit(0);
  };

  return (
    <Panel title="Switch Workspace">
      {phase === "loading" && <TaskRunning label="Loading workspaces..." />}
      {phase === "select" && (
        <Select label="Select a workspace" options={workspaces} onSubmit={handleSubmit} />
      )}
      {phase === "done" && <TaskRunning label="Switching..." />}
      {phase === "error" && <TaskError message={errorMsg} />}
    </Panel>
  );
}

if (import.meta.main) {
  await renderPrompt(<WorkspaceSwitchPrompt />);
}
