'use strict';

/* ═══════════════════════════════════════════════════════════
   methodica-math-proportion-02 — part 03 — js/main.js
   Canvas: 1280 × 710 px (720 reference engine)

   Everything above the "SCREEN LOGIC" divider is the shared engine and
   should not need editing beyond TOTAL_SCREENS. Per-screen code goes
   below it, in screen order.
   ═══════════════════════════════════════════════════════════ */

/* ─── Constants ─────────────────────────────────────────── */
const TOTAL_SCREENS = 10;   // S0-S9  ·  spec slides 40-49
/* Which part this page is. Consumed twice: the DEV bar's part selector,
   which has to follow the lomda when it crosses a boundary on its own, and
   PartNav's trail. One constant so the two can never disagree. */
const PART_ID = '03';

const CANVAS_W = 1280, CANVAS_H = 710, BOTTOM_BAR_H = 74;

/* Screens gated on their question being answered. Every screen in this part
   except the two transitions (S0, S7) and the reserved applet (S5) is a
   question, so this is the full list of built question screens. */
const QUESTION_SCREENS = [1, 2, 3, 4, 5, 6, 8, 9];

/* TWO separate practice runs, each with its own strip — not one strip of six.

   Block א · slides 41-46. Slide 40 announces "4 שאלות פשוטות יותר" and the
   per-slide notes agree ("שאלה N מתוך 4"). Slides 41+42 are parts א and ב of
   question 1, and 43+44 are parts א and ב of question 2, so each pair SHARES
   one step — the same shape as part 01's S10/S11 pair. Question 3 is slide
   45, still reserved, so its dot stays pending until that screen lands.

   Block ב · slides 48-49. Slide 47 hands over to "2 תרגילים ברמת קושי גבוהה
   יותר" and both slides are numbered "שאלה N מתוך 2". A single six-step strip
   would contradict both of the deck's own counters. */
const PRACTICE_BLOCKS = [
  { count: 4, of: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4 } },
  { count: 2, of: { 8: 1, 9: 2 } },
];

/* No multi-step screen in this part; the maps stay declared so the shared
   engine block below needs no per-part edits. */
const CAR_QUESTION_OF = {};
const CAR_STEPS = 0;

/* Mapped-but-unbuilt screens. Claiming the indices now means everything
   after them is built at its FINAL number, so landing the missing screens
   later is an insert and not a renumber of the whole part. goTo() refuses
   these and reports the nearest built screen, and the DEV bar renders them
   as ⛔ טרם נבנה — a visible hole rather than a screen that silently is not
   there. Blockers are listed in CLAUDE.md → open questions. */
const RESERVED_SCREENS = {
  /* שקף 45 — שאלה 3 של בלוק א. BLOCKED, not merely unbuilt: the slide is a
     SharePoint "יישומון" placeholder and the applet itself was never handed
     over, so there is nothing to build. Its practice dot stays pending. */
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

/* Poses the producer supplied in BOTH colours. A slot names one with
   data-pose and applyCharacter() picks the file for the learner's choice —
   which is why such a slot may keep --fixed (that class carries the SIZING
   contract) and still swap. A pose delivered in one colour only stays
   --fixed with no data-pose. The victory pair arrived 03.09.2026. */
const CHARACTER_POSE = {
  victory: {
    green:  'assets/img/character-victory-green.png',
    yellow: 'assets/img/character-victory-yellow.png',
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
    // This part's S0 is a TransitionScreen, not part 01's character picker,
    // so there is no per-screen reset to run beside it.
    PartNav.mountBack('s0-back');
  }
  // Every screen that shows the companion character re-reads the choice, so
  // a learner who changes it on S0 sees the change everywhere on the way back.
  applyCharacter(n);
  Q.restore(n);
  renderPracticeStrip(n);
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

  /* The carousel and the guided practice are multi-step SCREENS: forward
     means "next step" until the last one. The question engine calls this
     same function when a resolved question's pill is clicked (it defers to
     window.advanceScreen), so a graded step advances through here too. */

  if (Q.isAnswered(currentScreen) === false && QUESTION_SCREENS.indexOf(currentScreen) !== -1) return;
  // Crossing forward out of this part — including when the remaining
  // indices are all reserved, which still means this part is finished.
  if (next === -1) { PartNav.forward('04'); return; }
  goTo(next);
}

function goBack() {
  // Inside a multi-step screen, back means the previous STEP.
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
    devReportScreen();
  }
});

/* How many steps the screen the learner is on has, and which one is showing.
   1/1 for an ordinary screen, so the harness needs no special case. */
