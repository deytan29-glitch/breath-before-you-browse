/* ══════════════════════════════════════════════════════════
   Bloom — Companion App  (vanilla JS, no libraries, file://)
   ══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Constants ── */
  var XP_PER_RESIST = 10;
  var XP_PER_BREATH = 5;
  var BASE_XP       = 100;   // XP needed for level 1 → 2
  var LEVEL_SCALE   = 1.4;   // each level costs 1.4× more XP
  var STORAGE_KEY   = 'bloom_companion_v1';
  var DAY_NAMES     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  /* ── DOM refs ── */
  var canvas     = document.getElementById('companion');
  var ctx        = canvas.getContext('2d');
  var levelLabel = document.getElementById('levelLabel');
  var xpBar      = document.getElementById('xpBar');
  var xpText     = document.getElementById('xpText');
  var dayRow     = document.getElementById('dayRow');
  var streakLabel= document.getElementById('streakLabel');
  var resistBtn  = document.getElementById('resistBtn');
  var breathBtn  = document.getElementById('breathBtn');
  var resetBtn   = document.getElementById('resetBtn');
  var toastEl    = document.getElementById('toast');

  /* ── State ── */
  var state = loadState();

  /* ── Helpers ── */

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function dayOfWeek() {
    return new Date().getDay(); // 0=Sun … 6=Sat
  }

  function xpForLevel(lvl) {
    return Math.round(BASE_XP * Math.pow(LEVEL_SCALE, lvl - 1));
  }

  /* ── Persistence ── */

  function defaultState() {
    return {
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      weekDays: {},   // { "2025-03-02": true, ... }
      totalResists: 0,
      totalBreaths: 0
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // merge with defaults so new fields are added on upgrade
        var def = defaultState();
        for (var k in def) {
          if (!(k in parsed)) parsed[k] = def[k];
        }
        return parsed;
      }
    } catch (e) { /* corrupted — start fresh */ }
    return defaultState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* quota exceeded — silently continue */ }
  }

  /* ── XP / Level logic ── */

  function addXP(amount, message) {
    state.xp += amount;
    var needed = xpForLevel(state.level);

    while (state.xp >= needed) {
      state.xp -= needed;
      state.level++;
      needed = xpForLevel(state.level);
      showToast('🌱 Level ' + state.level + '! Your plant grew!');
    }

    // mark today active
    var today = todayKey();
    if (!state.weekDays[today]) {
      state.weekDays[today] = true;
    }

    // update streak
    updateStreak();

    saveState();
    render();

    if (message) showToast(message);
  }

  /* ── Streak logic ── */

  function updateStreak() {
    var today = todayKey();

    if (state.lastActiveDate === today) return; // already counted today

    if (state.lastActiveDate) {
      var last = new Date(state.lastActiveDate + 'T00:00:00');
      var now  = new Date(today + 'T00:00:00');
      var diff = Math.round((now - last) / 86400000);

      if (diff === 1) {
        state.streak++;
      } else if (diff > 1) {
        state.streak = 1; // broke the streak
      }
    } else {
      state.streak = 1; // first ever day
    }

    state.lastActiveDate = today;
  }

  /* ── Toast ── */

  var toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    toastEl.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2200);
  }

  /* ── Day-row rendering ── */

  function buildDayRow() {
    dayRow.innerHTML = '';

    // figure out the dates for this week (Sun–Sat)
    var now = new Date();
    var dow = now.getDay(); // 0=Sun
    var startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dow);

    for (var i = 0; i < 7; i++) {
      var d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      var key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');

      var dot = document.createElement('div');
      dot.className = 'day-dot' + (state.weekDays[key] ? ' done' : '');

      var circle = document.createElement('div');
      circle.className = 'circle';
      circle.textContent = state.weekDays[key] ? '✓' : '';

      var label = document.createElement('span');
      label.textContent = DAY_NAMES[i];

      dot.appendChild(circle);
      dot.appendChild(label);
      dayRow.appendChild(dot);
    }
  }

  /* ── Draw plant companion on canvas ── */

  function drawPlant() {
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // ── Progress ring (background) ──
    var ringR = 95;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = '#0f2818';
    ctx.lineWidth = 8;
    ctx.stroke();

    // ── Progress ring (filled) ──
    var needed = xpForLevel(state.level);
    var pct = state.xp / needed;
    var startA = -Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, startA, startA + pct * Math.PI * 2);
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // ── Pot ──
    var potW = 44 + Math.min(state.level, 10) * 2;
    var potH = 36 + Math.min(state.level, 10);
    var potY = cy + 28;

    ctx.beginPath();
    ctx.moveTo(cx - potW/2, potY);
    ctx.lineTo(cx - potW/2 + 6, potY + potH);
    ctx.lineTo(cx + potW/2 - 6, potY + potH);
    ctx.lineTo(cx + potW/2, potY);
    ctx.closePath();
    ctx.fillStyle = '#8d5524';
    ctx.fill();

    // pot rim
    ctx.beginPath();
    ctx.roundRect(cx - potW/2 - 3, potY - 6, potW + 6, 10, 3);
    ctx.fillStyle = '#a0622e';
    ctx.fill();

    // ── Stem ──
    var stemH = 20 + Math.min(state.level, 15) * 4;
    var stemTop = potY - stemH;
    ctx.beginPath();
    ctx.moveTo(cx, potY);
    ctx.lineTo(cx, stemTop);
    ctx.strokeStyle = '#388e3c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // ── Leaves ──
    var leafCount = Math.min(state.level, 8);
    for (var i = 0; i < leafCount; i++) {
      var t = (i + 1) / (leafCount + 1);
      var ly = potY - stemH * t;
      var side = (i % 2 === 0) ? 1 : -1;
      var leafLen = 12 + Math.min(state.level, 10) * 1.5;

      ctx.save();
      ctx.translate(cx, ly);
      ctx.rotate(side * -0.5);
      ctx.beginPath();
      ctx.ellipse(side * leafLen / 2, -4, leafLen / 2, 7, side * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#4caf50';
      ctx.fill();
      ctx.restore();
    }

    // ── Flower / bloom (appears at level 5+) ──
    if (state.level >= 5) {
      var petalCount = Math.min(state.level - 3, 8);
      var petalR = 8 + Math.min(state.level, 12);
      for (var p = 0; p < petalCount; p++) {
        var angle = (p / petalCount) * Math.PI * 2 - Math.PI / 2;
        var px = cx + Math.cos(angle) * petalR * 0.6;
        var py = stemTop + Math.sin(angle) * petalR * 0.6;
        ctx.beginPath();
        ctx.ellipse(px, py, 7, 11, angle, 0, Math.PI * 2);
        ctx.fillStyle = '#f48fb1';
        ctx.fill();
      }
      // center
      ctx.beginPath();
      ctx.arc(cx, stemTop, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fff176';
      ctx.fill();
    } else {
      // small bud
      ctx.beginPath();
      ctx.arc(cx, stemTop, 5 + state.level, 0, Math.PI * 2);
      ctx.fillStyle = '#66bb6a';
      ctx.fill();
    }

    // ── Face (simple) ──
    var faceY = stemTop + (state.level >= 5 ? 0 : 0);
    // eyes
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(cx - 4, faceY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4, faceY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // smile
    ctx.beginPath();
    ctx.arc(cx, faceY + 1, 3, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* ── Render everything ── */

  function render() {
    var needed = xpForLevel(state.level);

    levelLabel.textContent = 'Level ' + state.level;
    xpBar.style.width = ((state.xp / needed) * 100) + '%';
    xpText.textContent = state.xp + ' / ' + needed + ' XP';
    streakLabel.textContent = '🔥 Streak: ' + state.streak + ' day' + (state.streak !== 1 ? 's' : '');

    buildDayRow();
    drawPlant();
  }

  /* ── Button handlers ── */

  resistBtn.addEventListener('click', function () {
    state.totalResists++;
    var messages = [
      '+' + XP_PER_RESIST + ' XP — You resisted a distraction!',
      '+' + XP_PER_RESIST + ' XP — Staying focused 💪',
      '+' + XP_PER_RESIST + ' XP — Your plant is proud of you!',
      '+' + XP_PER_RESIST + ' XP — Willpower activated!',
      '+' + XP_PER_RESIST + ' XP — Mindful choice 🌿'
    ];
    var msg = messages[Math.floor(Math.random() * messages.length)];
    addXP(XP_PER_RESIST, msg);
  });

  breathBtn.addEventListener('click', function () {
    state.totalBreaths++;
    addXP(XP_PER_BREATH, '+' + XP_PER_BREATH + ' XP — Deep breath taken 🧘');
  });

  resetBtn.addEventListener('click', function () {
    if (confirm('Reset all progress? This cannot be undone.')) {
      state = defaultState();
      saveState();
      render();
      showToast('Progress reset — fresh start! 🌱');
    }
  });

  /* ── Polyfill roundRect for older browsers ── */
  if (!ctx.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (typeof r === 'number') r = [r, r, r, r];
      this.moveTo(x + r[0], y);
      this.lineTo(x + w - r[1], y);
      this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
      this.lineTo(x + w, y + h - r[2]);
      this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
      this.lineTo(x + r[3], y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
      this.lineTo(x, y + r[0]);
      this.quadraticCurveTo(x, y, x + r[0], y);
      this.closePath();
    };
  }

  /* ── Init ── */
  render();

})();
