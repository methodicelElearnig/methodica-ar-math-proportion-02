'use strict';

/* ═══════════════════════════════════════════════════════════
   methodica-math-proportion-02 — part 01 — js/main.js
   Canvas: 1280 × 710 px (720 reference engine)

   Everything above the "SCREEN LOGIC" divider is the shared engine and
   should not need editing beyond TOTAL_SCREENS. Per-screen code goes
   below it, in screen order.
   ═══════════════════════════════════════════════════════════ */

/* ─── Constants ─────────────────────────────────────────── */
const TOTAL_SCREENS = 12;   // S0-S11 — S10/S11 (slides 31-32) not yet built
/* Which part this page is. Consumed twice: the DEV bar's part selector,
   which has to follow the lomda when it crosses a boundary on its own, and
   PartNav's trail. One constant so the two can never disagree. */
const PART_ID = '01';

const CANVAS_W = 1280, CANVAS_H = 710, BOTTOM_BAR_H = 74;

/* Screens gated on their question being answered. This part's questions all
   live INSIDE the carousel (S5) rather than owning a screen each, so the
   list is empty and S5's own gate is in advanceScreen(). Slides 31-32 add
   S10 and S11 here when they are built. */
const QUESTION_SCREENS = [10, 11];

/* The two warm-up questions slide 30 announces share one strip:
   "מקטע זה מלווה בסרגל שאלה, שאלה N מתוך 2" on both slides 31 and 32. */
const PRACTICE_QUESTION_OF = { 10: 1, 11: 2 };
const PRACTICE_COUNT = 2;

/* The carousel's four graded steps, keyed by their engine id. Kept as one
   map so carGate(), carRender() and the resume path cannot drift from the
   set of questions actually registered with Q.define(). */
const CAR_QUESTION_OF = { 4: 51, 6: 52, 9: 53, 10: 54 };
const CAR_STEPS = 12;

/* Mapped-but-unbuilt screens. Claiming the indices now means everything
   after them is built at its FINAL number, so landing the missing screens
   later is an insert and not a renumber of the whole part. goTo() refuses
   these and reports the nearest built screen, and the DEV bar renders them
   as ⛔ טרם נבנה — a visible hole rather than a screen that silently is not
   there. Blockers are listed in CLAUDE.md → open questions. */
const RESERVED_SCREENS = {
  /* 06.09 — screen 6 (slides 20-21, the whiteboard video) is no longer
     reserved: the producer asked for the Video screen to stand with a
     placeholder where the player goes, rather than being skipped. The clip
     itself is still owed. */
};

/* Namespaced per lomda — an LMS may host several lomdot on one origin,
   so a bare key like 'selectedCharacter' would collide across them.
   (720-templates → _global-components.md → Companion character system) */
const CHARACTER_STORAGE_KEY = 'methodica_math_proportion_02_selectedCharacter';

/* Which asset each companion character uses. One map, so a screen never
   builds an asset path by string-concatenating the choice. */
const CHARACTER_ASSET = {
  green:  'assets/img/character-green.png',
  yellow: 'assets/img/character-yellow.png',
};

/* The animated companion, one clip per character — the selection card's own
   files, reused wherever a slot plays rather than shows (S7). */
/* Companion CLIPS, grouped by SET. A screen names its set with data-clip on
   the slot; applyCharacter() then picks the file for the learner's colour,
   the same contract the stills use. Three sets so far — the selection card
   (S0), the two friends on S7, and the idle pair on S9 (the producer sent a
   reader for yellow and a spinner for green; they are one set, not two). */
const CHARACTER_CLIP = {
  selection: {
    green:  'assets/video/character-green-selection.mp4',
    yellow: 'assets/video/character-yellow-selection.mp4',
  },
  duo: {
    green:  'assets/video/character-green-duo.mp4',
    yellow: 'assets/video/character-yellow-duo.mp4',
  },
  solo: {
    green:  'assets/video/character-green-spinning.mp4',
    yellow: 'assets/video/character-yellow-reading.mp4',
  },
};

/* Poses the producer supplied in BOTH colours. A slot names one with
   data-pose and applyCharacter() picks the file for the learner's choice —
   which is why such a slot may keep --fixed (that class carries the SIZING
   contract) and still swap. A pose delivered in one colour only stays
   --fixed with no data-pose. The squashed pair arrived 03.09.2026. */
const CHARACTER_POSE = {
  squashed: {
    green:  'assets/img/character-squashed-green.png',
    yellow: 'assets/img/character-squashed-yellow.png',
  },
};

/* ─── Global lomda state ────────────────────────────────────
   Single source of truth that persists across every screen for the
   whole session. */
window.lomdaState = window.lomdaState || {
  selectedCharacter: null
};

/* ─── State ─────────────────────────────────────────────── */
let currentScreen = 0;

/* ─── Feedback icons — Type 1, bare 16px vector, no circle.
   720-design-guidelines → components-icons-states.md
   (Figma nodes 1027-26019 / 1027-26020). ─────────────────── */
const CHECK_SVG =
  '<svg width="16" height="16" viewBox="0 0 14 12" fill="none" aria-hidden="true">' +
  '<path d="M4.52036 12C4.12296 12.0002 3.74183 11.8126 3.46106 11.4787L0.258452 7.67744C-0.0861507 7.26814 -0.0861507 6.60467 0.258452 6.19536C0.603165 5.78619 1.16194 5.78619 1.50666 6.19536L4.52036 9.77374L12.4933 0.306878C12.8381 -0.102293 13.3968 -0.102293 13.7415 0.306878C14.0862 0.716179 14.0862 1.37966 13.7415 1.78896L5.57966 11.4787C5.29889 11.8126 4.91776 12.0002 4.52036 12Z" fill="#609E12"/>' +
  '</svg>';
const WRONG_SVG =
  '<svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
  '<path d="M13.6743 0.325691C13.4657 0.117151 13.1828 0 12.8879 0C12.5929 0 12.31 0.117151 12.1014 0.325691L7 5.42709L1.8986 0.325691C1.69 0.117151 1.40711 0 1.11215 0C0.817183 0 0.534294 0.117151 0.325691 0.325691C0.117151 0.534294 0 0.817183 0 1.11215C0 1.40711 0.117151 1.69 0.325691 1.8986L5.42709 7L0.325691 12.1014C0.117151 12.31 0 12.5929 0 12.8879C0 13.1828 0.117151 13.4657 0.325691 13.6743C0.534294 13.8829 0.817183 14 1.11215 14C1.40711 14 1.69 13.8829 1.8986 13.6743L7 8.57291L12.1014 13.6743C12.31 13.8829 12.5929 14 12.8879 14C13.1828 14 13.4657 13.8829 13.6743 13.6743C13.8829 13.4657 14 13.1828 14 12.8879C14 12.5929 13.8829 12.31 13.6743 12.1014L8.57291 7L13.6743 1.8986C13.8829 1.69 14 1.40711 14 1.11215C14 0.817183 13.8829 0.534294 13.6743 0.325691Z" fill="#B20010"/>' +
  '</svg>';

/* Small inline-equation helpers. The spec pipeline now recovers an
   OfficeMath equation's STRUCTURE — slide 15 reaches spec/ as
   "(1)/(140)=(x)/(280)" rather than v1's flat "140 1 280 x" — so these build
   the same fraction as real markup rather than reconstructing it by eye
   against the PDF. */
function frac(num, den) {
  return '<span class="eq-frac"><span class="eq-num">' + num +
         '</span><span class="eq-den">' + den + '</span></span>';
}
function eq(sym) { return '<span class="eq-eq">' + (sym || '=') + '</span>'; }
function eqRow(inner) { return '<span class="eq-frac-row">' + inner + '</span>'; }
/* A formula on a line of its OWN. The deck centres every standalone
   equation (slides 26, 28); eqRow alone is inline and leaves it hanging
   on the right edge as if it were part of the sentence above. */
function eqBlock(inner) { return '<div class="gp-eq">' + eqRow(inner) + '</div>'; }

