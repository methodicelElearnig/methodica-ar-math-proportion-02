'use strict';
/* ═══════════════════════════════════════════════════════════════════
   Applet — "יישומון: עיצוב דינוזאור למשחק"  (deck slide 35)

   The slide carries a production callout ("הפקה- שילוב ישומון") over a
   reference render, i.e. a build instruction, not learner copy. Rebuilt
   from that render: two sliders drive a plotted rectangle, and the box
   underneath shows the height:width ratio the learner has to keep.
   ═══════════════════════════════════════════════════════════════════ */

const DINO_START = { h: 12, w: 9 };
const DINO_MAX = 25;

function dinoAppletHTML() {
  return `
  <div class="dino" id="dino">
    <p class="dino-title">יישומון: עיצוב דינוזאור למשחק</p>
    <p class="dino-sub">מצב מקורי: גובה <strong>12</strong> ס"מ, רוחב <strong>9</strong> ס"מ. שנו את הערכים כדי לשמור על היחס</p>
    <div class="dino-body">
      <div class="dino-plot">
        <svg viewBox="0 0 340 312" role="img" aria-label="תרשים ממדי הדינוזאור">
          <g id="dino-grid"></g>
          <line class="dino-axis" x1="48" y1="260" x2="330" y2="260"/>
          <line class="dino-axis" x1="48" y1="260" x2="48" y2="10"/>
          <rect id="dino-rect" class="dino-rect" x="40" y="0" width="0" height="0"/>
          <text id="dino-tag" class="dino-tag" x="0" y="0">דינוזאור</text>
          <g id="dino-ticks"></g>
          <text class="dino-axis-label" x="330" y="300" text-anchor="end">רוחב (ס"מ)</text>
          <text class="dino-axis-label" x="50" y="14" text-anchor="start">גובה (ס"מ)</text>
        </svg>
      </div>
      <div class="dino-side">
        <label class="dino-ctl">
          <span>גובה (ס"מ):</span>
          <input type="range" id="dino-h" min="1" max="${DINO_MAX}" step="1" value="${DINO_START.h}"
                 aria-label="גובה הדינוזאור בסנטימטרים">
          <output id="dino-h-out">${DINO_START.h}</output>
        </label>
        <label class="dino-ctl">
          <span>רוחב (ס"מ):</span>
          <input type="range" id="dino-w" min="1" max="${DINO_MAX}" step="1" value="${DINO_START.w}"
                 aria-label="רוחב הדינוזאור בסנטימטרים">
          <output id="dino-w-out">${DINO_START.w}</output>
        </label>
        <div class="dino-readouts">
          <span class="dino-pill">גובה: <strong id="dino-h-pill">12</strong> ס"מ</span>
          <span class="dino-pill">רוחב: <strong id="dino-w-pill">9</strong> ס"מ</span>
        </div>
        <div class="dino-ratio">
          <p>היחס בין גובה הדמות לרוחב הדמות:</p>
          <span class="fraction fr-inline">
            <span class="frac-top" id="dino-fr-top">12</span>
            <span class="frac-bottom" id="dino-fr-bot">9</span>
          </span>
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
