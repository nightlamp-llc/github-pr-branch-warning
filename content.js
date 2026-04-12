'use strict';

// Kept for reference; not used in logic (allowed list is user-configurable)
const DEFAULT_BRANCHES = ['main', 'master'];

const CONTAINER_ID = 'gh-pr-warning-container';
const WARN_BRANCH_ID = 'gh-pr-warn-branch';
const WARN_MERGE_ID  = 'gh-pr-warn-merge';
const WARN_TIME_ID   = 'gh-pr-warn-time';

// --- DOM helpers ---

function isPRPage() {
  return /^\/[^/]+\/[^/]+\/pull\/\d+/.test(window.location.pathname);
}

function getRepoInfo() {
  const m = window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/\d+/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

function getBaseBranch() {
  const prcBranches = document.querySelectorAll('[class*="prc-BranchName-BranchName"]');
  if (prcBranches.length > 0) {
    const text = prcBranches[0].textContent.trim();
    if (text) return text;
  }
  const selectors = [
    '.commit-ref.base-ref .css-truncate-target',
    '.base-ref .css-truncate-target',
    'span.base-ref',
    '.gh-header-meta .base-ref',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) return el.textContent.trim();
  }
  const summaryEl = document.querySelector('[class*="summaryContainer"]') ||
                    document.querySelector('.gh-header-meta');
  if (summaryEl) {
    const text = summaryEl.innerText || summaryEl.textContent;
    const match = text.match(/into\s*(?:[^:\s]+:)?(\S+)\s*from/);
    if (match) return match[1];
  }
  return null;
}

