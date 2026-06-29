import { useState } from "react";
import { Box, Text } from "ink";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { useTheme } from "@/components/ui/theme-provider";
import { Spinner } from "@/components/ui/spinner";

const HERDR = process.env.HERDR_BIN_PATH || "herdr";

async function herdrRun(...args: string[]) {
  await Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
}

export function NewWorkspacePrompt() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"input" | "creating" | "done" | "error">("input");
  const [errorMsg, setErrorMsg] = useState("");
  const theme = useTheme();

  const handleSubmit = async () => {
    setPhase("creating");
    try {
      const args = name.trim()
        ? ["workspace", "create", "--label", name.trim(), "--focus"]
        : ["workspace", "create", "--focus"];
      await herdrRun(...args);
      setPhase("done");
      setTimeout(() => process.exit(0), 800);
    } catch (e: any) {
      setErrorMsg(e.message || String(e));
      setPhase("error");
    }
  };

  const handleCancel = () => process.exit(0);

  return (
    <Panel title="New Workspace">
      {phase === "input" && (
        <Input
          label="Workspace name"
          placeholder="my-project (empty = default name)"
          value={name}
          onChange={setName}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
      {phase === "creating" && (
        <Box flexDirection="column">
          <Box gap={1}>
            <Spinner type="dots" />
            <Text color={theme.colors.mutedForeground}>Creating workspace...</Text>
          </Box>
          {name.trim() && (
            <Box marginTop={1}>
              <Text color={theme.colors.mutedForeground}>Name: </Text>
              <Text>{name.trim()}</Text>
            </Box>
          )}
        </Box>
      )}
      {phase === "done" && (
        <Text color={theme.colors.success}>
          ✓ {name.trim() ? `Workspace "${name.trim()}" created` : "Workspace created"}
        </Text>
      )}
      {phase === "error" && (
        <Text color={theme.colors.error}>✗ {errorMsg}</Text>
      )}
    </Panel>
  );
}
