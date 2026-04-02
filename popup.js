'use strict';

const STRINGS = {
  en: {
    sectionLabel: 'Allowed base branches',
    placeholder: 'Branch name (e.g. develop)',
    addBtn: 'Add',
    removeTitle: 'Remove',
    empty: '(No branches — warnings are disabled)',
    added: b => `Added "${b}"`,
    removed: b => `Removed "${b}"`,
    alreadyAdded: 'Already added',
    enterBranch: 'Please enter a branch name',
  },
  ja: {
    sectionLabel: '許可するベースブランチ',
    placeholder: 'ブランチ名（例: develop）',
    addBtn: '追加',
    removeTitle: '削除',
    empty: '（ブランチなし — 警告は表示されません）',
    added: b => `「${b}」を追加しました`,
    removed: b => `「${b}」を削除しました`,
    alreadyAdded: '既に追加済みです',
    enterBranch: 'ブランチ名を入力してください',
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

function applyLang() {
  const s = STRINGS[currentLang];
  document.getElementById('sectionLabel').textContent = s.sectionLabel;
  document.getElementById('newBranch').placeholder = s.placeholder;
  document.getElementById('addBtn').textContent = s.addBtn;
  const toggle = document.getElementById('langToggle');
  toggle.innerHTML = currentLang === 'en'
    ? '<strong>EN</strong>&nbsp;/&nbsp;JA'
    : 'EN&nbsp;/&nbsp;<strong>JA</strong>';
}

function renderList(branches) {
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
      renderList(updated);
      showStatus(STRINGS[currentLang].removed(branch));
    });
  });
}

async function init() {
  const { allowedBranches = [], uiLang = 'en' } = await chrome.storage.sync.get({
    allowedBranches: [],
    uiLang: 'en',
  });
  currentLang = uiLang;
  applyLang();
  renderList(allowedBranches);
}

document.getElementById('langToggle').addEventListener('click', async () => {
  currentLang = currentLang === 'en' ? 'ja' : 'en';
  await chrome.storage.sync.set({ uiLang: currentLang });
  applyLang();
  const { allowedBranches = [] } = await chrome.storage.sync.get({ allowedBranches: [] });
  renderList(allowedBranches);
});

document.getElementById('addBtn').addEventListener('click', async () => {
  const input = document.getElementById('newBranch');
  const branch = input.value.trim();
  const s = STRINGS[currentLang];
  if (!branch) { showStatus(s.enterBranch, true); return; }
  const { allowedBranches = [] } = await chrome.storage.sync.get({ allowedBranches: [] });
  if (allowedBranches.includes(branch)) { showStatus(s.alreadyAdded, true); return; }
  const updated = [...allowedBranches, branch];
  await chrome.storage.sync.set({ allowedBranches: updated });
  renderList(updated);
  input.value = '';
  showStatus(s.added(branch));
});

document.getElementById('newBranch').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

init();
