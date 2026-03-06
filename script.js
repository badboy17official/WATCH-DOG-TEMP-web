/* ═══════════════════════════════════════════════════
   ctOS SYMPOSIUM — JAVASCRIPT
   Watch Dogs 1 surveillance-console aesthetic
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────
   NETWORK CANVAS — animated nodes + infrastructure lines
────────────────────────────────────────────────── */
const NetworkMap = (() => {
  const canvas = document.getElementById('networkCanvas');
  const ctx    = canvas.getContext('2d');

  const NODE_COUNT      = 38;
  const LINE_DIST       = 180;
  const NODE_RADIUS_MIN = 2;
  const NODE_RADIUS_MAX = 5;
  const SPEED           = 0.28;
  const LINE_COLOR      = 'rgba(255,255,255,';
  const NODE_COLOR      = 'rgba(255,255,255,';
  const PULSE_COLOR     = 'rgba(0,200,255,';

  let nodes  = [];
  let width  = 0;
  let height = 0;
  let raf;

  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeNode() {
    const angle = Math.random() * Math.PI * 2;
    const spd   = (Math.random() * 0.5 + 0.1) * SPEED;
    return {
      x:      Math.random() * width,
      y:      Math.random() * height,
      vx:     Math.cos(angle) * spd,
      vy:     Math.sin(angle) * spd,
      r:      Math.random() * (NODE_RADIUS_MAX - NODE_RADIUS_MIN) + NODE_RADIUS_MIN,
      pulse:  Math.random() > 0.85,        // special pulsing node
      pPhase: Math.random() * Math.PI * 2, // phase offset
      active: Math.random() > 0.3
    };
  }

  function init() {
    resize();
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) nodes.push(makeNode());
    window.addEventListener('resize', resize);
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // subtle grid
    drawGrid();

    const t = performance.now() / 1000;

    // move nodes
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width  + 20;
      if (n.x > width  + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;
    }

    // draw lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINE_DIST) {
          const alpha = (1 - dist / LINE_DIST) * 0.09;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = LINE_COLOR + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // draw nodes
    for (const n of nodes) {
      if (!n.active) continue;
      const alpha = n.pulse
        ? 0.5 + 0.45 * Math.sin(t * 2.5 + n.pPhase)
        : 0.35;

      if (n.pulse) {
        // outer glow ring
        const ringR = n.r * (2.5 + 1.5 * Math.sin(t * 2 + n.pPhase));
        const ringA = 0.15 * (0.5 + 0.5 * Math.sin(t * 2 + n.pPhase));
        ctx.beginPath();
        ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = PULSE_COLOR + ringA + ')';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = PULSE_COLOR + alpha + ')';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = NODE_COLOR + alpha + ')';
        ctx.fill();
      }
    }

    raf = requestAnimationFrame(loop);
  }

  function drawGrid() {
    const step = 60;
    ctx.strokeStyle = 'rgba(255,255,255,0.022)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  return { init };
})();