/* ─── Nav-button labels ──────────────────────────────────────
   Set a nav-style button's label through the .nav-label wrapper, never
   with a raw textContent assignment — that destroys the wrapper the
   hover width-reservation mechanism depends on, and the button starts
   reflowing on hover. Rebuilds the wrapper each call, so it's correct
   whether the button already has one (markup-authored) or not.
   (720-design-guidelines → typography.md → "Hover must not reflow") */
function setNavLabel(btn, label) {
  if (!btn) return;
  btn.innerHTML = '';
  const wrap = document.createElement('span');
  wrap.className = 'nav-label';
  wrap.dataset.label = label;
  const inner = document.createElement('span');
  inner.textContent = label;
  wrap.appendChild(inner);
  btn.appendChild(wrap);
}

/* ─── Scale App — 1280×710 design grid, scale-to-fit + extend the
   canvas to fill the viewport (no letterboxing) so chrome anchored to
   canvas edges (flag button, bottom bar) reaches the actual screen
   edges on any aspect ratio.
   - scale  = min(viewportW/1280, viewportH/710)  → no distortion
   - canvas = viewport / scale  → in design coords, fills viewport

   Anything measured in JS against the canvas (drag clamps, popup
   positioning) must read the LIVE canvas size, not these constants.

   NOTE ON DECK GEOMETRY: 2-2.pptx is authored at 1280×720 while the
   canvas is 1280×710, so a y taken from spec/ is up to 10px low at the
   very bottom of a slide. Content sits well above that band and the
   bottom bar is positioned by its own shared rule, not from deck y.
   ─────────────────────────────────────────────────────────── */
function scaleApp() {
  const app = document.getElementById('app');
  const scale   = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
  const canvasW = window.innerWidth  / scale;
  const canvasH = window.innerHeight / scale;
  app.style.width     = canvasW + 'px';
  app.style.height    = canvasH + 'px';
  app.style.transform = 'scale(' + scale + ')';
  app.style.left      = '0px';
  app.style.top       = '0px';
}
window.addEventListener('resize', scaleApp);
scaleApp();
/* Boot runs at the BOTTOM of this file — see the block after the screen
   code. resetScreenState(0) reads per-screen `let`s declared further down,
   so calling it here would hit them in the temporal dead zone and throw
   ("Cannot access 'carStep' before initialization"), aborting the rest of
   main.js and leaving the page half-initialised. */

/* ─── Navigation ────────────────────────────────────────── */
function goTo(n) {
  if (n < 0 || n >= TOTAL_SCREENS) return;

  // A reserved index has no section to activate. Land on the nearest built
  // screen instead of a blank canvas, and say so — silence here is how a
  // gap ships unnoticed.
  if (Object.prototype.hasOwnProperty.call(RESERVED_SCREENS, String(n))) {
    console.warn('[nav] screen ' + n + ' is reserved, not built: ' + RESERVED_SCREENS[n]);
    const dir = n > currentScreen ? 1 : -1;
    let probe = n;
    while (probe >= 0 && probe < TOTAL_SCREENS &&
           Object.prototype.hasOwnProperty.call(RESERVED_SCREENS, String(probe))) {
      probe += dir;
    }
    if (probe < 0 || probe >= TOTAL_SCREENS) { devReportScreen(); return; }
    n = probe;
  }

  // Feedback popups / hint overlays live outside .screen divs — close them
  // all on every navigation so none carries over to the next screen.
  document.querySelectorAll('[id$="-popup"], [id$="-hint-overlay"]')
    .forEach(el => el.classList.add('hidden'));

  const prev = document.querySelector('.screen.active');
  if (prev) { Motion.cancel(prev); prev.classList.remove('active'); }
  currentScreen = n;
  const next = document.getElementById('s' + n);
  if (next) { next.classList.add('active'); Motion.reveal(next); }
  resetScreenState(n);
  // Keep the DEV bar in sync when the learner moves via buttons/keyboard,
  // not only via the bar itself.
  devReportScreen();
}

/* Tells the DEV harness which screen the lomda is ACTUALLY on. Called on
   every goTo() exit — including the ones that refuse to move — so a jump
   to an out-of-range index shows the bar snapping back to where the
   learner really landed, rather than a number that never rendered.
   No-op outside the harness. */
function devReportScreen() {
  if (window.parent === window) return;
  const d = (typeof devSteps === 'function') ? devSteps(currentScreen)
                                             : { steps: 1, step: 1 };
  window.parent.postMessage({ type: 'DEV_SCREEN', screen: currentScreen,
                              step: d.step, steps: d.steps }, '*');
}

/* Restore a screen's UI to the state it should be in on (re-)entry.
   CRITICAL for question screens: once answered, a screen must NOT get a
   new attempt on return. Guard the initial-state reset with the screen's
   own `sNDone` flag — see 720-templates → _question-template-defaults.md
   → "Resume state". */
function resetScreenState(n) {
  if (n === 0) {
    // Shows the Back button only when the trail is non-empty — an empty trail
    // means the part was opened directly and there is genuinely nowhere back.
    PartNav.mountBack('s0-back');
    s0ResetInitial();
  }
  // Every screen that shows the companion character re-reads the choice, so
  // a learner who changes it on S0 sees the change everywhere on the way back.
  applyCharacter(n);
  /* A multi-step screen re-opens at STEP 1. 720-templates → Carousel.md:
     "Returning to the screen resets to step 1 unless the brief says
      otherwise; the seen-all-steps flag persists so Continue stays ungated."
     Without this the step is whatever the last visit left it at, so a
     reviewer coming back to S5 after reaching its end landed on step 12 and
     read it as the first eleven slides having been skipped. What the learner
     already ANSWERED is untouched — that lives in the question engine, which
     Q.restore() re-applies below. */
  if (n === 5) { carStep = 1; carRender(); }
  if (n === 8) { s8Step = 1; s8Render(); }
  Q.restore(n);
  renderPracticeStrip(n);
  // Every registered question restores itself: the two-flag resume rule
  // lives in the engine, not in a copy per screen.
  Object.keys(CAR_QUESTION_OF).forEach(function (step) {
    if (n === 5) Q.restore(CAR_QUESTION_OF[step]);
  });
}

/* The next screen the learner can actually reach. A reserved index is not
   built, so it must not count as "there is more of this part left" —
   otherwise Continue walks into the hole, goTo() refuses it, and the learner
   is stuck on the last built screen with no way across the part boundary.
   Returns -1 when this part has nothing left. */
function nextBuiltScreen() {
  for (let n = currentScreen + 1; n < TOTAL_SCREENS; n++) {
    if (!Object.prototype.hasOwnProperty.call(RESERVED_SCREENS, String(n))) return n;
  }
  return -1;
}

function advanceScreen() {
  // Re-crossing a boundary the learner already passed: skip the gates rather
  // than re-judging them on a fresh page's empty state.
  const returnForward = PartNav.forwardOverride();
  const next = nextBuiltScreen();
  if (returnForward && next === -1) {
    PartNav.forward(returnForward);
    return;
  }
  /* S0 is a choice, not a graded question, but Continue still waits for one —
     and for one made in THIS visit. restoreCharacter() now brings a previous
     session's choice back into lomdaState so every later screen renders it,
     which would otherwise let a returning learner walk straight past the
     picker. The producer's rule is that the screen always opens with nothing
     selected (720-templates → TwoOptionSelection), so the gate tracks the
     click, not the stored value. */
  if (currentScreen === 0 && !s0Picked) return;

  /* The carousel and the guided practice are multi-step SCREENS: forward
     means "next step" until the last one. The question engine calls this
     same function when a resolved question's pill is clicked (it defers to
     window.advanceScreen), so a graded step advances through here too. */
  if (currentScreen === 5 && carStep < CAR_STEPS) {
    if (!carGate()) return;
    carGo(carStep + 1);
    return;
  }
  if (currentScreen === 8 && s8Step < S8_STEPS.length) {
    if (!s8Gate()) return;
    s8Go(s8Step + 1);
    return;
  }
  if (currentScreen === 5 && !carGate()) return;

  if (Q.isAnswered(currentScreen) === false && QUESTION_SCREENS.indexOf(currentScreen) !== -1) return;
  // Crossing forward out of this part — including when the remaining
  // indices are all reserved, which still means this part is finished.
  if (next === -1) { PartNav.forward('02'); return; }
  goTo(next);
}

