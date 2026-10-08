'use strict';
/* Open class task (deck slides 52-58) — engine lifted from
   template-library/templates/ClassTaskScreen/template.js, 27.09.26.
   No key: the action opens the moment every box has something in it. */
const TASKS = {};

function taskOnInput(sid) {
  /* the rows may be static markup in index.html rather than built by
     taskRowsHTML(), so the state is created on first input */
  const st = TASKS[sid] = TASKS[sid] || { done: false };
  if (st.done) return;
  const filled = [...document.querySelectorAll('#' + sid + ' .task-input')].every(el => el.value.trim() !== '');
  const btn = document.getElementById(sid + '-check');
  if (btn) btn.disabled = !filled;
  /* deck 58 holds the companion + bubble until the learner has typed */
  const cheer = document.getElementById(sid + '-cheer');
  if (cheer) cheer.classList.toggle('is-hidden', !filled);
}

/* ── Answer keys, read off the deck (תסריט) pages 52-58 ──────────────────────
   Producer 04.10: "לאורך כל מסכי המשימה, צריך כרטיסיות משוב - תשובה נכונה /
   התשובה אינה נכונה - התשובה הנכונה מוצגת. ולהציג את התשובה הנכונה כמו
   שמופיעה בתסריט."  The task used to have no key at all — the button simply
   opened once every box held something.
   s33 has no input, and s34 measures the learner's OWN screen (deck 58: the
   diagonal they just measured), so neither has a correct answer to show and
   neither gets a card. They keep the open behaviour. */
const TASK_KEYS = {
  s28: ['10'],             /* deck 52 — 10 מ"מ בסנטימטר */
  s29: ['1', '10'],        /* deck 53 — ס"מ : מ"מ  =  1 : 10 */
  s30: ['45'],             /* deck 54 — 450 מ"מ = 45 ס"מ */
  s31: ['12.7'],           /* deck 55 — 5 אינצ'ים = 12.7 ס"מ */
  s32: ['12.7', '2.54'],   /* deck 56 — 5 אינץ'/12.7 ס"מ = 1 אינץ'/2.54 ס"מ */
};

/* same numeric tolerance the quiz engine uses, so "12.70" is not a mistake */
function taskSame(a, b) {
  if (typeof quizSameValue === 'function') return quizSameValue(a, b);
  return String(a).trim() === String(b).trim();
}

function taskFeedbox(sid) {
  const sec = document.getElementById(sid);
  let box = sec.querySelector('.quiz-feedbox');
  if (!box) {
    box = document.createElement('div');
    box.className = 'quiz-feedbox';
    sec.appendChild(box);
  }
  return box;
}

function taskShowFeedback(sid, ok) {
  const box = taskFeedbox(sid);
  box.className = 'quiz-feedbox ' + (ok ? 'is-correct' : 'is-wrong');
  box.style.transform = '';
  if (typeof quizFeedboxDrag === 'function') quizFeedboxDrag(box);
  const title = ok ? 'תשובה נכונה' : 'התשובה אינה נכונה - התשובה הנכונה מוצגת.';
  box.innerHTML = `<div class="scq-fb-title">${title}</div>`;
}

function taskCheck(sid) {
  const st = TASKS[sid] = TASKS[sid] || { done: false };
  const key = TASK_KEYS[sid];

  /* second press (or a screen with no key) — move on */
  if (!key || st.done) { st.done = true; advanceScreen(); return; }

  const inputs = [...document.querySelectorAll('#' + sid + ' .task-input')];
  const ok = inputs.map((el, i) => taskSame(el.value, key[i]));
  const allOk = ok.every(Boolean);

  /* snapshot the raw answer BEFORE the reveal overwrites it — this is the only
     point at which it still exists (720-templates → View My Answer Toggle). */
  st.userInputs = inputs.map(el => el.value);
  st.answerKey = key;
  st.slotOk = ok;

  inputs.forEach((inp, i) => {
    const good = !!ok[i];
    if (!good) inp.value = key[i];          /* "התשובה הנכונה מוצגת" */
    /* the 28.09 treatment: glyph INSIDE the box, white fill, coloured border
       (`.vi-slot` is the retired corner-badge era). */
    if (typeof quizPaintSlot === 'function') quizPaintSlot(inp, good);
    inp.disabled = true;
  });

  taskShowFeedback(sid, allOk);
  /* the reveal overwrote the learner's own values in the SAME boxes, so this
     outcome needs the toggle. Never on the correct path — nothing was hidden. */
  if (!allOk && typeof answerToggleAdd === 'function') {
    answerToggleAdd(
      document.querySelector('#' + sid + ' .quiz-feedbox'),
      () => [...document.querySelectorAll('#' + sid + ' .task-input')],
      st
    );
  }
  st.done = true;
  const btn = document.getElementById(sid + '-check');
  if (btn) { btn.textContent = 'המשך'; btn.disabled = false; }
  /* Platform layer (70-platform.js): the check is committed — persist it (resume). Guarded. */
  if (typeof onTaskChecked === 'function') {
    try { onTaskChecked(sid); } catch (e) { console.error('[resume] onTaskChecked', e); }
  }
}

/* rows: [{label, suffix}] — suffix is the unit word, which the deck puts to
   the LEFT of the box (ס"מ / מ"מ / אינץ׳). */
function taskRowsHTML(sid, rows) {
  TASKS[sid] = TASKS[sid] || { done: false };
  return `<div class="viq-rows task-rows">
    ${rows.map((r, i) => `<div class="viq-row task-row">
      ${r.label ? `<span class="viq-row-label">${r.label}</span>` : ''}
      <input id="${sid}-in-${i}" class="viq-input-box task-input" type="text"
             aria-label="${(r.label || r.suffix || '').replace(/<[^>]*>/g, '')}"
             oninput="taskOnInput('${sid}')">
      ${r.suffix ? `<span class="viq-row-label">${r.suffix}</span>` : ''}
    </div>`).join('')}
  </div>`;
}
