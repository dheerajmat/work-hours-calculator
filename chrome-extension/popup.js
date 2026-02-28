// ── Helpers ──────────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100; }

function fmtHM(h) {
  var m = Math.round(h * 60), hr = Math.floor(m / 60), mn = m % 60;
  if (hr === 0) return mn + 'm';
  if (mn === 0) return hr + 'h';
  return hr + 'h ' + mn + 'm';
}

function fmtHMS(h) {
  var s = Math.floor(h * 3600);
  var hr = Math.floor(s / 3600);
  var mn = Math.floor((s % 3600) / 60);
  var sc = s % 60;
  if (hr === 0 && mn === 0) return sc + 's';
  if (hr === 0) return mn + 'm ' + sc + 's';
  return hr + 'h ' + mn + 'm ' + sc + 's';
}

function timeStr(d) {
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}

function timeStr12(d) {
  var hr = d.getHours(), mn = d.getMinutes();
  var ap = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12 || 12;
  return hr + ':' + String(mn).padStart(2,'0') + ' ' + ap;
}

function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// ── Parser ───────────────────────────────────────────────
var lineRe = /^(.+?)\s+(IN|OUT)\s+(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})/;
var dtRe   = /^(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})$/;

function parsePunches(raw) {
  var lines = raw.split('\n').map(function(l){return l.trim();}).filter(Boolean);
  var recs = [];
  // single-line
  for (var i = 0; i < lines.length; i++) {
    var m = lineRe.exec(lines[i]);
    if (m) {
      var p = m[3].split('-').map(Number), t = m[4].split(':').map(Number);
      recs.push({ name:m[1].trim(), dir:m[2], dt:new Date(p[2],p[1]-1,p[0],t[0],t[1],t[2]) });
    }
  }
  if (recs.length) return recs;
  // multi-line
  for (var i = 0; i < lines.length - 2; i++) {
    var d = lines[i+1];
    if (d !== 'IN' && d !== 'OUT') continue;
    var dm = dtRe.exec(lines[i+2]);
    if (!dm) continue;
    var p = dm[1].split('-').map(Number), t = dm[2].split(':').map(Number);
    var dt = new Date(p[2],p[1]-1,p[0],t[0],t[1],t[2]);
    if (isNaN(dt.getTime())) continue;
    recs.push({ name:lines[i].trim(), dir:d, dt:dt });
    i += 2;
  }
  return recs;
}

// ── Compute today summary ─────────────────────────────────
function computeToday(recs) {
  var now = new Date(), tk = dateKey(now), GOAL = 9;
  var today = recs.filter(function(r){ return dateKey(r.dt) === tk; });
  if (!today.length) return null;
  today.sort(function(a,b){ return a.dt - b.dt; });

  var intervals = [], lastIn = null, work = 0, firstIn = null, lastOut = null, working = false;
  for (var i = 0; i < today.length; i++) {
    var r = today[i];
    if (r.dir === 'IN') { if (!firstIn) firstIn = r.dt; lastIn = r.dt; }
    else if (r.dir === 'OUT' && lastIn) {
      lastOut = r.dt;
      var h = (r.dt - lastIn) / 36e5;
      if (h > 0) { intervals.push({ s:timeStr(lastIn), e:timeStr(r.dt), h:round2(h) }); work += h; }
      lastIn = null;
    }
  }
  if (lastIn) {
    working = true;
    var h = (now - lastIn) / 36e5;
    if (h > 0) { intervals.push({ s:timeStr(lastIn), e:'Now', h:round2(h) }); work += h; }
  }
  var total = firstIn ? ((working ? now : (lastOut||firstIn)) - firstIn) / 36e5 : 0;
  var brk = total - work, rem = GOAL - total;
  var ot = Math.max(0, work - 8);
  var leaveBy = null;
  if (working && firstIn && rem > 0) {
    leaveBy = timeStr12(new Date(now.getTime() + rem * 36e5));
  }
  return {
    name: today[0].name, total: round2(total), work: round2(work),
    brk: round2(brk), brkOver: brk > 1, intervals: intervals,
    rem: round2(Math.abs(rem)), goalDone: rem <= 0,
    ot: round2(ot), isOT: ot > 0, working: working, leaveBy: leaveBy
  };
}

