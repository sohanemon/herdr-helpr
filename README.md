# herdr-helpr

A swiss-army knife of [herdr](https://herdr.io) helpers: create and rename workspaces and tabs, switch between workspaces, close other tabs and panes, toggle zoom, and more.

## Features

| Action | Type | Description |
|---|---|---|
| **New Workspace** | pane | Create a workspace with an optional name |
| **Rename Workspace** | pane | Rename the currently focused workspace |
| **Switch Workspace** | pane | List all workspaces and pick one to focus |
| **New Tab** | pane | Create a tab with an optional name |
| **Rename Tab** | pane | Rename the currently focused tab |
| **Close Other Tabs** | pane | Close all non-focused tabs while keeping at least one per workspace |
| **Close Other Panes** | pane | Close all non-focused panes |
| **Toggle Zoom** | action | Zoom/unzoom the current pane |

## Install

### via herdr (recommended)

```bash
herdr plugin install sohanemon/herdr-helpr
```

This clones the repo, runs `bun install`, and registers the plugin. All actions and panes appear automatically in herdr's UI.

### via mise

Add to your `~/.config/mise/config.toml` or `.mise.toml`:

```toml
[tools]
"github:sohanemon/herdr-helpr" = "latest"
```

### manual

```bash
# Download the latest release
curl -sL "https://github.com/sohanemon/herdr-helpr/releases/latest/download/herdr-helpr-*.tar.gz" \
  | tar xz
cd herdr-helpr-*/
bun install
```

Then link it into herdr:

```bash
herdr plugin link "$PWD"
```

## Usage

Once installed, bind actions in your `config.toml` keybindings or trigger them from the command palette:

| ID | What it does |
|---|---|
| `workspace:create` | Open a prompt to name and create a new workspace |
| `workspace:rename` | Rename the currently focused workspace |
| `workspace:switch` | Browse all workspaces and jump to one |
| `tab:create` | Open a prompt to name and create a new tab |
| `tab:rename` | Rename the currently focused tab |
| `tab:close-other` | Close every tab except the focused one |
| `pane:close-other` | Close every pane except the focused one |
| `pane:zoom-toggle` | Toggle zoom on the current pane |

Each interactive pane opens an overlay where you navigate with arrow keys and confirm/cancel with ↵ / esc.

### Suggested keybindings

```toml
# In your herdr config.toml
[[keys]]
keys = ["alt", "t"]
action = { plugin = "herdr-helpr", id = "tab:create" }

[[keys]]
keys = ["alt", "w"]
action = { plugin = "herdr-helpr", id = "workspace:switch" }

[[keys]]
keys = ["alt", "z"]
action = { plugin = "herdr-helpr", id = "pane:zoom-toggle" }
```

## Development

```bash
# Install dependencies
bun install

# Type-check
bun run --bun tsc --noEmit

# Format & lint
bunx @biomejs/biome check src/

# Auto-fix
bunx @biomejs/biome check --write src/

# Link locally for testing
herdr plugin link "$PWD"
```

### Creating a release

```bash
# Tag and push — the GitHub Action builds and publishes the release
git tag v0.1.0
git push origin v0.1.0
```

## Requirements

- [Bun](https://bun.sh) — runtime for the plugin scripts
- herdr v0.7.0 or later
- Linux or macOS
