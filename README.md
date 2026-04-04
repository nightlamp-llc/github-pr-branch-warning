# GitHub PR Branch Warning

**English** | [日本語](#日本語)

---

A Chrome extension that displays a sticky red warning banner when a GitHub pull request targets an unexpected base branch.

## Features

- Shows a red sticky banner at the top of any PR page when the base branch is not in your allowed list
- Banner persists while scrolling (sticky positioning)
- Configurable allowed branches via popup UI
- **EN / JA language toggle** — switch between English and Japanese from the popup
- Settings are synced across devices via `chrome.storage.sync`
- Supports GitHub SPA navigation (Turbo / Turbolinks)
- `main` is pre-configured as the default allowed branch on first install
- No warning shown when no branches are configured

## Installation

### From Chrome Web Store

[Chrome Web Store](https://chromewebstore.google.com/detail/github-pr-branch-warning/kfbegmojndmlgamhppfphabkgfllllmj) からインストールできます。

1. 上のリンクから Chrome Web Store を開く
2. **「Chromeに追加」** をクリック

### Manual (Developer Mode)

1. Download and unzip the extension
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the unzipped folder

## Usage

1. Click the extension icon in the toolbar to open the settings popup
2. Add the branch names you consider "safe" targets (e.g. `main`, `develop`)
3. Open any GitHub PR — if the base branch is not in your list, a red warning banner appears
4. Use the **EN / JA** toggle in the popup to switch the UI language

## Configuration

| Setting | Description |
|---|---|
| Allowed branches | List of base branch names that are considered safe. If empty, no warnings are shown. |
| Language | EN (English) or JA (Japanese), toggled in the popup. |

## Development

```bash
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
├── background.js   # Service worker (sets default allowed branch on first install)
├── content.js      # Warning banner logic (injected into GitHub PR pages)
├── popup.html      # Settings UI
├── popup.js        # Settings logic (i18n, branch management)
└── icons/          # Extension icons (16, 48, 128px)
```

## Chrome Web Store Listing

**Short description:**
> Warns you when a GitHub PR targets a branch not in your allowed list. Never accidentally merge into the wrong branch.

**Detailed description:**
> GitHub PR Branch Warning helps teams avoid accidentally merging pull requests into the wrong branch.
>
> When you open a GitHub PR, the extension checks whether the base (target) branch is in your configured allowed list. If it isn't, a prominent red sticky banner appears at the top of the page — even while scrolling.
>
> Features:
> - Red sticky warning banner on unexpected base branches
> - Configurable allowed branch list (e.g. main, master, develop)
> - EN / JA language toggle
> - Settings sync across devices via Chrome sync
> - Works with GitHub's SPA navigation
> - No external data collection — all settings stored locally

## Privacy Policy

This extension does **not** collect, transmit, or share any personal data.

- **Data stored:** Only your configured allowed branch list and language preference, saved locally via `chrome.storage.sync` (synced across your own Chrome profile by Google).
- **Data accessed:** The extension reads GitHub PR page DOM to check the target branch name. This data is processed locally and never sent to any server.
- **No tracking:** No analytics, telemetry, or usage data is collected.
- **No third-party sharing:** No data is sold or transferred to any third party.

## License

MIT

---

# 日本語

**[English](#github-pr-branch-warning)** | 日本語

---

GitHubのプルリクエストが、許可リストにないベースブランチをターゲットにしている場合に、ページ上部に赤いスティッキーバナーを表示するChrome拡張機能です。

## 機能

- ベースブランチが許可リストに含まれていないPRページで赤いバナーを表示
- スクロール中もバナーが追従（sticky配置）
- ポップアップUIで許可ブランチを管理
- **EN / JA 言語切替** — ポップアップから英語・日本語を切り替え可能
- 設定は `chrome.storage.sync` によりデバイス間で同期
- GitHubのSPAナビゲーション（Turbo / Turbolinks）に対応
- 初回インストール時に `main` がデフォルトの許可ブランチとして自動設定
- ブランチが未設定の場合は警告なし

## インストール

### Chrome Web Storeから

[Chrome Web Store](https://chromewebstore.google.com/detail/github-pr-branch-warning/kfbegmojndmlgamhppfphabkgfllllmj) で公開中です。

1. 上のリンクから Chrome Web Store を開く
2. **「Chromeに追加」** をクリック

### 手動インストール（デベロッパーモード）

1. 拡張機能をダウンロードして解凍
2. `chrome://extensions/` を開く
3. 右上の **「デベロッパーモード」をON**
4. **「パッケージ化されていない拡張機能を読み込む」** をクリックして解凍フォルダを選択

## 使い方

1. ツールバーの拡張機能アイコンをクリックして設定ポップアップを開く
2. 「安全」とみなすベースブランチ名を追加（例: `main`、`develop`）
3. GitHubのPRページを開いたとき、ベースブランチがリストにない場合は赤いバナーが表示される
4. ポップアップの **EN / JA** ボタンでUI言語を切り替え可能

## 設定項目

| 設定 | 説明 |
|---|---|
| 許可ブランチ | 安全とみなすベースブランチ名のリスト。空の場合は警告なし。 |
| 言語 | EN（英語）または JA（日本語）。ポップアップで切り替え。 |

## ライセンス

MIT
