import { Box, Text, useFocus, useInput } from "ink";
import { useCallback, useMemo, useState } from "react";
import type { BorderStyle } from "./theme-provider";

export interface SearchInputProps<T = string> {
  options?: T[];
  getValue?: (item: T) => string;
  value?: string;
  onChange?: (query: string) => void;
  onSelect?: (item: T) => void;
  placeholder?: string;
  label?: string;
  maxResults?: number;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
  searchIcon?: string;
  resultCursor?: string;
}

export const SearchInput = <T = string>({
  options,
  getValue,
  value: controlledValue,
  onChange,
  onSelect,
  placeholder = "Search...",
  label,
  maxResults = 5,
  id,
  borderStyle = "round",
  paddingX = 1,
  cursor = "█",
  searchIcon = "\uD83D\uDD0D",
  resultCursor = "›",
}: SearchInputProps<T>) => {
  const [internalValue, setInternalValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { isFocused } = useFocus({ id });

  const query = controlledValue ?? internalValue;

  const getItemValue = useCallback(
    (item: T): string => {
      if (getValue) {
        return getValue(item);
      }
      return String(item);
    },
    [getValue],
  );

  const setQuery = (newQuery: string) => {
    if (onChange) {
      onChange(newQuery);
    } else {
      setInternalValue(newQuery);
    }
  };

  const filteredResults = useMemo(() => {
    if (!options || options.length === 0) {
      return [];
    }
    if (!query) {
      return options.slice(0, maxResults);
    }
    const lower = query.toLowerCase();
    return options
      .filter((item) => getItemValue(item).toLowerCase().includes(lower))
      .slice(0, maxResults);
  }, [options, query, maxResults, getItemValue]);

  useInput(
    (input, key) => {
      if (!isFocused) {
        return;
      }

      if (key.escape) {
        setQuery("");
        setShowResults(false);
        setSelectedIndex(0);
        return;
      }

      if (key.return) {
        if (showResults && filteredResults.length > 0) {
          const item = filteredResults[selectedIndex];
          if (item !== undefined) onSelect?.(item);
          setShowResults(false);
          setSelectedIndex(0);
        }
        return;
      }

      if (key.upArrow && showResults) {
        setSelectedIndex((i) => Math.max(0, i - 1));
        return;
      }

      if (key.downArrow && showResults) {
        setSelectedIndex((i) => Math.min(filteredResults.length - 1, i + 1));
        return;
      }

      if (key.backspace || key.delete) {
        setQuery(query.slice(0, -1));
        setShowResults(true);
        setSelectedIndex(0);
        return;
      }

      if (input && input.length === 1 && input.charCodeAt(0) >= 32) {
        setQuery(query + input);
        setShowResults(true);
        setSelectedIndex(0);
      }
    },
    { isActive: isFocused },
  );

  const borderColor = isFocused ? "cyan" : "gray";
  const hasResults = showResults && filteredResults.length > 0;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box borderStyle={borderStyle} borderColor={borderColor} paddingX={paddingX}>
        <Text dimColor>{searchIcon}</Text>
        {query ? <Text>{query}</Text> : <Text dimColor>{placeholder}</Text>}
        {isFocused && <Text color="cyan">{cursor}</Text>}
      </Box>
      {hasResults && (
        <Box flexDirection="column" paddingLeft={2}>
          {filteredResults.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <Box key={getItemValue(item)} flexDirection="row">
                <Text color={isSelected ? "cyan" : "gray"}>
                  {isSelected ? resultCursor : " ".repeat(resultCursor.length)}
                </Text>
                <Text dimColor={!isSelected}>{getItemValue(item)}</Text>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