// ── Render dashboard ─────────────────────────────────────
function renderDash(s) {
  // employee row
  var badge = s.working
    ? '<span class="badge badge-green">● Working</span>'
    : '<span class="badge badge-slate">○ Clocked Out</span>';
  $('empRow').innerHTML = '<span class="emp-name">' + s.name + '</span>' + badge;

  // stat cards
  var cards = '';
  cards += card('⏱️ Office Time', fmtHM(s.total), s.total.toFixed(1)+'h', 'c-blue');
  cards += card('💼 Work Time', fmtHM(s.work), s.work.toFixed(1)+'h', 'c-green');
  cards += card(s.brkOver ? '☕ Break ⚠️' : '☕ Break', fmtHM(s.brk), s.brkOver?'Over 1h limit':'', s.brkOver?'c-red':'c-amber');
  if (s.isOT) cards += card('🔥 Overtime', fmtHM(s.ot), '', 'c-purple');
  else if (s.leaveBy) cards += card('🚪 Leave By', s.leaveBy, '', 'c-purple');
  else cards += card('✅ Status', s.goalDone?'Done!':'--', '', 'c-green');
  $('statGrid').innerHTML = cards;

  // goal progress
  var pct = Math.min(100, (s.total / 9) * 100).toFixed(0);
  var col = s.goalDone ? '#34d399' : '#3b82f6';
  var gl = '<div class="goal-row"><span class="goal-label">🎯 9h Goal</span>';
  gl += '<span class="goal-val ' + (s.goalDone?'c-green':'c-blue') + '">';
  gl += s.goalDone ? '🎉 Reached!' : fmtHMS(s.rem) + ' left';
  gl += '</span></div>';
  gl += '<div class="progress-bg"><div class="progress-fill" style="width:'+pct+'%;background:'+col+'"></div></div>';
  $('goalSection').innerHTML = '<div class="goal-box">' + gl + '</div>';

  // sessions
  var sl = '<div class="sess-title">📅 Sessions (' + s.intervals.length + ')</div>';
  for (var i = 0; i < s.intervals.length; i++) {
    var iv = s.intervals[i];
    sl += '<div class="sess-item">';
    sl += '<div style="display:flex;align-items:center">';
    sl += '<div class="sess-num">' + (i+1) + '</div>';
    sl += '<span class="sess-times">' + iv.s + ' → ' + iv.e + '</span>';
    sl += '</div>';
    sl += '<span class="sess-dur">' + fmtHM(iv.h) + '</span>';
    sl += '</div>';
  }
  $('sessionsSection').innerHTML = sl;

  // updated
  var n = new Date();
  $('updatedRow').textContent = 'Updated ' + timeStr(n) + ':' + String(n.getSeconds()).padStart(2,'0');
}

