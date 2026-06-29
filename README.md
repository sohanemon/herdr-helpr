# herdr-helpr

A swiss-army knife for [herdr](https://herdr.io): create named workspaces, close other tabs/panes, rename workspaces interactively, and more.

## Features

| Action | Description |
|---|---|
| **New Workspace** | Create a workspace with an optional name |
| **Rename Workspace** | Rename the currently focused workspace |
| **Close Other Tabs** | Close all non-focused tabs while keeping at least one per workspace |
| **Close Other Panes** | Close all non-focused panes |

## Install

### via herdr (recommended)

```bash
herdr plugin install sohanemon/herdr-helpr
```

This clones the repo, runs `bun install`, and registers the plugin. The actions and panes will appear automatically in herdr's UI.

### via mise

Add to your `~/.config/mise/config.toml` or `.mise.toml`:

```toml
[tools]
"github:sohanemon/herdr-helpr" = "latest"
```

Then install with:

```bash
mise install herdr-helpr
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

Once installed, access the tools from herdr's command palette or keybindings:

- **New Workspace** → `workspace:create`
- **Rename Workspace** → `workspace:rename`
- **Close Other Tabs** → `tab:close-other`
- **Close Other Panes** → `pane:close-other`

Each opens an interactive overlay where you can confirm or cancel with ↵ / esc.

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