function goBack() {
  // Inside a multi-step screen, back means the previous STEP.
  if (currentScreen === 5 && carStep > 1) { carGo(carStep - 1); return; }
  if (currentScreen === 8 && s8Step > 1)  { s8Go(s8Step - 1);  return; }
  // S0 has no previous screen in this part, so back means crossing to the part
  // the learner actually arrived from — which is recorded in the trail, not
  // derived from the part number. No-op on an empty trail.
  if (currentScreen === 0) { PartNav.back(); return; }
  goTo(currentScreen - 1);
}

/* ─── Keyboard navigation (RTL: ← forward, → back) ────────
   Suppressed inside editable controls, or typing in an input would
   navigate away mid-answer. */
function hasOwnArrowKeyMeaning(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  if (el.getAttribute && el.getAttribute('role') === 'slider') return true;
  return false;
}
document.addEventListener('keydown', e => {
  if (hasOwnArrowKeyMeaning(e.target)) return;
  if (e.key === 'ArrowLeft')  advanceScreen();
  if (e.key === 'ArrowRight') goBack();
});
/* ─── Dev mode: postMessage bridge ───────────────────────────
   index_dev.html loads this page in an iframe. postMessage is required
   because file:// blocks direct cross-frame access.

   Beyond DEV_GOTO this part needs DEV_STEP: two of its ten screens are
   multi-step (the 12-step carousel and the 7-step guided practice), and a
   harness that can only reach SCREENS shows a reviewer 1 of 12 steps and
   calls it a screen review. */
window.addEventListener('message', (e) => {
  if (!e.data) return;
  if (e.data.type === 'DEV_GOTO') {
    const n = parseInt(e.data.screen, 10);
    if (!isNaN(n)) goTo(n);
    return;
  }
  if (e.data.type === 'DEV_STEP') {
    const k = parseInt(e.data.step, 10);
    if (isNaN(k)) return;
    if (currentScreen === 5) carGo(k);
    if (currentScreen === 8) s8Go(k);
    devReportScreen();
  }
});

/* How many steps the screen the learner is on has, and which one is showing.
   1/1 for an ordinary screen, so the harness needs no special case. */
function devSteps(n) {
  if (n === 5) return { steps: CAR_STEPS,        step: carStep };
  if (n === 8) return { steps: S8_STEPS.length,  step: s8Step  };
  return { steps: 1, step: 1 };
}



/* ═══════════════════════════════════════════════════════════
   REPORT MODAL — "מצאתם בעיה?"
   Vendored from methodica-math-central-tendency-03-01 (originally
   examples/methodica-math-ratio-01 → template-library/ReportModal,
   approved 09.08). Sends to the shared Google Form.

   The .flag-btn ships with the scaffold but has no modal and no handler
   behind it — clicking it does nothing. This is the missing half.

   Unit / component IDs are inlined until metadata files exist (then
   switch to window.METADATA, like the reference project does).
   ═══════════════════════════════════════════════════════════ */
function shortId(u){ return String(u || '').split('/').pop(); }

var REPORT_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSfFq5XFtH1pPpLgV5RWT4m3NanYPW5GKremqTvkp6zKjEGqcw/formResponse';

/* screen -> [subContent suffix, page-in-item]; null = no matching subContent.
   No subContent metadata authored for this unit yet, so the report carries
   the raw screen index as the page reference. */
var SCREEN_TO_SUBCONTENT = {};

function openReportModal() {
  document.getElementById('report-modal').removeAttribute('hidden');
  setTimeout(function() { var el = document.getElementById('report-type'); if (el) el.focus(); }, 40);
}
function tryCloseReportModal() {
  var typeVal = document.getElementById('report-type').value;
  var textVal = document.getElementById('report-text').value.trim();
  if (typeVal || textVal) {
    document.getElementById('report-modal').setAttribute('hidden', '');
    document.getElementById('report-confirm-modal').removeAttribute('hidden');
  } else { forceCloseReportModal(); }
}
function forceCloseReportModal() {
  document.getElementById('report-modal').setAttribute('hidden', '');
  document.getElementById('report-confirm-modal').setAttribute('hidden', '');
  resetReportForm();
}
function backToReportForm() {
  document.getElementById('report-confirm-modal').setAttribute('hidden', '');
  document.getElementById('report-modal').removeAttribute('hidden');
  setTimeout(function() { var el = document.getElementById('report-type'); if (el) el.focus(); }, 40);
}

function submitReport() {
  var typeSel = document.getElementById('report-type');
  var textVal = document.getElementById('report-text').value.trim();
  var errEl   = document.getElementById('report-error');
  if (!typeSel.value || !textVal) {
    if (errEl) errEl.removeAttribute('hidden');
    (typeSel.value ? document.getElementById('report-text') : typeSel).focus();
    return;
  }
  if (errEl) errEl.setAttribute('hidden', '');
  var now  = new Date();
  var meta = window.METADATA || {
    learningUnitId: 'methodica-math-proportion-02',
    id: 'methodica-math-proportion-02-01',
  };
  var body = new URLSearchParams();
  body.append('entry.301404029_year',  now.getFullYear());
  body.append('entry.301404029_month', now.getMonth() + 1);
  body.append('entry.301404029_day',   now.getDate());
  body.append('entry.2066097581_hour',   now.getHours());
  body.append('entry.2066097581_minute', now.getMinutes());
  body.append('entry.1933069481', shortId(meta.learningUnitId));
  body.append('entry.2070680092', shortId(meta.id));
  var mapEntry = SCREEN_TO_SUBCONTENT[currentScreen];
  var itemId   = mapEntry ? (shortId(meta.id)) + '-' + mapEntry[0] : '';
  var itemPage = mapEntry ? String(mapEntry[1]) : String(currentScreen);
  body.append('entry.1555704258', itemId);
  body.append('entry.1671046914', itemPage);
  body.append('entry.1179822443', typeSel.options[typeSel.selectedIndex].text);
  body.append('entry.806447525',  textVal);
  fetch(REPORT_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: body })
    .catch(function(e) { console.error('[Report] send failed', e); });
  console.log('[Report Issue] sent');
  showReportThanks();
}
function showReportThanks() {
  document.querySelectorAll('#report-modal .report-field, #report-modal .report-actions, #report-modal .report-modal-body')
    .forEach(function(el) { el.setAttribute('hidden', ''); });
  var t = document.getElementById('report-thanks');
  if (t) t.removeAttribute('hidden');
}
function resetReportForm() {
  document.getElementById('report-type').value = '';
  document.getElementById('report-text').value = '';
  document.getElementById('report-char-count').textContent = '0 / 250';
  var errEl = document.getElementById('report-error');
  if (errEl) errEl.setAttribute('hidden', '');
  var t = document.getElementById('report-thanks');
  if (t) t.setAttribute('hidden', '');
  document.querySelectorAll('#report-modal .report-field, #report-modal .report-actions, #report-modal .report-modal-body')
    .forEach(function(el) { el.removeAttribute('hidden'); });
}
/* Wire the flag button + char counter + Esc-to-close */
(function wireReport() {
  var flagBtn = document.querySelector('.flag-btn');
  if (flagBtn) flagBtn.addEventListener('click', openReportModal);
  var reportTextarea = document.getElementById('report-text');
  var reportCounter  = document.getElementById('report-char-count');
  if (reportTextarea && reportCounter) {
    reportTextarea.addEventListener('input', function() {
      reportCounter.textContent = reportTextarea.value.length + ' / 250';
    });
  }
  document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return;
    var confirmModal = document.getElementById('report-confirm-modal');
    var reportModal  = document.getElementById('report-modal');
    if (confirmModal && !confirmModal.hasAttribute('hidden')) { forceCloseReportModal(); return; }
    if (reportModal && !reportModal.hasAttribute('hidden'))  { tryCloseReportModal();   return; }
  });
})();


