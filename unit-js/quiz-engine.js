/* =====================================================================
   720-core — config-driven question engine (shared; vendored per unit)
   Question types: single | multi | dual-select | value-input
   Hint policies per _question-template-defaults.md:
     'always' (default) | 'after-wrong' (hidden until first incorrect attempt)

   The unit must define BEFORE this file runs (js/questions.js):
     QUESTIONS — array of question configs (see unit questions.js for shape)
   Requires in index.html: #quiz-hint-overlay (shared hint popup, outside screens).
   ===================================================================== */

'use strict';

/* Applet (יישומון) embed — iframe + fullscreen-zoom button.
   Zoom expands the SAME iframe in place (CSS class), never a second
   instance — learner input inside the applet persists across zoom.
   Toggle handler is delegated in engine.js. */
/* `fit` = {w, h}: render the applet's iframe at THAT logical viewport and
   scale the whole thing down to the embed box. The applet file is never
   touched — some are producer-supplied and must stay byte-identical — and it
   lays out at the width its author designed for, so neither axis scrolls. */
function appletEmbed(src, title, fit) {
  const fitAttrs = fit
    ? ` data-fit style="--fit-w:${fit.w}px;--fit-h:${fit.h}px;--fit-s:${Math.min(460 / fit.w, 380 / fit.h).toFixed(4)}"`
    : '';
  return `<div class="applet-embed"${fitAttrs}>
    <button class="applet-zoom-btn" type="button" data-applet-toggle="open"
      aria-label="הגדלת היישומון למסך מלא"><svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" stroke-width="2"/><line x1="13.5" y1="13.5" x2="19" y2="19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>
    <button class="applet-zoom-btn applet-close-btn" type="button" data-applet-toggle="close"
      aria-label="סגירת מסך מלא"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><line x1="2" y1="2" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="2" x2="2" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
    <iframe src="${src}" title="${title || 'יישומון'}" loading="lazy"></iframe>
  </div>`;
}


/* Question progress stepper (סרגל שאלה) — q.step = {group, index, total}.
   07.09 — this is percent-04's approved `qprog` component (same markup, same two
   glyph SVGs, same class names). The classes are load-bearing: the CSS hides every
   svg inside a dot and re-shows exactly one by class, so a copy without
   class="qp-tick" renders a dot with no mark and a correct answer looks unanswered.
   The container keeps `qstepper` too, purely so `:has(.qstepper)` layout rules match.
   States still derive from sibling questions in the same group (a station may span
   several screens — sub-questions א/ב — and only resolves when all of them do). */
const QP_TICK = '<svg class="qp-tick" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1.5 6.2l3 3 6-6.4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const QP_X    = '<svg class="qp-x" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

/* a custom screen passes { step: {...} } straight through */
function quizStepperHTML(q) {
  let html = '';
  for (let i = 1; i <= q.step.total; i++) {
    const label = (q.step.labels && q.step.labels[i - 1]) || `שאלה ${i}`;
    html += `<div class="qprog-station" data-step="${i}">` +
              `<span class="qprog-dot">${QP_TICK}${QP_X}</span>` +
              `<span class="qprog-label">${label}</span>` +
            `</div>`;
    /* RTL: station i+1 sits to the LEFT of station i, so the connector between
       them fills once the RIGHT-hand (lower-numbered) station resolves. */
    if (i < q.step.total) html += `<span class="qprog-line" data-after="${i}"></span>`;
  }
  return `<div class="qprog qstepper" data-group="${q.step.group}" data-current="${q.step.index}" aria-hidden="true">${html}</div>`;
}

function quizStepperUpdate(screen) {
  const q = QUESTIONS.find(x => x.screen === screen);
  if (!q || !q.step) return;
  quizStepperPaint(document.querySelector(`#q${screen} .qstepper`), q.step.group, q.step.index);
}

/* 16.09 — the paint step is split out so an intro screen that sits BETWEEN two
   questions (screen 48, the gym table) can carry the same live strip instead of
   dropping it for one screen. */
function quizStepperPaint(bar, groupName, current) {
  const group = QUESTIONS.filter(x => x.step && x.step.group === groupName);
  if (!bar) return;
  const resolved = {};
  bar.querySelectorAll('.qprog-station').forEach(el => {
    const i = Number(el.dataset.step);
    // a step may span several screens (sub-questions א/ב) — aggregate them:
    // done only when all parts are done, correct only when all parts correct
    const sibs = group.filter(x => x.step.index === i);
    const sts = sibs.map(x => quizState[x.screen]).filter(Boolean);
    /* `sibs` empty would make this vacuously true and tick a station that has
       no question behind it — green before the learner has answered anything. */
    const allDone = sibs.length > 0 && sts.length === sibs.length && sts.every(st => st.done);
    const allCorrect = allDone && sts.every(st => st.wasCorrect);
    resolved[i] = allDone;
    el.classList.toggle('is-current', i === current);
    el.classList.toggle('is-correct', allDone && allCorrect);
    el.classList.toggle('is-wrong', allDone && !allCorrect);
  });
  bar.querySelectorAll('.qprog-line').forEach(ln => {
    ln.classList.toggle('is-done', !!resolved[Number(ln.dataset.after)]);
  });
}

/* In the client's multi-component structure each component sets
   window.PART_CONFIG = {start,end}. A builder must skip any screen outside it,
   or every component ships the whole unit. Absent PART_CONFIG, nothing changes.
   (from percent-08; 2.1 had the same test written inline.) */
function inPart(n) {
  const p = window.PART_CONFIG;
  return !p || (n >= p.start && n <= p.end);
}

/* Per-question runtime state, keyed by screen number — survives navigation */
const quizState = {};

