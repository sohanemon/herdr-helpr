import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTheme } from "src/components/ui/theme-provider";
import { Panel } from "src/components/ui/panel";
import { Spinner } from "src/components/ui/spinner";

const HERDR = process.env.HERDR_BIN_PATH || "herdr";

async function herdr(...args: string[]) {
  const proc = Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return JSON.parse(out);
}

async function herdrRun(...args: string[]) {
  await Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
}

export function CloseOtherPanesPrompt() {
  const [phase, setPhase] = useState<"running" | "done" | "error">("running");
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState("");
  const theme = useTheme();

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
      {phase === "error" && (
        <Text color={theme.colors.error}>✗ {msg}</Text>
      )}
    </Panel>
  );
}
