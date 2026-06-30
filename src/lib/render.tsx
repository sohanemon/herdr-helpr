import { Box, render, useStdout } from "ink";
import type React from "react";

function FullCenter({ children }: { children: React.ReactNode }) {
  // NOTE: Match the terminal height so content is vertically centered regardless of terminal size.
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

export async function renderPrompt(element: React.ReactNode) {
  const { waitUntilExit } = render(<FullCenter>{element}</FullCenter>);
  await waitUntilExit();
}
