# GitHub PR Branch Warning

A Chrome extension that displays a sticky red warning banner when a GitHub pull request targets an unexpected base branch.

## Features

- Shows a red sticky banner at the top of any PR page when the base branch is not in your allowed list
- Banner persists while scrolling (sticky positioning)
- Configurable allowed branches via popup UI
- Settings are synced across devices via `chrome.storage.sync`
- Supports GitHub SPA navigation (Turbo / Turbolinks)
- No warning shown when no branches are configured

## Installation

### From Chrome Web Store

*(Coming soon)*

### Manual (Developer Mode)

1. Download and unzip the extension
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the unzipped folder

## Usage

1. Click the extension icon in the toolbar to open the settings popup
2. Add the branch names you consider "safe" targets (e.g. `main`, `develop`)
3. Open any GitHub PR — if the base branch is not in your list, a red warning banner appears

![Warning banner example](docs/screenshot-warning.png)

## Configuration

| Setting | Description |
|---|---|
| Allowed branches | List of base branch names that are considered safe. If empty, no warnings are shown. |

## Development

```bash
# Clone the repo
git clone https://github.com/nightlamp-llc/github-pr-branch-warning.git
cd github-pr-branch-warning

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked" → select this directory
```

### File structure

```
├── manifest.json   # Manifest V3 config
├── content.js      # Warning banner logic (injected into GitHub PR pages)
├── popup.html      # Settings UI
├── popup.js        # Settings logic
└── icons/          # Extension icons (16, 48, 128px)
```

## Chrome Web Store Listing

**Short description (132 chars):**
> Warns you when a GitHub PR targets an unexpected base branch. Configurable allowed branch list. Never accidentally merge into the wrong branch.

**Detailed description:**
> GitHub PR Branch Warning helps teams avoid accidentally merging pull requests into the wrong branch.
>
> When you open a GitHub PR, the extension checks whether the base (target) branch is in your configured allowed list. If it isn't, a prominent red sticky banner appears at the top of the page — even while scrolling.
>
> **Features:**
> - Red sticky warning banner on unexpected base branches
> - Configurable allowed branch list (e.g. main, master, develop)
> - Settings sync across devices via Chrome sync
> - Works with GitHub's SPA navigation
> - No external data collection — all settings stored locally

## License

MIT
