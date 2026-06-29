import { Text } from "ink";

export function TaskSuccess({ message }: { message: string }) {
  return <Text color="green">✓ {message}</Text>;
}

export function TaskError({ message }: { message: string }) {
  return <Text color="red">✗ {message}</Text>;
}
