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

function taskCheck(sid) {
  const st = TASKS[sid] = TASKS[sid] || { done: false };
  st.done = true;
  advanceScreen();
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
