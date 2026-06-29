import { Text } from "ink";
import { useTheme } from "@/components/ui/theme-provider";

export function TaskSuccess({ message }: { message: string }) {
  const theme = useTheme();
  return <Text color={theme.colors.success}>✓ {message}</Text>;
}

export function TaskError({ message }: { message: string }) {
  const theme = useTheme();
  return <Text color={theme.colors.error}>✗ {message}</Text>;
}
