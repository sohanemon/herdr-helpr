#!/usr/bin/env bun
import { herdrRun } from "@/lib/herdr";

const id = process.argv[2];
if (!id) {
  console.error("Usage: herdr-helpr <action-id>");
  process.exit(1);
}

await herdrRun("plugin", "pane", "open", "--plugin", "herdr-helpr", "--entrypoint", id);
