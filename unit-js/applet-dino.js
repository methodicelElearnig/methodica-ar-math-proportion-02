'use strict';
/* ═══════════════════════════════════════════════════════════════════
   Applet — "تطبيق مصغّر: تصميم ديناصور للعبة"  (deck slide 35)

   The slide carries a production callout ("הפקה- שילוב ישומון") over a
   reference render, i.e. a build instruction, not learner copy. Rebuilt
   from that render: two sliders drive a plotted rectangle, and the box
   underneath shows the height:width ratio the learner has to keep.
   ═══════════════════════════════════════════════════════════════════ */

const DINO_START = { h: 12, w: 9 };
const DINO_MAX = 25;

function dinoAppletHTML() {
  /* 04.10, producer: this applet needs a magnifier like the iframe ones.
     The dino is INLINE DOM, not an iframe, so the image/table overlay is
     wrong for it — that overlay clones the node, and a cloned dino is dead
     (its sliders are bound to the ids in the live one). Reuse the in-place
     `.applet-embed.is-zoomed` toggle instead: same element, so the learner's
     slider positions survive opening and closing the zoom. Buttons are the
     approved 44px chips, and the close one keeps BOTH classes. */
  return `
  <div class="applet-embed applet-inline">
    <button class="applet-zoom-btn" type="button" data-applet-toggle="open"
      aria-label="تكبير التطبيق إلى شاشة كاملة"><svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" stroke-width="2"/><line x1="13.5" y1="13.5" x2="19" y2="19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>
    <button class="applet-zoom-btn applet-close-btn" type="button" data-applet-toggle="close"
      aria-label="إغلاق الشاشة الكاملة"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><line x1="2" y1="2" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="2" x2="2" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
  <div class="dino" id="dino">
    <p class="dino-title">تطبيق مصغّر: تصميم ديناصور للعبة</p>
    <p class="dino-sub">الوضع الأصلي: ارتفاع <strong>12</strong> سم، عرض <strong>9</strong> سم. غيّروا القيم للحفاظ على النسبة</p>
    <div class="dino-body">
      <div class="dino-plot">
        <svg viewBox="0 0 340 312" role="img" aria-label="مخطط أبعاد الديناصور">
          <g id="dino-grid"></g>
          <line class="dino-axis" x1="48" y1="260" x2="330" y2="260"/>
          <line class="dino-axis" x1="48" y1="260" x2="48" y2="10"/>
          <rect id="dino-rect" class="dino-rect" x="40" y="0" width="0" height="0"/>
          <text id="dino-tag" class="dino-tag" x="0" y="0">ديناصور</text>
          <g id="dino-ticks"></g>
          <text class="dino-axis-label" x="330" y="300" text-anchor="end">العرض (سم)</text>
          <text class="dino-axis-label" x="50" y="14" text-anchor="start">الارتفاع (سم)</text>
        </svg>
      </div>
      <div class="dino-side">
        <label class="dino-ctl"><span>الارتفاع (سم):</span><input type="range" id="dino-h" min="1" max="${DINO_MAX}" step="1" value="${DINO_START.h}"
                 aria-label="ارتفاع الديناصور بالسنتيمترات">
          <output id="dino-h-out">${DINO_START.h}</output>
        </label>
        <label class="dino-ctl"><span>العرض (سم):</span><input type="range" id="dino-w" min="1" max="${DINO_MAX}" step="1" value="${DINO_START.w}"
                 aria-label="عرض الديناصور بالسنتيمترات">
          <output id="dino-w-out">${DINO_START.w}</output>
        </label>
        <div class="dino-readouts"><span class="dino-pill">الارتفاع: <strong id="dino-h-pill">12</strong> سم</span> <span class="dino-pill">العرض: <strong id="dino-w-pill">9</strong> سم</span></div>
        <div class="dino-ratio">
          <p>النسبة بين ارتفاع الشكل وعرض الشكل:</p>
          <span class="fraction fr-inline">
            <span class="frac-top" id="dino-fr-top">12</span>
            <span class="frac-bottom" id="dino-fr-bot">9</span>
          </span>
        </div>
      </div>
    </div>
  </div>
  </div>`;
}

function dinoWire() {
  const root = document.getElementById('dino');
  if (!root || root.dataset.wired) return;
  root.dataset.wired = '1';

  const X0 = 48, Y0 = 260, PX = 10.4;      /* 25 cm across ~260px */
  const grid = root.querySelector('#dino-grid');
  const ticks = root.querySelector('#dino-ticks');
  let g = '', t = '';
  for (let v = 0; v <= DINO_MAX; v += 1) {
    const x = X0 + v * PX, y = Y0 - v * PX;
    const major = v % 5 === 0;
    g += `<line class="dino-grid${major ? ' is-major' : ''}" x1="${x}" y1="${Y0}" x2="${x}" y2="10"/>`;
    g += `<line class="dino-grid${major ? ' is-major' : ''}" x1="${X0}" y1="${y}" x2="330" y2="${y}"/>`;
    /* the top/right-most tick label would sit under the axis caption */
    if (major && v && v < DINO_MAX) {
      t += `<text class="dino-tick" x="${x}" y="${Y0 + 20}" text-anchor="middle">${v}</text>`;
      t += `<text class="dino-tick" x="${X0 - 6}" y="${y + 6}" text-anchor="end">${v}</text>`;
    }
  }
  grid.innerHTML = g; ticks.innerHTML = t;

  const H = root.querySelector('#dino-h'), W = root.querySelector('#dino-w');
  const rect = root.querySelector('#dino-rect'), tag = root.querySelector('#dino-tag');

  function draw() {
    const h = +H.value, w = +W.value;
    rect.setAttribute('x', X0);
    rect.setAttribute('y', Y0 - h * PX);
    rect.setAttribute('width', w * PX);
    rect.setAttribute('height', h * PX);
    tag.setAttribute('x', X0 + w * PX / 2);
    tag.setAttribute('y', Y0 - h * PX - 6);
    root.querySelector('#dino-h-out').textContent = h;
    root.querySelector('#dino-w-out').textContent = w;
    root.querySelector('#dino-h-pill').textContent = h;
    root.querySelector('#dino-w-pill').textContent = w;
    root.querySelector('#dino-fr-top').textContent = h;
    root.querySelector('#dino-fr-bot').textContent = w;
    /* the ratio box turns green while the learner is holding 12:9 (= 4:3) */
    root.querySelector('.dino-ratio').classList.toggle('is-kept', h * 9 === w * 12);
  }
  H.addEventListener('input', draw);
  W.addEventListener('input', draw);
  draw();
}
