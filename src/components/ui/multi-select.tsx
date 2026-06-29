import { Box, Text, useInput } from "ink";
import { useState } from "react";

export interface MultiSelectOption<T = string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface MultiSelectProps<T = string> {
  options: MultiSelectOption<T>[];
  value?: T[];
  onChange?: (values: T[]) => void;
  onSubmit?: (values: T[]) => void;
  cursor?: string;
  checkmark?: string;
  height?: number;
}

export const MultiSelect = <T = string>({
  options,
  value: controlledValue,
  onChange,
  onSubmit,
  cursor = "›",
  checkmark = "◉",
  height,
}: MultiSelectProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalSelected, setInternalSelected] = useState<T[]>([]);
  const selected = controlledValue ?? internalSelected;

  const scrollOffset = (() => {
    if (!height) {
      return 0;
    }
    const half = Math.floor(height / 2);
    const maxOffset = options.length - height;
    const offset = activeIndex - half;
    if (offset < 0) {
      return 0;
    }
    if (offset > maxOffset) {
      return Math.max(0, maxOffset);
    }
    return offset;
  })();

  const visibleOptions = height ? options.slice(scrollOffset, scrollOffset + height) : options;

  useInput((_input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => {
        let next = i - 1;
        while (next >= 0 && options[next]?.disabled) {
          next -= 1;
        }
        return next < 0 ? i : next;
      });
    } else if (key.downArrow) {
      setActiveIndex((i) => {
        let next = i + 1;
        while (next < options.length && options[next]?.disabled) {
          next += 1;
        }
        return next >= options.length ? i : next;
      });
    } else if (key.return) {
      const opt = options[activeIndex];
      if (!opt || opt.disabled) return;

      const isSelected = selected.includes(opt.value);
      const next = isSelected ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
      setInternalSelected(next);
      onChange?.(next);
      if (!isSelected) {
        onSubmit?.(next);
      }
    }
  });

  return (
    <Box flexDirection="column" width={80}>
      {visibleOptions.map((opt, idx) => {
        const realIdx = height ? idx + scrollOffset : idx;
        const isActive = realIdx === activeIndex;
        const isSelected = selected.includes(opt.value);

        let labelColor: string | undefined;
        if (opt.disabled) {
          labelColor = undefined;
        } else if (isActive) {
          labelColor = "cyan";
        } else {
          labelColor = undefined;
        }

        return (
          <Box key={opt.value as unknown as string} gap={1}>
            <Text>
              {isActive ? (
                <Text color="cyan">{cursor}</Text>
              ) : (
                <Text>{" ".repeat(cursor.length)}</Text>
              )}
            </Text>
            <Text color={isSelected ? "cyan" : "gray"}>{checkmark}</Text>
            <Text color={labelColor} bold={isSelected} dimColor={opt.disabled}>
              {opt.label}
            </Text>
            {opt.hint && <Text dimColor>{opt.hint}</Text>}
          </Box>
        );
      })}
    </Box>
  );
};
