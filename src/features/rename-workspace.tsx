import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { useTheme } from "@/components/ui/theme-provider";
import { Spinner } from "@/components/ui/spinner";
import { herdrJson, herdrRun } from "@/lib/herdr";
import { formatError } from "@/lib/utils";

export function RenameWorkspacePrompt() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<"loading" | "input" | "renaming" | "done" | "error">(
    "loading",
  );
  const [currentLabel, setCurrentLabel] = useState("");
  const [wsId, setWsId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const theme = useTheme();

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
      setTimeout(() => process.exit(0), 800);
    } catch (e: unknown) {
      setErrorMsg(formatError(e));
      setPhase("error");
    }
  };

  const handleCancel = () => process.exit(0);

  return (
    <Panel title="Rename Workspace">
      {phase === "loading" && (
        <Box gap={1}>
          <Spinner type="dots" />
          <Text color={theme.colors.mutedForeground}>Loading...</Text>
        </Box>
      )}
      {phase === "input" && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={theme.colors.mutedForeground}>Current: </Text>
            <Text bold color={theme.colors.foreground}>
              {currentLabel}
            </Text>
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
          <Box gap={1}>
            <Spinner type="dots" />
            <Text color={theme.colors.mutedForeground}>Renaming workspace...</Text>
          </Box>
          <Box marginTop={1}>
            <Text color={theme.colors.mutedForeground}>New name: </Text>
            <Text>{name.trim()}</Text>
          </Box>
        </Box>
      )}
      {phase === "done" && (
        <Text color={theme.colors.success}>✓ Workspace renamed to "{name.trim()}"</Text>
      )}
      {phase === "error" && <Text color={theme.colors.error}>✗ {errorMsg}</Text>}
    </Panel>
  );
}