function getHeadBranch() {
  const prcBranches = document.querySelectorAll('[class*="prc-BranchName-BranchName"]');
  if (prcBranches.length >= 2) {
    const text = prcBranches[1].textContent.trim();
    if (text) return text;
  }
  const selectors = [
    '.commit-ref.head-ref .css-truncate-target',
    '.head-ref .css-truncate-target',
    'span.head-ref',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) return el.textContent.trim();
  }
  const summaryEl = document.querySelector('[class*="summaryContainer"]') ||
                    document.querySelector('.gh-header-meta');
  if (summaryEl) {
    const text = summaryEl.innerText || summaryEl.textContent;
    const match = text.match(/from\s*(?:[^:\s]+:)?(\S+?)(?:\s|$)/);
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

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// --- Banner container (single sticky container for all warnings) ---

function getOrCreateContainer() {
  let container = document.getElementById(CONTAINER_ID);
  if (container) return container;
  container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.style.cssText = [
    'position: sticky',
    `top: ${getHeaderHeight()}px`,
    'z-index: 9999',
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  ].join('; ');
  const main = document.querySelector('main, [role="main"], #js-pjax-container, .application-main');
  (main || document.body).insertAdjacentElement('afterbegin', container);
  return container;
}

function showWarningItem(id, html, bgColor) {
  const container = getOrCreateContainer();
  let item = document.getElementById(id);
  if (!item) {
    item = document.createElement('div');
    item.id = id;
    container.appendChild(item);
  }
  item.style.cssText = [
    `background-color: ${bgColor}`,
    'color: #ffffff',
    'padding: 10px 16px',
    'text-align: center',
    'font-size: 14px',
    'font-weight: 600',
    'box-shadow: 0 2px 6px rgba(0,0,0,0.4)',
  ].join('; ');
  item.innerHTML = html;
}

function removeWarningItem(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  const container = document.getElementById(CONTAINER_ID);
  if (container && container.children.length === 0) container.remove();
}

function removeAllWarnings() {
  const container = document.getElementById(CONTAINER_ID);
  if (container) container.remove();
}

// --- Warning 1: Wrong base branch ---

async function checkBranchWarning(uiLang) {
  // Use array syntax (same as original v1.1.0) to avoid edge cases with object-default form
  const result = await chrome.storage.sync.get(['allowedBranches']);
  const allowedBranches = result.allowedBranches;
  if (!allowedBranches || allowedBranches.length === 0) {
    removeWarningItem(WARN_BRANCH_ID);
    return;
  }

  const baseBranch = getBaseBranch();
  if (!baseBranch) return; // DOM not ready — retry will handle it

  if (!allowedBranches.includes(baseBranch)) {
    const cs = 'background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:13px;font-family:monospace';
    const allowedText = allowedBranches.map(b => `<code style="${cs}">${escapeHtml(b)}</code>`).join(' / ');
    const html = uiLang === 'ja'
      ? `⚠️ マージ先ブランチが <code style="${cs}">${escapeHtml(baseBranch)}</code> です。` +
        `許可ブランチ（${allowedText}）ではありません。マージ先を確認してください。`
      : `⚠️ Base branch is <code style="${cs}">${escapeHtml(baseBranch)}</code> — ` +
        `not in your allowed list (${allowedText}). Please verify the merge target.`;
    showWarningItem(WARN_BRANCH_ID, html, '#cf222e');
  } else {
    removeWarningItem(WARN_BRANCH_ID);
  }
}

// --- Warning 2: Merge forget check ---

// Uses HTML fetch with browser cookies — works for both public and private repos
// (user must be logged in to GitHub). No token required.
async function isMergedInto(owner, repo, headBranch, requiredBranch) {
  const url = `https://github.com/${owner}/${repo}/compare/${encodeURIComponent(requiredBranch)}...${encodeURIComponent(headBranch)}`;
  try {
    const resp = await fetch(url, { credentials: 'include' });
    if (!resp.ok) return null;
    const html = await resp.text();
    // "nothing to compare" or "up to date" text indicates fully merged
    return /There isn't anything to compare|is up to date with all commits from/i.test(html);
  } catch {
    return null;
  }
}

async function checkMergeForgetWarning(uiLang) {
  const result = await chrome.storage.sync.get(['mergeCheckBranches']);
  const mergeCheckBranches = result.mergeCheckBranches;
  if (!mergeCheckBranches || mergeCheckBranches.length === 0) {
    removeWarningItem(WARN_MERGE_ID);
    return;
  }

  const repoInfo = getRepoInfo();
  const headBranch = getHeadBranch();
  if (!repoInfo || !headBranch) return;

  const unmerged = [];
  for (const req of mergeCheckBranches) {
    const merged = await isMergedInto(repoInfo.owner, repoInfo.repo, headBranch, req);
    if (merged === false) unmerged.push(req);
  }

  if (unmerged.length > 0) {
    const cs = 'background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;font-size:13px;font-family:monospace';
    const headCode = `<code style="${cs}">${escapeHtml(headBranch)}</code>`;
    const unmergedText = unmerged.map(b => `<code style="${cs}">${escapeHtml(b)}</code>`).join(', ');
    const html = uiLang === 'ja'
      ? `⚠️ ${headCode} はまだ ${unmergedText} にマージされていません。マージし忘れに注意！`
      : `⚠️ ${headCode} has not been merged into ${unmergedText} yet. Don't forget to merge!`;
    showWarningItem(WARN_MERGE_ID, html, '#9a6700');
  } else {
    removeWarningItem(WARN_MERGE_ID);
  }
}

// --- Warning 3: Outside merge time window ---

function getCurrentTimeInfo(timezone) {
  // Prefer Temporal API (Chrome 109+, fully available as of 2025)
  if (typeof Temporal !== 'undefined') {
    try {
      const now = Temporal.Now.zonedDateTimeISO(timezone);
      return { dayOfWeek: now.dayOfWeek, hour: now.hour, minute: now.minute };
    } catch { /* fall through to Intl fallback */ }
  }
  // Fallback: Intl.DateTimeFormat
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long' });
  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
  const [hour, minute] = timeStr.split(':').map(Number);
  return { dayOfWeek: dayMap[dayName] ?? 1, hour, minute };
}

function isWithinTw(tw) {
  try {
    const { dayOfWeek, hour, minute } = getCurrentTimeInfo(tw.timezone || 'UTC');
    if (!tw.days.includes(dayOfWeek)) return false;
    const nowMin = hour * 60 + minute;
    const [sh, sm] = tw.startTime.split(':').map(Number);
    const [eh, em] = tw.endTime.split(':').map(Number);
    return nowMin >= sh * 60 + sm && nowMin < eh * 60 + em;
  } catch {
    return true; // on error, don't block
  }
}

async function checkTimeWindowWarning(uiLang) {
  const { timeWindows = [] } = await chrome.storage.sync.get({ timeWindows: [] });
  if (!timeWindows.length) { removeWarningItem(WARN_TIME_ID); return; }

  const inWindow = timeWindows.some(tw => isWithinTw(tw));
  if (!inWindow) {
    const html = uiLang === 'ja'
      ? '🕐 現在はマージ可能時間外です。設定された時間帯を確認してください。'
      : '🕐 You are outside the allowed merge time window. Check your settings before merging.';
    showWarningItem(WARN_TIME_ID, html, '#6e40c9');
  } else {
    removeWarningItem(WARN_TIME_ID);
  }
}

// --- Main orchestrator ---

async function checkAndShowWarning() {
  if (!isPRPage()) { removeAllWarnings(); return; }
  const { uiLang = 'en' } = await chrome.storage.sync.get({ uiLang: 'en' });
  await Promise.all([
    checkBranchWarning(uiLang),
    checkMergeForgetWarning(uiLang),
    checkTimeWindowWarning(uiLang),
  ]);
}

// Initial runs with retries for slow DOM
checkAndShowWarning();
setTimeout(checkAndShowWarning, 800);
setTimeout(checkAndShowWarning, 2000);

// GitHub SPA navigation (title mutation)
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

document.addEventListener('turbo:load', () => setTimeout(checkAndShowWarning, 300));
document.addEventListener('turbolinks:load', () => setTimeout(checkAndShowWarning, 300));