/* ──────────────────────────────────────────────────
   BOOT SEQUENCE
────────────────────────────────────────────────── */
const Boot = (() => {
  const screen    = document.getElementById('bootScreen');
  const log       = document.getElementById('bootLog');
  const granted   = document.getElementById('bootGranted');
  const barFill   = document.getElementById('bootBar');
  const percent   = document.getElementById('bootPercent');
  const mainApp   = document.getElementById('mainApp');

  const lines = [
    { text: '[ ctOS v3.0 INITIALIZING ]', delay: 300,  cls: '' },
    { text: '',                             delay: 500,  cls: '' },
    { text: '> establishing network link', delay: 700,  cls: '' },
    { text: '> scanning infrastructure nodes', delay: 1150, cls: '' },
    { text: '> authenticating operator credentials', delay: 1600, cls: '' },
    { text: '> loading surveillance feeds', delay: 2050, cls: '' },
    { text: '> verifying city-grid topology', delay: 2500, cls: '' },
    { text: '> decrypting secure channels', delay: 2900, cls: '' },
    { text: '> mounting persistent storage [OK]', delay: 3300, cls: '' },
    { text: '> initializing UI subsystem [OK]',   delay: 3650, cls: '' },
    { text: '',                                    delay: 3900, cls: '' },
  ];

  function printLine(text, cls = '') {
    const el = document.createElement('div');
    el.className = 'log-entry' + (cls ? ' ' + cls : '');
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function animateBar(cb) {
    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + (Math.random() * 4 + 0.5), 100);
      barFill.style.width = p + '%';
      percent.textContent = Math.floor(p);
      if (p >= 100) {
        clearInterval(interval);
        if (cb) cb();
      }
    }, 40);
  }

  function run() {
    // schedule each line
    lines.forEach(({ text, delay, cls }) => {
      setTimeout(() => printLine(text, cls), delay);
    });

    // animate progress bar in parallel
    setTimeout(() => animateBar(() => {
      setTimeout(() => {
        granted.classList.remove('hidden');
        setTimeout(() => finish(), 1600);
      }, 400);
    }), 400);
  }

  function finish() {
    screen.style.transition  = 'opacity 0.7s ease';
    screen.style.opacity     = '0';
    mainApp.classList.remove('hidden');
    mainApp.style.opacity    = '0';
    mainApp.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      screen.style.display = 'none';
      setTimeout(() => { mainApp.style.opacity = '1'; }, 80);
    }, 700);
  }

  return { run };
})();


/* ──────────────────────────────────────────────────
   CLOCK
────────────────────────────────────────────────── */
function startClock() {
  const el = document.getElementById('topbarClock');
  function tick() {
    const d  = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);
}


/* ──────────────────────────────────────────────────
   NAVIGATION
────────────────────────────────────────────────── */
const Nav = (() => {
  const links        = document.querySelectorAll('.nav-link, .mob-link, .ctos-btn[data-section]');
  const pages        = document.querySelectorAll('.page');
  const mobileMenu   = document.getElementById('mobileMenu');
  const hamburger    = document.getElementById('hamburger');

  function showPage(id) {
    pages.forEach(p => {
      const active = p.id === id;
      p.classList.toggle('active-page', active);
      if (active) p.style.display = 'block';
      else        p.style.display = 'none';
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.section === id);
    });
    // Close mobile menu
    mobileMenu.classList.add('hidden');
    hamburger.setAttribute('aria-expanded', 'false');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger section-specific init
    if (id === 'home')     initHome();
    if (id === 'schedule') initSchedule(1);
  }

  function init() {
    links.forEach(link => {
      link.addEventListener('click', e => {
        const sec = link.dataset.section;
        if (sec) { e.preventDefault(); showPage(sec); }
      });
    });

    hamburger.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', open);
      hamburger.setAttribute('aria-expanded', String(!open));
    });

    // Init first page
    showPage('home');
  }

  return { init, showPage };
})();


