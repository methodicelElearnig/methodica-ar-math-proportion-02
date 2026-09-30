'use strict';
/* ═══════════════════════════════════════════════════════════════════
   S8 — guided practice · deck slides 23-29 (ONE screen, 7 steps)

   The library's default guided screen is GuidedInstructionFlow-RevealCallout
   (percent-08, approved 10.09.26): the answer is revealed BY THE CLICK — no
   "צדקתי?" and no ✗ on a wrong pick — and the explanation appears in an
   indigo callout beneath.

   The exercise stem stands on every step; only the step's own question and
   callout change.
   ═══════════════════════════════════════════════════════════════════ */

const G_STORY = `<p>חברת צעצועי הרכבה החליטה לבנות דגם ענק של מכונית יוקרה.<br>
  כדי שהדגם המוגדל ייראה כמו הדגם המקורי, עליה לשמור על פרופורציה בין הממדים של שני הדגמים.</p>
  <p>גובה הדגם המקורי הוא 4 ס"מ, אורכו 16 ס"מ.<br>
  החברה מעוניינת שאורך הדגם המוגדל לתצוגה יהיה 80 ס"מ.</p>`;
/* the deck sets this at the FOOT of the framed box, under the table/photo */
const G_ASK = `<p class="g-ask"><strong>מה צריך להיות גובה הדגם המוגדל כדי שתישמר הפרופורציה?</strong></p>`;
/* the bold line above both columns. Slide 23 says "רק קראו", 25-29 "רק הסתכלו
   על"; slide 24 has no such line at all. */
const TOP_READ = 'התבוננו בתרגיל הבא. אל תפתרו אותו, רק קראו את הנתונים וחישבו האם יש לכם כיוון לפתרון.';
const TOP_LOOK = 'התבוננו בתרגיל הבא. אל תפתרו אותו, רק הסתכלו על הנתונים וחישבו האם יש לכם כיוון לפתרון.';

const gf = (n, d) => `<span class="fraction fr-inline"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span>`;
const geq = (a, b) => `<span class="car-eq" dir="ltr">${a}<span class="car-eq-op">=</span>${b}</span>`;

/* DELIBERATE DEVIATION FROM THE DECK (flagged 27.09, producer may overrule):
   the deck names the same unknown four different ways across these seven
   slides — capital `X` on 24 and 26, `?` on 25, lowercase `x` on 27 and 28.
   Step 5 (slide 27) is where the deck itself defines the unknown, "x – גובה
   הדגם המוגדל", and step 6 (slide 28) solves x = 20. Across one continuous
   exercise X -> ? -> X -> x reads as three different quantities, so every
   table cell below uses lowercase `x`. Each changed cell is marked. */
const G_TABLE = (cells) => `<table class="car-table"><thead><tr><th></th><th>דגם מקורי</th><th>דגם מוגדל</th></tr></thead>
  <tbody><tr><th>גובה</th><td>${cells[0]}</td><td>${cells[1]}</td></tr>
  <tr><th>אורך</th><td>${cells[2]}</td><td>${cells[3]}</td></tr></tbody></table>`;

/* Layout, read off the rendered deck pages 23-29 (27.09):
     · a bold TOPLINE above both columns (every step but 2),
     · RIGHT: a framed box — story, then the table (or step 1's photo), then
       the bold question at its foot,
     · LEFT: the purple instruction card … except step 1, where the deck has no
       card at all: the COMPANION stands there with its speech bubble.
   The table lives in the frame on steps 3-7; on step 2, where it is being
   introduced, the deck puts it inside the card (`tableInCard`). */