function devSteps(n) { return { steps: 1, step: 1 }; }



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
  /* --fixed carries TWO meanings: size this slot itself, and do not swap its
     artwork. S7's victory-sign pose kept both while it existed in green only;
     now that its yellow twin has arrived the slot names the POSE instead, so
     it keeps the sizing and follows the learner's choice again. A pose still
     delivered in one colour only stays --fixed with no data-pose. */
  screen.querySelectorAll('.hct-character:not(.hct-character--fixed) img, .ts-character:not(.ts-character--fixed) img, [data-pose] img')
    .forEach(function (img) {
      const slot = img.closest('[data-pose]');
      const set  = (slot && CHARACTER_POSE[slot.dataset.pose]) || CHARACTER_ASSET;
      img.src = set[choice] || set.green;
    });
}

/* The block a screen belongs to, or undefined for a screen outside both. */
function practiceBlockOf(n) {
  return PRACTICE_BLOCKS.filter(function (b) { return b.of[n] !== undefined; })[0];
}

function renderPracticeStrip(n) {
  const block = practiceBlockOf(n);
  const host = document.getElementById('s' + n + '-strip');
  if (!host || !block) return;
  const results = {};
  /* Only this block's screens count. Reading every answered screen in the
     part would light block ב's two dots with block א's results. */
  Object.keys(block.of).forEach(function (screen) {
    const idx = block.of[screen];
    if (Q.isAnswered(Number(screen))) {
      results[idx] = Q.wasCorrect(Number(screen)) ? 'correct' : 'wrong';
    }
  });
  ProgressStrip.render(host, block.count, block.of[n], results);
}

/* Every slide in block א carries the note "רמז יוצג מיד עם הצגת השאלה", and
   slide 40 announces the same for the whole block ("וכבר בהתחלה יש רמז!").
   So they open their hint card on ENTRY — but only the first time:
   re-opening it every time a learner steps back onto the screen would be an
   obstruction, not a hint.

   Block ב is the OPPOSITE: slides 48 and 49 note "רמז בכל שאלה שיוצג רק
   לאחר ניסיון ראשון שגוי", which is the engine's own `hintAfterWrong` flag
   on those two specs — the hint button starts hidden there and appears with
   the retry popup. The two rules must not both be set on one screen. */
/* No screen opens a hint by itself — the button appears after a wrong
   answer and the learner chooses to open it. Replaces the deck's own
   "רמז יוצג מיד" on slides 41-46, per the client's rule. */
const hintShown = {};

/* ═══════════════════════════════════════════════════════════
   QUESTION REGISTRATION
   ═══════════════════════════════════════════════════════════ */
const RETRY_DEFAULT = { bg: '#ffdbdc', title: 'התשובה אינה נכונה.', body: ['שננסה שוב?'] };

const S1_EXPLANATION = [
  'היחס בין x ל-<span class="num">27</span> שווה ליחס בין <span class="num">6</span> ל-<span class="num">9</span>.',
  'נתרגם את היחסים לשברים:',
  'היחס בין x ל-<span class="num">27</span> נכתב כשבר: ' + eqRow(frac('x', '27')),
  'היחס בין <span class="num">6</span> ל-<span class="num">9</span> נכתב כשבר: ' + eqRow(frac('6', '9')) + '.',
  'פרופורציה היא שוויון בין יחסים.',
  'נבנה את משוואת הפרופורציה ונקבל שהתשובה המתאימה היא:',
  eqRow(frac('x', '27') + eq('=') + frac('6', '9')),
];

/* slide 42 sets every equation in this explanation bold (b="1" on each math
   run) — the proportion it starts from and the two solving lines. */
const S2_EXPLANATION = [
  'משוואת הפרופורציה המתאימה היא:',
  '<strong>' + eqRow(frac('x', '27') + eq('=') + frac('6', '9')) + '</strong>',
  'נכפול במכנה המשותף (<span class="num">27</span>) ונקבל:',
  '<strong><span class="num">x = 6 · 3</span></strong>',
  '<strong><span class="num">x = 18</span></strong>',
];

/* ── Q5 · slide 45 — the tiling applet ──
   "רמז יוצג מיד עם הצגת השאלה", like every other question in this
   block. The hint waits for a wrong answer, like every other question
   in the unit. */
const S5_EXPLANATION = [
  'יש לשמור על יחס של <span class="num">2:5</span> בין שיש לדשא.',
  'נסמן בx- את מספר הבלוקים של השיש הדרושים עבור <span class="num">30</span> בלוקים של דשא.',
  'משוואת הפרופורציה המתאימה היא:',
  eqRow(frac('2', '5') + eq('=') + frac('x', '30')),
  'נכפול במכנה המשותף (<span class="num">30</span>)',
  '<span class="num">x = 2 · 6</span>',
  '<span class="num">x = 12</span>',
  'כלומר, דרושים <span class="num">12</span> בלוקים של שיש עבור <span class="num">30</span> בלוקים של דשא.',
];

