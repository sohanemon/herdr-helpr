#!/usr/bin/env bun
import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { TaskError, TaskSuccess } from "@/components/ui/task-result";
import { TaskRunning } from "@/components/ui/task-running";
import { herdrJson, herdrRun } from "@/lib/herdr";
import { renderPrompt } from "@/lib/render";
import { formatError } from "@/lib/utils";

export function RenameWorkspacePrompt() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"loading" | "input" | "renaming" | "done" | "error">(
    "loading",
  );
  const [currentLabel, setCurrentLabel] = useState("");
  const [wsId, setWsId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const info = await herdrJson<{
          result?: { workspaces?: { workspace_id: string; label: string; focused?: boolean }[] };
        }>("workspace", "list");
        const workspaces = info?.result?.workspaces;
        const ws = workspaces?.find((w) => w.focused);
        if (ws) {
          setCurrentLabel(ws.label);
          setWsId(ws.workspace_id);
          setPhase("input");
        } else {
          setErrorMsg("No focused workspace");
          setPhase("error");
        }
      } catch (e: unknown) {
        setErrorMsg(formatError(e));
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
      // NOTE: Brief pause to show success message before closing the overlay.
      setTimeout(() => process.exit(0), 800);
    } catch (e: unknown) {
      setErrorMsg(formatError(e));
      setPhase("error");
    }
  };

  const handleCancel = () => process.exit(0);

  return (
    <Panel title="Rename Workspace">
      {phase === "loading" && <TaskRunning label="Loading..." />}
      {phase === "input" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text dimColor>Current: </Text>
            <Text bold>{currentLabel}</Text>
          </Box>
          <Input
            label="New name"
            placeholder={currentLabel}
            value={name}
            onChange={setName}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Box>
      )}
      {phase === "renaming" && (
        <Box flexDirection="column">
          <TaskRunning label="Renaming workspace..." />
          <Box marginTop={1}>
            <Text dimColor>New name: </Text>
            <Text>{name.trim()}</Text>
          </Box>
        </Box>
      )}
      {phase === "done" && <TaskSuccess message={`Workspace renamed to "${name.trim()}"`} />}
      {phase === "error" && <TaskError message={errorMsg} />}
    </Panel>
  );
}

if (import.meta.main) {
  await renderPrompt(<RenameWorkspacePrompt />);
}