/* ═══════════════════════════════════════════════════════════
   SCREEN LOGIC — one clearly-headed block per screen, in order.
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   COMPANION CHARACTER — chosen on S0, used by every later screen.
   720-templates → _global-components.md → Companion character system.
   ═══════════════════════════════════════════════════════════ */

/* Every character <img> in the unit carries no per-screen asset of its own:
   this rewrites their src from the current choice, so adding a character to
   a screen is markup only. The deck draws the GREEN character on every
   slide, which is the producer showing one of the two options, not a
   decision — the learner's pick wins. */
/* ─── The companion choice, restored ────────────────────────
   01/S0 WRITES the choice to localStorage and, until now, nothing ever read
   it back: lomdaState.selectedCharacter stayed null in every part, so
   applyCharacter() fell through to green on every screen. A learner who
   picked yellow saw the yellow character on the selection card and the green
   one for the rest of the lomda. */
function restoreCharacter() {
  try {
    const v = localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (v && CHARACTER_ASSET[v]) window.lomdaState.selectedCharacter = v;
  } catch (e) {}
}

function applyCharacter(n) {
  const choice = window.lomdaState.selectedCharacter || 'green';
  const screen = document.getElementById('s' + n);
  if (!screen) return;
  /* S0's own two cards are the CHOICE, not the companion — leave them alone.
     --fixed carries TWO meanings: size this slot itself, and do not swap its
     artwork. A slot that names a POSE opts back into swapping while keeping
     the sizing. Only a pose delivered in one colour stays --fixed alone. */
  screen.querySelectorAll('.hct-character:not(.hct-character--fixed) img, .ts-character img, [data-pose] img')
    .forEach(function (img) {
      const slot = img.closest('[data-pose]');
      const set  = (slot && CHARACTER_POSE[slot.dataset.pose]) || CHARACTER_ASSET;
      img.src = set[choice] || set.green;
    });
  /* A slot may hold a CLIP instead of a still (S7, S9). Same contract, same
     choice — only the file extension differs, so the map lives beside the
     stills rather than in the markup. data-clip names which SET to draw from;
     without one the slot falls back to the selection pair. Re-assigning the
     same src would restart the clip on every screen entry, so it is only
     written when it changes. */
  screen.querySelectorAll('.ts-character video, .hct-character video')
    .forEach(function (vid) {
      const slot = vid.closest('[data-clip]');
      const set  = (slot && CHARACTER_CLIP[slot.dataset.clip]) || CHARACTER_CLIP.selection;
      const want = set[choice] || set.green;
      if (vid.getAttribute('src') === want) return;
      vid.setAttribute('src', want);
      vid.load();
      const play = vid.play();
      if (play && play.catch) play.catch(function () {});
    });
}

/* ═══════════════════════════════════════════════════════════
   S0 — TwoOptionSelection: pick a companion  (spec slide 3)

   Write-only to localStorage, per the template: the screen must always
   open with NOTHING selected, even on reload, so a learner returning to
   it is making the choice again rather than confirming a stale one.
   ═══════════════════════════════════════════════════════════ */