function quizBuildScreens() {
  const app = document.getElementById('app');
  const backRef = document.getElementById('quiz-hint-overlay'); // insert screens before overlay
  QUESTIONS.forEach(q => {
    /* one shared questions.js for the whole unit: a component builds only the
       screens inside its own range (window.PART_CONFIG, set in script.js) */
    if (!inPart(q.screen)) return;
    quizState[q.screen] = { attempts: 0, done: false, hintUsed: false, selected: null, selectedSet: [] };
    const sec = document.createElement('section');
    sec.className = 'screen quiz-screen';
    sec.dataset.screen = q.screen;
    sec.id = `q${q.screen}`;
    sec.innerHTML = `
      ${q.step && !q.step.hideBar ? quizStepperHTML(q) : (q.label ? `<div class="scq-progress">${q.label}</div>` : '')}
      <div class="quiz-cols">
        <div class="quiz-main${q.afterInteraction ? ' quiz-main--scroll' : ''}" data-reveal="1">
          <div class="quiz-stem">${q.stem}</div>
          ${q.popup && !q.popup.inBubble ? `<button class="popup-trigger" type="button"
            onclick="document.getElementById('q${q.screen}-note-popup').classList.remove('hidden')">${q.popup.trigger}</button>` : ''}
          ${quizInteractionHTML(q)}
          ${q.afterInteraction ? `<div class="quiz-after">${q.afterInteraction}</div>` : ''}
        </div>
        ${q.content ? `<div class="quiz-content"${q.content.includes('data-persist') ? '' : ` data-reveal="2"${q.content.includes('applet-embed') ? ' data-reveal-fade' : ''}`}>${q.content}</div>` : ''}
      </div>
      ${q.popup ? `<div class="note-popup m-popup hidden" id="q${q.screen}-note-popup" role="dialog" aria-modal="true" aria-label="${q.popup.title}">
        <div class="note-popup-panel">
          <button class="popup-x" type="button" aria-label="סגירה"
            onclick="document.getElementById('q${q.screen}-note-popup').classList.add('hidden')"></button>
          <h3>${q.popup.title}</h3>
          <div class="note-popup-body">${q.popup.body}</div>
          <button class="hint-close-btn" type="button"
            onclick="document.getElementById('q${q.screen}-note-popup').classList.add('hidden')">חזרה</button>
        </div>
      </div>` : ''}
      <div class="quiz-feedbox" id="q${q.screen}-feedbox"></div>
      <div class="scq-bar">
        <button class="quiz-check" id="q${q.screen}-check" disabled onclick="quizCheck(${q.screen})">צדקתי?</button>
        <button class="quiz-hint" id="q${q.screen}-hint" onclick="quizOpenHint(${q.screen})"
          ${q.hintPolicy === 'after-wrong' ? 'style="visibility:hidden"' : ''}><svg class="quiz-hint-icon" viewBox="0 0 25.9999 22.2883" fill="none" aria-hidden="true"><path d="M17.7925 2.76345C16.3676 1.37911 14.5057 0.68776 12.5488 0.815545C9.07995 1.04163 6.27286 3.9168 6.01796 7.50134C5.85646 9.77363 6.7035 11.9443 8.34374 13.4548C9.23036 14.2723 9.74016 15.465 9.74016 16.7265H11.2284H14.7733H16.2615C16.2615 15.4847 16.7919 14.2707 17.7181 13.3959C19.17 12.0263 20.0012 10.0751 20.0012 8.04361C20.0012 6.01215 19.1953 4.12486 17.7909 2.76018L17.7925 2.76345ZM13.0001 5.54524C11.6701 5.54524 10.5856 6.66582 10.5856 8.04525C10.5856 8.46956 10.2515 8.81524 9.84149 8.81524C9.43143 8.81524 9.09736 8.46956 9.09736 8.04525C9.09736 5.8172 10.8484 4.00527 13.0001 4.00527C13.4133 4.00527 13.7473 4.35094 13.7473 4.77525C13.7473 5.19957 13.4133 5.54524 13.0001 5.54524Z" fill="currentColor"/><path d="M9.73858 19.6245C9.73858 20.3289 9.99823 20.9908 10.478 21.4904L10.4938 21.5068C10.9783 22.0098 11.6242 22.2883 12.3114 22.2883H13.6888C14.3775 22.2883 15.025 22.0114 15.5111 21.5052C15.9956 21.0039 16.2631 20.3355 16.2631 19.6277V17.9895H9.73858V19.6245ZM11.2268 19.5294H14.7717V19.6277C14.7717 19.9243 14.6609 20.2077 14.4566 20.419C14.254 20.6254 13.9753 20.7483 13.6888 20.7483H12.3114C12.028 20.7483 11.7588 20.6336 11.5561 20.4305L11.5451 20.4174C11.3424 20.211 11.2268 19.9226 11.2268 19.6261V19.5311V19.5294Z" fill="currentColor"/><path d="M25.2558 7.27531H22.607C22.1954 7.27531 21.8629 7.62099 21.8629 8.0453C21.8629 8.46961 22.197 8.81529 22.607 8.81529H25.2558C25.6674 8.81529 25.9999 8.46961 25.9999 8.0453C25.9999 7.62099 25.6658 7.27531 25.2558 7.27531Z" fill="currentColor"/><path d="M4.1386 8.0453C4.1386 7.61935 3.80453 7.27531 3.39447 7.27531H0.744124C0.332481 7.27531 0 7.62099 0 8.0453C0 8.46961 0.334064 8.81529 0.744124 8.81529H3.39289C3.80453 8.81529 4.13701 8.46961 4.13701 8.0453H4.1386Z" fill="currentColor"/><path d="M20.8702 3.11398C21.0175 3.11398 21.1663 3.06811 21.2961 2.97472L23.4667 1.40198C23.804 1.15788 23.8847 0.677863 23.6488 0.328911C23.4129 -0.0200418 22.949 -0.105232 22.6118 0.140509L20.4412 1.71325C20.1039 1.95736 20.0232 2.43737 20.2591 2.78632C20.4032 3.00094 20.6343 3.11562 20.8702 3.11562V3.11398Z" fill="currentColor"/><path d="M4.70372 13.1172L2.53309 14.69C2.19586 14.9341 2.11512 15.4141 2.35102 15.763C2.49509 15.9777 2.72625 16.0923 2.96215 16.0923C3.10939 16.0923 3.25822 16.0465 3.38804 15.9531L5.55867 14.3803C5.8959 14.1362 5.97665 13.6562 5.74074 13.3073C5.50484 12.9583 5.04095 12.8731 4.70372 13.1189V13.1172Z" fill="currentColor"/><path d="M23.4668 14.6884L21.2961 13.1157C20.9589 12.8716 20.495 12.9567 20.2591 13.3041C20.0232 13.653 20.1055 14.133 20.4412 14.3771L22.6118 15.9499C22.7416 16.0449 22.8904 16.0891 23.0377 16.0891C23.272 16.0891 23.5032 15.9744 23.6488 15.7598C23.8847 15.4109 23.8024 14.9309 23.4668 14.6868V14.6884Z" fill="currentColor"/><path d="M5.55869 1.71322L3.38806 0.140478C3.05083 -0.103625 2.58694 -0.0184349 2.35104 0.328879C2.11513 0.677832 2.19746 1.15785 2.53311 1.40195L4.70374 2.97469C4.83356 3.06971 4.98239 3.11395 5.12963 3.11395C5.36395 3.11395 5.5951 2.99927 5.74076 2.78465C5.97666 2.4357 5.89434 1.95569 5.55869 1.71158V1.71322Z" fill="currentColor"/></svg>אפשר רמז?</button>
        <button class="quiz-back" onclick="goTo(${q.screen - 1})">חזרה</button>
      </div>`;
    app.insertBefore(sec, backRef);
  });
}

