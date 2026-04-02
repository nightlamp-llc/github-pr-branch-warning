'use strict';

const DEFAULT_BRANCHES = ['main', 'master'];
const WARNING_ID = 'gh-pr-branch-warning-banner';

function isPRPage() {
  return /^\/[^/]+\/[^/]+\/pull\/\d+/.test(window.location.pathname);
}

function getBaseBranch() {
  // 新GitHub UI (2025+): prc-BranchName クラス — DOM順で最初がbase branch
  const prcBranches = document.querySelectorAll('[class*="prc-BranchName-BranchName"]');
  if (prcBranches.length > 0) {
    const text = prcBranches[0].textContent.trim();
    if (text) return text;
  }

  // 旧 GitHub UI セレクタ（フォールバック）
  const selectors = [
    '.commit-ref.base-ref .css-truncate-target',
    '.base-ref .css-truncate-target',
    'span.base-ref',
    '.gh-header-meta .base-ref',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }

  // フォールバック: "into owner:branch from" パターンから抽出（空白あり・なし両対応）
  const summaryEl = document.querySelector('[class*="summaryContainer"]') ||
                    document.querySelector('.gh-header-meta');
  if (summaryEl) {
    const text = summaryEl.innerText || summaryEl.textContent;
    const match = text.match(/into\s*(?:[^:\s]+:)?(\S+)\s*from/);
    if (match) return match[1];
  }

  return null;
}

function getHeaderHeight() {
  const selectors = ['.AppHeader', '.js-header-wrapper', 'header[role="banner"]', 'div.Header'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el.offsetHeight;
  }
  return 64;
}

function removeWarning() {
  const existing = document.getElementById(WARNING_ID);
  if (existing) existing.remove();
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showWarning(baseBranch, allowedBranches, uiLang) {
  removeWarning();

  const headerHeight = getHeaderHeight();
  const banner = document.createElement('div');
  banner.id = WARNING_ID;
  banner.style.cssText = [
    'position: sticky',
    `top: ${headerHeight}px`,
    'z-index: 9999',
    'background-color: #cf222e',
    'color: #ffffff',
    'padding: 10px 16px',
    'text-align: center',
    'font-size: 14px',
    'font-weight: 600',
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    'box-shadow: 0 2px 6px rgba(0,0,0,0.4)',
  ].join('; ');

  const codeStyle = 'background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:13px;font-family:monospace';
  const allowedText = allowedBranches
    .map(b => `<code style="${codeStyle}">${escapeHtml(b)}</code>`)
    .join(' / ');

  banner.innerHTML = uiLang === 'ja'
    ? `⚠️ マージ先ブランチが <code style="${codeStyle}">${escapeHtml(baseBranch)}</code> です。` +
      `許可ブランチ（${allowedText}）ではありません。マージ先を確認してください。`
    : `⚠️ Base branch is <code style="${codeStyle}">${escapeHtml(baseBranch)}</code> — ` +
      `not in your allowed list (${allowedText}). Please verify the merge target.`;

  // main の先頭に挿入することでヘッダー後の余白を回避
  const main = document.querySelector('main, [role="main"], #js-pjax-container, .application-main');
  if (main) {
    main.insertAdjacentElement('afterbegin', banner);
  } else {
    document.body.insertAdjacentElement('afterbegin', banner);
  }
}

async function checkAndShowWarning() {
  if (!isPRPage()) {
    removeWarning();
    return;
  }

  const data = await chrome.storage.sync.get(['allowedBranches', 'uiLang']);
  const allowedBranches = data.allowedBranches;
  const uiLang = data.uiLang || 'en';

  // 設定がない or 空のときは警告なし
  if (!allowedBranches || allowedBranches.length === 0) {
    removeWarning();
    return;
  }

  const baseBranch = getBaseBranch();
  if (!baseBranch) return; // DOM未準備 — リトライに任せる

  if (!allowedBranches.includes(baseBranch)) {
    showWarning(baseBranch, allowedBranches, uiLang);
  } else {
    removeWarning();
  }
}

// 初回実行
checkAndShowWarning();
setTimeout(checkAndShowWarning, 800);
setTimeout(checkAndShowWarning, 2000);

// GitHub SPA ナビゲーション対応 (title変化を監視)
let lastUrl = location.href;
const titleEl = document.querySelector('title');
if (titleEl) {
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(checkAndShowWarning, 600);
    }
  }).observe(titleEl, { childList: true });
}

// Turbo / Turbolinks イベント
document.addEventListener('turbo:load', () => setTimeout(checkAndShowWarning, 300));
document.addEventListener('turbolinks:load', () => setTimeout(checkAndShowWarning, 300));
