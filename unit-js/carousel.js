'use strict';
/* ═══════════════════════════════════════════════════════════════════
   S5 — the carousel · deck slides 8-19 (ONE screen, 12 steps)

   The deck draws a 9-dot strip on all twelve slides with the SAME dot
   active — it is a static mock, never advanced. The step count is the
   slides (12), and the indicator below is built from that.

   Four steps are graded (4, 6, 9, 10 — deck slides 11, 13, 16, 17);
   the rest are explanation. The bottom bar is the only control: המשך
   steps forward, and on a graded step it becomes צדקתי? until answered.
   ═══════════════════════════════════════════════════════════════════ */

/* ── The deck's annotated proportion equation (slides 14 and 18) ───────────
   A CENTRED fraction pair with three callout boxes around it: one beside the
   left fraction, and two to the right joined to the right fraction's numerator
   and denominator by leader lines. The lines are drawn in `eqfigWire()` from
   the laid-out geometry — hard-coded coordinates drift the moment the text
   rewraps. */
const eqfig = (left, tr, br, eq, opt) => {
  const o = opt || {};
  const at = o.lines === false ? ['', ''] : [' data-from="num"', ' data-from="den"'];
  const col = `<div class="eqfig-col">
      <div class="eqfig-box"${at[0]}>${tr}</div>
      <div class="eqfig-box"${at[1]}>${br}</div>
    </div>`;
  const box = `<div class="eqfig-box eqfig-box--l">${left}</div>`;
  const body = `<div class="eqfig-eq">${eq}</div>`;
  /* `mirror` puts the pair on the LEFT and the lone label on the RIGHT — which
     is how the deck lays out the second equation in slide 13's feedback. */
  return `<div class="eqfig${o.tight ? ' eqfig--tight' : ''}">
    <svg class="eqfig-lines" aria-hidden="true"></svg>
    ${o.mirror ? col + body + box : box + body + col}
  </div>`;
};