function selectCharacter(cardEl) {
  document.querySelectorAll('#s0 .option-card').forEach(function (c) {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  cardEl.classList.add('selected');
  cardEl.setAttribute('aria-checked', 'true');
  window.lomdaState.selectedCharacter = cardEl.dataset.value;
  s0Picked = true;
  try { localStorage.setItem(CHARACTER_STORAGE_KEY, cardEl.dataset.value); } catch (e) {}
  const cont = document.getElementById('s0-continue');
  if (cont) cont.disabled = false;
}

/* Whether the learner has picked on THIS visit to S0. See advanceScreen(). */
let s0Picked = false;

function s0ResetInitial() {
  s0Picked = false;
  document.querySelectorAll('#s0 .option-card').forEach(function (c) {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  const cont = document.getElementById('s0-continue');
  if (cont) cont.disabled = true;
  /* The SESSION choice is deliberately NOT cleared: later screens keep
     showing the character the learner picked while they are back here
     deciding. It is replaced only when they pick again. */
}

/* Keyboard parity for the cards — they are role="radio", so Space/Enter
   must select, exactly as a click does. */
document.addEventListener('keydown', function (e) {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  const card = e.target.closest && e.target.closest('#s0 .option-card');
  if (!card) return;
  e.preventDefault();
  selectCharacter(card);
});


/* ═══════════════════════════════════════════════════════════
   S5 — Carousel  (spec slides 8-19)

   Twelve steps. Four of them are graded and registered with the question
   engine under 51..54 (see CAR_QUESTION_OF): the engine's DOM contract is
   one id prefix per question, and this screen holds four, so they get
   their own keys rather than the screen's.

   The bottom bar is the carousel's only control — the deck draws no
   in-carousel arrows, and a graded step's pill has to be "צדקתי?", which
   is that same button.
   ═══════════════════════════════════════════════════════════ */
let carStep = 1;

/* Forward is blocked on a graded step until its question resolves. Reading
   it back from the ENGINE rather than a local flag is what keeps the gate
   and the marking the learner saw from ever disagreeing. */
function carGate() {
  const q = CAR_QUESTION_OF[carStep];
  if (q === undefined) return true;
  return Q.isAnswered(q);
}

function carGo(step) {
  if (step < 1 || step > CAR_STEPS) return;
  // A step's popup must not follow the learner to the next step.
  document.querySelectorAll('#s5 ~ [id^="s5"][id$="-popup"], [id^="s5"][id$="-popup"]')
    .forEach(function (el) { el.classList.add('hidden'); });
  carStep = step;
  carRender();
  // Keep the DEV bar on the same step the learner is on.
  devReportScreen();
}

function carRender() {
  const screen = document.getElementById('s5');
  if (!screen) return;

  screen.querySelectorAll('.car-step').forEach(function (el) {
    el.classList.toggle('active', Number(el.dataset.step) === carStep);
  });
  /* Mirror the step onto the screen element. A multi-step screen otherwise
     has no observable position at all from outside the module — `carStep` is
     a `let` at the top level of a classic script, so it lives in script scope
     and never reaches `window`. The DEV harness, the QA walk-through and
     anything else looking in can read it here. */
  screen.dataset.step = carStep;

  // Dot strip: RTL, so step 1 is the rightmost dot.
  const dots = document.getElementById('s5-dots');
  if (dots) {
    let html = '';
    for (let i = 1; i <= CAR_STEPS; i++) {
      html += '<span class="car-dot' +
              (i === carStep ? ' here' : (i < carStep ? ' done' : '')) + '"></span>';
    }
    dots.innerHTML = html;
  }

  // Back is hidden on the first step of the first screen a learner reaches
  // only when there is genuinely nothing behind it; inside the carousel
  // there always is (S4), so it stays.
  const q = CAR_QUESTION_OF[carStep];
  if (q !== undefined) Q.restore(q);
}

/* ── Drag-and-drop for the two proportion tables ────────────
   The producer asked for dragging ("על ידי גרירה"), and dragging is what
   these give — but every chip is also a <button> and every slot is
   focusable, so the same question is answerable by click and by keyboard.
   A drag-only answer would be unusable on a touch device and unreachable
   with a keyboard. */
function dragChip(e, value) {
  if (e.target.disabled) { e.preventDefault(); return; }
  e.dataTransfer.setData('text/plain', value);
  e.dataTransfer.effectAllowed = 'move';
}
function dropAllow(e, slot) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  slot.classList.add('drop-over');
}
function dropLeave(slot) { slot.classList.remove('drop-over'); }
function dropChip(e, n, slotKey, slot) {
  e.preventDefault();
  slot.classList.remove('drop-over');
  const value = e.dataTransfer.getData('text/plain');
  if (value) Q.slotSet(n, slotKey, value);
}


/* ═══════════════════════════════════════════════════════════
   S8 — Guided Math Practice Screen  (spec slides 23-29)

   One screen, seven steps. The story box and the table never move; the
   teaching panel on the left is REPLACED each step, which is what the deck
   does — each of the seven slides carries only that step's text in it.

   Steps 3 and 5 (slides 25 and 27) offer a choice of ratio. The deck gives
   them no feedback popup, no attempts model and no retry: a green "נכון"
   badge appears under the right option. So they are not routed through the
   question engine — that would attach a contract the producer did not ask
   for — and either click resolves the step, revealing which was right.
   ═══════════════════════════════════════════════════════════ */
let s8Step = 1;
/* Per-step resolution, keyed by step number. Not one shared flag: the two
   picks resolve independently and returning to the screen must not hand
   back an unresolved step the learner already worked through. */
const s8Resolved = {};

/* `table` — false, 'empty' (slide 24: the frame with no values) or 'full'.
   `body`  — what the teaching panel says at this step.
   `pick`  — { options: [...], correct: <key> } for the two graded steps. */
/* the two badge glyphs, from percent-04's guided callout */
const QP_TICK =
  '<svg class="qp-tick" viewBox="0 0 12 12" fill="none"><path d="M1.5 6.2l3 3 6-6.4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const QP_X =
  '<svg class="qp-x" viewBox="0 0 12 12" fill="none"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

const S8_STEPS = [
  /* 1 · slide 23 */ {
    character: true,
    figure: true,        // the model car and its 4x16 callipers
  },
  /* 2 · slide 24 */ {
    table: 'full',          // the deck shows the data, not an empty frame
    tableIn: 'card',        // slide 24 puts it in the blue card

    body: '<p>לפני שנתחיל לחשב,<br>נעזר בטבלת הפרופורציה לארגון הנתונים.</p>',
  },
  /* 3 · slide 25 */ {
    table: 'full',
    body: '<p>כדי שצורת הדגם לא תתעוות, יש לשמור על פרופורציה (שוויון יחסים) בין גובה הדגם לאורכו.</p>' +
          '<p class="pgap"></p>' +
          '<p>מה היחס ה<strong>מצומצם</strong> בין הגובה לאורך של הדגם המקורי?</p>',
    /* .gp-pick is direction:ltr, so the array is in PHYSICAL left-to-right
       order — the deck's x ascending. Slide 25: x = 42 (1/4), 149 (4/1),
       255 (1/12). The "נכון" badge sits at x=47, i.e. under 1/4. */
    pick: { correct: 'a', options: [
      { key: 'a', num: '1',  den: '4'  },
      { key: 'b', num: '4',  den: '1'  },
      { key: 'c', num: '1',  den: '12' },
    ] },
  },
  /* 4 · slide 26 */ {
    table: 'full',
    body: '<p>לפי הנתונים, היחס בין גובה הדגם המקורי לאורכו הוא:</p>' +
          eqBlock(frac('4', '16')) +
          '<p>לאחר צמצום ב-<span class="num">4</span> נקבל<br>שהיחס המצומצם שווה ל- ' +
          eqRow(frac('1', '4')) + '</p>',
  },
  /* 5 · slide 27 */ {
    table: 'full',
    body: '<p>נסמן:<br>x – גובה הדגם המוגדל.</p>' +
          '<p class="pgap"></p>' +
          '<p>היחס בין גובה הדגם המוגדל לאורכו הוא:</p>',
    /* Left to right, deck x ascending: 74 (x/80), 211 (80/x). Badge at
       x=78, i.e. under x/80. */
    pick: { correct: 'a', options: [
      { key: 'a', num: 'x',  den: '80' },
      { key: 'b', num: '80', den: 'x'  },
    ] },
  },
  /* 6 · slide 28 */ {
    table: 'full',
    body: '<p>נבנה את משוואת הפרופורציה – שוויון בין שני היחסים שמצאנו:</p>' +
          eqBlock(frac('x', '80') + eq('=') + frac('1', '4')) +
          '<p>נכפול במכנה המשותף (<span class="num">80</span>) ונקבל:</p>' +
          '<div class="gp-eq"><span class="num">x = 20</span></div>',
  },
  /* 7 · slide 29 */ {
    table: 'full',
    body: '<p><strong>לא לשכוח – לנסח תשובה סופית 😊</strong></p>' +
          '<p class="pgap"></p>' +
          '<p>כדי שתישמר פרופורציה בין הממדים של הדגם המוגדל והדגם המקורי, ' +
          '<strong>גובה הדגם המוגדל צריך להיות <span class="num">20</span> ס"מ.</strong></p>' +
          '<img class="gp-panel-car" src="assets/img/lego-car-small.png" alt="">',
    /* The final step FILLS the answer cell — the deck stops showing "?" once
       it has stated the answer, and marks it in Subject blue. */
    answer: '<span class="num">20</span> ס"מ',
  },
];

/* A step with a pick cannot be left until it resolves. Every other step is
   free: the walkthrough explains, it does not test. */
function s8Gate() {
  return !S8_STEPS[s8Step - 1].pick || !!s8Resolved[s8Step];
}

function s8Go(step) {
  if (step < 1 || step > S8_STEPS.length) return;
  s8Step = step;
  s8Render();
  // Keep the DEV bar on the same step the learner is on.
  devReportScreen();
}

function s8Render() {
  const cfg = S8_STEPS[s8Step - 1];
  const resolved = !!s8Resolved[s8Step];
  const screen = document.getElementById('s8');
  if (screen) screen.dataset.step = s8Step;   // observable — see carRender()

  // Step 1 only: the character and its bubble, and the model-car figure.
  const ch = document.getElementById('s8-character');
  const bub = document.getElementById('s8-bubble');
  if (ch)  ch.classList.toggle('hidden', !cfg.character);
  if (bub) bub.classList.toggle('hidden', !cfg.character);
  const fig = document.getElementById('s8-figure');
  if (fig) fig.classList.toggle('hidden', !cfg.figure);
  // The copy runs in the deck's narrower column while the figure is beside it.
  const story = screen && screen.querySelector('.gp-story');
  if (story) story.classList.toggle('gp-story--figure', !!cfg.figure);

  // The table: absent on step 1, an empty frame on step 2, filled after.
  // Its HOME changes per step — the deck has it inside the blue card on
  // slide 24 and back in the white scenario box on 25-29. One element,
  // re-parented, so the two can never drift apart.
  const wrap = document.getElementById('s8-table-wrap');
  if (wrap) {
    const slot = document.getElementById(
      cfg.tableIn === 'card' ? 's8-card-slot' : 's8-story-slot');
    if (slot && wrap.parentNode !== slot) slot.appendChild(wrap);
    wrap.className = cfg.tableIn === 'card' ? 'gp-card-table' : 'gp-table-float';
    // The copy narrows to the box's right half only while the table is
    // beside it, not on step 1 or 2.
    if (story) story.classList.toggle('gp-story--table',
                                      !!cfg.table && cfg.tableIn !== 'card');
    wrap.classList.toggle('hidden', !cfg.table);
    const full = cfg.table === 'full';
    const cell = function (id, html) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = full ? html : '';
    };
    /* The deck rings the GIVEN numbers — 4, 16 and 80 — and writes X for
       the unknown until the final step names it. */
    const given = function (n) {
      return '<span class="given"><span class="num">' + n + '</span></span> ס"מ';
    };
    cell('s8-cell-oh', given(4));
    cell('s8-cell-h',  cfg.answer
      ? '<strong style="color:var(--subject-500)">' + cfg.answer + '</strong>'
      : 'X');
    cell('s8-cell-ol', given(16));
    cell('s8-cell-l',  given(80));
  }

  // The teaching panel.
  const panel = document.getElementById('s8-panel');
  const body  = document.getElementById('s8-panel-body');
  if (panel) panel.classList.toggle('hidden', !cfg.body);
  if (body)  body.innerHTML = cfg.body || '';

  const pick = document.getElementById('s8-pick');
  if (pick) {
    pick.classList.toggle('hidden', !cfg.pick);
    pick.className = 'gp-pick gc-opts' + (cfg.pick ? '' : ' hidden');
    pick.innerHTML = cfg.pick ? cfg.pick.options.map(function (o) {
      const right = o.key === cfg.pick.correct;
      const picked = s8Picked[s8Step] === o.key;
      /* percent-04's rule: the right option turns green, and the learner's own
         pick turns red only if it was wrong. The options they did not choose
         stay neutral — two crosses beside one tick says nothing useful. */
      const state = !resolved ? '' : (right ? ' correct' : (picked ? ' wrong' : ''));
      /* The badge rides in the correct option's OWN column. A single badge
         beside the row cannot say WHICH ratio it is confirming, and the deck
         places it directly under the right one (x=47 on slide 25, x=78 on
         slide 27). */
      /* percent-04's approved guided pill: the pill fills with Subject/300,
         the label goes semibold and a filled circle carries a white tick or
         cross. Copied from its .gc-opt markup, fractions instead of words. */
      return '<button class="gc-opt' + state + '" type="button" ' +
             (resolved ? 'disabled ' : '') +
             'aria-checked="' + (resolved && right ? 'true' : 'false') + '" role="radio" ' +
             'onclick="s8Pick(' + s8Step + ', \'' + o.key + '\')">' +
             '<span class="gc-opt-text">' + eqRow(frac(o.num, o.den)) + '</span>' +
             '<span class="gc-badge gc-badge-correct">' + QP_TICK + '</span>' +
             '<span class="gc-badge gc-badge-incorrect">' + QP_X + '</span>' +
             '</button>';
    }).join('') : '';
  }
  // The standalone badge is superseded by the per-option one above.
  const badge = document.getElementById('s8-badge');
  if (badge) badge.classList.add('hidden');

  const pill = document.getElementById('s8-submit');
  if (pill) {
    setNavLabel(pill, s8Step === S8_STEPS.length ? 'שנמשיך?' : 'המשך');
    pill.disabled = !s8Gate();
  }
}

/* Either option resolves the step. The deck REVEALS which ratio is right
   rather than grading the learner — there is no second attempt anywhere in
   slides 25 or 27 — so both options get marked and the badge appears. */
const s8Picked = {};
function s8Pick(step, key) {
  s8Resolved[step] = true;
  s8Picked[step] = key;
  s8Render();
}

function s8Next() { advanceScreen(); }


/* The question strip for the warm-up block. Results are read back from the
   ENGINE, never from a local tally, so the strip cannot disagree with the
   marks the learner actually saw. */
function renderPracticeStrip(n) {
  const q = PRACTICE_QUESTION_OF[n];
  const host = document.getElementById('s' + n + '-strip');
  if (!host || q === undefined) return;
  const results = {};
  Object.keys(PRACTICE_QUESTION_OF).forEach(function (screen) {
    const idx = PRACTICE_QUESTION_OF[screen];
    if (Q.isAnswered(Number(screen))) {
      results[idx - 1] = Q.wasCorrect(Number(screen)) ? 'correct' : 'wrong';
    }
  });
  /* 06.09 — percent-04's approved strip (qprog), not the local
     .progress-question component. A station is current, correct or wrong;
     the connector fills once the station before it is answered. */
  const parts = [];
  for (let i = 0; i < PRACTICE_COUNT; i++) {
    const r = results[i];
    /* PRACTICE_QUESTION_OF is 1-based ("שאלה 1", "שאלה 2"); this loop is
       0-based, so the current station is q - 1. */
    const cls = (r === 'correct' ? 'is-correct' : r === 'wrong' ? 'is-wrong' : '') +
                (i === q - 1 ? ' is-current' : '');
    parts.push('<div class="qprog-station ' + cls + '"><span class="qprog-dot">' +
               QP_TICK + QP_X + '</span><span class="qprog-label">שאלה ' + (i + 1) +
               '</span></div>');
    if (i < PRACTICE_COUNT - 1) {
      parts.push('<span class="qprog-line' + (r ? ' is-done' : '') + '"></span>');
    }
  }
  host.className = 'qprog';
  host.setAttribute('aria-hidden', 'true');
  host.innerHTML = parts.join('');
}


/* ═══════════════════════════════════════════════════════════
   QUESTION REGISTRATION — the carousel's four graded steps.

   Each supplies only its DATA. The contract (attempts, "a non-final wrong
   marks nothing", the lastWrong snapshot, the two resume flags) is the
   engine's, once, for all four.

   ⚠ FEEDBACK COPY NOT AUTHORED BY THE PRODUCER is marked FLAG-PRODUCER
   below and listed in CLAUDE.md → open questions. 720-templates →
   _question-template-defaults.md sanctions the shared defaults when a
   slide has none, provided the substitution is visible rather than silent.
   ═══════════════════════════════════════════════════════════ */

/* The shared retry copy. Slides 11, 13, 16 and 17 all author ONE wrong
   popup, which reveals the answer — i.e. the FINAL wrong. None authors a
   non-final retry, so all four use the documented default.
   FLAG-PRODUCER. */
const RETRY_DEFAULT = { bg: '#ffdbdc', title: 'התשובה אינה נכונה.', body: ['שננסה שוב?'] };

/* Slide 13 prints ONE explanation and uses it under both outcomes — the
   correct popup opens "תשובה נכונה, כל הכבוד!" and the wrong one
   "זו טעות…", then both continue with these three runs verbatim. */
/* Each of the two correct equations, annotated. The deck draws three
   leader lines onto each one, naming what its parts are ("הסבר: קו 15/16/17"
   on slide 13, present in BOTH popup variants). Leader lines are not
   reproducible inside a 426px feedback popup at a readable size, so each
   label is tied to its part by naming the part instead — every word of the
   producer's copy is kept, and so is which part of the equation it is
   about. */
function annotated(numA, denA, numB, denB, labels) {
  return '<span class="eq-annot">' +
    eqRow(frac(numA, denA) + eq('=') + frac(numB, denB)) +
    '<span class="eq-annot-list">' +
    labels.map(function (l) {
      return '<span class="eq-annot-row"><span class="eq-annot-part">' + l[0] +
             '</span><span class="eq-annot-text">' + l[1] + '</span></span>';
    }).join('') +
    '</span></span>';
}

const S52_EXPLANATION = [
  'אם נכתוב את היחס בין כוסות (<span class="num">1</span>) לגרמים (<span class="num">140</span>), אז היחס המתאים בפרופורציה ייכתב כך שמספר הכוסות במונה וכמות הגרמים במכנה.',
  annotated('1', '140', 'x', '280', [
    [frac('1', '140'), 'היחס הידוע  בין כוסות לגרמים עבור קמח לבן'],
    ['x',              'מספר  כוסות הקמח שאביבית רוצה לחשב'],
    ['280',            'כמות הגרמים של קמח במתכון'],
  ]),
  'אפשר גם לכתוב את היחס בין גרמים (<span class="num">140</span>) לכוסות (<span class="num">1</span>), ואז היחס המתאים בפרופורציה ייכתב באותו סדר - גרמים במונה וכוסות במכנה.',
  annotated('280', 'X', '140', '1', [
    [frac('140', '1'), 'היחס הידוע  בין גרמים לכוסות עבור קמח לבן'],
    ['280',            'כמות הגרמים של קמח במתכון'],
    ['X',              'מספר  כוסות הקמח שאביבית רוצה לחשב'],
  ]),
  '<strong>ולכן יש שתי תשובות נכונות.</strong>',
];

/* Slides 31 and 32 print ONE explanation and use it under both outcomes —
   "נכון!" and "כמעט..." open the same body verbatim. */
const S10_EXPLANATION = [
  'נכתוב את משוואת הפרופורציה המתאימה לנתונים:',
  eqRow(frac('10', 'x') + eq('=') + frac('6', '15')),
  'נכפול במכנה המשותף (<span class="num">15x</span>):',
  '<span class="num">6 · x = 10 · 15</span>',
  '<span class="num">6x = 150&nbsp; / :6</span>',
  'ונקבל:',
  '<span class="num">x = 25</span>',
];

/* The deck's own table, rendered as a real table rather than described.
   Slide 32's explanation says "נסדר את הנתונים בטבלת פרופורציה:" and then
   shows one — leaving it out drops the step it is pointing at. */
function propTable(head, rows) {
  return '<table class="prop-table prop-table--pop"><thead><tr><th></th>' +
    head.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    rows.map(function (r) {
      return '<tr><td class="prop-rowhead">' + r[0] + '</td>' +
        r.slice(1).map(function (c) { return '<td class="prop-num">' + c + '</td>'; }).join('') +
        '</tr>';
    }).join('') + '</tbody></table>';
}

const S11_EXPLANATION = [
  'נסמן:',
  'x - המחיר ששירה ורז צריכים לשלם.',
  'נסדר את הנתונים בטבלת פרופורציה:',
  propTable(['<span class="num">100</span>', '<span class="num">300</span>'],
            [['משקל (גרם)', '<span class="num">100</span>', '<span class="num">300</span>'],
             ['מחיר (₪)', '<span class="num">11</span>', 'x']]),
  'נכתוב את משוואת הפרופורציה:',
  eqRow(frac('x', '300') + eq('=') + frac('11', '100')),
  'נכפול במכנה המשותף (<span class="num">300</span>) ונקבל:',
  '<span class="num">x = 33</span>',
  'מסקנה: על שירה ורז לשלם <span class="num">33</span> ₪.',
];

/* The COMPLETED proportion table, as the deck draws it inside the feedback
   panel. Both drag questions put one there — slide 11's popups carry the
   spec's tables 2 and 3, slide 16's the same — and both popups shipped
   without it. "הנה התשובה" and "הנה הטבלה הנכונה" are titles pointing at a
   table: with the table missing, the wrong-answer panel was a heading over
   an empty box and the learner never saw the answer it promised.

   A wider column than propTable's: this table has a row-label column of
   Hebrew phrases, not a bare number. */
function dragAnswerTable(head, rows) {
  return '<table class="prop-table prop-table--pop prop-table--wide"><thead><tr><th></th>' +
    head.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    rows.map(function (r) {
      return '<tr><td class="prop-rowhead">' + r[0] + '</td>' +
        r.slice(1).map(function (c) { return '<td class="prop-num">' + c + '</td>'; }).join('') +
        '</tr>';
    }).join('') + '</tbody></table>';
}

const S51_TABLE = dragAnswerTable(
  ['יחס ידוע', 'המתכון של אביבית'],
  [['מספר כוסות', '<span class="num">1</span>', 'X'],
   ['כמות בגרמים', '<span class="num">140</span>', '<span class="num">280</span>']]);

/* ── Q51 · slide 11 — fill the flour proportion table by dragging ──
   `ordered: true`: the same three chips in the wrong cells is a wrong
   table, so position is graded, not just the set of values used. */
Q.define({
  screen: 51,
  kind: 'pool',
  ordered: true,
  slots:  ['cups', 'gramsKnown', 'gramsRecipe'],
  pool:   ['X', '140', '280'],
  correct: ['X', '140', '280'],
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!', body: [
      'זוהי טבלת הפרופורציה הנכונה ממנה נוכל ליצור את המשוואה ולמצוא את הנעלם.',
      S51_TABLE] },
    /* "הנה התשובה וההסבר" — the answer IS the completed table, which the
       deck puts in the panel; the explanation sentence is the correct
       panel's, repeated here so a learner who got it wrong reads it too. */
    wrong2: { bg: '#ffdbdc', title: 'לא מדויק, הנה התשובה וההסבר:', body: [
      'זוהי טבלת הפרופורציה הנכונה ממנה נוכל ליצור את המשוואה ולמצוא את הנעלם.',
      S51_TABLE] },
  },
});

