import { Box, Text } from "ink";
import type { ReactNode } from "react";

export interface PanelProps {
  title: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <Box flexDirection="column" alignItems="center" paddingTop={1}>
      <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
        <Text bold color="cyan">
          {title}
        </Text>
        <Box marginY={1}>
          <Text color="gray">{"\u2500".repeat(40)}</Text>
        </Box>
        {children}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>↵ confirm · esc cancel</Text>
      </Box>
    </Box>
  );
}
