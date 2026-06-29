import type { ReactNode } from "react";

import { Box, Text } from "ink";
import { useTheme } from "./theme-provider";

export interface PanelProps {
  title: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  const theme = useTheme();
  return (
    <Box flexDirection="column" alignItems="center" paddingTop={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={theme.colors.primary}
        paddingX={2}
        paddingY={1}
      >
        <Text bold color={theme.colors.primary}>
          {title}
        </Text>
        <Box marginY={1}>
          <Text color={theme.colors.border}>{"\u2500".repeat(40)}</Text>
        </Box>
        {children}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.colors.mutedForeground}>↵ confirm · esc cancel</Text>
      </Box>
    </Box>
  );
}