function quizInteractionHTML(q) {
  if (q.type === 'single' || q.type === 'multi') {
    const role = q.type === 'multi' ? 'checkbox' : 'radio';
    return `<div class="scq-answers" role="${q.type === 'multi' ? 'group' : 'radiogroup'}" aria-label="אפשרויות תשובה">
      ${q.options.map(o => `
        <div class="scq-opt ${q.type === 'multi' ? 'is-multi' : ''}" role="${role}" aria-checked="false" tabindex="0"
             data-id="${o.id}" onclick="quizSelect(${q.screen}, this)"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quizSelect(${q.screen}, this);}">
          <span class="scq-radio ${q.type === 'multi' ? 'is-box' : ''}"></span>
          <span class="scq-opt-text">${o.html}</span>
        </div>`).join('')}
    </div>`;
  }
  if (q.type === 'dropdown') {
    // sentence: array of text parts; blanks: [{pool, correct}] — blank i renders between parts[i] and parts[i+1]
    let html = '<div class="dd-sentence">';
    q.sentence.forEach((part, i) => {
      html += part;
      if (i < q.blanks.length) {
        const opts = q.blanks[i].pool.map(v => `<option value="${v}">${v}</option>`).join('');
        html += `<select class="dd-select" data-slot="${i}" onchange="quizDropdownChange(${q.screen})">
          <option value="">בחרו</option>${opts}</select>`;
      }
    });
    return html + '</div>';
  }
  if (q.type === 'statement') {
    /* 16.09 — rebuilt to 720---UI-Templates node 4763:34499
       (TrueFalseQuestion-ShortSentences) and the answer states at 3527:24086.
       Each statement is its own block: a subject-coloured letter to the RIGHT
       of the sentence, and the נכון / לא נכון pair BELOW it (they used to sit
       beside the sentence on the same row). Each pill carries a 22px radio
       that fills when picked and becomes the ✓/✗ once marked. */
    const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];
    const pill = (i, val, label) =>
      `<button type="button" class="stmt-pill" data-val="${val}" onclick="quizStatementPick(${q.screen}, ${i}, this)">` +
      `<span class="stmt-radio" aria-hidden="true"></span><span class="stmt-pill-label">${label}</span></button>`;
    return `<div class="stmt-list">` + q.statements.map((s, i) => `
      <div class="stmt-row" data-row="${i}">
        <div class="stmt-head">
          <span class="stmt-letter" aria-hidden="true">${LETTERS[i] || i + 1}.</span>
          <span class="stmt-text">${s.text}</span>
        </div>
        <div class="stmt-pills">
          ${pill(i, 'true', 'נכון')}
          ${pill(i, 'false', 'לא נכון')}
        </div>
      </div>`).join('') + `</div>`;
  }
  if (q.type === 'dual-select') {
    const opts = q.pool.map(y => `<option value="${y}">${y}</option>`).join('');
    return `<div class="dual-select-sentence">
      ${q.sentence.before}
      <select class="year-select" data-slot="0" onchange="quizDualChange(${q.screen})"><option value="">בחרו שנה</option>${opts}</select>
      ${q.sentence.middle}
      <select class="year-select" data-slot="1" onchange="quizDualChange(${q.screen})"><option value="">בחרו שנה</option>${opts}</select>
      ${q.sentence.after}
    </div>`;
  }
  if (q.type === 'value-input') {
    let slot = 0;
    const input = (label) => `<input type="text" inputmode="numeric" class="vi-input" data-slot="${slot++}" aria-label="${label || ''}" oninput="quizInputChange(${q.screen})">`;
    if (q.ratioRows) {
      // rows of "label — [input] : [input]" (e.g. reduced-ratio answers)
      return `<div class="ratio-rows">` + q.ratioRows.map(row => {
        /* row.frac: the deck writes the answer as a fraction (numerator box over
           a bar over a denominator box) rather than "[input] : [input]". Slot
           order stays top-then-bottom, so correctInputs is indexed the same. */
        if (row.frac) {
          return `<div class="ratio-row ratio-row--frac"><span class="ratio-row-label">${row.label}</span>` +
            `<span class="fraction vi-frac"><span class="frac-top">${input(row.label + ' — מונה')}</span>` +
            `<span class="frac-bottom">${input(row.label + ' — מכנה')}</span></span></div>`;
        }
        const cells = Array.from({ length: row.parts || 2 }, () => input(row.label || ''));
        /* row.suffix: a unit word that belongs to the LEFT of the box, which is
           where the deck puts ש"ח / ס"מ. Without this the row printed the
           literal string "undefined" in place of an absent label. */
        const label = row.label ? `<span class="ratio-row-label">${row.label}</span>` : '';
        const suffix = row.suffix ? `<span class="ratio-row-suffix">${row.suffix}</span>` : '';
        /* 30.09 — the box and its unit are ONE group. As separate siblings the
           unit wrapped away from the box and off the column (dslide 41: the
           ס"מ landed outside .quiz-main entirely). Now a long label wraps and
           the answer stays whole on its own line. */
        /* 06.10 — a label that is an EQUATION PREFIX ("x =") is maths, not
           Hebrew: the deck draws it LEFT of the box on every one of these
           rows (slides 31, 42, 44), and in an rtl row it came out as
           "[box] = x". The row flips to ltr and stays pinned to the column's
           right edge; a Hebrew label row is untouched. */
        const eqLabel = /[=:]\s*$/.test(String(row.label || '')) && !/[\u0590-\u05FF]/.test(String(row.label || ''));
        return `<div class="ratio-row${eqLabel ? ' ratio-row--eq' : ''}">${label}<span class="ratio-row-answer"><span class="ratio-row-cells" dir="ltr">${cells.join('<span class="vi-colon">:</span>')}</span>${suffix}</span></div>`;
      }).join('') + `</div>`;
    }
    // equation of two fractions; each cell is a fixed string or {input:true,label}
    const cell = (c) => (c && typeof c === 'object' && c.input) ? input(c.label) : c;
    const frac = (side) => `<span class="fraction vi-frac"><span class="frac-top">${cell(side.top)}</span><span class="frac-bottom">${cell(side.bottom)}</span></span>`;
    return `<div class="vi-equation" dir="ltr">${frac(q.equation.left)}<span class="vi-eq">=</span>${frac(q.equation.right)}</div>`;
  }
  return '';
}

