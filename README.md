# GitHub PR Branch Warning

**English** | [日本語](#日本語)

---

A Chrome extension that protects your GitHub workflow with three types of warnings on pull request pages.

## Features

### 🔴 Wrong Base Branch Warning
- Shows a **red sticky banner** when the PR's base branch is not in your allowed list
- Prevents accidental merges into the wrong target branch

### 🟠 Merge-Forget Alert *(new in v1.2.0)*
- Configure a list of branches that the head branch **must be merged into** before the final merge
- Fetches the GitHub compare page using your browser session — no token required, works with private repositories
- Shows an **orange warning banner** if the head branch hasn't been merged into one or more required branches

### 🟣 Outside Merge Window Alert *(new in v1.2.0)*
- Define allowed merge time windows (day of week + time range + timezone)
- Shows a **purple warning banner** when opening a PR outside all configured windows
- Uses the [Temporal API](https://tc39.es/proposal-temporal/) for accurate timezone handling (falls back to `Intl.DateTimeFormat` if unavailable)
- Example: allow merges only Mon–Thu 10:00–18:00 Asia/Tokyo

### General
- Banner persists while scrolling (sticky positioning)
- All warnings stack cleanly — multiple banners are shown simultaneously if needed
- **EN / JA language toggle** — switch between English and Japanese from the popup
- Settings are synced across devices via `chrome.storage.sync`
- Supports GitHub SPA navigation (Turbo / Turbolinks)
- `main` is pre-configured as the default allowed branch on first install
- No warning shown when a feature has no configuration

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

### Tab 1 — Branch

1. Click the extension icon to open the settings popup
2. Add branch names you consider safe merge targets (e.g. `main`, `develop`)
3. Open any GitHub PR — if the base branch is not in your list, a **red banner** appears

### Tab 2 — Merge Check

1. Add branches that the PR's head branch must have been merged into (e.g. `staging`, `qa`)
2. Open a GitHub PR — if the head branch has unmerged commits, an **orange banner** appears

### Tab 3 — Time

1. Select the days of the week, start/end times, and timezone for an allowed merge window
2. Click **Add Window** to save it (multiple windows are supported)
3. Open a GitHub PR outside all configured windows — a **purple banner** appears

## Configuration

| Setting | Tab | Description |
|---|---|---|
| Allowed base branches | Branch | Base branch names considered safe. Empty = no warnings. |
| Merge-into check branches | Merge | Branches the head branch must be merged into before merging. |
| Time windows | Time | Day/time/timezone ranges during which merging is allowed. |
| Language | Header | EN (English) or JA (Japanese). |

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
├── popup.html      # Settings UI (3 tabs: Branch / Merge / Time)
├── popup.js        # Settings logic (i18n, branch/merge/time-window management)
└── icons/          # Extension icons (16, 48, 128px)
```

### How the Merge-Forget check works

The extension fetches `https://github.com/{owner}/{repo}/compare/{requiredBranch}...{headBranch}` from the content script using `credentials: 'include'`, so your existing GitHub login session is used automatically — no personal access token needed, and private repositories work out of the box.  
If the response HTML contains the text *"is up to date with all commits from"* or *"There isn't anything to compare"*, the head branch is considered merged → no warning. Otherwise an orange banner is shown.

### How the Time Window check works

Using `Temporal.Now.zonedDateTimeISO(timezone)` (with an `Intl.DateTimeFormat` fallback), the extension compares the current day-of-week and time against each configured window. If the current moment falls outside **all** windows, a warning is shown.

## Chrome Web Store Listing

**Short description:**
> Warns you when a GitHub PR targets a wrong branch, when a branch hasn't been merged, or when merging outside allowed hours.

**Detailed description:**
> GitHub PR Branch Warning protects your team from three common merge mistakes:
>
> **Wrong base branch** — A red sticky banner appears when the PR targets a branch not in your allowed list.
>
> **Merge-forget** — An orange banner warns you if the PR's head branch hasn't been merged into your required branches yet (e.g. staging, QA). Uses the GitHub compare page via your browser session — no token required, works with private repositories.
>
> **Outside merge window** — A purple banner warns you when opening a PR outside your configured merge hours (e.g. Mon–Thu 10:00–18:00 Asia/Tokyo). Uses the Temporal API for accurate timezone support.
>
> All settings are managed via a clean 3-tab popup (Branch / Merge / Time) with EN/JA language support.

## Privacy Policy

This extension does **not** collect, transmit, or share any personal data.

- **Data stored:** Your allowed branch list, merge-check branch list, time windows, and language preference — all saved locally via `chrome.storage.sync` (synced across your own Chrome profile by Google).
- **Data accessed:** The extension reads GitHub PR page DOM to detect branch names, and fetches GitHub compare pages using your existing browser session to check merge status. No data is sent to any other server.
- **No tracking:** No analytics, telemetry, or usage data is collected.
- **No third-party sharing:** No data is sold or transferred to any third party.

## License

MIT

---

# 日本語

**[English](#github-pr-branch-warning)** | 日本語

---

GitHubのプルリクエストページで3種類の警告を表示し、マージミスを防ぐChrome拡張機能です。

## 機能

### 🔴 意図しないマージ先ブランチ警告
- PRのベースブランチが許可リストにない場合に**赤いスティッキーバナー**を表示
- 誤ったターゲットブランチへのマージを防止

### 🟠 マージし忘れアラート *(v1.2.0 新機能)*
- 最終マージ前に**マージ済みであるべきブランチ**をリストとして設定
- ブラウザのログインセッションを使ってGitHubのCompareページを取得 — トークン不要、プライベートリポジトリにも対応
- 未マージのブランチがある場合に**オレンジのバナー**を表示

### 🟣 マージ可能時間外アラート *(v1.2.0 新機能)*
- マージを許可する時間帯（曜日・時間・タイムゾーン）を設定
- 設定した時間帯外にPR画面を開くと**紫のバナー**を表示
- タイムゾーン処理に[Temporal API](https://tc39.es/proposal-temporal/)を使用（非対応環境は`Intl.DateTimeFormat`でフォールバック）
- 例: 月〜木 10:00〜18:00 Asia/Tokyo のみマージ許可

### 共通
- スクロール中もバナーが追従（sticky配置）
- 複数の警告が同時に発生した場合はバナーが縦に積み重なって表示
- **EN / JA 言語切替** — ポップアップから英語・日本語を切り替え可能
- 設定は `chrome.storage.sync` によりデバイス間で同期
- GitHubのSPAナビゲーション（Turbo / Turbolinks）に対応
- 初回インストール時に `main` がデフォルトの許可ブランチとして自動設定
- 設定が未登録の機能は警告なし

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

### タブ1 — Branch（ブランチ）

1. 拡張機能アイコンをクリックして設定ポップアップを開く
2. 安全とみなすベースブランチ名を追加（例: `main`、`develop`）
3. GitHubのPRページを開いたとき、ベースブランチがリストにない場合は**赤いバナー**が表示される

### タブ2 — Merge（マージ確認）

1. 作業ブランチが事前にマージ済みであるべきブランチを追加（例: `staging`、`qa`）
2. GitHubのPRページを開いたとき、未マージのブランチがある場合は**オレンジのバナー**が表示される

### タブ3 — Time（時間帯）

1. 許可する曜日・開始/終了時刻・タイムゾーンを選択
2. **Add Window** をクリックして保存（複数登録可）
3. 設定した時間帯外にPRページを開くと**紫のバナー**が表示される

## 設定項目

| 設定 | タブ | 説明 |
|---|---|---|
| 許可ブランチ | Branch | 安全とみなすベースブランチ名。未設定の場合は警告なし。 |
| マージ済みチェックブランチ | Merge | 最終マージ前にマージ済みであるべきブランチ。 |
| 時間帯 | Time | マージを許可する曜日・時間・タイムゾーンの範囲。 |
| 言語 | ヘッダー | EN（英語）またはJA（日本語）。 |

## ライセンス

MIT