function eqfigWire(sec) {
  sec.querySelectorAll('.eqfig').forEach(fig => {
    const svg = fig.querySelector('.eqfig-lines');
    const eq = fig.querySelector('.eqfig-eq');
    if (!svg || !eq) return;
    /* the RIGHT fraction of the pair — its numerator and denominator are what
       the two callouts point at */
    const fracs = eq.querySelectorAll('.fraction');
    const target = fracs[fracs.length - 1];
    if (!target) return;
    const anchors = {
      num: target.querySelector('.frac-top'),
      den: target.querySelector('.frac-bottom'),
    };
    const F = fig.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${Math.round(F.width)} ${Math.round(F.height)}`);
    svg.setAttribute('width', Math.round(F.width));
    svg.setAttribute('height', Math.round(F.height));
    let d = '';
    fig.querySelectorAll('[data-from]').forEach(box => {
      const a = anchors[box.dataset.from];
      if (!a) return;
      const b = box.getBoundingClientRect(), t = a.getBoundingClientRect();
      /* from the box's edge nearest the equation to the anchor's far edge */
      /* 5px of air before the glyph — the line used to land ON the numerator
         and denominator of the y fraction. 10px was too much (producer 06.10). */
      const GAP = 5;
      const x1 = b.left - F.left, y1 = b.top - F.top + b.height / 2;
      const x2 = t.right - F.left + GAP, y2 = t.top - F.top + t.height / 2;
      d += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
    });
    svg.innerHTML = d;
  });
}

/* the explanation both drag steps share under their feedback table */
const EXPL = 'זוהי טבלת הפרופורציה הנכונה ממנה נוכל ליצור את המשוואה ולמצוא את הנעלם.';

const CAR_STEPS = 12;
const CAR_TITLE = {
  1: 'איך מוודאים שפרופורציה נשמרת?', 2: 'איך מוודאים שפרופורציה נשמרת?',
  3: 'אביבית אופה עוגה',
  4: 'איך נמיר גרמים לכוסות מדידה?', 5: 'איך נמיר גרמים לכוסות מדידה?',
  6: 'איך נמיר גרמים לכוסות מדידה?', 7: 'איך נמיר גרמים לכוסות מדידה?',
  8: 'כמה כוסות קמח לבן צריך במתכון?',
  9: 'כמה כוסות סוכר אביבית צריכה?', 10: 'כמה כוסות סוכר אביבית צריכה?',
  11: 'כמה כוסות סוכר אביבית צריכה?', 12: 'כמה כוסות סוכר אביבית צריכה?',
};

const fr = (n, d) => `<span class="fraction fr-inline"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span>`;
const eqp = (a, b) => `<span class="car-eq" dir="ltr">${a}<span class="car-eq-op">=</span>${b}</span>`;

/* A proportion table. `cells` are the four body values; a null becomes a
   drop target for the drag steps. */
function carTable(head2, rows, cells) {
  const td = (v, slot) => v === null
    ? `<td class="car-drop" data-slot="${slot}" aria-label="שחררו כאן"></td>`
    : `<td>${v}</td>`;
  return `<table class="car-table"><thead><tr><th></th><th>${head2[0]}</th><th>${head2[1]}</th></tr></thead>
    <tbody>
      <tr><th>${rows[0]}</th>${td(cells[0], 0)}${td(cells[1], 1)}</tr>
      <tr><th>${rows[1]}</th>${td(cells[2], 2)}${td(cells[3], 3)}</tr>
    </tbody></table>`;
}

const CAR = [
  { /* 1 · deck 8 */ img: 'car-kitchen.jpg', alt: 'מטבח ביתי עם מרכיבי אפייה',
    body: `<p>ניקח דוגמה מהמטבח של אביבית:</p>
      <p>במתכוני אפייה, כמויות המרכיבים יכולות להופיע בגרמים (יחידת משקל)<br>או בכוסות מדידה (המודדות את נפח המרכיבים).</p>
      <p>כיצד נוכל לעבוד עם כוסות מדידה, כאשר מתכון רשום בגרמים?</p>`,
    bubble: 'כמה גרמים יש<br>בכוס אחת?', bubbleAt: 'step1' },

  { /* 2 · deck 9 */ img: 'car-cups.jpg', alt: 'כוסות מדידה עם קמח וסוכר',
    body: `<p>כמות הגרמים שמכילה כוס מדידה שונה בין מרכיבים שונים.<br>
      לדוגמה, <strong>כוס קמח </strong>שוקלת <strong>פחות מכוס סוכר</strong>.</p>
      <p>ניתן להיעזר בפרופורציה (שוויון בין יחסים) בכדי להעביר כמויות<br>
      מגרמים לכוסות מדידה באופן מדויק.</p>`,
    under: `<img class="car-scales" src="assets/img/car-scales.png"
        alt="שני משקלי מטבח: כוס סוכר לבן 200 גרם, כוס קמח לבן 140 גרם">`,
    bubble: 'דיוק הוא המפתח<br>לעוגה מוצלחת!', bubbleAt: 'mouth' },

  { /* 3 · deck 10 */ img: 'car-baking.jpg', alt: 'אביבית אופה עוגה',
    body: `<p>אביבית רוצה לאפות עוגה לכבוד יום ההולדת של אמא שלה.</p>
      <p>כמויות המרכיבים במתכון מצוינות בגרמים, אבל המשקל הדיגיטלי<br>שלה התקלקל ויש לה רק כוסות מדידה.</p>
      <p>במתכון כתוב שצריך 280 גרם קמח.</p>
      <p>אביבית חיפשה באינטרנט ומצאה:</p>`,
    under: '<div class="car-chip-note"><strong>1 כוס קמח לבן = 140 גרם</strong></div>' },

  { /* 4 · deck 11 — GRADED, drag the numbers into the table */
    img: 'car-recipe.jpg', alt: 'מתכון ומרכיבים',
    body: `<p>היחס עבור קמח הוא: <strong>1 כוס קמח לבן = 140 גרם</strong></p>
      <p>לפי המתכון, צריך 280 גרם קמח.<br>נסמן: x - כמות כוסות הקמח הדרושות לאביבית.</p>
      <p>השלימו את טבלת הפרופורציה על ידי גרירה:</p>`,
    grade: { kind: 'drag', pool: ['280', '140', 'x'],
      table: () => carTable(['יחס ידוע', 'המתכון של אביבית'], ['מספר כוסות', 'כמות בגרמים'], ['1', null, null, null]),
      correct: ['x', '140', '280'],   /* slots 1,2,3 in order */
      /* deck slide 11 holds THREE tables: the canvas one plus a FILLED copy
         inside each feedback popup. Both popups were shipping without it. */
      fb: () => carTable(['יחס ידוע', 'המתכון של אביבית'], ['מספר כוסות', 'כמות בגרמים'], ['1', 'x', '140', '280']),
      ok: { t: 'נכון!', b: `${EXPL}` },
      no: { t: 'לא מדויק, הנה התשובה וההסבר:', b: `${EXPL}` } } },

  { /* 5 · deck 12 — the deck does NOT split this screen: the copy runs across
       the top and image17 sits UNDER it at (70,433) 846x329, i.e. two thirds
       of the stage width. */
    stack: true, mediaW: 846,
    img: 'car-writing.jpg', alt: 'אביבית רושמת את המתכון',
    body: `<p>כדי לשמור על דיוק, ניעזר בפרופורציה –<br>שוויון יחסים בין מספר כוסות המדידה לכמות בגרמים.</p>
      <p><strong>בכתיבת פרופורציה, יש חשיבות גדולה לסדר המילים והמספרים.</strong></p>` },

  { /* 6 · deck 13 — GRADED, multi-select: TWO equations are right */
    body: `<p>בהנתן טבלת הפרופורציה המלאה:</p>
      ${carTable(['יחס ידוע', 'המתכון של אביבית'], ['מספר כוסות', 'כמות גרמים'], ['1', 'x', '140', '280'])}
      <p><strong>קבעו - מה משוואת הפרופורציה המתאימה? בחרו בכל התשובות המתאימות.</strong></p>`,
    grade: { kind: 'multi',
      opts: [eqp(fr('x', '140'), fr('1', '280')), eqp(fr('1', '140'), fr('x', '280')),
             eqp(fr('1', '140'), fr('280', 'x')), eqp(fr('280', 'x'), fr('140', '1'))],
      correct: [1, 3],
      ok: { t: 'תשובה נכונה, כל הכבוד!', b: `<p>אם נכתוב את היחס בין כוסות (1) לגרמים (140),<br>
        אז היחס המתאים בפרופורציה ייכתב כך שמספר<br>
        הכוסות במונה וכמות הגרמים במכנה.</p>
      ${eqfig('היחס הידוע בין כוסות<br>לגרמים עבור קמח לבן',
              'מספר כוסות הקמח<br>שאביבית רוצה לחשב',
              'כמות הגרמים של<br>קמח במתכון',
              eqp(fr('1', '140'), fr('x', '280')), { lines: false, tight: true })}
      <p>אפשר גם לכתוב את היחס בין גרמים (140)<br>
        לכוסות (1), ואז היחס המתאים בפרופורציה ייכתב<br>
        באותו סדר - גרמים במונה וכוסות במכנה.</p>
      ${eqfig('היחס הידוע בין גרמים<br>לכוסות עבור קמח לבן',
              'כמות הגרמים של<br>קמח במתכון',
              'מספר כוסות הקמח<br>שאביבית רוצה לחשב',
              eqp(fr('280', 'x'), fr('140', '1')), { lines: false, tight: true, mirror: true })}
      <p><strong>ולכן יש שתי תשובות נכונות.</strong></p>` },
      no: { t: 'טעית בחלק מהסעיפים או בכולם. התשובה הנכונה מוצגת.', b: `<p>אם נכתוב את היחס בין כוסות (1) לגרמים (140),<br>
        אז היחס המתאים בפרופורציה ייכתב כך שמספר<br>
        הכוסות במונה וכמות הגרמים במכנה.</p>
      ${eqfig('היחס הידוע בין כוסות<br>לגרמים עבור קמח לבן',
              'מספר כוסות הקמח<br>שאביבית רוצה לחשב',
              'כמות הגרמים של<br>קמח במתכון',
              eqp(fr('1', '140'), fr('x', '280')), { lines: false, tight: true })}
      <p>אפשר גם לכתוב את היחס בין גרמים (140)<br>
        לכוסות (1), ואז היחס המתאים בפרופורציה ייכתב<br>
        באותו סדר - גרמים במונה וכוסות במכנה.</p>
      ${eqfig('היחס הידוע בין גרמים<br>לכוסות עבור קמח לבן',
              'כמות הגרמים של<br>קמח במתכון',
              'מספר כוסות הקמח<br>שאביבית רוצה לחשב',
              eqp(fr('280', 'x'), fr('140', '1')), { lines: false, tight: true, mirror: true })}
      <p><strong>ולכן יש שתי תשובות נכונות.</strong></p>` } } },

  { /* 7 · deck 14 — the annotated equation: three callouts with connector
       lines into the fraction, plus the companion and its bubble. */
    body: `<p><strong>נדגיש שוב:</strong></p>
      <p>אם נבחר לכתוב את היחס בין כוסות (1) לגרמים<br>
         (140), יש לכתוב כל יחס נוסף בפרופורציה כך<br>
         שהכמות בכוסות תהיה במונה והכמות בגרמים במכנה.</p>
      ${eqfig('יחס ההמרה בין כוסות<br>לגרמים עבור קמח לבן',
              'מספר כוסות הקמח<br>שאביבית רוצה לחשב',
              'כמות הגרמים של<br>קמח במתכון',
              eqp(fr('1', '140'), fr('x', '280')))}`,
    /* deck slide 14 puts the companion bottom-left (image3 at -11,459) */
    monster: 'standing', bubble: 'זה ממש חשוב, טוב<br>שחזרתם על זה!' },

  { /* 8 · deck 15 */ img: 'car-measuring.jpg', alt: 'מדידת קמח בכוס',
    /* the deck sets this line above the photo; producer asked for it as the
       companion's speech bubble rather than a body paragraph (27.09) */
    bubble: 'אם הגרמים גדלו פי 2 –<br>גם הכוסות גדלות פי 2!', bubbleAt: 'abovepic',
    body: `<p>נשים לב ש: <span dir="ltr">140 · <strong>2</strong> = 280</span></p>
      <p>כדי שיתקיים שוויון, השבר ${fr('x', '280')}<br>צריך להיות הרחבה פי 2 של השבר ${fr('1', '140')}</p>
      <!-- the deck draws the two ·2 arcs as shapes; cropped from the rendered
           deck page rather than re-drawn (producer 27.09) -->
      <img class="car-eqpic" src="assets/img/car-eq-times2.png"
           alt="1 חלקי 140 שווה x חלקי 280, שני האגפים מוכפלים ב-2">
      <p>ולכן: <span dir="ltr">x = 1 · <strong>2</strong> = 2</span></p>
      <p><strong>כלומר, אביבית צריכה 2 כוסות קמח.</strong></p>` },

  { /* 9 · deck 16 — GRADED, drag again (sugar) */
    img: 'car-sugar.jpg', alt: 'כוס סוכר',
    body: `<p>במתכון כתוב שצריך 300 גרם סוכר.</p>
      <p>אביבית חיפשה שוב באינטרנט ומצאה:</p>
      <div class="car-chip-note"><strong>1 כוס סוכר = 200 גרם</strong></div>
      <p>נסמן: y - כמות כוסות הסוכר הדרושות לאביבית.</p>
      <p>השלימו את טבלת הפרופורציה ע"י גרירת המספרים למקום הנכון:</p>`,
    grade: { kind: 'drag', pool: ['300', '200', '1'],
      table: () => carTable(['יחס ידוע', 'המתכון של אביבית'], ['מספר כוסות סוכר', 'כמות סוכר בגרמים'], [null, 'y', null, null]),
      slots: [0, 2, 3], correct: ['1', '200', '300'],
      /* deck slide 16, same as 11: the filled table lives in BOTH popups — and
         the wrong-answer title literally promises it ("הנה הטבלה הנכונה:").
         NOTE the deck names the second row 'כמות בגרמים' inside the popups but
         'כמות סוכר בגרמים' on the canvas; each is built as written. */
      fb: () => carTable(['יחס ידוע', 'המתכון של אביבית'], ['מספר כוסות סוכר', 'כמות בגרמים'], ['1', 'y', '200', '300']),
      ok: { t: 'התשובה נכונה. זה מראה על הבנה!', b: `${EXPL}` },
      no: { t: 'לא מדויק, הנה הטבלה הנכונה:', b: `${EXPL}` } } },

  { /* 10 · deck 17 — GRADED, single choice.  The slide's image3 IS the
       companion, bottom-left (it was missing from the build entirely). */
    monster: 'standing',
    body: `${carTable(['יחס ההמרה', 'המתכון של אביבית'], ['מספר כוסות סוכר', 'כמות סוכר בגרמים'], ['1', 'y', '200', '300'])}
      <p>היעזרו בטבלת הפרופורציה ובחרו במשוואת הפרופורציה המתאימה:</p>`,
    grade: { kind: 'single',
      opts: [eqp(fr('1', '200'), fr('y', '300')), eqp(fr('y', '200'), fr('1', '300')), eqp(fr('1', '200'), fr('300', 'y'))],
      correct: [0],
      ok: { t: 'נכון!', b: 'היחס נכתב באותו סדר בשני האגפים — כוסות במונה, גרמים במכנה.' },
      no: { t: 'לא מדויק, הנה ההסבר:', b: 'היחס נכתב באותו סדר בשני האגפים — כוסות במונה, גרמים במכנה.' } } },

  { /* 11 · deck 18 */ body: `${carTable(['יחס ההמרה', 'המתכון של אביבית'], ['מספר כוסות סוכר', 'כמות סוכר בגרמים'], ['1', 'y', '200', '300'])}
      <p>אם y מייצג את כמות כוסות הסוכר שמתאימה ל-300 גרם,<br>נכתוב את משוואת הפרופורציה כך:</p>
      ${eqfig('יחס ההמרה בין כוסות<br>לגרמים עבור סוכר',
              'כמות כוסות הסוכר<br>שאביבית רוצה לחשב',
              'כמות הגרמים של<br>סוכר במתכון',
              eqp(fr('1', '200'), fr('y', '300')))}` },

  { /* 12 · deck 19 — image34 runs 757px wide in the deck, not the column's 430 */
    mediaW: 700,
    img: 'car-solving.jpg', alt: 'אביבית פותרת את התרגיל במטבח', body: `<p>כדי למצוא את y (כמות כוסות הסוכר),<br>הפעם נפתור את המשוואה על ידי הכפלה במכנה המשותף:</p>
      <p class="car-center" dir="ltr">${eqp(fr('1', '200'), fr('y', '300'))} <span class="car-mul">/ · 600</span> <span class="car-denom-note" dir="rtl">המכנה<br>המשותף</span></p>
      <p class="car-solve" dir="ltr">2 · y = 1 · 3<br>2y = 3 &nbsp;/ :2<br>y = 1.5</p>
      <p><strong>כלומר, אביבית צריכה להכנת העוגה 1.5 כוסות סוכר.</strong></p>`,
    /* deck 19 draws the bubble ABOVE the photo with a downward tail */
    bubble: 'זו משוואה שקל לי<br>לפתור!', bubbleAt: 'abovepic' },
];

/* ─── runtime ───────────────────────────────────────────────────────── */
const carState = { step: 1, answered: {}, picked: {}, placed: {} };

function carRender() {
  const i = carState.step, cfg = CAR[i - 1];
  const sec = document.getElementById('s5');
  if (!sec || !cfg) return;
  const g = cfg.grade;
  const done = !!carState.answered[i];

  let interaction = '';
  if (g && g.kind === 'drag') {
    const placed = carState.placed[i] || {};
    const used = Object.values(placed);
    const held = carState.held && carState.held[i];
    interaction = `<div class="car-drag">
        ${g.table()}
        <div class="car-pool" aria-label="גררו או בחרו מספר ואז את התא בטבלה">
          ${g.pool.map(v => `<button type="button" class="car-chip${used.includes(v) ? ' is-used' : ''}${held === v ? ' is-held' : ''}"
             ${used.includes(v) || done ? 'disabled' : ''} draggable="${!done && !used.includes(v)}" data-v="${v}">${v}</button>`).join('')}
        </div>
      </div>`;
  } else if (g) {
    const picked = carState.picked[i] || [];
    interaction = `<div class="car-opts" role="${g.kind === 'multi' ? 'group' : 'radiogroup'}">
        ${g.opts.map((o, k) => `<button type="button" class="scq-opt car-opt${picked.includes(k) ? ' selected' : ''}${done && g.correct.includes(k) ? ' correct' : ''}${done && picked.includes(k) && !g.correct.includes(k) ? ' wrong' : ''}"
           data-k="${k}" ${done ? 'disabled' : ''}><span class="scq-radio${g.kind === 'multi' ? ' is-box' : ''}"></span>${o}</button>`).join('')}
      </div>`;
  }

  sec.dataset.carStep = i;          /* lets CSS address a single step */
  sec.innerHTML = `
    <h1 class="car-title">${CAR_TITLE[i]}</h1>
    <div class="car-body${cfg.stack ? ' car-body--stack' : ''}">
      <div class="car-copy">${cfg.body}${cfg.callout ? `<div class="car-callout">${cfg.callout}</div>` : ''}${cfg.under || ''}${interaction}</div>
      ${cfg.img ? `<figure class="car-media"${cfg.mediaW ? ` style="--car-media-w:${cfg.mediaW}px"` : ''}>
          <img src="assets/img/${cfg.img}" alt="${cfg.alt || ''}">
          ${cfg.bubble ? `<div class="speech-bubble ${cfg.bubbleAt === 'step1' ? 'side-bubble' : (cfg.bubbleAt === 'abovepic' ? '' : 'side-bubble--right')} car-bubble${cfg.bubbleAt ? ' car-bubble--' + cfg.bubbleAt : ''}">${cfg.bubble}</div>` : ''}
        </figure>` : (cfg.bubble && !cfg.monster
          ? `<div class="speech-bubble side-bubble--right car-bubble car-bubble--free">${cfg.bubble}</div>` : '')}
    </div>
    ${cfg.monster ? `<div class="car-char">
      ${cfg.bubble ? `<div class="speech-bubble car-bubble car-bubble--overchar">${cfg.bubble}</div>` : ''}
      <img id="car-char" alt="הדמות המלווה">
    </div>` : ''}
    <div class="car-dots" role="progressbar" aria-valuemin="1" aria-valuemax="${CAR_STEPS}" aria-valuenow="${i}" aria-label="שלב ${i} מתוך ${CAR_STEPS}">
      ${/* the dots say WHERE YOU ARE, nothing else — the done/missed states are
            gone (producer 06.10). The stepper above the practice screens is
            where progress is reported. */''}
      ${Array.from({ length: CAR_STEPS }, (_, k) => `<span class="car-dot${k + 1 === i ? ' is-on' : ''}"></span>`).join('')}
    </div>
    <div class="car-fb" id="car-fb"></div>
    <button class="btn-continue" id="car-next">${g && !done ? 'צדקתי?' : 'המשך'}</button>
    <button class="btn-back" id="car-prev">חזרה</button>`;

  if (done && g) carShowFeedback(i, carState.answered[i] === 'ok');
  carWire();
  eqfigWire(sec);
  /* tell the DEV harness which SLIDE of this screen is showing, so its arrows
     carry on from here instead of snapping to the screen's first slide */
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'DEV_SCREEN', screen: 5, step: carState.step }, '*');
  }
  if (cfg.monster && typeof setCharacter === 'function') setCharacter('car-char', cfg.monster);
  if (typeof decorateBubbles === 'function') decorateBubbles(sec);
  /* Platform layer (70-platform.js): mirror the state for resume. Guarded: runs without it. */
  if (typeof onCarChanged === 'function') {
    try { onCarChanged(); } catch (e) { console.error('[resume] onCarChanged', e); }
  }
}

