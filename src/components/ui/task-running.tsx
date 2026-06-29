import { Text } from "ink";
import { Spinner } from "@/components/ui/spinner";

export function TaskRunning({ label }: { label: string }) {
  return (
    <Text>
      <Spinner type="dots" />
      <Text> </Text>
      <Text dimColor>{label}</Text>
    </Text>
  );
}