Q.define({
  screen: 5, kind: 'value', inputs: ['x'], correct: [['12']],
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!', body: S5_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S5_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(5); },
});

/* ── S1 · slide 41 — pick the proportion ──
   Correct is x/27 = 6/9; slide 42 opens by stating that equation as found. */
Q.define({
  screen: 1, kind: 'single', options: ['a', 'b', 'c', 'd'], correct: 'c',  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!',   body: S1_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S1_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(1); },
});

/* ── S2 · slide 42 — solve it ──  x/27 = 6/9 → x = 18. */
Q.define({
  screen: 2, kind: 'value', inputs: ['x'], correct: [['18']],  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!',   body: S2_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S2_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(2); },
});


/* The deck's own proportion tables, rendered as real tables rather than
   described. Slides 46 and 48 leave a five-blank-paragraph hole in the
   feedback panel and drop a table into it — leaving it out would drop the
   step the sentence above it is pointing at. Two shapes because the deck
   uses two: slide 46's table is a plain two-column head/body, slide 48's
   has a row-label column as well.
   (propTable is the same helper part 01 uses for slide 32.) */
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
/* No row-label column: every cell under the head is data. */
function propTablePlain(head, rows) {
  return '<table class="prop-table prop-table--pop"><thead><tr>' +
    head.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    rows.map(function (r) {
      return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
}

/* A named ratio written as a fraction — "כמות משימות / מטבעות זהב". The deck
   sets these in the same fraction rule as a numeric one, so they go through
   frac() too rather than being faked with a slash. */
function nameFrac(num, den) { return eqRow(frac(num, den)); }

/* A multiplier annotation riding on a fraction's numerator, the way slide 44
   draws it: a small blue "·10" tucked above and before the term. */
function mul(n) { return '<sup class="eq-mul">·<span class="num">' + n + '</span></sup>'; }

/* ── S3 · slide 43 — complete the proportion ──
   The learner fills the RIGHT fraction's denominator; 3/120 = x/[400]. */
const S3_EXPLANATION = [
  'על כל <span class="num">3</span> משימות, איתי מקבל <span class="num">120</span> מטבעות זהב וירטואליים ולכן השבר ' +
    eqRow(frac('3', '120')) + ' מייצג את היחס:',
  nameFrac('כמות משימות', 'מטבעות זהב'),
  '<span class="pgap"></span>',
  'במשחק אחר הצהריים איתי השלים x משימות וקיבל <span class="num">400</span> מטבעות זהב.',
  'לכן משוואת הפרופורציה היא:',
  eqRow(frac('3', '120') + eq('=') + frac('x משימות', '<span class="num">400</span> מטבעות')),
];

Q.define({
  screen: 3, kind: 'value', inputs: ['den'], correct: [['400']],  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!',   body: S3_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S3_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(3); },
});

/* ── S4 · slide 44 — solve it ──  3/120 = x/400 → x = 10. */
const S4_EXPLANATION = [
  'נכפול במכנה המשותף (<span class="num">1200</span>):',
  eqRow(frac(mul(10) + '3', '120') + eq('=') + frac(mul(3) + 'x', '400')),
  '<span class="pgap"></span>',
  '<span class="num">30 = 3x  /: 3</span>',
  '<span class="pgap"></span>',
  '<span class="num">x = 10</span>',
  '<span class="pgap"></span>',
  'איתי סיים בהצלחה <span class="num">10</span> משימות.',
];

Q.define({
  screen: 4, kind: 'value', inputs: ['x'], correct: [['10']],
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!',   body: S4_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S4_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(4); },
});

/* ── S6 · slide 46 — the playlist ──  5/15 = x/60 → x = 20 שירים.
   FLAG-PRODUCER: the correct panel is headed "נכון!" and the wrong one
   "כמעט!" (with an exclamation mark, where every other slide in this part
   writes "כמעט..."). Transcribed as the deck has it. */
const S6_EXPLANATION_BODY = [
  'נסמן: x - כמות השירים בפלייליסט של <span class="num">60</span> דקות.',
  'נסדר את הנתונים בטבלת פרופורציה:',
  propTablePlain(['כמות שירים', 'זמן השמעה'],
                 [['<span class="num">5</span>', '<span class="num">15</span> דקות'],
                  ['x', '<span class="num">60</span> דקות']]),
  'נרצה לשמור על היחס:',
  nameFrac('כמות שירים', 'זמן בדקות'),
  '<span class="pgap"></span>',
  'נכתוב משוואת פרופורציה מתאימה:',
  eqRow(frac('5', '15') + eq('=') + frac('x', '60')),
  '<span class="pgap"></span>',
  'נכפול במכנה המשותף (<span class="num">60</span>):',
  '<span class="num">x = 5 ∙ 4</span>',
  '<span class="num">x = 20</span>',
];

Q.define({
  screen: 6, kind: 'value', inputs: ['n'], correct: [['20']],  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!',  body: S6_EXPLANATION_BODY },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט!', body: S6_EXPLANATION_BODY },
  },
  onResolve: function () { renderPracticeStrip(6); },
});