function carWire() {
  const i = carState.step, cfg = CAR[i - 1], g = cfg.grade;
  /* `done` lives in carRender; referencing it here threw a ReferenceError
     inside the drop loop, which aborted the wiring and left the cells
     looking like dead input boxes. */
  const done = !!carState.answered[i];
  const sec = document.getElementById('s5');

  sec.querySelectorAll('.car-opt').forEach(b => b.onclick = () => {
    const k = +b.dataset.k;
    const cur = carState.picked[i] || [];
    carState.picked[i] = g.kind === 'multi'
      ? (cur.includes(k) ? cur.filter(x => x !== k) : cur.concat(k))
      : [k];
    carRender();
  });

  carState.held = carState.held || {};
  sec.querySelectorAll('.car-chip[draggable="true"]').forEach(c => {
    c.ondragstart = e => e.dataTransfer.setData('text/plain', c.dataset.v);
    /* click-to-pick: the same answer without a mouse drag */
    c.onclick = () => {
      carState.held[i] = carState.held[i] === c.dataset.v ? null : c.dataset.v;
      carRender();
    };
  });
  sec.querySelectorAll('.car-drop').forEach(d => {
    d.ondragover = e => { e.preventDefault(); d.classList.add('is-over'); };
    d.ondragleave = () => d.classList.remove('is-over');
    const put = (v) => {
      if (!v) return;
      const placed = Object.assign({}, carState.placed[i] || {});
      Object.keys(placed).forEach(s => { if (placed[s] === v) delete placed[s]; });
      placed[d.dataset.slot] = v;
      carState.placed[i] = placed;
      carState.held[i] = null;
      carRender();
    };
    d.ondrop = e => { e.preventDefault(); d.classList.remove('is-over'); put(e.dataTransfer.getData('text/plain')); };
    /* a focusable slot completes the click path, and keyboard users get in */
    d.tabIndex = done ? -1 : 0;
    d.onclick = () => { if (!done) carState.held[i] ? put(carState.held[i]) : takeBack(d); };
    d.onkeydown = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); d.onclick();
    };
  });
  /* A value that arrived by DRAG has to be removable by drag too — clicking it
     works, but nothing says so, so the cells read as one-way (producer 27.09).
     A filled cell is itself draggable: drag it back to the chip pool (or off
     the table) to clear it, or onto another cell to move it. */
  const pool = sec.querySelector('.car-pool');
  if (pool && !done) {
    pool.ondragover = e => { e.preventDefault(); pool.classList.add('is-over'); };
    pool.ondragleave = () => pool.classList.remove('is-over');
    pool.ondrop = e => {
      e.preventDefault(); pool.classList.remove('is-over');
      const from = e.dataTransfer.getData('application/x-slot');
      if (!from) return;
      const placed = Object.assign({}, carState.placed[i] || {});
      delete placed[from];
      carState.placed[i] = placed;
      carRender();
    };
  }
  (carState.placed[i] ? Object.entries(carState.placed[i]) : []).forEach(([slot, v]) => {
    const cell = sec.querySelector(`.car-drop[data-slot="${slot}"]`);
    if (!cell) return;
    cell.classList.add('is-filled');
    cell.textContent = v;
    if (carState.answered[i]) return;
    cell.title = 'גררו החוצה או לחצו כדי להחזיר';
    cell.draggable = true;
    cell.ondragstart = e => {
      e.dataTransfer.setData('text/plain', v);
      e.dataTransfer.setData('application/x-slot', slot);
      cell.classList.add('is-lifting');
    };
    cell.ondragend = () => cell.classList.remove('is-lifting');
  });

  function takeBack(cell) {
    const placed = Object.assign({}, carState.placed[i] || {});
    delete placed[cell.dataset.slot];
    carState.placed[i] = placed;
    carRender();
  }

  sec.querySelector('#car-next').onclick = carNext;
  sec.querySelector('#car-prev').onclick = () => {
    if (carState.step > 1) { carState.step--; carRender(); }
    else goTo(4);
  };
}

