import { Box, Text, useInput } from "ink";
import { useTheme } from "./theme-provider";


export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  label?: string;
  placeholder?: string;
}

export function Input({
  value,
  onChange,
  onSubmit,
  onCancel,
  label,
  placeholder = "",
}: InputProps) {
  const theme = useTheme();

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      onSubmit();
      return;
    }
    if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
      return;
    }
    if (input && input.length === 1 && input.charCodeAt(0) >= 32) {
      onChange(value + input);
    }
  });

  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Text bold color={theme.colors.foreground}>
            {label}
          </Text>
        </Box>
      )}
      <Box
        borderStyle="round"
        borderColor={theme.colors.border}
        paddingX={1}
      >
        <Text color={theme.colors.primary}>❯ </Text>
        {value.length > 0 ? (
          <Text color={theme.colors.foreground}>{value}</Text>
        ) : (
          <Text color={theme.colors.mutedForeground}>{placeholder}</Text>
        )}
        <Text color={theme.colors.focusRing}>█</Text>
      </Box>
    </Box>
  );
}