/* ──────────────────────────────────────────────────
   SYSTEM LOG
────────────────────────────────────────────────── */
const SysLog = (() => {
  const container = document.getElementById('syslog');

  const pool = [
    { msg: '> scanning city infrastructure',          cls: 'log-cyan' },
    { msg: '> loading data nodes [OK]',               cls: '' },
    { msg: '> network access established',            cls: 'log-cyan' },
    { msg: '> monitoring active — 241 cameras online',cls: '' },
    { msg: '> packet capture initialized',            cls: '' },
    { msg: '> node pulse: sector 7 responding',       cls: 'log-white' },
    { msg: '> anomalous traffic detected — analyzing',cls: 'log-warn' },
    { msg: '> firewall layer 3 active',               cls: '' },
    { msg: '> ctOS heartbeat nominal',                cls: 'log-cyan' },
    { msg: '> relay tower ping: 12ms',                cls: '' },
    { msg: '> credentials verified — tier 2',         cls: 'log-white' },
    { msg: '> data stream encrypted [AES-256]',       cls: '' },
    { msg: '> uplink to central node maintained',     cls: '' },
    { msg: '> geo-fence boundary active',             cls: 'log-cyan' },
    { msg: '> WARNING: unrecognised MAC address',     cls: 'log-warn' },
    { msg: '> scanning perimeter — clear',            cls: '' },
    { msg: '> symposium node provisioned',            cls: 'log-white' },
    { msg: '> traffic re-route via NODE-7',           cls: '' },
    { msg: '> signal strength: 4/5 bars',             cls: '' },
    { msg: '> access log updated',                    cls: 'log-cyan' },
  ];

  let idx      = 0;
  let interval = null;

  function getTime() {
    const d  = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
  }

  function addEntry() {
    const { msg, cls } = pool[idx % pool.length];
    idx++;
    const el = document.createElement('div');
    el.className = 'syslog-entry' + (cls ? ' ' + cls : '');
    el.innerHTML = `<span class="log-time">[${getTime()}]</span><span class="log-msg">${msg}</span>`;
    container.appendChild(el);
    // keep max 30 entries
    while (container.children.length > 30) container.removeChild(container.firstChild);
    container.scrollTop = container.scrollHeight;
  }

  function start() {
    if (interval) clearInterval(interval);
    addEntry();
    interval = setInterval(addEntry, 2200);
  }

  return { start };
})();


/* ──────────────────────────────────────────────────
   COUNTERS
────────────────────────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1600;
    const start  = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(ease * target);
      if (t < 1) requestAnimationFrame(step);
      else       el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}


/* ──────────────────────────────────────────────────
   HOME INIT
────────────────────────────────────────────────── */
function initHome() {
  SysLog.start();
  animateCounters();
}


