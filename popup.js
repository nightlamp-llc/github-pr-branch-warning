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
    tabTime: 'Time',
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
    // --- Tab 3: Time windows ---
    timeWindowLabel: 'Allowed merge time windows',
    timeWindowEmpty: '(No windows — time warnings disabled)',
    twDaysLabel: 'Days',
    twFromLabel: 'From',
    twToLabel: 'To',
    twTzLabel: 'TZ',
    twTzPlaceholder: 'Asia/Tokyo',
    addWindowBtn: 'Add Window',
    twRemoveTitle: 'Remove window',
    twAdded: 'Time window added',
    twRemoved: 'Time window removed',
    twInvalidDays: 'Please select at least one day',
    twInvalidTime: 'End time must be after start time',
    twInvalidTz: 'Invalid timezone',
    dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
    tabTime: '時間帯',
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
    // --- Tab 3: Time windows ---
    timeWindowLabel: 'マージ可能時間帯',
    timeWindowEmpty: '（時間帯なし — 時間帯警告は無効）',
    twDaysLabel: '曜日',
    twFromLabel: '開始',
    twToLabel: '終了',
    twTzLabel: 'TZ',
    twTzPlaceholder: 'Asia/Tokyo',
    addWindowBtn: '追加',
    twRemoveTitle: '削除',
    twAdded: '時間帯を追加しました',
    twRemoved: '時間帯を削除しました',
    twInvalidDays: '曜日を1つ以上選択してください',
    twInvalidTime: '終了時間は開始時間より後にしてください',
    twInvalidTz: '無効なタイムゾーンです',
    dayNames: ['月', '火', '水', '木', '金', '土', '日'],
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

function isValidTimezone(tz) {
  try { Intl.DateTimeFormat(undefined, { timeZone: tz }); return true; }
  catch { return false; }
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
  // Tab 3
  document.getElementById('timeWindowLabel').textContent = s.timeWindowLabel;
  document.getElementById('twDaysLabel').textContent = s.twDaysLabel;
  document.getElementById('twFromLabel').textContent = s.twFromLabel;
  document.getElementById('twToLabel').textContent = s.twToLabel;
  document.getElementById('twTzLabel').textContent = s.twTzLabel;
  document.getElementById('twTz').placeholder = s.twTzPlaceholder;
  document.getElementById('addTwBtn').textContent = s.addWindowBtn;
  // Day buttons
  document.querySelectorAll('.day-btn').forEach((btn, i) => {
    btn.textContent = s.dayNames[i];
  });
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

// --- Tab 3: Time windows ---

function renderTimeWindowList(timeWindows) {
  const s = STRINGS[currentLang];
  const list = document.getElementById('timeWindowList');
  list.innerHTML = '';
  if (timeWindows.length === 0) {
    list.innerHTML = `<li style="padding:6px;color:#57606a;font-size:12px">${s.timeWindowEmpty}</li>`;
    return;
  }
  timeWindows.forEach(tw => {
    const li = document.createElement('li');
    li.className = 'tw-item';
    const daysText = tw.days.map(d => s.dayNames[d - 1]).join(' ');
    li.innerHTML = `
      <div class="tw-info">
        <span class="tw-days-display">${escapeHtml(daysText)}</span>
        <span class="tw-time-display">${escapeHtml(tw.startTime)}–${escapeHtml(tw.endTime)}</span>
        <span class="tw-tz-display">${escapeHtml(tw.timezone)}</span>
      </div>
      <button class="remove-btn" data-id="${tw.id}" title="${s.twRemoveTitle}">×</button>
    `;
    list.appendChild(li);
  });
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const { timeWindows: tws = [] } = await chrome.storage.sync.get({ timeWindows: [] });
      const updated = tws.filter(tw => tw.id !== id);
      await chrome.storage.sync.set({ timeWindows: updated });
      renderTimeWindowList(updated);
      showStatus(STRINGS[currentLang].twRemoved);
    });
  });
}

// Day toggle buttons
document.querySelectorAll('.day-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

document.getElementById('addTwBtn').addEventListener('click', async () => {
  const s = STRINGS[currentLang];
  const selectedDays = Array.from(document.querySelectorAll('.day-btn.active'))
    .map(btn => Number(btn.dataset.day));
  if (selectedDays.length === 0) { showStatus(s.twInvalidDays, true); return; }

  const startTime = document.getElementById('twStart').value;
  const endTime   = document.getElementById('twEnd').value;
  if (!startTime || !endTime || startTime >= endTime) { showStatus(s.twInvalidTime, true); return; }

  const timezone = document.getElementById('twTz').value.trim() || 'UTC';
  if (!isValidTimezone(timezone)) { showStatus(s.twInvalidTz, true); return; }

  const { timeWindows: tws = [] } = await chrome.storage.sync.get({ timeWindows: [] });
  const newTw = { id: Date.now(), days: selectedDays.sort((a, b) => a - b), startTime, endTime, timezone };
  await chrome.storage.sync.set({ timeWindows: [...tws, newTw] });
  renderTimeWindowList([...tws, newTw]);

  // Reset form
  document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('twStart').value = '10:00';
  document.getElementById('twEnd').value   = '18:00';
  document.getElementById('twTz').value    = '';
  showStatus(s.twAdded);
});

// --- Language toggle ---

document.getElementById('langToggle').addEventListener('click', async () => {
  currentLang = currentLang === 'en' ? 'ja' : 'en';
  await chrome.storage.sync.set({ uiLang: currentLang });
  applyLang();
  const { allowedBranches = [], mergeCheckBranches = [], timeWindows = [] } =
    await chrome.storage.sync.get({ allowedBranches: [], mergeCheckBranches: [], timeWindows: [] });
  renderBranchList(allowedBranches);
  renderMergeCheckList(mergeCheckBranches);
  renderTimeWindowList(timeWindows);
});

// --- Init ---

async function init() {
  // Populate timezone datalist
  if (typeof Intl.supportedValuesOf === 'function') {
    const tzList = document.getElementById('tz-list');
    Intl.supportedValuesOf('timeZone').forEach(tz => {
      const opt = document.createElement('option');
      opt.value = tz;
      tzList.appendChild(opt);
    });
  }

  const {
    allowedBranches = [],
    uiLang = 'en',
    mergeCheckBranches = [],
    timeWindows = [],
  } = await chrome.storage.sync.get({
    allowedBranches: [],
    uiLang: 'en',
    mergeCheckBranches: [],
    timeWindows: [],
  });
  currentLang = uiLang;
  applyLang();
  renderBranchList(allowedBranches);
  renderMergeCheckList(mergeCheckBranches);
  renderTimeWindowList(timeWindows);
}

init();
