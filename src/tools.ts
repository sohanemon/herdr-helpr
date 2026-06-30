/**
 * Single source of truth for all herdr-helpr tools.
 *
 * Everything else is derived from this:
 *   - herdr-plugin.toml       ← scripts/generate-plugin-toml.ts
 *   - src/actions.ts          ← imports TOOLS
 *   - src/cli.ts              ← imports TOOLS
 *   - README.md docs          ← (manual, but references the same IDs)
 */

export interface ToolDef {
  /** Unique action/pane identifier (e.g. "workspace:create") */
  id: string;
  /** Human-readable title shown in herdr's UI (e.g. "New Workspace") */
  title: string;
  /** Short description for CLI --help / README */
  description: string;
  /**
   * For pane overlays: the feature file stem under src/features/.
   * e.g. "new-workspace" → src/features/new-workspace.tsx
   *
   * Generates both [[actions]] (opens via actions.ts) and [[panes]] entries.
   * Mutually exclusive with directCommand.
   */
  module?: string;
  /**
   * For direct actions (no UI): herdr subcommand args run synchronously.
   * e.g. ["pane", "zoom", "--toggle"] — no overlay, no user interaction.
   *
   * Generates only an [[actions]] entry; actions.ts runs this directly.
   * Mutually exclusive with `module`.
   */
  directCommand?: string[];
}

export const TOOLS: ToolDef[] = [
  {
    id: "workspace:create",
    title: "New Workspace",
    description: "Create a workspace with an optional name",
    module: "new-workspace",
  },
  {
    id: "workspace:rename",
    title: "Rename Workspace",
    description: "Rename the currently focused workspace",
    module: "rename-workspace",
  },
  {
    id: "workspace:switch",
    title: "Switch Workspace",
    description: "List all workspaces and pick one to focus",
    module: "workspace-switch",
  },
  {
    id: "tab:create",
    title: "New Tab",
    description: "Create a tab with an optional name",
    module: "new-tab",
  },
  {
    id: "tab:rename",
    title: "Rename Tab",
    description: "Rename the currently focused tab",
    module: "rename-tab",
  },
  {
    id: "tab:close-other",
    title: "Close Other Tabs",
    description: "Close all non-focused tabs while keeping at least one per workspace",
    module: "close-other-tabs",
  },
  {
    id: "pane:close-other",
    title: "Close Other Panes",
    description: "Close all non-focused panes",
    module: "close-other-panes",
  },
  {
    id: "pane:zoom-toggle",
    title: "Toggle Zoom",
    description: "Zoom/unzoom the current pane",
    directCommand: ["pane", "zoom", "--toggle"],
  },
];
