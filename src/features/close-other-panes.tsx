import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/panel";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "@/components/ui/theme-provider";
import { herdrJson, herdrRun } from "@/lib/herdr";
import { formatError } from "@/lib/utils";

export function CloseOtherPanesPrompt() {
  const [phase, setPhase] = useState<"running" | "done" | "error">("running");
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState("");
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const list = await herdrJson<{
          result?: { panes?: { pane_id: string; focused?: boolean }[] };
        }>("pane", "list");
        const panes = list?.result?.panes;
        const focused = panes?.find((p) => p.focused)?.pane_id;
        if (!panes || !focused) {
          if (!focused) setMsg("No focused pane");
          setPhase("done");
          return;
        }

        let closed = 0;
        for (const pane of panes) {
          if (pane.pane_id !== focused) {
            await herdrRun("pane", "close", pane.pane_id);
            closed++;
          }
        }

        setCount(closed);
        setPhase("done");
        setTimeout(() => process.exit(0), 1200);
      } catch (e: unknown) {
        setMsg(formatError(e));
        setPhase("error");
      }
    })();
  }, []);

  return (
    <Panel title="Close Panes">
      {phase === "running" && (
        <Box gap={1}>
          <Spinner type="dots" />
          <Text color={theme.colors.mutedForeground}>Closing other panes...</Text>
        </Box>
      )}
      {phase === "done" && (
        <Text color={theme.colors.success}>
          ✓ Closed {count} pane{count !== 1 ? "s" : ""}
        </Text>
      )}
      {phase === "error" && <Text color={theme.colors.error}>✗ {msg}</Text>}
    </Panel>
  );
}
