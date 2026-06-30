# herdr-helpr

Prompt-driven workspace and pane management for herdr. Name workspaces before
they're created, rename them in-place, and close everything but what you're
focused on — all through keyboard-driven overlays that stay out of your flow.

## Install

```bash
herdr plugin install sohanemon/herdr-helpr
```

Clones, builds, and registers the plugin. Actions appear in herdr's UI
immediately.

### Manual

```bash
git clone https://github.com/sohanemon/herdr-helpr
cd herdr-helpr
bun install
herdr plugin link "$PWD"
```

## Tools

| ID | Type | Title | Description |
|---|---|---|---|
<!-- GENERATED:TOOLS -->
| `workspace:create` | pane | New Workspace | Create a workspace with an optional name |
| `workspace:rename` | pane | Rename Workspace | Rename the currently focused workspace |
| `workspace:switch` | pane | Switch Workspace | List all workspaces and pick one to focus |
| `tab:create` | pane | New Tab | Create a tab with an optional name |
| `tab:rename` | pane | Rename Tab | Rename the currently focused tab |
| `tab:close-other` | pane | Close Other Tabs | Close all non-focused tabs while keeping at least one per workspace |
| `pane:close-other` | pane | Close Other Panes | Close all non-focused panes |
| `pane:zoom-toggle` | action | Toggle Zoom | Zoom/unzoom the current pane |
<!-- /GENERATED:TOOLS -->

## Usage

Each interactive pane opens an Ink overlay — arrow keys to navigate, `↵` to confirm,
`esc` to cancel.

Bind any action in `~/.config/herdr/config.toml`:

```toml
[[keys.command]]
key = "alt+n"
type = "plugin_action"
command = "herdr-helpr.workspace:create"
description = "New Workspace"

[[keys.command]]
key = "alt+r"
type = "plugin_action"
command = "herdr-helpr.workspace:rename"
description = "Rename Workspace"

[[keys.command]]
key = "alt+shift+x"
type = "plugin_action"
command = "herdr-helpr.tab:close-other"
description = "Close Other Tabs"

[[keys.command]]
key = "alt+shift+c"
type = "plugin_action"
command = "herdr-helpr.pane:close-other"
description = "Close Other Panes"
```

Then reload: `herdr server reload-config`.

## Development

```bash
bun install
bunx tsc --noEmit
bunx biome check src/
herdr plugin link "$PWD"
```

## Requirements

- [Bun](https://bun.sh)
- herdr ≥ 0.7.0
- Linux or macOS
