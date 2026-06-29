const HERDR = process.env.HERDR_BIN_PATH || "herdr";

export async function herdrJson<T = unknown>(...args: string[]): Promise<T> {
  const proc = Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  await proc.exited;
  return JSON.parse(out) as T;
}

export async function herdrRun(...args: string[]) {
  await Bun.spawn([HERDR, ...args], { stdout: "pipe", stderr: "pipe" });
}