/* ── Q52 · slide 13 — which proportion equations fit? (two correct) ──
   The deck marks options b and d with a green dot and its own explanation
   ends "ולכן יש שתי תשובות נכונות", so this is genuinely multi-select
   even though the note says "singlechoice". */
Q.define({
  screen: 52,
  kind: 'multi',
  options: ['a', 'b', 'c', 'd'],
  correct: ['b', 'd'],
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'תשובה נכונה, כל הכבוד!', body: S52_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'זו טעות. לא נורא, ככה נבנית הבנה.',
               body: ['<strong>בואו נסביר:</strong>'].concat(S52_EXPLANATION) },
  },
});

/* ── Q53 · slide 16 — the sugar proportion table, same mechanic ── */
const S53_TABLE = dragAnswerTable(
  ['יחס ידוע', 'המתכון של אביבית'],
  [['מספר כוסות סוכר', '<span class="num">1</span>', 'y'],
   ['כמות בגרמים', '<span class="num">200</span>', '<span class="num">300</span>']]);

Q.define({
  screen: 53,
  kind: 'pool',
  ordered: true,
  slots:  ['cupsKnown', 'gramsKnown', 'gramsRecipe'],
  pool:   ['1', '200', '300'],
  correct: ['1', '200', '300'],
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'התשובה נכונה. זה מראה על הבנה!', body: [
      'זוהי טבלת הפרופורציה הנכונה ממנה נוכל ליצור את המשוואה ולמצוא את הנעלם.',
      S53_TABLE] },
    /* "הנה הטבלה הנכונה" — so the panel has to CARRY that table. */
    wrong2: { bg: '#ffdbdc', title: 'לא מדויק, הנה הטבלה הנכונה:', body: [S53_TABLE] },
  },
});

