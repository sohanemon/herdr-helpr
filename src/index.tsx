#!/usr/bin/env bun
/**
 * herdr-helpr — TUI entry point
 *
 * Usage: herdr-helpr <command>
 *   prompt-new-workspace
 *   prompt-rename-workspace
 *   prompt-close-other-tabs
 *   prompt-close-other-panes
 */
import React from "react";
import { render, Box, Text, useStdout } from "ink";
import { ThemeProvider } from "./components/ui/theme-provider";
import { NewWorkspacePrompt } from "./features/new-workspace";
import { RenameWorkspacePrompt } from "./features/rename-workspace";
import { CloseOtherTabsPrompt } from "./features/close-other-tabs";
import { CloseOtherPanesPrompt } from "./features/close-other-panes";
import { Panel } from "./components/ui/panel";

const cmd = process.argv[2] || "help";

function Main() {
  switch (cmd) {
    case "prompt-new-workspace":
      return <NewWorkspacePrompt />;
    case "prompt-rename-workspace":
      return <RenameWorkspacePrompt />;
    case "prompt-close-other-tabs":
      return <CloseOtherTabsPrompt />;
    case "prompt-close-other-panes":
      return <CloseOtherPanesPrompt />;
    default:
      return (
        <Panel title="herdr-helpr">
          <Text>Commands:</Text>
          <Text> prompt-new-workspace</Text>
          <Text> prompt-rename-workspace</Text>
          <Text> prompt-close-other-tabs</Text>
          <Text> prompt-close-other-panes</Text>
        </Panel>
      );
  }
}

function FullCenter({ children }: { children: React.ReactNode }) {
  const { stdout } = useStdout();
  return (
    <Box
      flexDirection="column"
      minHeight={stdout?.rows ?? 24}
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FullCenter>
        <Main />
      </FullCenter>
    </ThemeProvider>
  );
}

(async () => {
  const { waitUntilExit } = render(<App />);
  await waitUntilExit();
})();
