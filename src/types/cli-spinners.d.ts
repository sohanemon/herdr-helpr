declare module "cli-spinners" {
  export type SpinnerName = string;

  export type Spinner = {
    readonly interval: number;
    readonly frames: string[];
  };

  const cliSpinners: Record<string, Spinner>;

  export default cliSpinners;
}
