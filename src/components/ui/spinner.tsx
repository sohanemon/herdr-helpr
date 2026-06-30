import cliSpinners from "cli-spinners";
import { Text } from "ink";
import { useAnimation } from "@/hooks/use-animation";

export type SpinnerType = string;

export const spinnerNames = Object.keys(cliSpinners);

export interface SpinnerProps {
  type?: SpinnerType;
  label?: string;
  color?: string;
  fps?: number;
  frames?: string[];
}

export const Spinner = ({
  type: spinnerType = "dots",
  label,
  color,
  fps = 12,
  frames: customFrames,
}: SpinnerProps) => {
  const builtin = cliSpinners[spinnerType] ?? cliSpinners.dots;
  // biome-ignore lint/style/noNonNullAssertion: ?? fallback guarantees non-null at runtime
  const spinner = builtin!;
  const useCustomFrames = customFrames !== undefined;
  const frames = useCustomFrames ? customFrames : spinner.frames;
  const frame = useAnimation(useCustomFrames ? fps : { intervalMs: spinner.interval });
  const icon = frames[frame % frames.length];
  const resolvedColor = color ?? "cyan";

  return (
    <Text>
      <Text color={resolvedColor}>{icon}</Text>
      {label && <Text> {label}</Text>}
    </Text>
  );
};