function card(label, value, sub, cls) {
  return '<div class="stat-card"><div class="stat-label">' + label + '</div>'
    + '<div class="stat-value ' + cls + '">' + value + '</div>'
    + (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</div>';
}

function $(id) { return document.getElementById(id); }

// ── Boot ─────────────────────────────────────────────────
var _rawData = null;   // cached extracted text
var _ticker  = null;   // live-update interval

document.addEventListener('DOMContentLoaded', function() {

  // ── Tab switching ───────────────────────────────────
  $('tabCopy').addEventListener('click', function() {
    setTab('Copy');
  });
  $('tabToday').addEventListener('click', function() {
    setTab('Today');
    if (!_rawData) fetchAndShow();
    else refreshDash();
  });

  function setTab(name) {
    $('tabCopy').className  = 'tab' + (name==='Copy'  ? ' active' : '');
    $('tabToday').className = 'tab' + (name==='Today' ? ' active' : '');
    $('viewCopy').className  = 'view' + (name==='Copy'  ? '' : ' hidden');
    $('viewToday').className = 'view' + (name==='Today' ? '' : ' hidden');
    if (name !== 'Today' && _ticker) { clearInterval(_ticker); _ticker = null; }
  }

  // ── Copy button (existing) ─────────────────────────
  $('extractBtn').addEventListener('click', async function() {
    var btn = $('extractBtn'), st = $('status');
    btn.disabled = true; btn.textContent = '⏳ Extracting...';
    try {
      var tab = (await chrome.tabs.query({active:true,currentWindow:true}))[0];
      var res = await chrome.tabs.sendMessage(tab.id, {action:'extractData'});
      if (res.success) {
        _rawData = res.data;
        st.textContent = '✅ Copied to clipboard!'; st.className = 'status-msg success';
      } else {
        st.textContent = '❌ ' + res.error; st.className = 'status-msg error';
      }
    } catch(e) {
      st.textContent = '❌ ' + e.message; st.className = 'status-msg error';
    }
    btn.disabled = false; btn.textContent = '📋 Copy Attendance Data';
    setTimeout(function(){ $('status').className = 'status-msg'; }, 3000);
  });

  // ── fetchAndShow: extract from page then show ───────
  window.fetchAndShow = async function() {
    $('todayLoading').className = 'loading';
    $('todayError').className = 'error-box hidden';
    $('todayDash').className = 'hidden';
    try {
      var tab = (await chrome.tabs.query({active:true,currentWindow:true}))[0];
      var res = await chrome.tabs.sendMessage(tab.id, {action:'extractData'});
      if (!res.success) throw new Error(res.error);
      _rawData = res.data;
      refreshDash();
    } catch(e) {
      $('todayLoading').className = 'loading hidden';
      $('todayError').className = 'error-box';
      $('todayError').textContent = '❌ ' + e.message;
    }
  };

  // ── refreshDash: parse + render + start ticker ──────
  window.refreshDash = function() {
    if (!_rawData) return;
    var recs = parsePunches(_rawData);
    var s = computeToday(recs);
    $('todayLoading').className = 'loading hidden';
    if (!s) {
      $('todayError').className = 'error-box';
      $('todayError').textContent = 'No records found for today.';
      $('todayDash').className = 'hidden';
      return;
    }
    $('todayError').className = 'error-box hidden';
    $('todayDash').className = '';
    renderDash(s);
    // live tick every second
    if (_ticker) clearInterval(_ticker);
    _ticker = setInterval(function() {
      var r2 = parsePunches(_rawData);
      var s2 = computeToday(r2);
      if (s2) renderDash(s2);
    }, 1000);
  };

  // ── Open in V1 / V2 ─────────────────────────────
  var V1 = 'https://work-hours-calculator-2o8g.vercel.app/';
  var V2 = 'https://work-hours-calculator-v2-gyssljnso-naapbooks.vercel.app/';

  $('openV1').addEventListener('click', function(){ openInApp(V1); });
  $('openV2').addEventListener('click', function(){ openInApp(V2); });

  async function openInApp(baseUrl) {
    var btn = event.target; btn.disabled = true;
    try {
      // use cached data or extract fresh
      if (!_rawData) {
        var tab = (await chrome.tabs.query({active:true,currentWindow:true}))[0];
        var res = await chrome.tabs.sendMessage(tab.id, {action:'extractData'});
        if (!res.success) throw new Error(res.error);
        _rawData = res.data;
      }
      var encoded = btoa(unescape(encodeURIComponent(_rawData)));
      chrome.tabs.create({ url: baseUrl + '#data=' + encoded });
    } catch(e) {
      $('status').textContent = '❌ ' + e.message;
      $('status').className = 'status-msg error';
      setTimeout(function(){ $('status').className = 'status-msg'; }, 3000);
    }
    btn.disabled = false;
  }

  // ── Auto-fetch on popup open ───────────────────────
  fetchAndShow();

}); // end DOMContentLoaded
