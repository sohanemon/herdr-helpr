import { Box, Text, useInput } from "ink";

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
    // NOTE: Filter non-printable characters (control chars, escape sequences) at the
    // input layer so downstream consumers don't need to sanitize.
    if (input && input.length === 1 && input.charCodeAt(0) >= 32) {
      onChange(value + input);
    }
  });

  return (
    <Box flexDirection="column">
      {label && (
        <Box marginBottom={1}>
          <Text bold>{label}</Text>
        </Box>
      )}
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <Text color="cyan">❯ </Text>
        {value.length > 0 ? <Text>{value}</Text> : <Text dimColor>{placeholder}</Text>}
        <Text color="cyan">█</Text>
      </Box>
    </Box>
  );
}
