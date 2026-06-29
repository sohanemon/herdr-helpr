#!/usr/bin/env bun
import { Box, render, Text, useStdout } from "ink";
/**
 * herdr-helpr — TUI entry point
 *
 * Usage: herdr-helpr <entrypoint>
 */
import type React from "react";
import { Panel } from "./components/ui/panel";
import { ThemeProvider } from "./components/ui/theme-provider";
import { actions, promptEntrypoint } from "./lib/actions";

const cmd = process.argv[2] || "help";

const componentMap = Object.fromEntries(actions.map((a) => [promptEntrypoint(a.id), a.el]));

function Main() {
  const component = componentMap[cmd];
  if (component) return component;

  return (
    <Panel title="herdr-helpr">
      <Text>Entrypoints:</Text>
      {actions.map((a) => (
        <Text key={a.id}> {promptEntrypoint(a.id)}</Text>
      ))}
    </Panel>
  );
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