/* ---------- selection handlers ---------- */
function quizSelect(screen, el) {
  const st = quizState[screen];
  const q = QUESTIONS.find(x => x.screen === screen);
  if (st.done) return;
  const opts = document.querySelectorAll(`#q${screen} .scq-opt`);
  // A new selection after a wrong attempt clears the wrong marks
  opts.forEach(o => o.classList.remove('wrong'));
  quizHideFeedback(screen);

  if (q.type === 'multi') {
    el.classList.toggle('selected');
    el.setAttribute('aria-checked', el.classList.contains('selected'));
    st.selectedSet = [...opts].filter(o => o.classList.contains('selected')).map(o => o.dataset.id);
    document.getElementById(`q${screen}-check`).disabled = st.selectedSet.length === 0;
  } else {
    opts.forEach(o => { o.classList.remove('selected'); o.setAttribute('aria-checked', 'false'); });
    el.classList.add('selected');
    el.setAttribute('aria-checked', 'true');
    st.selected = el.dataset.id;
    document.getElementById(`q${screen}-check`).disabled = false;
  }
}

function quizDualChange(screen) {
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const sels = [...document.querySelectorAll(`#q${screen} .year-select`)];
  sels.forEach(s => s.classList.remove('wrong'));
  st.selectedSet = sels.map(s => s.value);
  document.getElementById(`q${screen}-check`).disabled = st.selectedSet.some(v => !v);
}

function quizInputChange(screen) {
  document.querySelectorAll(`#q${screen} .vi-input`).forEach(i => {
    const clean = i.value.replace(/[^0-9.,]/g, '');
    if (clean !== i.value) i.value = clean;
  });
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const inputs = [...document.querySelectorAll(`#q${screen} .vi-input`)];
  inputs.forEach(i => i.classList.remove('wrong'));
  st.selectedSet = inputs.map(i => i.value.trim());
  document.getElementById(`q${screen}-check`).disabled = st.selectedSet.some(v => !v);
}

/* 16.09, producer (screen 49): the longest option ran under the chevron, and
   the box changed width once the ✓/✗ arrived. The select is measured against
   its widest option ON SCREEN ENTRY (a hidden select measures 0) and pinned to
   a px width that already carries both paddings, so nothing shifts later. */
function quizFitSelects(screen) {
  const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
  if (!sels.length || !sels[0].offsetWidth) return;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;top:-9999px;left:-9999px';
  document.body.appendChild(probe);
  sels.forEach(sel => {
    if (sel.dataset.fitted) return;
    const cs = getComputedStyle(sel);
    probe.style.font = cs.font;
    let widest = 0;
    [...sel.options].forEach(o => {
      probe.textContent = o.textContent;
      widest = Math.max(widest, probe.getBoundingClientRect().width);
    });
    const chrome = parseFloat(cs.paddingInlineStart) + parseFloat(cs.paddingInlineEnd) +
      parseFloat(cs.borderInlineStartWidth) + parseFloat(cs.borderInlineEndWidth);
    sel.style.width = Math.ceil(widest + chrome + 4) + 'px';
    sel.dataset.fitted = '1';
  });
  probe.remove();
}

function quizDropdownChange(screen) {
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
  sels.forEach(s => s.classList.remove('wrong', 'correct'));
  st.selectedSet = sels.map(s => s.value);
  document.getElementById(`q${screen}-check`).disabled = st.selectedSet.some(v => !v);
}

function quizStatementPick(screen, row, el) {
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const rowEl = el.closest('.stmt-row');
  rowEl.classList.remove('wrong');
  rowEl.querySelectorAll('.stmt-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  st.selectedSet = [...document.querySelectorAll(`#q${screen} .stmt-row`)].map(r =>
    r.querySelector('.stmt-pill.selected')?.dataset.val || '');
  document.getElementById(`q${screen}-check`).disabled = st.selectedSet.some(v => !v);
}

