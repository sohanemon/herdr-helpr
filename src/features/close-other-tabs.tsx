#!/usr/bin/env bun
import { Panel } from "@/components/ui/panel";
import { TaskError, TaskSuccess } from "@/components/ui/task-result";
import { TaskRunning } from "@/components/ui/task-running";
import { useAsyncTask } from "@/hooks/use-async-task";
import { herdrJson, herdrRun } from "@/lib/herdr";
import { renderPrompt } from "@/lib/render";

export function CloseOtherTabsPrompt() {
  const { phase, message } = useAsyncTask(
    async () => {
      const list = await herdrJson<{
        result?: { tabs?: { tab_id: string; focused?: boolean }[] };
      }>("tab", "list");
      const tabs = list?.result?.tabs;
      const focused = tabs?.find((t) => t.focused)?.tab_id;

      if (!tabs || !focused) {
        return focused ? "Done" : "No focused tab";
      }

      // Build workspace tab counts to avoid closing last tab in a workspace
      const wsCount: Record<string, number> = {};
      for (const t of tabs) {
        const wsKey = t.tab_id.split(":")[0] ?? "";
        wsCount[wsKey] = (wsCount[wsKey] || 0) + 1;
      }

      let closed = 0;
      for (const tab of tabs) {
        if (tab.tab_id === focused) continue;
        const wsKey = tab.tab_id.split(":")[0] ?? "";
        const n = wsCount[wsKey] ?? 0;
        if (n <= 1) continue;
        wsCount[wsKey] = n - 1;
        await herdrRun("tab", "close", tab.tab_id);
        closed++;
      }

      return `Closed ${closed} tab${closed !== 1 ? "s" : ""}`;
    },
    { autoExitDelay: 1200 },
  );

  return (
    <Panel title="Close Tabs">
      {phase === "running" && <TaskRunning label="Closing other tabs..." />}
      {phase === "done" && <TaskSuccess message={message} />}
      {phase === "error" && <TaskError message={message} />}
    </Panel>
  );
}

if (import.meta.main) {
  await renderPrompt(<CloseOtherTabsPrompt />);
}
