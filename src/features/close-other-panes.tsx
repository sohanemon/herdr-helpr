#!/usr/bin/env bun
import { Panel } from "@/components/ui/panel";
import { TaskError, TaskSuccess } from "@/components/ui/task-result";
import { TaskRunning } from "@/components/ui/task-running";
import { useAsyncTask } from "@/hooks/use-async-task";
import { herdrJson, herdrRun } from "@/lib/herdr";
import { renderPrompt } from "@/lib/render";

export function CloseOtherPanesPrompt() {
  const { phase, message } = useAsyncTask(
    async () => {
      const list = await herdrJson<{
        result?: { panes?: { pane_id: string; focused?: boolean }[] };
      }>("pane", "list");
      const panes = list?.result?.panes;
      const focused = panes?.find((p) => p.focused)?.pane_id;

      if (!panes || !focused) {
        return focused ? "Done" : "No focused pane";
      }

      let closed = 0;
      for (const pane of panes) {
        if (pane.pane_id !== focused) {
          await herdrRun("pane", "close", pane.pane_id);
          closed++;
        }
      }

      return `Closed ${closed} pane${closed !== 1 ? "s" : ""}`;
    },
    { autoExitDelay: 1200 },
  );

  return (
    <Panel title="Close Panes">
      {phase === "running" && <TaskRunning label="Closing other panes..." />}
      {phase === "done" && <TaskSuccess message={message} />}
      {phase === "error" && <TaskError message={message} />}
    </Panel>
  );
}

if (import.meta.main) {
  await renderPrompt(<CloseOtherPanesPrompt />);
}