/* ---------- check / feedback ---------- */
function quizIsCorrect(q, st) {
  if (q.type === 'single') return st.selected === q.correct;
  if (q.type === 'multi') {
    return q.correctSet.length === st.selectedSet.length &&
      q.correctSet.every(id => st.selectedSet.includes(id));
  }
  if (q.type === 'dual-select') {
    const pair = [...st.selectedSet].sort();
    return JSON.stringify(pair) === JSON.stringify([...q.correctPair].sort()) &&
      st.selectedSet[0] !== st.selectedSet[1];
  }
  if (q.type === 'dropdown') {
    return st.selectedSet.every((v, i) => v === q.blanks[i].correct);
  }
  if (q.type === 'statement') {
    return st.selectedSet.every((v, i) => v === String(q.statements[i].correct));
  }
  if (q.type === 'value-input') {
    /* 30.09 — compare NUMERICALLY, not as strings. A learner who types 9.0,
       09, 20.00 or a thousands comma was being marked wrong for a right
       answer. Anything that is not a clean number on both sides still falls
       back to a trimmed string compare. */
    const same = quizSameValue;
    const matches = (arr) => st.selectedSet.length === arr.length && st.selectedSet.every((v, i) => same(v, arr[i]));
    return matches(q.correctInputs) || (q.altInputs || []).some(matches);
  }
  return false;
}

/* ── One value comparison for the WHOLE engine ───────────────────────────────
   `quizIsCorrect` judged a field numerically ("450.0" == "450") while the two
   markers judged it with `===`, so a correctly-answered field could be told it
   was wrong. Both now call this. */
function quizNumValue(v) {
  const t = String(v).trim().replace(/,/g, '');
  return /^-?\d*\.?\d+$/.test(t) ? parseFloat(t) : null;
}
function quizSameValue(a, b) {
  const x = quizNumValue(a), y = quizNumValue(b);
  if (x !== null && y !== null) return Math.abs(x - y) < 1e-9;
  return String(a).trim() === String(b).trim();
}

/* Per-FIELD verdicts for a value-input question, against whichever accepted
   set the learner matched best. Used by the retry marker AND the reveal
   marker, so a field cannot be a ✓ in one and an ✗ in the other. */
/* ONE painter for a field's verdict. `mark-ok|mark-bad` and `correct|wrong`
   are two parallel pairs, and `.vi-input.mark-bad` sits AFTER `.mark-ok` in
   the cascade — so a stale `mark-bad` left by an earlier attempt outranks a
   freshly-added `mark-ok` and paints a now-correct answer red. Clearing only
   `wrong`/`correct` (as quizMarkOutcome did) is not enough: every call site
   must set all four, which is why they all go through here. */
function quizPaintSlot(inp, ok) {
  inp.classList.toggle('correct', ok);
  inp.classList.toggle('mark-ok', ok);
  inp.classList.toggle('wrong', !ok);
  inp.classList.toggle('mark-bad', !ok);
  const slot = inp.parentNode;
  if (slot && slot.classList && slot.classList.contains('vi-slot')) {
    slot.dataset.mark = ok ? 'ok' : 'bad';
  }
}

function quizSlotVerdicts(q, st) {
  const altSets = [q.correctInputs, ...(q.altInputs || [])];
  const score = arr => arr.filter((v, i) => quizSameValue(st.selectedSet[i] || '', v)).length;
  const best = altSets.find(arr => arr.every((v, i) => quizSameValue(st.selectedSet[i] || '', v))) ||
    altSets.reduce((a, b) => (score(b) > score(a) ? b : a), q.correctInputs);
  return { best, slotOk: best.map((v, i) => quizSameValue(st.selectedSet[i] || '', v)) };
}

function quizCheck(screen) {
  const st = quizState[screen];
  const q = QUESTIONS.find(x => x.screen === screen);
  if (st.done) { goTo(screen + 1); return; }

  st.attempts += 1;
  const correct = quizIsCorrect(q, st);

  st.wasCorrect = correct;
  if (correct) {
    const hintBtn = document.getElementById(`q${screen}-hint`);
    if (hintBtn) hintBtn.style.display = 'none';
    quizMarkOutcome(screen, q, true);
    quizShowFeedback(screen, 'correct', q.fb.correct);
    quizFinish(screen);
  } else if (st.attempts >= q.maxAttempts) {
    const hintBtn = document.getElementById(`q${screen}-hint`);
    if (hintBtn) hintBtn.style.display = 'none';
    quizMarkOutcome(screen, q, false);
    const fb = { ...q.fb.wrong };
    /* a multi-field question that is PARTLY right swaps the title for the
       shared "כמעט!" line — unless the question pins its own wrong title
       with `fb.partial: null` (06.10, producer, dslide 56). */
    if (q.type === 'value-input' && st.slotOk && st.slotOk.some(Boolean)) {
      const partial = 'partial' in q.fb ? q.fb.partial : 'כמעט! חלק מהתשובות נכונות';
      if (partial) fb.title = partial;
    }
    quizShowFeedback(screen, 'wrong', fb);
    if (q.type === 'value-input') quizAnswerToggleAdd(screen, q);
    quizFinish(screen);
  } else {
    quizMarkRetry(screen, q);
    quizShowFeedback(screen, 'wrong', { title: q.fb.retry, body: '' });
    if (q.hintPolicy === 'after-wrong') {
      document.getElementById(`q${screen}-hint`).style.visibility = 'visible';
    }
    document.getElementById(`q${screen}-check`).disabled = true; // until a new selection
  }
}

function quizMarkRetry(screen, q) {
  if (q.type === 'single' || q.type === 'multi') {
    document.querySelectorAll(`#q${screen} .scq-opt.selected`).forEach(o => {
      o.classList.remove('selected');
      o.classList.add('wrong');
      o.setAttribute('aria-checked', 'false');
    });
    quizState[screen].selected = null;
    quizState[screen].selectedSet = [];
  } else if (q.type === 'dual-select') {
    document.querySelectorAll(`#q${screen} .year-select`).forEach(s => s.classList.add('wrong'));
  } else if (q.type === 'value-input') {
    /* producer 04.10 (screen 53): "if one input is wrong it marks them both as
       wrong — if the answer is right on check then mark it right". Same rule the
       dropdown branch below already follows. */
    const st = quizState[screen];
    const { slotOk } = quizSlotVerdicts(q, st);
    [...document.querySelectorAll(`#q${screen} .vi-input`)].forEach((inp, i) => {
      quizPaintSlot(inp, !!slotOk[i]);
    });
  } else if (q.type === 'dropdown') {
    /* producer 16.09: "make sure that right answers has V" — a slot the learner
       already got right is marked ✓ on the retry instead of staying blank. */
    const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
    sels.forEach((s, i) => {
      if (s.value !== q.blanks[i].correct) { s.classList.add('wrong'); s.classList.remove('correct'); }
      else { s.classList.add('correct'); s.classList.remove('wrong'); }
    });
  } else if (q.type === 'statement') {
    [...document.querySelectorAll(`#q${screen} .stmt-row`)].forEach((r, i) => {
      const pick = r.querySelector('.stmt-pill.selected');
      if (pick && pick.dataset.val !== String(q.statements[i].correct)) r.classList.add('wrong');
    });
  }
}