const GUIDED = [
  { /* 1 · deck 23 — no card: the companion and its callout stand in the left
       column, and the framed box carries the annotated photo. */
    topline: TOP_READ,
    frameImg: 'guided-car.png', dims: true,
    monster: 'standing', bubble: 'מיד נסביר את הפתרון,<br>שלב אחר שלב' },

  { /* 2 · deck 24 — the only step with no topline, and the only one where the
       table sits in the CARD (it is being introduced there). */
    card: 'לפני שנתחיל לחשב,<br>נעזר בטבלת הפרופורציה לארגון הנתונים.',
    tableInCard: true,
    /* deck slide 24 writes this cell as capital `X` — normalised to `x` */
    table: G_TABLE(['4 ס"מ', 'x', '16 ס"מ', '80 ס"מ']) },

  { /* 3 · deck 25 — pick.  The deck lays the three pills out left-to-right
       1/4 · 4/1 · 1/12, i.e. RIGHT-to-left 1/12 · 4/1 · 1/4, and the נכון
       badge sits under the LEFTMOST pill (1/4) — so 1/4 is last here. */
    topline: TOP_LOOK,
    /* deck slide 25 writes this cell as `?` — normalised to `x` */
    table: G_TABLE(['4 ס"מ', 'x', '16 ס"מ', '80 ס"מ']),
    card: 'כדי שצורת הדגם לא תתעוות, יש לשמור על פרופורציה (שוויון יחסים) בין גובה הדגם לאורכו.',
    q: 'מה היחס ה<strong>מצומצם</strong> בין הגובה לאורך של הדגם המקורי?',
    opts: [gf('1', '12'), gf('4', '1'), gf('1', '4')], correct: 2 },

  { /* 4 · deck 26 */ topline: TOP_LOOK,
    /* deck slide 26 writes this cell as capital `X` — normalised to `x` */
    table: G_TABLE(['4 ס"מ', 'x', '16 ס"מ', '80 ס"מ']),
    card: `לפי הנתונים, היחס בין גובה הדגם המקורי לאורכו הוא:<br>${gf('4', '16')}<br>לאחר צמצום ב-4 נקבל שהיחס המצומצם שווה ל- ${gf('1', '4')}` },

  { /* 5 · deck 27 — pick.  Deck order left-to-right x/80 · 80/x → right-to-left
       80/x · x/80, נכון badge under the leftmost pill (x/80). */
    topline: TOP_LOOK,
    table: G_TABLE(['4 ס"מ', 'x', '16 ס"מ', '80 ס"מ']),
    card: 'נסמן:<br><span dir="ltr">x</span> – גובה הדגם המוגדל.',
    q: 'היחס בין גובה הדגם המוגדל לאורכו הוא:',
    opts: [gf('80', 'x'), gf('x', '80')], correct: 1 },

  { /* 6 · deck 28 */ topline: TOP_LOOK,
    table: G_TABLE(['4 ס"מ', 'x', '16 ס"מ', '80 ס"מ']),
    card: `נבנה את משוואת הפרופורציה – שוויון בין שני היחסים שמצאנו:<br>${geq(gf('x', '80'), gf('1', '4'))}<br>נכפול במכנה המשותף (80) ונקבל:<br><span dir="ltr">x = 20</span>` },

  { /* 7 · deck 29 — the card carries the closing note AND the photo; the deck
       puts image50 in the LEFT column (x 49..289), i.e. beside the card. */
    topline: TOP_LOOK,
    table: G_TABLE(['4 ס"מ', '<strong>20 ס"מ</strong>', '16 ס"מ', '80 ס"מ']),
    cardTitle: 'לא לשכוח – לנסח תשובה סופית 😊',
    card: 'כדי שתישמר פרופורציה בין הממדים של הדגם המוגדל והדגם המקורי, <strong>גובה הדגם המוגדל צריך להיות 20 ס"מ.</strong>',
    cardImg: 'guided-car-big.png' },
];

const GC_BULB = `<svg class="gc-bulb" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 28" fill="none" aria-hidden="true"><path fill="currentColor" d="M17.482 2.658A10.54 10.54 0 0 0 9.257.07C4.598.604.748 4.357.103 8.991a10.51 10.51 0 0 0 3.429 9.349c1.46 1.294 2.298 3.18 2.298 5.17v.406a4.09 4.09 0 0 0 4.084 4.083h1.166a4.09 4.09 0 0 0 4.084-4.083v-.412c0-1.967.877-3.86 2.47-5.333a10.49 10.49 0 0 0 3.363-7.672c0-2.99-1.281-5.849-3.515-7.841m-3.485 21.256a2.92 2.92 0 0 1-2.917 2.917H9.914a2.92 2.92 0 0 1-2.917-2.917v-.406c0-.453-.038-.904-.11-1.344h7.227q-.116.66-.117 1.338zm2.846-6.6c-1.152 1.063-1.978 2.325-2.435 3.684h-3.329v-8.8a3.505 3.505 0 0 0 2.917-3.45.584.584 0 0 0-1.167 0 2.336 2.336 0 0 1-2.333 2.333 2.336 2.336 0 0 1-2.334-2.333.584.584 0 0 0-1.166 0 3.505 3.505 0 0 0 2.916 3.45v8.8h-3.31a8 8 0 0 0-2.296-3.532C1.96 15.39.822 12.281 1.258 9.152c.573-4.116 3.992-7.448 8.13-7.924a10 10 0 0 1 1.123-.064c2.296 0 4.463.82 6.196 2.365a9.35 9.35 0 0 1 3.124 6.969 9.19 9.19 0 0 1-2.987 6.815z"/></svg>`;

