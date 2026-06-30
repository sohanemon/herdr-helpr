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

export function RenameTabPrompt() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"loading" | "input" | "renaming" | "done" | "error">(
    "loading",
  );
  const [currentLabel, setCurrentLabel] = useState("");
  const [tabId, setTabId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const info = await herdrJson<{
          result?: { tabs?: { tab_id: string; label: string; focused?: boolean }[] };
        }>("tab", "list");
        const tabs = info?.result?.tabs;
        const focused = tabs?.find((t) => t.focused);
        if (focused) {
          setCurrentLabel(focused.label);
          setTabId(focused.tab_id);
          setPhase("input");
        } else {
          setErrorMsg("No focused tab");
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
      await herdrRun("tab", "rename", tabId, name.trim());
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
    <Panel title="Rename Tab">
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
          <TaskRunning label="Renaming tab..." />
          <Box marginTop={1}>
            <Text dimColor>New name: </Text>
            <Text>{name.trim()}</Text>
          </Box>
        </Box>
      )}
      {phase === "done" && <TaskSuccess message={`Tab renamed to "${name.trim()}"`} />}
      {phase === "error" && <TaskError message={errorMsg} />}
    </Panel>
  );
}

if (import.meta.main) {
  await renderPrompt(<RenameTabPrompt />);
}