function quizMarkOutcome(screen, q, isCorrect) {
  if (q.type === 'single' || q.type === 'multi') {
    const correctIds = q.type === 'multi' ? q.correctSet : [q.correct];
    document.querySelectorAll(`#q${screen} .scq-opt`).forEach(o => {
      const inCorrect = correctIds.includes(o.dataset.id);
      const wasChosen = o.classList.contains('selected');
      o.classList.remove('selected');
      if (inCorrect) o.classList.add('correct');
      else if (wasChosen && !isCorrect) o.classList.add('wrong');
    });
  } else if (q.type === 'dual-select') {
    const sels = [...document.querySelectorAll(`#q${screen} .year-select`)];
    if (!isCorrect) sels.forEach((s, i) => { s.value = q.correctPair[i]; });
    sels.forEach(s => { s.classList.remove('wrong'); s.classList.add('correct'); s.disabled = true; });
  } else if (q.type === 'value-input') {
    const inputs = [...document.querySelectorAll(`#q${screen} .vi-input`)];
    const st = quizState[screen];
    // per-field verdict (partial answers get per-input V/X, notes 50/63)
    const { best, slotOk } = quizSlotVerdicts(q, st);
    st.userInputs = inputs.map(i => i.value);
    st.answerKey = best;
    st.slotOk = slotOk;
    inputs.forEach((inp, i) => {
      quizPaintSlot(inp, !!st.slotOk[i]);
      inp.disabled = true;
      /* QA 15.09 (screen 34): painting the V/X as the input's own background
         needs padding-left, which pushes the digit off-centre inside the box.
         The mark moves onto a wrapper as a corner badge instead, so the answer
         stays centred exactly as the deck draws it. */
      let slot = inp.parentNode;
      if (!slot || !slot.classList.contains('vi-slot')) {
        slot = document.createElement('span');
        slot.className = 'vi-slot';
        inp.parentNode.insertBefore(slot, inp);
        slot.appendChild(inp);
      }
      slot.dataset.mark = st.slotOk[i] ? 'ok' : 'bad';
    });
  } else if (q.type === 'dropdown') {
    const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
    sels.forEach((s, i) => {
      const ok = s.value === q.blanks[i].correct;
      if (!isCorrect && !ok) s.classList.add('wrong'); else s.classList.remove('wrong');
      if (!ok) s.value = q.blanks[i].correct;
      if (ok || isCorrect) s.classList.add('correct');
      s.disabled = true;
    });
  } else if (q.type === 'statement') {
    [...document.querySelectorAll(`#q${screen} .stmt-row`)].forEach((r, i) => {
      const correctVal = String(q.statements[i].correct);
      r.querySelectorAll('.stmt-pill').forEach(p => {
        p.disabled = true;
        const picked = p.classList.contains('selected');
        if (p.dataset.val === correctVal) p.classList.add('correct');
        else if (picked && !isCorrect) p.classList.add('wrong');
      });
    });
  }
}

/* magnifier zoom for content images (note 67, גורף) */
function quizImageZoomInit(scope) {
  /* `.teach-experiment img` added 15.09.26: screen 3's second applet ships as
     a static PNG and sat outside the sweep, so it had no magnifier.
     `data-no-zoom` is the opt-out, as in the other units. */
  /* 17.09.26 — the size gate used to read `img.width`, which is 0 until the file
     has DECODED. This init runs once, 50ms after DOMContentLoaded: on our own
     machines the images are cached and already decoded, on the client's server
     they are not, so screens 24/31/32 shipped with no magnifier at all. On 24
     the unwrapped <img> also overflowed its row (the width cap lives on
     .img-zoom-wrap), which is the horizontal scroll the client saw and we did
     not. Decide on the DECODED size, and when an image has not decoded yet,
     wait for it instead of silently skipping it. */
  /* `.ct-ruler` added 04.10: the class-task ruler (screens 28-32) sat outside
     the sweep, so the producer's "add zoom to image" on 28 is really the whole
     task run — the same picture appears on all five. */
  (scope || document).querySelectorAll('.quiz-content img, .explain-content img, .teach-experiment img, .ct-ruler').forEach(img => {
    if (img.closest('.img-zoom-wrap') || img.closest('.character-widget')
        || img.hasAttribute('data-no-zoom')) return;
    if (!img.complete || !img.naturalWidth) {
      if (!img.dataset.zoomPending) {
        img.dataset.zoomPending = '1';
        const again = () => { delete img.dataset.zoomPending; quizImageZoomInit(img.parentNode); };
        img.addEventListener('load', again, { once: true });
        img.addEventListener('error', () => { delete img.dataset.zoomPending; }, { once: true });
      }
      return;
    }
    if (img.naturalWidth < 120) return;
    const wrap = document.createElement('span');
    wrap.className = 'img-zoom-wrap';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'applet-zoom-btn img-zoom-btn';
    btn.setAttribute('aria-label', 'הגדלת התמונה');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7.5 10.5h6M10.5 7.5v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    btn.onclick = () => quizImageZoomOpen(img.src, img.alt);
    wrap.appendChild(btn);
  });
}
/* 16.09, producer (screen 54): a TABLE can be magnified too. Opt in per table
   with `data-zoom` — this is not applied to every table in the unit. The
   overlay is the same one images use; the table is cloned into it and scaled,
   so the live one keeps whatever state it has. */