const gState = { step: 1, picked: {} };

function gRender() {
  const i = gState.step, cfg = GUIDED[i - 1], sec = document.getElementById('s8');
  if (!sec || !cfg) return;
  const picked = gState.picked[i];
  const revealed = picked !== undefined;
  /* the counter counts QUESTION steps only, exactly as 2.1 does */
  const steps = GUIDED.filter(c => c.opts);
  const stepIdx = steps.indexOf(cfg);

  const optsHTML = () => `<div class="gc-opts" role="radiogroup" aria-label="אפשרויות תשובה">
    ${cfg.opts.map((o, k) => `
      <div class="gc-opt${revealed ? ' locked' : ''}${revealed && k === cfg.correct ? ' correct' : ''}${revealed && picked === k && k !== cfg.correct ? ' chosen' : ''}"
           role="radio" aria-checked="${picked === k}" tabindex="0" data-k="${k}">${o}</div>`).join('')}
  </div>`;

  const pic = cfg.dims
    ? `<span class="g-figure"><img class="g-pic" src="assets/img/${cfg.frameImg}" alt="דגם מכונית הרכבה">
         <span class="g-rule g-rule--v"></span><span class="g-rule g-rule--h"></span>
         <span class="g-dim g-dim--h">4 ס"מ</span><span class="g-dim g-dim--w">16 ס"מ</span></span>`
    : `<img class="g-pic" src="assets/img/${cfg.frameImg}" alt="דגם מכונית הרכבה">`;

  sec.innerHTML = `
    <h1 class="g-title" data-reveal="1">פרופורציה – בואו נפתור תרגיל ראשון יחד</h1>
    ${cfg.topline ? `<p class="g-topline" data-reveal="2"><strong>${cfg.topline}</strong></p>` : ''}
    <div class="g-layout${cfg.topline ? '' : ' g-layout--notop'}">
      <div class="g-right" data-reveal="3">
        <div class="g-frame">
          <div class="g-story">${G_STORY}</div>
          ${!cfg.tableInCard && cfg.table ? `<div class="g-media">${cfg.table}</div>` : ''}
          ${cfg.frameImg ? `<div class="g-media">${pic}</div>` : ''}
          ${G_ASK}
        </div>
      </div>
      ${cfg.monster ? '' : `<aside class="g-callout" data-reveal="4" aria-label="הנחיית השלב">
        ${GC_BULB}
        ${cfg.cardTitle ? `<div class="gc-title">${cfg.cardTitle}</div>` : ''}
        ${cfg.card ? `<div class="gc-text">${cfg.card}</div>` : ''}
        ${cfg.tableInCard && cfg.table ? `<div class="gc-table">${cfg.table}</div>` : ''}
        ${cfg.q ? `<div class="gc-q">${cfg.q}</div>` : ''}
        ${cfg.opts ? optsHTML() : ''}
        ${cfg.cardImg ? `<img class="gc-pic" src="assets/img/${cfg.cardImg}" alt="דגם מכונית הרכבה">` : ''}
      </aside>`}
    </div>
    ${cfg.monster ? `<div class="character-widget" data-reveal="1" data-reveal-fade>
      <div class="speech-bubble">${cfg.bubble}</div>
      <img id="g-char" alt="דמות מלווה">
    </div>` : ''}
    <button class="btn-continue" id="g-next">המשך</button>
    <button class="btn-back" id="g-prev">חזרה</button>`;

  if (cfg.monster && typeof setCharacter === 'function') setCharacter('g-char', cfg.monster);
  /* report the SLIDE, not just the screen — the DEV harness steps 8 → 8.1 → … */
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'DEV_SCREEN', screen: 8, step: gState.step }, '*');
  }
  if (typeof decorateBubbles === 'function') decorateBubbles(sec);

  /* the approved default reveals ON THE CLICK — no צדקתי?, no ✗ on a miss */
  sec.querySelectorAll('.gc-opt').forEach(b => {
    b.onclick = () => { gState.picked[i] = +b.dataset.k; gRender(); };
    b.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.onclick(); } };
  });
  sec.querySelector('#g-next').onclick = () => {
    if (cfg.opts && !revealed) return;
    if (gState.step < GUIDED.length) { gState.step++; gRender(); } else goTo(9);
  };
  sec.querySelector('#g-prev').onclick = () => {
    if (gState.step > 1) { gState.step--; gRender(); } else goTo(7);
  };
}

function gEnter() { gRender(); }


window.gGoToStep = function (n) {
  const k = Math.max(1, Math.min(GUIDED.length, parseInt(n, 10) || 1));
  gState.step = k;
  gRender();
};
