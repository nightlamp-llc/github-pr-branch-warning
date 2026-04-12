'use strict';

const STRINGS = {
  en: {
    // --- Tab 1: Branch ---
    sectionLabel: 'Allowed base branches',
    placeholder: 'Branch name (e.g. develop)',
    addBtn: 'Add',
    removeTitle: 'Remove',
    empty: '(No branches — warnings are disabled)',
    added: b => `Added "${b}"`,
    removed: b => `Removed "${b}"`,
    alreadyAdded: 'Already added',
    enterBranch: 'Please enter a branch name',
    // --- Tabs ---
    tabBranch: 'Branch',
    tabMerge: 'Merge',
    // --- Tab 2: Merge check ---
    mergeCheckLabel: 'Merge-into check branches',
    mergeCheckDesc: "Warn if the PR's head branch has not been merged into these branches yet.",
    mergeCheckPlaceholder: 'Branch name (e.g. staging)',
    mergeCheckAddBtn: 'Add',
    mergeCheckEmpty: '(No branches — merge-forget check disabled)',
    mergeCheckRemoveTitle: 'Remove',
    mergeCheckAdded: b => `Added "${b}"`,
    mergeCheckRemoved: b => `Removed "${b}"`,
    mergeCheckAlreadyAdded: 'Already added',
    mergeCheckEnterBranch: 'Please enter a branch name',
  },
  ja: {
    // --- Tab 1: Branch ---
    sectionLabel: '許可するベースブランチ',
    placeholder: 'ブランチ名（例: develop）',
    addBtn: '追加',
    removeTitle: '削除',
    empty: '（ブランチなし — 警告は表示されません）',
    added: b => `「${b}」を追加しました`,
    removed: b => `「${b}」を削除しました`,
    alreadyAdded: '既に追加済みです',
    enterBranch: 'ブランチ名を入力してください',
    // --- Tabs ---
    tabBranch: 'ブランチ',
    tabMerge: 'マージ確認',
    // --- Tab 2: Merge check ---
    mergeCheckLabel: 'マージ済みチェックブランチ',
    mergeCheckDesc: 'PRの作業ブランチがこれらのブランチにまだマージされていない場合に警告します。',
    mergeCheckPlaceholder: 'ブランチ名（例: staging）',
    mergeCheckAddBtn: '追加',
    mergeCheckEmpty: '（ブランチなし — マージし忘れチェック無効）',
    mergeCheckRemoveTitle: '削除',
    mergeCheckAdded: b => `「${b}」を追加しました`,
    mergeCheckRemoved: b => `「${b}」を削除しました`,
    mergeCheckAlreadyAdded: '既に追加済みです',
    mergeCheckEnterBranch: 'ブランチ名を入力してください',
  },
};

let currentLang = 'en';

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showStatus(msg, isError = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status' + (isError ? ' error' : '');
  setTimeout(() => { el.textContent = ''; el.className = 'status'; }, 2000);
}

// --- Tab switching ---

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.tab-content').forEach(p => p.classList.toggle('active', p.id === `panel-${name}`));
  });
});

// --- applyLang: update all text elements ---

function applyLang() {
  const s = STRINGS[currentLang];
  // Tab labels
  document.querySelectorAll('.tab').forEach(t => {
    const key = 'tab' + t.dataset.tab.charAt(0).toUpperCase() + t.dataset.tab.slice(1);
    t.textContent = s[key] || t.dataset.tab;
  });
  // Tab 1
  document.getElementById('sectionLabel').textContent = s.sectionLabel;
  document.getElementById('newBranch').placeholder = s.placeholder;
  document.getElementById('addBtn').textContent = s.addBtn;
  // Tab 2
  document.getElementById('mergeCheckLabel').textContent = s.mergeCheckLabel;
  document.getElementById('mergeCheckDesc').textContent = s.mergeCheckDesc;
  document.getElementById('newMergeCheck').placeholder = s.mergeCheckPlaceholder;
  document.getElementById('addMergeCheckBtn').textContent = s.mergeCheckAddBtn;
  // Lang toggle
  document.getElementById('langToggle').innerHTML = currentLang === 'en'
    ? '<strong>EN</strong>&nbsp;/&nbsp;JA'
    : 'EN&nbsp;/&nbsp;<strong>JA</strong>';
}

// --- Tab 1: Allowed base branches ---

