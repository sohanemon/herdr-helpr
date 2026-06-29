"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TaskPhase = "loading" | "running" | "done" | "error";

export interface AsyncTaskState<T = string> {
  phase: TaskPhase;
  message: T;
}

export interface UseAsyncTaskOptions {
  autoExitDelay?: number;
}

export function useAsyncTask<T = string>(fn: () => Promise<T>, options: UseAsyncTaskOptions = {}) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [{ phase, message }, setState] = useState<AsyncTaskState<T>>({
    phase: "running",
    message: undefined as unknown as T,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      try {
        const result = await fnRef.current();
        setState({ phase: "done", message: result });
        const { autoExitDelay } = optionsRef.current;
        if (autoExitDelay) {
          timer = setTimeout(() => process.exit(0), autoExitDelay);
        }
      } catch (e: unknown) {
        setState({
          phase: "error",
          message: (e instanceof Error ? e.message : String(e)) as T,
        });
      }
    })();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const reset = useCallback(() => {
    setState({ phase: "running", message: undefined as unknown as T });
  }, []);

  return { phase, message, reset } as const;
}
