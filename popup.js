'use strict';

const DEFAULT_BRANCHES = ['main', 'master'];

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

function renderList(branches) {
  const list = document.getElementById('branchList');
  list.innerHTML = '';
  if (branches.length === 0) {
    list.innerHTML = '<li style="padding:6px;color:#57606a;font-size:12px">（ブランチなし — 警告は表示されません）</li>';
    return;
  }
  branches.forEach(branch => {
    const li = document.createElement('li');
    li.className = 'branch-item';
    li.innerHTML = `<span class="branch-name">${escapeHtml(branch)}</span>
      <button class="remove-btn" data-branch="${escapeHtml(branch)}" title="削除">×</button>`;
    list.appendChild(li);
  });

  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const branch = btn.dataset.branch;
      const { allowedBranches = [] } = await chrome.storage.sync.get({ allowedBranches: [] });
      const updated = allowedBranches.filter(b => b !== branch);
      await chrome.storage.sync.set({ allowedBranches: updated });
      renderList(updated);
      showStatus(`「${branch}」を削除しました`);
    });
  });
}

chrome.storage.sync.get({ allowedBranches: [] }, ({ allowedBranches }) => {
  renderList(allowedBranches);
});

document.getElementById('addBtn').addEventListener('click', async () => {
  const input = document.getElementById('newBranch');
  const branch = input.value.trim();
  if (!branch) { showStatus('ブランチ名を入力してください', true); return; }
  const { allowedBranches = [] } = await chrome.storage.sync.get({ allowedBranches: [] });
  if (allowedBranches.includes(branch)) { showStatus('既に追加済みです', true); return; }
  const updated = [...allowedBranches, branch];
  await chrome.storage.sync.set({ allowedBranches: updated });
  renderList(updated);
  input.value = '';
  showStatus(`「${branch}」を追加しました`);
});

document.getElementById('newBranch').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});
