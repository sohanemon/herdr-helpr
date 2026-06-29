import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput, useApp, measureElement } from "ink";

// ── Color palette ─────────────────────────────────────
const palette = {
  accent: "#67b5f7",
  accentDim: "#3a7bc8",
  bg: "#1a1b26",
  surface: "#1f2133",
  border: "#2f314a",
  text: "#c0caf5",
  dim: "#565f89",
  success: "#9ece6a",
  warning: "#e0af68",
  error: "#f7768e",
  cursor: "#67b5f7",
};

// ── Floating Panel ────────────────────────────────────

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <Box flexDirection="column" alignItems="center" paddingTop={1}>
      {/* Outer container with rounded border */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={palette.accent}
        paddingX={2}
        paddingY={1}
      >
        {/* Title */}
        <Box>
          <Text bold color={palette.accent}>
            {title}
          </Text>
        </Box>

        {/* Separator */}
        <Box marginY={1}>
          <Text color={palette.border}>
            {"\u2500".repeat(40)}
          </Text>
        </Box>

        {/* Content */}
        {children}
      </Box>

      {/* Footer hint */}
      <Box marginTop={1}>
        <Text color={palette.dim}>↵ confirm · esc cancel</Text>
      </Box>
    </Box>
  );
}

// ── Text Input ────────────────────────────────────────

interface InputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function Input({
  label,
  placeholder = "",
  value,
  onChange,
  onSubmit,
  onCancel,
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
    if (input && input.length === 1 && input.charCodeAt(0) >= 32) {
      onChange(value + input);
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={palette.text}>
          {label}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color={palette.accent}>❯ </Text>
        {value.length > 0 ? (
          <Text color={palette.text}>{value}</Text>
        ) : (
          <Text color={palette.dim}>{placeholder}</Text>
        )}
        <Text color={palette.cursor}>█</Text>
      </Box>
    </Box>
  );
}

// ── Select List ───────────────────────────────────────

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function Select({
  label,
  options,
  value,
  onChange,
  onSubmit,
  onCancel,
}: SelectProps) {
  const [cursor, setCursor] = useState(
    Math.max(0, options.findIndex((o) => o.value === value))
  );

  useInput((_input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      onSubmit(options[cursor]?.value ?? "");
      return;
    }
    if (key.upArrow) {
      setCursor((c) => (c > 0 ? c - 1 : options.length - 1));
    }
    if (key.downArrow) {
      setCursor((c) => (c < options.length - 1 ? c + 1 : 0));
    }
  });

  useEffect(() => {
    onChange(options[cursor]?.value ?? "");
  }, [cursor, onChange]);

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={palette.text}>
          {label}
        </Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {options.slice(0, 12).map((opt, i) => (
          <Box key={opt.value}>
            {i === cursor ? (
              <Text bold color={palette.accent}>
                ● {opt.label}
              </Text>
            ) : (
              <Text color={palette.dim}>○ {opt.label}</Text>
            )}
          </Box>
        ))}
        {options.length > 12 && (
          <Text color={palette.dim}>… {options.length - 12} more</Text>
        )}
      </Box>
    </Box>
  );
}

// ── Confirm Dialog ────────────────────────────────────

interface ConfirmProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirm({
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
}: ConfirmProps) {
  const [choice, setChoice] = useState<"confirm" | "cancel">("confirm");

  useInput((_input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      choice === "confirm" ? onConfirm() : onCancel();
      return;
    }
    if (key.leftArrow || key.rightArrow) {
      setChoice((c) => (c === "confirm" ? "cancel" : "confirm"));
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={palette.text}>
          {title}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color={palette.text}>{message}</Text>
      </Box>
      <Box marginTop={1} gap={2}>
        <Box
          borderStyle={choice === "confirm" ? "round" : undefined}
          borderColor={choice === "confirm" ? palette.success : palette.border}
          paddingX={1}
        >
          <Text
            bold={choice === "confirm"}
            color={choice === "confirm" ? palette.success : palette.dim}
          >
            {confirmLabel}
          </Text>
        </Box>
        <Box
          borderStyle={choice === "cancel" ? "round" : undefined}
          borderColor={choice === "cancel" ? palette.error : palette.border}
          paddingX={1}
        >
          <Text
            bold={choice === "cancel"}
            color={choice === "cancel" ? palette.error : palette.dim}
          >
            {cancelLabel}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

// ── Combobox (search + select) ───────────────────────

interface ComboboxProps {
  label: string;
  options: Option[];
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function Combobox({
  label,
  options,
  onSubmit,
  onCancel,
}: ComboboxProps) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.value.toLowerCase().includes(query.toLowerCase())
  );

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      if (filtered[cursor]) onSubmit(filtered[cursor].value);
      return;
    }
    if (key.upArrow) {
      setCursor((c) => (c > 0 ? c - 1 : 0));
      return;
    }
    if (key.downArrow) {
      setCursor((c) => (c < filtered.length - 1 ? c + 1 : filtered.length - 1));
      return;
    }
    if (key.backspace || key.delete) {
      setQuery((q) => q.slice(0, -1));
      setCursor(0);
      return;
    }
    if (input && input.length === 1 && input.charCodeAt(0) >= 32) {
      setQuery((q) => q + input);
      setCursor(0);
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={palette.text}>
          {label}
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color={palette.dim}>search: </Text>
        {query.length > 0 ? (
          <Text color={palette.text}>{query}</Text>
        ) : (
          <Text color={palette.dim}>type to filter...</Text>
        )}
        <Text color={palette.cursor}>█</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {filtered.length === 0 ? (
          <Text color={palette.dim}>no matches</Text>
        ) : (
          filtered.slice(0, 10).map((opt, i) => (
            <Box key={opt.value}>
              {i === cursor ? (
                <Text bold color={palette.accent}>
                  ● {opt.label}
                </Text>
              ) : (
                <Text color={palette.dim}>○ {opt.label}</Text>
              )}
            </Box>
          ))
        )}
        {filtered.length > 10 && (
          <Text color={palette.dim}>… {filtered.length - 10} more</Text>
        )}
      </Box>
    </Box>
  );
}

// ── Status Indicator ─────────────────────────────────

interface StatusProps {
  message: string;
  status: "running" | "success" | "error";
}

export function Status({ message, status }: StatusProps) {
  const icon =
    status === "running" ? "⋯" : status === "success" ? "✓" : "✗";
  const color =
    status === "running"
      ? palette.warning
      : status === "success"
        ? palette.success
        : palette.error;

  return (
    <Box>
      <Text color={color}>{icon}</Text>
      <Text> </Text>
      <Text color={palette.text}>{message}</Text>
    </Box>
  );
}
