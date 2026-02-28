// ─────────────────────────────────────────────────────────────
// ERP Attendance Extractor – content script
// Runs on every page the extension is active on.
// ─────────────────────────────────────────────────────────────
console.log('ERP Attendance Extractor loaded');

// ── Clipboard helper ─────────────────────────────────────────
function copyToClipboard(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity  = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

// ── Message listener (popup → content) ───────────────────────
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extractData') {
    try {
      const data = extractAttendanceData();
      if (data) {
        copyToClipboard(data);
        sendResponse({ success: true, data });
      } else {
        sendResponse({ success: false, error: 'No attendance data found on this page' });
      }
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }
  return true; // keep channel open for async
});

// ── Main dispatcher ────────────────────────────────────────────
function extractAttendanceData() {
  console.log('[Extractor] starting...');

  // 1. ERPNext / Frappe list view (Employee Checkin)
  const frappe = extractFromFrappeList();
  if (frappe) { console.log('[Extractor] frappe list ✓'); return frappe; }

  // 2. Standard HTML <table>
  for (const tbl of document.querySelectorAll('table')) {
    const t = extractFromTable(tbl);
    if (t) { console.log('[Extractor] table ✓'); return t; }
  }

  // 3. Generic page-text fallback
  const pg = extractFromPageText();
  if (pg) { console.log('[Extractor] page-text ✓'); return pg; }

  console.log('[Extractor] nothing found');
  return null;
}

// ── Method 1: Frappe / ERPNext list view ────────────────────────
// Targets the .list-row-container rows rendered by Frappe's
// List View (e.g. /app/employee-checkin).
function extractFromFrappeList() {
  // Frappe v13-v15 row selectors (try both)
  const rows = document.querySelectorAll(
    '.list-row-container, .result .list-row'
  );
  if (rows.length === 0) return null;

  const DATE_RE  = /\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}/;
  const INOUT_RE = /^(IN|OUT)$/;

  let output = '';
  let count  = 0;

  rows.forEach(row => {
    // Collect non-empty text tokens from the row
    const tokens = [];
    row.querySelectorAll('*').forEach(el => {
      // Only leaf-level text (skip containers that repeat child text)
      if (el.children.length === 0) {
        const t = el.textContent.trim();
        if (t) tokens.push(t);
      }
    });

    // Find IN/OUT and date-time inside the token list
    const logType = tokens.find(t => INOUT_RE.test(t));
    const timeVal = tokens.find(t => DATE_RE.test(t));
    if (!logType || !timeVal) return; // not an attendance row

    // Employee name: first token that is not logType / timeVal
    // and doesn't look like a status / number / symbol
    const SKIP_RE = /^(Approved|Rejected|Pending|Break|\d+|·|\d+\s*(m|h|d|w))$/i;
    const name = tokens.find(
      t => t !== logType && t !== timeVal && !SKIP_RE.test(t) && t.length > 1
    );
    if (!name) return;

    // Build the multi-line block the timeParser expects
    output += name + '\n' + logType + '\n' + timeVal + '\nApproved\n1 h\n0\n·\n\n';
    count++;
  });

  return count > 0 ? output : null;
}

// ── Method 3: generic page-text fallback ───────────────────────
// Walks the visible text of the page line-by-line and rebuilds
// attendance blocks using the same pattern the timeParser uses.
function extractFromPageText() {
  const DATE_RE  = /^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}$/;
  const INOUT_RE = /^(IN|OUT)$/;

  // Grab all visible text lines from the body
  const raw = (document.body ? document.body.innerText : '') || '';
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  let output = '';
  let count  = 0;

  for (let i = 0; i < lines.length - 2; i++) {
    const nameLine = lines[i];
    const dirLine  = lines[i + 1];
    const dtLine   = lines[i + 2];

    if (!INOUT_RE.test(dirLine)) continue;
    if (!DATE_RE.test(dtLine))   continue;

    // Skip if name looks like a UI label or number
    if (/^(Employee|Log Type|Time|Reason|Status|\d+|\d+\s*(m|h|d|w)|Filter|Search|·)$/i.test(nameLine)) continue;
    if (nameLine.length < 2) continue;

    output += nameLine + '\n' + dirLine + '\n' + dtLine + '\nApproved\n1 h\n0\n·\n\n';
    count++;
    i += 2; // skip the two lines we just consumed
  }

  return count > 0 ? output : null;
}

// ── Method 2: standard HTML <table> ─────────────────────────────
function extractFromTable(table) {
  const rows = table.querySelectorAll('tr');
  if (rows.length < 2) return null;

  let output = '';
  let count  = 0;

  // skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td, th');
    if (!cells.length) continue;

    const cols = [];
    cells.forEach(c => { const t = c.textContent.trim(); if (t) cols.push(t); });

    const rowText = cols.join(' ');
    if (/\bIN\b|\bOUT\b/.test(rowText) && /\d{2}[-/]\d{2}[-/]\d{4}/.test(rowText)) {
      output += cols.join('\n') + '\n\n';
      count++;
    }
  }

  return count > 0 ? output : null;
}