function quizTableZoomInit(scope) {
  /* 06.10, producer (dslides 46-50): any block can opt in with `data-zoom`,
     not only a table — the camp bulletin board is the first. A non-table
     block gets the button INSIDE its top-left corner (the table variant
     reserves a strip above, so the chip never sits on a column heading). */
  (scope || document).querySelectorAll('[data-zoom]').forEach(tbl => {
    if (tbl.parentNode.classList && tbl.parentNode.classList.contains('table-zoom-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-zoom-wrap' + (tbl.tagName === 'TABLE' ? '' : ' table-zoom-wrap--inset');
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(tbl);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'applet-zoom-btn img-zoom-btn';
    btn.setAttribute('aria-label', tbl.dataset.zoomLabel || 'הגדלת הטבלה');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7.5 10.5h6M10.5 7.5v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    btn.onclick = () => quizNodeZoomOpen(tbl);
    wrap.appendChild(btn);
  });
}

function quizNodeZoomOpen(node) {
  const ov = quizZoomOverlay();
  const box = ov.querySelector('.zoom-node');
  box.innerHTML = '';
  box.appendChild(node.cloneNode(true));
  box.hidden = false;
  ov.querySelector('img').hidden = true;
  ov.style.display = 'grid';
}

function quizZoomOverlay() {
  let ov = document.getElementById('img-zoom-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'img-zoom-overlay';
    /* 17.09.26, producer (screen 31): this close button was the ONE close in the
       unit that carried `applet-close-btn` ALONE. That class only sets
       display/padding — the approved chip (Figma Zoom/Close 1589:17043 /
       1589:17081: 44px circle, white fill, 2px subject stroke, hover inverts)
       lives on `applet-zoom-btn`. So the image-zoom overlay rendered a bare
       black X floating over the report flag instead of the approved control.
       It is now byte-identical to appletEmbed()'s close, chip and glyph. */
    ov.innerHTML = '<button type="button" class="applet-zoom-btn applet-close-btn" aria-label="סגירה" onclick="quizImageZoomClose()">' +
      '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><line x1="2" y1="2" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="2" x2="2" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>' +
      '<img alt=""><div class="zoom-node" hidden></div>';
    document.getElementById('app').appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) quizImageZoomClose(); });
  }
  return ov;
}

function quizImageZoomOpen(src, alt) {
  const ov = quizZoomOverlay();
  ov.querySelector('.zoom-node').hidden = true;
  const img = ov.querySelector('img');
  img.hidden = false;
  img.src = src;
  img.alt = alt || '';
  ov.style.display = 'grid';
}
function quizImageZoomClose() {
  const ov = document.getElementById('img-zoom-overlay');
  if (ov) ov.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => setTimeout(() => { quizImageZoomInit(); quizTableZoomInit(); }, 50));
/* safety net for a cold server: run the sweep again once every image has landed */
window.addEventListener('load', () => { quizImageZoomInit(); quizTableZoomInit(); });

/* show-correct-answer / my-answer toggle inside the feedback box (note 63) */
/* ── View My Answer Toggle — ONE implementation, shared ──────────────────────
   720-templates → _global-components.md → "View My Answer Toggle". Required
   wherever the reveal overwrites the same element that held the learner's
   answer (value-input questions AND the class task). Canonical labels, not
   paraphrased; pure view switch — never touches attempts, done, scoring or
   reporting. Only the final-wrong outcome ever gets it. */
const ANSWER_TOGGLE_LABELS = { toAnswer: 'מעבר לתשובה שלי', toSolution: 'התשובה הנכונה' };

function answerToggleAdd(box, getInputs, st) {
  if (!box || !st || !st.answerKey) return;
  const paint = (inp, i, showMine) => {
    inp.value = showMine ? (st.userInputs[i] || '') : st.answerKey[i];
    quizPaintSlot(inp, !showMine || !!st.slotOk[i]);
  };
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fb-answer-toggle popup-action';
  btn.dataset.mode = 'solution';
  btn.textContent = ANSWER_TOGGLE_LABELS.toAnswer;
  btn.onclick = () => {
    const showMine = btn.dataset.mode === 'solution';
    getInputs().forEach((inp, i) => paint(inp, i, showMine));
    btn.dataset.mode = showMine ? 'answer' : 'solution';
    btn.textContent = showMine ? ANSWER_TOGGLE_LABELS.toSolution : ANSWER_TOGGLE_LABELS.toAnswer;
  };
  box.appendChild(btn);
  /* opens on the solution view (template default) */
  getInputs().forEach((inp, i) => paint(inp, i, false));
}

function quizAnswerToggleAdd(screen, q) {
  answerToggleAdd(
    document.getElementById(`q${screen}-feedbox`),
    () => [...document.querySelectorAll(`#q${screen} .vi-input`)],
    quizState[screen]
  );
}

/* feedback boxes are draggable so they never hide the question (notes 38/58) */
function quizFeedboxDrag(box) {
  if (box.dataset.dragWired) return;
  box.dataset.dragWired = '1';
  let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
  box.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, input, select')) return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    const t = (box.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/) || [0, 0, 0]);
    ox = parseFloat(t[1]) || 0; oy = parseFloat(t[2]) || 0;
    box.setPointerCapture(e.pointerId);
    box.style.cursor = 'grabbing';
  });
  box.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    /* #app is CSS-scaled to the viewport, so a raw client delta over-travels:
       the panel drifted away from the pointer at every size but 1:1. Convert
       the screen delta back into stage pixels. */
    const app = document.getElementById('app');
    const scale = app ? (app.getBoundingClientRect().width / 1280) || 1 : 1;
    box.style.transform = `translate(${ox + (e.clientX - sx) / scale}px, ${oy + (e.clientY - sy) / scale}px)`;
  });
  const stop = () => { dragging = false; box.style.cursor = ''; };
  box.addEventListener('pointerup', stop);
  box.addEventListener('pointercancel', stop);
}

function quizFinish(screen) {
  const st = quizState[screen];
  st.done = true;
  quizStepperUpdate(screen);
  document.querySelectorAll(`#q${screen} .scq-opt`).forEach(o => o.classList.add('locked'));
  const check = document.getElementById(`q${screen}-check`);
  check.textContent = 'שנמשיך?';
  check.disabled = false;
  const hint = document.getElementById(`q${screen}-hint`);
  hint.disabled = true;
}