/* ──────────────────────────────────────────────────
   SCHEDULE DATA + RENDER
────────────────────────────────────────────────── */
const scheduleData = {
  1: [
    { time: '08:00', title: 'REGISTRATION & SYSTEM CHECK-IN',          room: 'FOYER',    badge: '',      speaker: '' },
    { time: '09:00', title: 'OPENING CEREMONY & BRIEFING',             room: 'MAIN HALL',badge: 'KEY',   speaker: 'DR. CLARA HAYES', highlight: true },
    { time: '10:30', title: 'TRACK-01 // NETWORK SECURITY SUMMIT',     room: 'NODE-A',   badge: '',      speaker: 'J. DONOVAN' },
    { time: '10:30', title: 'TRACK-02 // SURVEILLANCE SYSTEMS INTRO',  room: 'NODE-B',   badge: '',      speaker: 'S. KWAN' },
    { time: '12:00', title: '[ SYSTEM PAUSE — OPERATIONAL LUNCH ]',    room: '—',        badge: '',      speaker: '' },
    { time: '13:30', title: 'WORKSHOP: LIVE PACKET CAPTURE',           room: 'NODE-A',   badge: '',      speaker: 'M. REYES' },
    { time: '13:30', title: 'WORKSHOP: CAMERA MESH NETWORKS',          room: 'NODE-B',   badge: '',      speaker: 'L. PAYNE' },
    { time: '15:00', title: 'PANEL: PRIVACY VS. INFRASTRUCTURE',       room: 'MAIN HALL',badge: 'PANEL', speaker: 'ALL OPERATIVES', highlight: true },
    { time: '17:00', title: '[ NETWORK IDLE — END OF DAY 01 ]',        room: '—',        badge: '',      speaker: '' },
  ],
  2: [
    { time: '09:00', title: 'SYSTEM RESUME — DAY 02 BRIEFING',         room: 'MAIN HALL',badge: '',      speaker: 'T. NAKAMURA' },
    { time: '09:30', title: 'TRACK-03 // URBAN DATA GRID FORUM',       room: 'NODE-C',   badge: '',      speaker: 'DR. C. HAYES' },
    { time: '09:30', title: 'TRACK-04 // EXPLOIT ANALYSIS LAB',        room: 'NODE-D',   badge: '',      speaker: 'J. DONOVAN' },
    { time: '11:00', title: 'KEYNOTE: ZERO-TRUST ARCHITECTURE',        room: 'MAIN HALL',badge: 'KEY',   speaker: 'EXT. SPEAKER', highlight: true },
    { time: '12:30', title: '[ SYSTEM PAUSE — OPERATIONAL LUNCH ]',    room: '—',        badge: '',      speaker: '' },
    { time: '14:00', title: 'LAB: REVERSE ENGINEERING LIVE',           room: 'NODE-D',   badge: '',      speaker: 'M. REYES' },
    { time: '14:00', title: 'WORKSHOP: SENSOR FUSION',                 room: 'NODE-C',   badge: '',      speaker: 'S. KWAN' },
    { time: '16:00', title: 'CTF CHALLENGE // OPEN TO ALL OPERATIVES', room: 'SANDBOX',  badge: 'LIVE',  speaker: '', highlight: true },
    { time: '18:00', title: '[ NETWORK IDLE — END OF DAY 02 ]',        room: '—',        badge: '',      speaker: '' },
  ],
  3: [
    { time: '09:00', title: 'SYSTEM RESUME — FINAL DAY BRIEFING',      room: 'MAIN HALL',badge: '',      speaker: 'T. NAKAMURA' },
    { time: '09:30', title: 'TRACK-05 // CTRLR PROTOCOL DEMO',         room: 'NODE-E',   badge: 'LIVE',  speaker: 'M. REYES', highlight: true },
    { time: '11:00', title: 'KEYNOTE: CONNECTED CITIES',               room: 'MAIN HALL',badge: 'KEY',   speaker: 'DR. CLARA HAYES', highlight: true },
    { time: '12:30', title: '[ SYSTEM PAUSE — OPERATIONAL LUNCH ]',    room: '—',        badge: '',      speaker: '' },
    { time: '14:00', title: 'WORKSHOP: ctOS SANDBOX EXPLORATION',      room: 'SANDBOX',  badge: '',      speaker: 'J. DONOVAN' },
    { time: '14:00', title: 'ROUNDTABLE: FUTURE OF URBAN SURVEILLANCE',room: 'NODE-C',   badge: 'PANEL', speaker: 'L. PAYNE', highlight: false },
    { time: '16:00', title: 'AWARDS & CLOSING TRANSMISSION',           room: 'MAIN HALL',badge: 'KEY',   speaker: 'ALL OPERATIVES', highlight: true },
    { time: '17:30', title: '[ NETWORK SHUTDOWN — SYMPOSIUM COMPLETE ]',room: '—',       badge: '',      speaker: '' },
  ],
};

function initSchedule(day) {
  const panel = document.getElementById('timelinePanel');
  const items = scheduleData[day];

  const header = document.createElement('div');
  header.className = 'panel-header';
  header.innerHTML = `<span class="panel-tag">SYS // DAY ${day} OPERATIONAL LOG</span><span class="panel-corner">▣</span>`;

  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'tl-item' + (item.highlight ? ' highlight' : '');
    el.style.animationDelay = `${i * 60}ms`;

    let badgeHtml = '';
    if (item.badge) badgeHtml = `<span class="tl-badge ${item.badge === 'KEY' ? 'key' : ''}">${item.badge}</span>`;

    let metaHtml = `<span>${item.room}</span>`;
    if (item.speaker) metaHtml += `<span>// ${item.speaker}</span>`;

    el.innerHTML = `
      <div class="tl-time">${item.time}</div>
      <div class="tl-dot"><div class="tl-dot-inner"></div></div>
      <div class="tl-body">
        <div class="tl-title">${item.title} ${badgeHtml}</div>
        <div class="tl-meta">${metaHtml}</div>
      </div>`;
    timeline.appendChild(el);
  });

  panel.innerHTML = '';
  panel.appendChild(header);
  panel.appendChild(timeline);
}