/* ── S8 · slide 48 — the shirt order ──  25/175 = 550/x → x = 3850 ₪.
   hintAfterWrong, per the slide note "רמז בכל שאלה שיוצג רק לאחר ניסיון
   ראשון שגוי": the engine keeps the hint button hidden until the first
   wrong attempt resolves, then reveals it with the retry popup. */
const S8_EXPLANATION = [
  'נסמן ב-x את המחיר הכולל של <span class="num">175</span> חולצות ונסדר את הנתונים בטבלת פרופורציה:',
  propTable(['הצעת מחיר', 'ההזמנה כולה'],
            [['כמות חולצות', '<span class="num">25</span>', '<span class="num">175</span>'],
             ['מחיר (₪)', '<span class="num">550</span>', 'x']]),
  'ונכתוב את הפרופורציה הבאה:',
  eqRow(frac('25', '175') + eq('=') + frac('550', 'x')),
  'נוכל לצמצם ב-<span class="num">25</span> את היחס באגף שמאל:',
  eqRow(frac('1', '7') + eq('=') + frac('550', 'x')),
  'נכפול במכנה המשותף (<span class="num">7</span>x):',
  '<span class="num">x = 3850</span>',
  'ולכן המחיר הכולל של ההזמנה יהיה <span class="num">3850</span> שקלים.',
];

Q.define({
  screen: 8, hintAfterWrong: true, kind: 'value', inputs: ['total'], correct: [['3850']],
  /* 06.09: the hint is offered from the start — the deck says "מיד"
     (or says nothing) on every hint but slides 44-45. */
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!',   body: S8_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S8_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(8); },
});

/* ── S9 · slide 49 — the salad dressing ──  ×1.5 on all three ingredients.
   Three inputs, all three must be right; the engine's `value` kind grades
   every input in `inputs` against the matching entry in `correct`. */
const S9_EXPLANATION = [
  'עלינו להגדיל את הכמות של כל אחד מהמרכיבים לפי היחס בין כמויות הרוטב.',
  '<span class="pgap"></span>',
  'היחס בין כמות הרוטב במתכון החדש לכמות הרוטב במתכון המקורי הוא',
  eqRow(frac('150', '100') + eq('=') + '<span class="num">1.5</span>'),
  '<span class="pgap"></span>',
  'לכן, עלינו להכפיל את כמויות המרכיבים במתכון המקורי ב-<span class="num">1.5</span>:',
  'שמן זית: <span class="num">90</span> מ"ל <span class="num">= 60 ∙ 1.5</span>',
  'חומץ בלסמי: <span class="num">45</span> מ"ל <span class="num">= 30 ∙ 1.5</span>',
  'רוטב סויה: <span class="num">15</span> מ"ל <span class="num">= 10 ∙ 1.5</span>',
];

Q.define({
  screen: 9, hintAfterWrong: true, kind: 'value',
  inputs: ['oil', 'vinegar', 'soy'],
  correct: [['90'], ['45'], ['15']],
  /* 06.09: the hint is offered from the start — the deck says "מיד"
     (or says nothing) on every hint but slides 44-45. */
  popups: {
    retry: RETRY_DEFAULT,
    correct: { bg: '#edf8ed', title: 'נכון!',   body: S9_EXPLANATION },
    wrong2:  { bg: '#ffdbdc', title: 'כמעט...', body: S9_EXPLANATION },
  },
  onResolve: function () { renderPracticeStrip(9); },
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
  /* ?resolve=correct|wrong opens this step's feedback popup directly.
     Reviewing feedback COPY otherwise means answering wrongly on purpose,
     twice, on every question — which is how a popup ships with the wrong
     text in it. Drives the real engine, so what the reviewer reads is what
     a learner reads. */
  const want = p.get('resolve');
  if (want) {
    /* 06.09 — this part has no carousel (CAR_QUESTION_OF is empty and there is
       no carStep), but it carried part 01's `n === 5 ? CAR_QUESTION_OF[carStep]`
       branch, where screen 5 IS the carousel. Here screen 5 is an ordinary
       question, so ?resolve= on it looked up an empty map, got undefined and
       silently did nothing — the one screen in the part where the harness
       could not open the feedback. The screen is the question here. */
    const q = n;
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