/* ---------- the scroll-affordance sprite ----------
   Same component and same drift the scroll SCREENS use (producer 14.09.26,
   carried over from percent-04). The frame is 300x300 with the cursor tip at
   (148,149); the sparks fan out from there. */
const QUIZ_SPARK_DIRS = [
  [0, -80], [56.57, -56.57], [80, 0], [56.57, 56.57],
  [0, 80], [-56.57, 56.57], [-80, 0], [-56.57, -56.57],
];

function quizMakeClickHint(id) {
  const el = document.createElement('div');
  el.className = 'click-hint';
  el.id = id;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="click-hint__ripple1"><img src="../unit-assets/img/hint/ripple-ring-1.svg" alt=""></div>' +
    '<div class="click-hint__ripple2"><img src="../unit-assets/img/hint/ripple-ring-2.svg" alt=""></div>' +
    QUIZ_SPARK_DIRS.map(([dx, dy], i) =>
      `<div class="click-hint__spark" style="--dx:${dx}px; --dy:${dy}px; --d:${i * 3}ms"><img src="../unit-assets/img/hint/spark.svg" alt=""></div>`
    ).join('') +
    '<div class="click-hint__cursor"><img src="../unit-assets/img/hint/cursor.svg" alt=""></div>';
  return el;
}

/* A feedback body that actually overflows gets the drifting hint over its
   scrollbar, so the learner knows there is more below the fold. It only
   appears when `.fb-body` really is taller than its 360px cap, and it leaves
   on the first scroll.

   It is appended to the FEEDBOX, never to `.fb-body`: the body is the
   scroller, so a child hanging at a negative left would give it a horizontal
   scrollbar (percent-04 learned this the hard way). The feedbox is already
   `position: absolute`, so it is the positioning context, and the hint drags
   along with the panel for free.

   setTimeout, not requestAnimationFrame — rAF does not fire when the
   compositor is idle (headless capture, a backgrounded tab) and the hint would
   simply never appear. */
function quizFeedbackScrollHint(box) {
  const old = box.querySelector('.click-hint');
  if (old) old.remove();
  setTimeout(() => {
    const body = box.querySelector('.fb-body');
    if (!body || body.scrollHeight <= body.clientHeight + 8) return;
    const app = document.getElementById('app');
    const scale = app ? app.getBoundingClientRect().width / 1280 : 1;
    const br = body.getBoundingClientRect(), xr = box.getBoundingClientRect();
    const hint = quizMakeClickHint(`q${box.id.replace(/\D/g, '')}-hint-scroll`);
    hint.classList.add('click-hint--in-popup');
    /* the bar is on the body's RIGHT edge (06.10 — the scroller is ltr so the
       bar is always on the right). 148/149 is the cursor's own offset inside
       the frame, so subtracting it puts the TIP on the bar. */
    hint.style.left = Math.round((br.right - xr.left) / scale - 4 - 148) + 'px';
    hint.style.top  = Math.round((br.top - xr.top) / scale + 34 - 149) + 'px';
    box.appendChild(hint);
    body.addEventListener('scroll', () => hint.remove(), { once: true });
  });
}

function quizShowFeedback(screen, kind, fb) {
  const box = document.getElementById(`q${screen}-feedbox`);
  box.className = `quiz-feedbox ${kind === 'correct' ? 'is-correct' : 'is-wrong'}`;
  box.style.transform = '';
  quizFeedboxDrag(box);
  box.innerHTML = `
    <div class="scq-fb-title">${fb.title}</div>${fb.body ? `<div class="fb-body">${fb.body}</div>` : ''}`;
  quizFeedbackScrollHint(box);
}

function quizHideFeedback(screen) {
  const box = document.getElementById(`q${screen}-feedbox`);
  box.className = 'quiz-feedbox';
  box.innerHTML = '';
}

/* ---------- hint (shared overlay, populated per question) ---------- */
function quizOpenHint(screen) {
  const st = quizState[screen];
  const q = QUESTIONS.find(x => x.screen === screen);
  /* 07.09, producer: the hint is re-openable as often as the learner wants.
     It used to lock after the first close (hintUsed), which made the button a
     one-shot. The button is already removed outright once a question is
     answered (quizFinish / the two branches in quizCheck), so `done` is the
     only state that still closes it off. */
  if (st.done) return;
  const overlay = document.getElementById('quiz-hint-overlay');
  overlay.dataset.forScreen = screen;
  /* .hint-title-text, not .hint-title: the title element now holds the bulb
     icon as its first child, and assigning textContent to the PARENT would
     delete it on the first open. */
  /* producer 15.09.26: no standing title on the hint card. 04.10 — that
     blanked EVERY title, and 17 hints keep their first sentence in the title
     field ('מצאו תחילה כמה שורות…', 'היעזרו ביישומון', 'חשבו:'). Only the
     standing label is dropped; any other title opens the body as its first line. */
  overlay.querySelector('.hint-title-text').textContent = '';
  const t = (q.hint.title || '').trim();
  const lead = /^שימו לב[!:.]?$/.test(t) ? '' : (t ? t + '<br>' : '');
  overlay.querySelector('.hint-body').innerHTML = lead + q.hint.body;
  overlay.classList.remove('hidden');
}

function quizCloseHint() {
  const overlay = document.getElementById('quiz-hint-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;
  const screen = Number(overlay.dataset.forScreen);
  overlay.classList.add('hidden');
  if (quizState[screen]) {
    quizState[screen].hintUsed = true;   /* recorded for reporting, no longer a lock */
  }
}

/* resetScreenState hook — completed questions stay locked (resume-state) */
function quizResetScreenState(screen) {
  quizStepperUpdate(screen);
  quizFitSelects(screen);
  quizTableZoomInit(document.getElementById(`q${screen}`) || undefined);
  const st = quizState[screen];
  if (!st || st.done) return;
  // in-progress state is left as-is on return navigation
}