/* ── Q54 · slide 17 — pick the sugar proportion equation ──
   Slide 17 authors NO feedback text at all: it is the one graded question in
   the part with no popup copy anywhere in the deck, on stage or off, so the
   titles are the documented shared defaults. FLAG-PRODUCER — the wording
   still needs the producer's approval.

   The BODY is not invented copy: it is the option the learner had to pick,
   restated. A panel headed "התשובה הנכונה מוצגת" over an empty box shows
   nothing at all, and this is the one thing on the slide that can be said
   without writing an explanation the producer did not author. */
const S54_ANSWER = [eqRow(frac('1', '200') + eq('=') + frac('y', '300'))];

Q.define({
  screen: 54,
  kind: 'single',
  options: ['a', 'b', 'c'],
  correct: 'a',
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!', body: S54_ANSWER },
    wrong2:  { bg: '#ffdbdc', title: 'לא מדויק. התשובה הנכונה מוצגת.', body: S54_ANSWER },
  },
});


/* ── S10 · slide 31 — the ratio 10:x = 6:15 ──
   10/x = 6/15 → 6x = 150 → x = 25. The deck prints 25 in the answer box. */
Q.define({
  screen: 10,
  kind: 'value',
  inputs: ['x'],
  correct: [['25']],
  /* 06.09: the hint is offered from the start, as on the percent units */
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!', body: S10_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S10_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(10); },
});

/* ── S11 · slide 32 — popcorn, 11 ₪ per 100 g, 300 g ──
   x/300 = 11/100 → x = 33. */
Q.define({
  screen: 11,
  kind: 'value',
  inputs: ['x'],
  correct: [['33']],
  /* 06.09: the hint is offered from the start, as on the percent units */
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!', body: S11_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S11_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(11); },
});


/* ═══════════════════════════════════════════════════════════
   BOOT — last thing in the file, on purpose.

   Every per-screen state variable above is a `let`, so anything that calls
   resetScreenState() must run AFTER those declarations have been evaluated.
   Running it at the top of the file throws a temporal-dead-zone
   ReferenceError, which aborts main.js silently mid-way.

   Order is the shipped one (percent-02 / proportion-01): reveal the
   landing screen, put it into its correct state, and only then let PartNav
   redirect a cross-part arrival — so that jump goes through the normal
   goTo path.
   ═══════════════════════════════════════════════════════════ */
