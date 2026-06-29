#!/usr/bin/env bun
import { Box, Text } from "ink";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { TaskError, TaskSuccess } from "@/components/ui/task-result";
import { TaskRunning } from "@/components/ui/task-running";
import { herdrRun } from "@/lib/herdr";
import { renderPrompt } from "@/lib/render";
import { formatError } from "@/lib/utils";

export function NewTabPrompt() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"input" | "creating" | "done" | "error">("input");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setPhase("creating");
    try {
      const args = name.trim()
        ? ["tab", "create", "--label", name.trim(), "--focus"]
        : ["tab", "create", "--focus"];
      await herdrRun(...args);
      setPhase("done");
      setTimeout(() => process.exit(0), 800);
    } catch (e: unknown) {
      setErrorMsg(formatError(e));
      setPhase("error");
    }
  };

  const handleCancel = () => process.exit(0);

  return (
    <Panel title="New Tab">
      {phase === "input" && (
        <Input
          label="Tab name"
          placeholder="my-feature (empty = default name)"
          value={name}
          onChange={setName}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
      {phase === "creating" && (
        <Box flexDirection="column">
          <TaskRunning label="Creating tab..." />
          {name.trim() && (
            <Box marginTop={1}>
              <Text dimColor>Name: </Text>
              <Text>{name.trim()}</Text>
            </Box>
          )}
        </Box>
      )}
      {phase === "done" && (
        <TaskSuccess message={name.trim() ? `Tab "${name.trim()}" created` : "Tab created"} />
      )}
      {phase === "error" && <TaskError message={errorMsg} />}
    </Panel>
  );
}

if (import.meta.main) {
  await renderPrompt(<NewTabPrompt />);
}