// Day tab switching
document.addEventListener('click', e => {
  const btn = e.target.closest('.day-tab');
  if (!btn) return;
  document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  initSchedule(parseInt(btn.dataset.day, 10));
});


/* ──────────────────────────────────────────────────
   REGISTER FORM
────────────────────────────────────────────────── */
const RegForm = (() => {
  const form    = document.getElementById('regForm');
  const msgEl   = document.getElementById('regFormMsg');
  const prompt  = document.getElementById('termPrompt');

  function addPromptLine(text) {
    const p = document.createElement('p');
    p.className = 'term-line';
    p.textContent = text;
    prompt.appendChild(p);
  }

  function showMsg(text, isError = false) {
    msgEl.textContent = text;
    msgEl.className = 'form-msg' + (isError ? ' error' : '');
    msgEl.classList.remove('hidden');
  }

  function init() {
    if (!form) return;

    // Typing focus effect on inputs
    form.querySelectorAll('.ctos-input, .ctos-select, .ctos-textarea').forEach(el => {
      el.addEventListener('focus', () => {
        const label = el.closest('.form-field')?.querySelector('.field-label')?.textContent || '';
        addPromptLine(`> CURSOR ON ${label.replace('> ', '')}`);
        // keep last 8 lines
        while (prompt.children.length > 8) prompt.removeChild(prompt.firstChild);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      // Basic validation
      const fname  = form.querySelector('#fname').value.trim();
      const lname  = form.querySelector('#lname').value.trim();
      const email  = form.querySelector('#email').value.trim();
      const access = form.querySelector('#access').value;
      const agree  = form.querySelector('#agree').checked;

      if (!fname || !lname || !email || !access) {
        showMsg('ERROR: INCOMPLETE DATA PACKET — ALL FIELDS REQUIRED.', true);
        addPromptLine('> ERROR: missing credential fields');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg('ERROR: INVALID EMAIL FORMAT — TRANSMISSION REJECTED.', true);
        addPromptLine('> ERROR: malformed email address');
        return;
      }
      if (!agree) {
        showMsg('ERROR: MONITORING ACKNOWLEDGMENT REQUIRED.', true);
        addPromptLine('> ERROR: operator consent not confirmed');
        return;
      }

      // Simulate transmission
      addPromptLine('> transmitting credentials...');
      addPromptLine('> encrypting payload [AES-256]');
      const submitBtn = form.querySelector('.submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = '▶ TRANSMITTING...';

      setTimeout(() => {
        addPromptLine('> packet received by central node');
        addPromptLine(`> operator "${fname.toUpperCase()} ${lname.toUpperCase()}" registered`);
        addPromptLine('> confirmation code dispatched via secure channel');
        showMsg(`TRANSMISSION COMPLETE. CONFIRMATION DISPATCHED TO ${email.toUpperCase()}.`);
        submitBtn.textContent = '▶ TRANSMITTED';
        form.reset();
        setTimeout(() => { submitBtn.disabled = false; submitBtn.innerHTML = '<span class="btn-icon">▶</span> TRANSMIT CREDENTIALS'; }, 5000);
      }, 2000);
    });
  }

  return { init };
})();


/* ──────────────────────────────────────────────────
   RANDOM UI FLICKER
────────────────────────────────────────────────── */
function startUiFlicker() {
  setInterval(() => {
    const panels = document.querySelectorAll('.ctos-panel');
    if (!panels.length) return;
    const target = panels[Math.floor(Math.random() * panels.length)];
    target.classList.add('ui-flicker');
    setTimeout(() => target.classList.remove('ui-flicker'), 120);
  }, 3500);
}


/* ──────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  NetworkMap.init();
  Boot.run();

  // After boot finishes (~6s), init the rest
  setTimeout(() => {
    startClock();
    Nav.init();
    RegForm.init();
    startUiFlicker();
  }, 5800);
});