function renderBranchList(branches) {
  const s = STRINGS[currentLang];
  const list = document.getElementById('branchList');
  list.innerHTML = '';
  if (branches.length === 0) {
    list.innerHTML = `<li style="padding:6px;color:#57606a;font-size:12px">${s.empty}</li>`;
    return;
  }
  branches.forEach(branch => {
    const li = document.createElement('li');
    li.className = 'branch-item';
    li.innerHTML = `<span class="branch-name">${escapeHtml(branch)}</span>
      <button class="remove-btn" data-branch="${escapeHtml(branch)}" title="${s.removeTitle}">×</button>`;
    list.appendChild(li);
  });
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const branch = btn.dataset.branch;
      const { allowedBranches = [] } = await chrome.storage.sync.get({ allowedBranches: [] });
      const updated = allowedBranches.filter(b => b !== branch);
      await chrome.storage.sync.set({ allowedBranches: updated });
      renderBranchList(updated);
      showStatus(STRINGS[currentLang].removed(branch));
    });
  });
}

document.getElementById('addBtn').addEventListener('click', async () => {
  const input = document.getElementById('newBranch');
  const branch = input.value.trim();
  const s = STRINGS[currentLang];
  if (!branch) { showStatus(s.enterBranch, true); return; }
  const { allowedBranches = [] } = await chrome.storage.sync.get({ allowedBranches: [] });
  if (allowedBranches.includes(branch)) { showStatus(s.alreadyAdded, true); return; }
  const updated = [...allowedBranches, branch];
  await chrome.storage.sync.set({ allowedBranches: updated });
  renderBranchList(updated);
  input.value = '';
  showStatus(s.added(branch));
});

document.getElementById('newBranch').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

// --- Tab 2: Merge-into check branches ---

function renderMergeCheckList(branches) {
  const s = STRINGS[currentLang];
  const list = document.getElementById('mergeCheckList');
  list.innerHTML = '';
  if (branches.length === 0) {
    list.innerHTML = `<li style="padding:6px;color:#57606a;font-size:12px">${s.mergeCheckEmpty}</li>`;
    return;
  }
  branches.forEach(branch => {
    const li = document.createElement('li');
    li.className = 'branch-item';
    li.innerHTML = `<span class="branch-name">${escapeHtml(branch)}</span>
      <button class="remove-btn" data-branch="${escapeHtml(branch)}" title="${s.mergeCheckRemoveTitle}">×</button>`;
    list.appendChild(li);
  });
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const branch = btn.dataset.branch;
      const { mergeCheckBranches = [] } = await chrome.storage.sync.get({ mergeCheckBranches: [] });
      const updated = mergeCheckBranches.filter(b => b !== branch);
      await chrome.storage.sync.set({ mergeCheckBranches: updated });
      renderMergeCheckList(updated);
      showStatus(STRINGS[currentLang].mergeCheckRemoved(branch));
    });
  });
}

document.getElementById('addMergeCheckBtn').addEventListener('click', async () => {
  const input = document.getElementById('newMergeCheck');
  const branch = input.value.trim();
  const s = STRINGS[currentLang];
  if (!branch) { showStatus(s.mergeCheckEnterBranch, true); return; }
  const { mergeCheckBranches = [] } = await chrome.storage.sync.get({ mergeCheckBranches: [] });
  if (mergeCheckBranches.includes(branch)) { showStatus(s.mergeCheckAlreadyAdded, true); return; }
  const updated = [...mergeCheckBranches, branch];
  await chrome.storage.sync.set({ mergeCheckBranches: updated });
  renderMergeCheckList(updated);
  input.value = '';
  showStatus(s.mergeCheckAdded(branch));
});

document.getElementById('newMergeCheck').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addMergeCheckBtn').click();
});

// --- Language toggle ---

document.getElementById('langToggle').addEventListener('click', async () => {
  currentLang = currentLang === 'en' ? 'ja' : 'en';
  await chrome.storage.sync.set({ uiLang: currentLang });
  applyLang();
  const { allowedBranches = [], mergeCheckBranches = [] } =
    await chrome.storage.sync.get({ allowedBranches: [], mergeCheckBranches: [] });
  renderBranchList(allowedBranches);
  renderMergeCheckList(mergeCheckBranches);
});

// --- Init ---

async function init() {
  const {
    allowedBranches = [],
    uiLang = 'en',
    mergeCheckBranches = [],
  } = await chrome.storage.sync.get({
    allowedBranches: [],
    uiLang: 'en',
    mergeCheckBranches: [],
  });
  currentLang = uiLang;
  applyLang();
  renderBranchList(allowedBranches);
  renderMergeCheckList(mergeCheckBranches);
}

init();
