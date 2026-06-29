import type React from "react";
import { CloseOtherPanesPrompt } from "@/features/close-other-panes";
import { CloseOtherTabsPrompt } from "@/features/close-other-tabs";
import { NewWorkspacePrompt } from "@/features/new-workspace";
import { RenameWorkspacePrompt } from "@/features/rename-workspace";

export interface ActionEntry {
  id: string;
  label: string;
  el: React.ReactNode;
}

export const actions = [
  { id: "workspace:create", label: "New Workspace", el: <NewWorkspacePrompt /> },
  { id: "workspace:rename", label: "Rename Workspace", el: <RenameWorkspacePrompt /> },
  { id: "tab:close-other", label: "Close Other Tabs", el: <CloseOtherTabsPrompt /> },
  { id: "pane:close-other", label: "Close Other Panes", el: <CloseOtherPanesPrompt /> },
] satisfies ActionEntry[];

export type ActionId = (typeof actions)[number]["id"];

export function promptEntrypoint(id: string): `prompt-${string}` {
  return `prompt-${id}`;
}
