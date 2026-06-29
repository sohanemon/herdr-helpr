import { Box, Text } from "ink";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "@/components/ui/theme-provider";

export function TaskRunning({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <Box gap={1}>
      <Spinner type="dots" />
      <Text color={theme.colors.mutedForeground}>{label}</Text>
    </Box>
  );
}