function carGradedReady(i) {
  const g = CAR[i - 1].grade;
  if (!g) return true;
  if (g.kind === 'drag') return Object.keys(carState.placed[i] || {}).length === g.pool.length;
  return (carState.picked[i] || []).length > 0;
}

function carNext() {
  const i = carState.step, g = CAR[i - 1].grade;
  if (g && !carState.answered[i]) {
    if (!carGradedReady(i)) return;
    let ok;
    if (g.kind === 'drag') {
      const p = carState.placed[i] || {};
      const slots = g.slots || [1, 2, 3];
      ok = g.correct.every((want, k) => p[String(slots[k])] === want);
    } else {
      const picked = (carState.picked[i] || []).slice().sort();
      ok = picked.length === g.correct.length && picked.every((v, k) => v === g.correct.slice().sort()[k]);
    }
    carState.answered[i] = ok ? 'ok' : 'no';
    carRender();
    /* Platform layer: the step's one answer is committed — report it (item 002) and persist. */
    if (typeof onCarAnswered === 'function') {
      try { onCarAnswered(i, ok); } catch (e) { console.error('[xAPI] onCarAnswered', e); }
    }
    return;
  }
  if (carState.step < CAR_STEPS) { carState.step++; carRender(); }
  else goTo(6);
}

function carShowFeedback(i, ok) {
  const g = CAR[i - 1].grade, box = document.getElementById('car-fb');
  if (!g || !box) return;
  const f = ok ? g.ok : g.no;
  box.className = 'car-fb ' + (ok ? 'is-correct' : 'is-wrong');
  /* explanation first, table under it (producer 27.09) */
  box.innerHTML = `<p class="car-fb-title">${f.t}</p>`
    + `<div>${f.b}</div>`
    + (g.fb ? g.fb() : '');
  /* every feedback panel in the unit is draggable — same approved helper the
     quiz feedboxes use, so the carousel behaves identically (producer) */
  if (typeof quizFeedboxDrag === 'function') quizFeedboxDrag(box);
}

function carEnter() { carRender(); }


/* the dev harness (and anything else off-page) reaches a step through this */
window.carGoToStep = function (n) {
  const k = Math.max(1, Math.min(CAR_STEPS, parseInt(n, 10) || 1));
  carState.step = k;
  carRender();
};