restoreCharacter();
Motion.reveal(document.querySelector('.screen.active'));
resetScreenState(0);

/* DEV-ONLY deep link: ?screen=8&step=3 opens a screen (and a multi-step
   screen's step) directly. index_dev.html drives navigation by postMessage
   and does not need this; it exists so a screen can be opened, screenshotted
   and diffed against the deck by a script, which is the only way a dropped
   line or a shifted block is caught reliably (a click-through cannot be
   diffed). Harmless in production: with no ?screen= it does nothing. */
(function devDeepLink() {
  const p = new URLSearchParams(location.search);
  if (!p.has('screen')) return;
  const n = parseInt(p.get('screen'), 10);
  if (isNaN(n)) return;
  /* ?hint=0 SUPPRESSES a hint card that would otherwise open on entry.
     Block א's screens raise theirs the moment they are shown, which is
     right for a learner and useless for a layout screenshot — the card
     covers the very copy being checked. Marking it as already-shown is the
     same thing a second visit does, so no engine state is faked. */
  if (p.get('hint') === '0' && typeof hintShown !== 'undefined') hintShown[n] = true;
  goTo(n);
  const step = parseInt(p.get('step'), 10);
  if (!isNaN(step)) {
    if (n === 5) carGo(step);
    if (n === 8) s8Go(step);
  }
  /* ?resolve=correct|wrong opens this step's feedback popup directly.
     Reviewing feedback COPY otherwise means answering wrongly on purpose,
     twice, on every question — which is how a popup ships with the wrong
     text in it. Drives the real engine, so what the reviewer reads is what
     a learner reads. */
  const want = p.get('resolve');
  if (want) {
    /* On the carousel the question is the STEP's, not the screen's; anywhere
       else the screen is the question. */
    const q = (n === 5) ? CAR_QUESTION_OF[carStep] : n;
    if (q !== undefined && Q.spec(q)) devResolveQuestion(q, want);
  }
  /* ?hint=1 opens the hint card — same reason as ?resolve: reviewing hint
     COPY otherwise means clicking through to it on every question. */
  /* '0' is a truthy STRING — it means "suppress", handled above. */
  if (p.get('hint') && p.get('hint') !== '0') Q.openHint(n);
})();

/* Answers a registered question programmatically. DEV-ONLY. */
function devResolveQuestion(q, which) {
  const spec = Q.spec(q);
  if (!spec) return;
  const right = which === 'correct';
  if (spec.kind === 'pool') {
    spec.slots.forEach(function (k, i) {
      // Wrong on purpose: the same chips, rotated one cell along.
      const vals = spec.correct;
      Q.slotSet(q, k, right ? vals[i] : vals[(i + 1) % vals.length]);
    });
  } else if (spec.kind === 'value') {
    /* Fill each input with an accepted answer (or a deliberately wrong one).
       `correct[i]` may be a single string or a list of accepted forms. */
    spec.inputs.forEach(function (k, i) {
      const inp = document.getElementById('s' + q + '-in-' + k);
      if (!inp) return;
      const ok = spec.correct[i];
      inp.value = right ? (Array.isArray(ok) ? ok[0] : ok) : '0';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
  } else if (spec.kind === 'multi') {
    (right ? spec.correct
           : spec.options.filter(function (o) { return spec.correct.indexOf(o) === -1; })
    ).forEach(function (k) { Q.select(q, k); });
  } else {
    const pick = right ? spec.correct
      : spec.options.filter(function (o) { return o !== spec.correct; })[0];
    Q.select(q, pick);
  }
  // maxAttempts is 2, so a wrong answer needs two submits to reach wrong2.
  Q.submit(q);
  if (!right) Q.submit(q);
}
PartNav.init({
  part: PART_ID,
  getScreen: function () { return currentScreen; },
  goTo: goTo
});

/* Announce this part to the DEV harness.

   It lives in BOOT, not beside the message bridge above, for the file's own
   temporal-dead-zone reason: devSteps() reads `carStep` and `S8_STEPS`, both
   declared further down, so emitting DEV_READY up there would throw a
   ReferenceError and abort the rest of main.js.

   Report the MAPPED screen span, not the number of .screen elements. A
   reserved index has no element in the DOM, so counting elements silently
   truncates the bar at the built count. TOTAL_SCREENS is the authority on
   how far the part reaches; `built` says which of those indices actually
   landed, and `reserved` says why the rest have not. */
if (window.parent !== window) {
  const built = [...document.querySelectorAll('.screen')]
    .map(s => parseInt(s.getAttribute('data-screen'), 10));
  window.parent.postMessage({
    type: 'DEV_READY',
    part: PART_ID,
    total: TOTAL_SCREENS,
    built: built,
    // Mapped-but-unbuilt indices, so the bar shows a reserved slot rather
    // than a silently missing screen. Kept in step with the ⛔ marks in the
    // harness SCREEN_NAMES by tools/check_screen_map.py.
    reserved: (typeof RESERVED_SCREENS !== 'undefined') ? RESERVED_SCREENS : {},
    // Per-screen step counts, so the harness can build its step control
    // without a second copy of the two step tables.
    stepsPerScreen: (function () {
      const m = {};
      for (let i = 0; i < TOTAL_SCREENS; i++) {
        const d = devSteps(i);
        if (d.steps > 1) m[i] = d.steps;
      }
      return m;
    })()
  }, '*');
}


/* ═══════════════════════════════════════════════════════════
   Feedback-popup dragging. The drag clamp reads the LIVE canvas size, not
   the 1280×710 constants — a popup parked over a proportion table would
   otherwise hide the very data the question asks about.
   Ported from methodica-math-proportion-01.
   ═══════════════════════════════════════════════════════════ */
const POPUP_BAR_H = 74;
let popupDragId = null, popupOffX = 0, popupOffY = 0;

function resetPopupPosition(popup) {
  if (!popup) return;
  popup.style.left = '';
  popup.style.top = '';
  popup.style.bottom = '';
}
function popupAppScale() {
  const app = document.getElementById('app');
  const m = app && app.style.transform.match(/scale\(([^)]+)\)/);
  return m ? parseFloat(m[1]) : 1;
}
function popupCanvasSize() {
  const app = document.getElementById('app');
  return { w: (app && parseFloat(app.style.width)) || 1280,
           h: (app && parseFloat(app.style.height)) || 710 };
}
function popupPointerDown(e, popupId) {
  if (e.target.closest('.popup-action')) return;
  const popup = document.getElementById(popupId), app = document.getElementById('app');
  if (!popup || !app) return;
  popupDragId = popupId;
  const scale = popupAppScale(), r = app.getBoundingClientRect();
  const left = popup.offsetLeft, top = popup.offsetTop;
  /* Freeze the box on left/top before the first move: it is anchored by
     `bottom` at rest, and a bottom-anchored box grows upward as its body
     changes, which fights a pointer that is moving it down. */
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  popup.style.bottom = 'auto';
  popupOffX = (e.clientX - r.left) / scale - left;
  popupOffY = (e.clientY - r.top) / scale - top;
  e.preventDefault();
}
window.addEventListener('pointermove', function (e) {
  if (!popupDragId) return;
  const popup = document.getElementById(popupDragId), app = document.getElementById('app');
  if (!popup || !app) return;
  const scale = popupAppScale(), r = app.getBoundingClientRect();
  const size = popupCanvasSize();
  const rawX = (e.clientX - r.left) / scale - popupOffX;
  const rawY = (e.clientY - r.top) / scale - popupOffY;
  popup.style.left = Math.min(Math.max(rawX, 0), size.w - popup.offsetWidth) + 'px';
  popup.style.top  = Math.min(Math.max(rawY, 0), (size.h - POPUP_BAR_H) - popup.offsetHeight) + 'px';
});
window.addEventListener('pointerup',     function () { popupDragId = null; });
window.addEventListener('pointercancel', function () { popupDragId = null; });
