import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { Panel } from "@/components/ui/panel";
import { useTheme } from "@/components/ui/theme-provider";
import { Spinner } from "@/components/ui/spinner";

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

export function CloseOtherTabsPrompt() {
  const [phase, setPhase] = useState<"running" | "done" | "error">("running");
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState("");
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const list = await herdr("tab", "list");
        const focused = list?.result?.tabs?.find((t: { tab_id: string; focused?: boolean }) => t.focused)?.tab_id;
        if (!focused) { setMsg("No focused tab"); setPhase("done"); return; }

        const wsCount: Record<string, number> = {};
        for (const t of list.result.tabs) {
          const wsKey = t.tab_id.split(":")[0];
          wsCount[wsKey] = (wsCount[wsKey] || 0) + 1;
        }

        let closed = 0;
        for (const tab of list.result.tabs) {
          if (tab.tab_id === focused) continue;
          const wsKey = tab.tab_id.split(":")[0];
          const n = wsCount[wsKey] ?? 0;
          if (n <= 1) continue;
          wsCount[wsKey] = n - 1;
          await herdrRun("tab", "close", tab.tab_id);
          closed++;
        }

        setCount(closed);
        setPhase("done");
        setTimeout(() => process.exit(0), 1200);
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    })();
  }, []);

  return (
    <Panel title="Close Tabs">
      {phase === "running" && (
        <Box gap={1}>
          <Spinner type="dots" />
          <Text color={theme.colors.mutedForeground}>Closing other tabs...</Text>
        </Box>
      )}
      {phase === "done" && (
        <Text color={theme.colors.success}>
          ✓ Closed {count} tab{count !== 1 ? "s" : ""}
        </Text>
      )}
      {phase === "error" && (
        <Text color={theme.colors.error}>✗ {msg}</Text>
      )}
    </Panel>
  );
}
