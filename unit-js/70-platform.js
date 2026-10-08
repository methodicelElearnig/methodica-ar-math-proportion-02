'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02 — platform glue: xAPI reporting + resume on the 720-core engine.

   The platform files (10-identity / 20-xapi / 40-resume / 50-loader / 90-boot) come from
   methodica-math-proportion-01 (2026-10-08), which runs on the same 720-core (engine.js /
   quiz-engine.js). This file is that unit's 70-platform.js with its unit-specific screens taken
   out; what is generic is unchanged:
     - the quiz-engine call sites (every question type the engine builds; this unit asks only
       `single` and `value-input`)
     - scores, pass gates and the component result, from XAPI_Q_RESULTS (§6.4)
     - the end of the component — the platform owns routing (§8.12)
     - the resume hooks and the painters for the two question types this unit asks
   This unit's hand-built screens (component 01: the carousel s5 and the guided practice s8;
   component 02: the dino applet s13; component 04: the class task s28-s34) report and resume
   through CUSTOM_KEYS / paintCustom below — see the ⚑ seams.
   quizState / QUESTIONS / TOTAL_SCREENS are top-level in the shared global lexical scope, so this
   shared file reaches them directly. inPart(n) is quiz-engine.js's own (declaring it again here
   would be a silent last-wins overwrite — §3.3).

   Definition-only, like the rest of unit-js/ except 90-boot.js.

   Seams it provides:
     PART_FIRST / PART_LAST / PART_PREV  this component's range and its predecessor (PART_CONFIG)
     partEndScreens() / lastScreenButton()   where this component can end, and its button (D-8)
     partExit(dir)              engine.js goTo() walking off either end of the component
     partGateBlocks(from, to)   engine.js goTo() — a pass gate that ends the component early
     partResult()               the component result sent with 'completed'
     keyboardForwardAllowed()   engine.js ArrowLeft gate
     capturePartPayload / applyResumeVars / applyResumeDom / restoreScreenUI   the resume hooks
     applyExecutionState(st, n) the restore replay (50-loader.js phase B)
     repaintScreen(n)           engine.js goTo(), after resetScreenState — every navigation (§8.4a)
     onQuizAnswered / onQuizCommitted / onQuizHint   quiz-engine.js call sites
     onCustomAnswered / onCustomPick                 the hand-built screens' call sites
     partBoot()                 90-boot.js — builds the question screens and lands the part
   ═══════════════════════════════════════════════════════════════════ */

var PART_FIRST = (window.PART_CONFIG && typeof window.PART_CONFIG.start === 'number') ? window.PART_CONFIG.start : 0;
var PART_LAST  = (window.PART_CONFIG && typeof window.PART_CONFIG.end === 'number') ? window.PART_CONFIG.end : TOTAL_SCREENS - 1;
/* Read by hideCrossPartBack (40-resume.js): a component with a predecessor hides its first
   screen's "חזרה" in production. */
var PART_PREV  = (window.PART_CONFIG && window.PART_CONFIG.prev) || null;

/* The O-2 id lists (40-resume.js initResumeFieldSaves). Nothing here is addressed by id;
   initQuizFieldSaves below arms the debounced save by class instead. */
var RESUME_INPUT_IDS = [];
var RESUME_TEXT_IDS  = [];

function _pq(n) { return QUESTIONS.find(function (x) { return x.screen === n; }) || null; }
function _partQuestions() { return QUESTIONS.filter(function (q) { return inPart(q.screen); }); }
function _itemFor(n) {
  var m = (typeof SCREEN_TO_SUBCONTENT !== 'undefined') ? SCREEN_TO_SUBCONTENT[n] : null;
  return m ? m[0] : null;
}
/* The catalogue questions a screen answers, e.g. ['q1'] or ['q2']. */
function _qKeysFor(n) {
  var m = (typeof XAPI_SCREEN_QUESTIONS !== 'undefined') ? XAPI_SCREEN_QUESTIONS[n] : null;
  return m || [];
}
function _htmlNode(html) { var d = document.createElement('div'); d.innerHTML = html || ''; return d; }
function _txt(html) { return xapiAnswerText(_htmlNode(html)); }

/* ═══════════════════ Reporting call sites (quiz-engine.js) ═══════════════════ */

/* What the learner answered, as they see it. Choice: the option's own text (zoom chips and the
   radio glyph stripped, stacked fractions written a/b — xapiAnswerText), else an image's alt, else
   the option id. Value input: the boxes in data-slot order — a ratio row reads "3:2", anything else
   "a | b". Dropdown / dual-select: the picked values in sentence order. Statement: each row's
   נכון / לא נכון with its text. */
function quizAnswerText(screen, q, st) {
  try {
    if (q.type === 'single' || q.type === 'multi') {
      var ids = q.type === 'multi' ? (st.selectedSet || []) : [st.selected];
      return ids.map(function (id) {
        var o = document.querySelector('#q' + screen + ' .scq-opt[data-id="' + id + '"]');
        if (!o) return String(id);
        var t = xapiAnswerText(o.querySelector('.scq-opt-text') || o);
        var img = t ? null : o.querySelector('img');
        return t || (img && img.getAttribute('alt')) || String(id);
      }).join(', ');
    }
    if (q.type === 'value-input') {
      return (st.selectedSet || []).join(q.ratioRows ? ':' : ' | ');
    }
    if (q.type === 'dropdown' || q.type === 'dual-select') {
      return (st.selectedSet || []).map(function (v) { return v || '—'; }).join(' | ');
    }
    if (q.type === 'statement') {
      return (q.statements || []).map(function (s, i) {
        var v = (st.selectedSet || [])[i];
        return (v === 'true' ? 'נכון' : v === 'false' ? 'לא נכון' : '—') + ' — ' + _txt(s.text);
      }).join(' | ');
    }
    return JSON.stringify(st.selectedSet || st.selected || '');
  } catch (e) { return ''; }
}

/* Called from quizCheck() after the verdict is known and BEFORE any marking — every submit, all
   three branches. The isLast idiom is the family's: correct || attempts exhausted; the Retry gate
   (quiz-engine.js) makes the second attempt a real one, so answered.last counts are honest.
   A screen that answers several catalogue questions with one verdict reports each of them with
   that verdict (§6.3: never split finer than the UI, never leave a declared question silent). */
function onQuizAnswered(screen, q, st, correct) {
  var item = _itemFor(screen);
  var keys = _qKeysFor(screen);
  if (!item || !keys.length) return;
  var isLast = correct || st.attempts >= q.maxAttempts;
  if (q.type === 'statement' && keys.length > 1 && keys.length === (q.statements || []).length) {
    keys.forEach(function (k, i) {
      var v = (st.selectedSet || [])[i];
      var s = q.statements[i];
      xapiAnswered(item, k, v === String(s.correct), isLast,
        (v === 'true' ? 'נכון' : v === 'false' ? 'לא נכון' : '') + ' — ' + _txt(s.text));
    });
    return;
  }
  var text = quizAnswerText(screen, q, st);
  keys.forEach(function (k) { xapiAnswered(item, k, correct, isLast, text); });
}

/* Called at the very tail of quizCheck(), after the last commitment (done / lw / verdict) on every
   path — the flush-after-last-commitment contract (§8.3, D-13). */
function onQuizCommitted(screen) { flushResumeSave(); }

/* Called from quizOpenHint() after its done-guard, immediately before the overlay opens. The hints
   ledger (xapiRequestedHint → sendStatementOnce) reports each question's hint once per attempt,
   across re-opens and reloads (D-7). */
function onQuizHint(screen) {
  var item = _itemFor(screen);
  var keys = _qKeysFor(screen);
  if (item && keys.length) xapiRequestedHint(item, keys[0]);
}

/* ═══════════════════ The hand-built screens ═══════════════════
   Two screens of component 01 ask catalogue questions outside the quiz engine, each ONE screen
   that packs several deck slides as steps, with its whole state in one plain object:
     s5  the carousel  (carousel.js carState: step, answered, picked, placed) — item 002; its four
         graded steps (4, 6, 9, 10), in order, are q1-q4. One attempt each: every answer is last.
     s8  the guided flow (guided.js gState: step, picked) — item 004; its two question steps, in
         order, are q1, q2. The answer is revealed by the first click: that click is the answer.
   The screens call the hooks below; every hook ignores calls made while a painter replays the
   screen (resumeIsPainting). The state objects are mirrored into CUSTOM_STATE[screen] for the
   payload and copied back by applyResumeVars; the screens render from them (carEnter / gEnter on
   every goTo), which is their painter. */
var CUSTOM_STATE = {};

function _clone(o) { return JSON.parse(JSON.stringify(o || {})); }

function _carGradedSteps() {
  return (typeof CAR !== 'undefined') ? CAR.map(function (c, k) { return c.grade ? k + 1 : 0; }).filter(Boolean) : [];
}
function _carAnswerText(i) {
  try {
    var g = CAR[i - 1].grade;
    if (g.kind === 'drag') {
      var p = carState.placed[i] || {};
      return (g.slots || [1, 2, 3]).map(function (s) { return p[String(s)] || '—'; }).join(' | ');
    }
    return (carState.picked[i] || []).map(function (k) { return _txt(g.opts[k]); }).join(', ');
  } catch (e) { return ''; }
}
/* carousel.js carRender(), at its end — every change of step, pick or placement. */
function onCarChanged() {
  if (resumeIsPainting() || !inPart(5)) return;
  CUSTOM_STATE[5] = { step: carState.step, answered: _clone(carState.answered),
                      picked: _clone(carState.picked), placed: _clone(carState.placed) };
  scheduleResumeSave();
}
/* carousel.js carNext(), right after carState.answered[i] is set — the commitment. */
function onCarAnswered(i, ok) {
  if (resumeIsPainting()) return;
  onCarChanged();
  var item = _itemFor(5), keys = _qKeysFor(5), k = _carGradedSteps().indexOf(i);
  if (item && k !== -1 && keys[k]) xapiAnswered(item, keys[k], !!ok, true, _carAnswerText(i));
  flushResumeSave();
}

function _guidedQSteps() {
  return (typeof GUIDED !== 'undefined') ? GUIDED.map(function (c, k) { return c.opts ? k + 1 : 0; }).filter(Boolean) : [];
}
/* guided.js gRender(), at its end. */
function onGuidedChanged() {
  if (resumeIsPainting() || !inPart(8)) return;
  CUSTOM_STATE[8] = { step: gState.step, picked: _clone(gState.picked) };
  scheduleResumeSave();
}
/* guided.js, on the FIRST pick of a question step (the reveal) — the commitment. */
function onGuidedAnswered(i, k) {
  if (resumeIsPainting()) return;
  onGuidedChanged();
  var cfg = GUIDED[i - 1];
  var item = _itemFor(8), keys = _qKeysFor(8), n = _guidedQSteps().indexOf(i);
  if (item && cfg && n !== -1 && keys[n]) xapiAnswered(item, keys[n], k === cfg.correct, true, _txt(cfg.opts[k]));
  flushResumeSave();
}

/* ── component 04 · the class task (s28-s34, classtask.js) ──
   Declares no catalogue question, so it reports nothing — but it is resumable work: the boxes the
   learner typed, which screens were checked, and on a wrong check which of the two views the
   answer toggle shows. classtask.js keeps TASKS[sid] = {done, userInputs, answerKey, slotOk, tgl};
   the typed values live only in the DOM until the check, and after a wrong check the DOM shows
   the KEY (the reveal) while userInputs holds the learner's own (§8.9 hidden state).
   CUSTOM_STATE[n] = { vals, done, tgl } — vals are the learner's own values either way. */
function _ctScreens() {
  return Array.prototype.slice.call(document.querySelectorAll('.ct-screen[data-screen]'))
    .map(function (s) { return Number(s.dataset.screen); }).filter(inPart);
}
function _ctInputs(n) { return Array.prototype.slice.call(document.querySelectorAll('#s' + n + ' .task-input')); }
function _ctCapture() {
  if (typeof TASKS === 'undefined') return;
  _ctScreens().forEach(function (n) {
    var ins = _ctInputs(n);
    if (!ins.length) return;
    var st = TASKS['s' + n];
    var done = !!(st && st.done);
    var vals = (done && st.userInputs) ? st.userInputs.slice() : ins.map(function (i) { return i.value; });
    if (!done && !vals.some(function (v) { return v; })) { delete CUSTOM_STATE[n]; return; }
    CUSTOM_STATE[n] = { vals: vals, done: done, tgl: (st && st.tgl) || null };
  });
}
/* classtask.js taskCheck(), after the check is committed (done, userInputs, the reveal). */
function onTaskChecked(sid) {
  if (resumeIsPainting()) return;
  _ctCapture();
  flushResumeSave();
}
/* The class-task screen's look from its state, by replaying classtask.js's own handlers with the
   learner's values — exactly what the live typing and the live check drew. Idempotent: a checked
   screen already showing its check (boxes locked) is left alone. */
function _paintTask(n) {
  if (typeof TASKS === 'undefined') return;
  var sid = 's' + n, s = CUSTOM_STATE[n], st = TASKS[sid];
  var ins = _ctInputs(n);
  if (!s || !ins.length) return;
  if (ins.some(function (i) { return i.disabled; })) return;          // already painted (checked)
  var empty = ins.every(function (i) { return !i.value; });
  /* pending: fill only empty boxes — never overwrite what the learner is typing now */
  if (!s.done && !empty) return;
  ins.forEach(function (inp, i) { inp.value = s.vals[i] == null ? '' : s.vals[i]; });
  var keyed = typeof TASK_KEYS !== 'undefined' && !!TASK_KEYS[sid];
  TASKS[sid] = TASKS[sid] || { done: false };
  TASKS[sid].done = false;
  taskOnInput(sid);                                                   // the button and s34's cheer, as live
  if (!s.done) return;
  if (keyed) {
    taskCheck(sid);                                                   // marks, card, reveal, toggle; done = true
    if (s.tgl === 'answer') {
      var tb = document.querySelector('#' + sid + ' .fb-answer-toggle');
      if (tb) tb.click();
    }
  } else {
    TASKS[sid].done = true;                                           // s34: no key, nothing to show
  }
}

/* Back into the screens' own objects (applyResumeVars). Mutated in place: carousel.js and
   guided.js hold them as const. */
function _restoreCustomScreens() {
  var c = CUSTOM_STATE[5];
  if (c && typeof carState !== 'undefined') {
    carState.step = c.step || 1;
    carState.answered = _clone(c.answered);
    carState.picked = _clone(c.picked);
    carState.placed = _clone(c.placed);
    carState.held = {};
  }
  var g = CUSTOM_STATE[8];
  if (g && typeof gState !== 'undefined') {
    gState.step = g.step || 1;
    gState.picked = _clone(g.picked);
  }
  /* The class task: the verdict travels in TASKS so a screen not painted yet still counts as checked
     (keyboardForwardAllowed, the next capture); its look waits for _paintTask. */
  if (typeof TASKS !== 'undefined') {
    _ctScreens().forEach(function (n) {
      var t = CUSTOM_STATE[n];
      if (!t) return;
      TASKS['s' + n] = Object.assign(TASKS['s' + n] || {}, { done: !!t.done, tgl: t.tgl || undefined },
        t.done ? { userInputs: (t.vals || []).slice() } : {});
    });
  }
}

/* ═══════════════════ Scores, gates and results ═══════════════════
   One rule for every component, from XAPI_Q_RESULTS — the same truth the 'answered' statements
   carried, so a result cannot disagree with them. Unanswered questions count as not correct.

   Components WITH a promise on screen (XAPI_GATE in script.js) score on exactly the set the
   learner was told about, and pass on the promised number (§6.4). Components WITHOUT one score
   correct ÷ the questions the metadata declares, and always succeed — unless the component's
   script.js sets XAPI_PASS_SCALED: then success = scaled >= it. A component that grades nothing
   (the class task) reports success with no score (§6.4). */

function _declaredQs(item) {
  try {
    var sc = (window.METADATA && window.METADATA.subContent) || [];
    for (var i = 0; i < sc.length; i++) {
      if (String(sc[i].id).replace(/\/+$/, '').slice(-(item.length + 1)) === '-' + item) {
        return (sc[i].questions || []).map(function (q) { return shortId(q.questionId); });
      }
    }
  } catch (e) {}
  /* no metadata (reporting off): the questions the screens of this item answer */
  var keys = [];
  var map = (typeof XAPI_SCREEN_QUESTIONS !== 'undefined') ? XAPI_SCREEN_QUESTIONS : {};
  Object.keys(map).forEach(function (n) {
    if (_itemFor(Number(n)) === item) keys = keys.concat(map[n]);
  });
  return keys;
}
function _evalItems() { return Object.keys((typeof XAPI_EVAL_ITEMS !== 'undefined') ? XAPI_EVAL_ITEMS : {}); }
function _qOk(item, k) { return XAPI_Q_RESULTS[item + '/' + k] === true; }
function _qSeen(item, k) { return Object.prototype.hasOwnProperty.call(XAPI_Q_RESULTS, item + '/' + k); }
function _itemAllOk(item) { var qs = _declaredQs(item); return qs.length > 0 && qs.every(function (k) { return _qOk(item, k); }); }
function _screenAllOk(n) { var it = _itemFor(n), ks = _qKeysFor(n); return !!it && ks.length > 0 && ks.every(function (k) { return _qOk(it, k); }); }

function _gate() { return (typeof XAPI_GATE !== 'undefined') ? XAPI_GATE : null; }
/* The gated set: its members (items, or question screens), how many are correct, and whether
   every member has been answered at all (the gate fails OPEN on incomplete evidence, §6.4). */
function _gateTally() {
  var g = _gate();
  if (!g) return null;
  var members = g.of === 'items'
    ? (g.items || _evalItems())
    : Object.keys((typeof XAPI_SCREEN_QUESTIONS !== 'undefined') ? XAPI_SCREEN_QUESTIONS : {}).map(Number).filter(inPart);
  var ok = members.filter(function (m) { return g.of === 'items' ? _itemAllOk(m) : _screenAllOk(m); }).length;
  var complete = members.every(function (m) {
    if (g.of === 'items') return _declaredQs(m).every(function (k) { return _qSeen(m, k); });
    return !!(quizState[m] && quizState[m].done);
  });
  return { need: g.need, total: members.length, ok: ok, complete: complete };
}

function partResult() {
  var items = _evalItems();
  if (!items.length) return { success: true };
  var t = _gateTally();
  if (t) return { success: t.ok >= t.need, score: { scaled: t.total ? t.ok / t.total : 0 } };
  var total = 0, ok = 0;
  items.forEach(function (it) {
    _declaredQs(it).forEach(function (k) { total++; if (_qOk(it, k)) ok++; });
  });
  var scaled = total ? ok / total : 0;
  var bar = (typeof XAPI_PASS_SCALED === 'number') ? XAPI_PASS_SCALED : null;
  return { success: bar === null || scaled >= bar, score: { scaled: scaled } };
}

/* An explicit result for every graded item's 'completed' (read by xapiItemResult, 20-xapi.js).
   Without it the item result would be the library's own per-page-load aggregate, which knows
   nothing about answers restored by a resume. scaled = correct ÷ declared; success = all correct,
   except an item that IS a gated component's whole promised set (a gate of: 'screens'), whose
   success is the gate's. Built as a getter map so it follows XAPI_EVAL_ITEMS (script.js, loaded
   before this). */
var XAPI_ITEM_RESULT = {};
_evalItems().forEach(function (item) {
  XAPI_ITEM_RESULT[item] = function () {
    var qs = _declaredQs(item);
    var ok = qs.filter(function (k) { return _qOk(item, k); }).length;
    var scaled = qs.length ? ok / qs.length : 0;
    var g = _gate();
    var success = (g && g.of === 'screens') ? (function () { var t = _gateTally(); return t.ok >= t.need; })()
                                            : (qs.length > 0 && ok === qs.length);
    return { success: success, score: { scaled: scaled } };
  };
});

function partResultKey() { return 'proportion02_c' + currentPartSlug().slice(-2) + '_result'; }

/* ═══════════════════ The end of the component ═══════════════════ */

/* A gate screen ends the component only while the gate blocks; a learner who passed it ends on
   PART_LAST like everyone else, and stepping back onto the gate screen must not disable it. */
function _gateEnds() {
  var g = _gate();
  if (!g || g.at == null || !inPart(g.at)) return false;
  var t = _gateTally();
  return !!(t && t.complete && t.ok < t.need);
}
function partEndScreens() {
  var g = _gate();
  return _gateEnds() ? [PART_LAST, g.at] : [PART_LAST];
}
function _endButtonFor(n) {
  if (_pq(n)) return document.getElementById('q' + n + '-check');
  return document.querySelector('.screen[data-screen="' + n + '"] .btn-continue');
}
/* The button whose click ends this component: the last question's "שנמשיך?", else the static last
   screen's continue button ("סיימתי" on 07's s59) — or, below a gate, the gate screen's. */
function lastScreenButton() {
  var ends = partEndScreens();
  return _endButtonFor(ends.indexOf(currentScreen) !== -1 ? currentScreen : PART_LAST);
}

/* Report the component, disable the button, record the verdict, flush — and navigate NOWHERE
   (the platform owns routing, §8.12). */
function _endComponent(btn) {
  var res = partResult();
  try { xapiEndComponent(res, btn); } catch (e) { console.error('[xAPI] end component', e); }
  try { setUnitResult(partResultKey(), res.success ? 'pass' : 'fail'); } catch (e) { console.error('[resume] result', e); }
  flushResumeSave();
  return res;
}

/* engine.js goTo() calls this instead of hopping when n leaves [PART_FIRST, PART_LAST].
   Forward off the last screen = the learner's last click. Only a DEV_NAV walkthrough (?dev=1
   without ?registration) goes on to the next component. Backward off the first screen only
   exists under DEV_NAV too. */
function partExit(dir) {
  if (_restoring) return;
  if (dir < 0) {
    if (DEV_NAV) goToPrevPart();
    return;
  }
  if (currentScreen !== PART_LAST) return;
  /* The last question must be answered before its button ends anything, and a disabled static
     last screen must be opened first — ArrowLeft reaches this path too. */
  var lq = _pq(PART_LAST);
  if (lq && !(quizState[PART_LAST] && quizState[PART_LAST].done)) return;
  var btn = lastScreenButton();
  if (!lq && btn && btn.disabled && !alreadySent('done', currentPartSlug())) return;
  _endComponent(btn);
  var P = window.PART_CONFIG;
  if (DEV_NAV && P && P.next) {
    var dest = String(P.next).replace(/\/index\.html$/, '').replace(/\/+$/, '').split('/').pop();
    writeForwardState(dest, '#screen=' + PART_LAST);
    goToNextPart();
  }
}

/* engine.js goTo() asks this before every move. A gate placed INSIDE a component (XAPI_GATE.at =
   the screen of the last promised exercise) ends the component there when the learner moves
   forward below the promised number (§6.4). Checked last, after the question's own "answered"
   guard, and it fails OPEN when a gated item has no recorded answer. Below the gate it blocks
   every forward move, the second click included; the ledger keeps the 'completed' to one. */
function partGateBlocks(from, to) {
  if (_restoring || typeof to !== 'number' || to <= from) return false;
  var g = _gate();
  if (!g || g.at == null || from !== g.at) return false;
  if (!_gateEnds()) return false;
  _endComponent(_endButtonFor(g.at));
  return true;
}

/* ArrowLeft goes forward only where the screen's own forward button would (engine.js): a quiz
   screen once answered; the carousel and the guided flow only from their LAST step (their button
   steps inside the screen before that, and a graded step's button is צדקתי? — skipping it would
   close the item unanswered); a class-task screen with an answer key once checked (its button
   checks first, then moves on); any other screen while its continue button is enabled. A local
   walkthrough keeps free navigation. */
function keyboardForwardAllowed() {
  if (DEV_NAV) return true;
  var n = currentScreen;
  if (quizState[n]) return !!quizState[n].done;
  if (n === 5 && typeof carState !== 'undefined' && typeof CAR !== 'undefined') {
    var cg = CAR[carState.step - 1] && CAR[carState.step - 1].grade;
    return carState.step === CAR.length && (!cg || !!carState.answered[carState.step]);
  }
  if (n === 8 && typeof gState !== 'undefined' && typeof GUIDED !== 'undefined') {
    var gc = GUIDED[gState.step - 1];
    return gState.step === GUIDED.length && (!gc || !gc.opts || gState.picked[gState.step] !== undefined);
  }
  var sid = 's' + n;
  if (typeof TASK_KEYS !== 'undefined' && TASK_KEYS[sid]) return !!(TASKS[sid] && TASKS[sid].done);
  var btn = document.querySelector('.screen[data-screen="' + n + '"] .btn-continue');
  return !(btn && btn.disabled);
}

/* ═══════════════════ Resume hooks ═══════════════════ */

/* userInputs / answerKey / slotOk are NOT saved: quizMarkOutcome re-derives them from the inputs,
   which the painter fills from selectedSet first. */
var RESUME_Q_FIELDS = ['attempts', 'done', 'wasCorrect', 'hintUsed', 'selected', 'selectedSet', 'lw', 'tgl'];

/* This component's payload: where the learner is, the per-question verdicts, every quiz
   question's state — submitted AND pending (§8.8 rule 4) — and the hand-built screens'. */
function capturePartPayload() {
  var qs = {};
  _partQuestions().forEach(function (q) {
    var st = quizState[q.screen];
    if (!st) return;
    var o = {};
    RESUME_Q_FIELDS.forEach(function (k) {
      if (st[k] === undefined) return;
      o[k] = Array.isArray(st[k]) ? st[k].slice() : st[k];
    });
    qs[q.screen] = o;
  });
  _ctCapture();
  return {
    currentScreen: currentScreen,
    qResults: JSON.parse(JSON.stringify(XAPI_Q_RESULTS)),
    q: qs,
    c: JSON.parse(JSON.stringify(CUSTOM_STATE))
  };
}

/* Restores the variables. Idempotent — applyExecutionState runs it twice. XAPI_Q_RESULTS and
   CUSTOM_STATE are refilled in place (shared vars other code holds). Only this part's screens.
   The hand-built screens' own flags are NOT set here: their painters set them by replaying the
   screens' own handlers, so the flag and the screen that shows it can never disagree (§8.7). */
function applyResumeVars(st) {
  if (!st) return;
  if (st.qResults && typeof st.qResults === 'object') {
    Object.keys(XAPI_Q_RESULTS).forEach(function (k) { delete XAPI_Q_RESULTS[k]; });
    Object.keys(st.qResults).forEach(function (k) { XAPI_Q_RESULTS[k] = !!st.qResults[k]; });
  }
  var qs = st.q || {};
  Object.keys(qs).forEach(function (key) {
    var n = Number(key);
    if (!inPart(n) || !quizState[n]) return;
    var src = qs[key] || {};
    RESUME_Q_FIELDS.forEach(function (k) {
      if (src[k] === undefined) return;
      quizState[n][k] = Array.isArray(src[k]) ? src[k].slice() : src[k];
    });
  });
  var cs = st.c || {};
  Object.keys(CUSTOM_STATE).forEach(function (k) { delete CUSTOM_STATE[k]; });
  Object.keys(cs).forEach(function (key) {
    if (inPart(Number(key))) CUSTOM_STATE[key] = JSON.parse(JSON.stringify(cs[key]));
  });
  _restoreCustomScreens();
}

/* Values that live only in the DOM (§8.9): the class task's PENDING boxes. Written back here — not
   only by the painter — because capture reads them off the DOM, and the first save after a resume
   that lands anywhere else would otherwise persist empty boxes. Checked screens carry their values
   in TASKS[sid].userInputs (applyResumeVars) and are drawn by _paintTask. */
function applyResumeDom(st) {
  _ctScreens().forEach(function (n) {
    var s = CUSTOM_STATE[n];
    if (!s || s.done) return;
    _ctInputs(n).forEach(function (inp, i) { if (!inp.value && typeof s.vals[i] === 'string') inp.value = s.vals[i]; });
  });
}

/* One painter per interaction type, config-driven (§8.8). Every painter:
   - repaints from state, never resets it; never reports; mutates no score state
   - is idempotent and safe on a clean screen ("clean" = nothing picked or typed, never attempts===0)
   - re-derives the check button through the live predicate (quizCheckBlocked — the Retry gate)
   - draws the wrong-attempt look only while the answer is still the submitted one (D-15)
   Static screens have no painter. */
function restoreScreenUI(n) {
  if (!inPart(n)) return;
  var q = _pq(n);
  if (q) {
    var st = quizState[n];
    if (!st || !document.getElementById('q' + n)) return;
    if (q.type === 'single' || q.type === 'multi') paintChoice(n, q, st);
    else if (q.type === 'value-input') paintValue(n, q, st);
    else console.warn('[resume] no painter for question type', q.type, 'on screen', n);
    return;
  }
  paintCustom(n);
}

function _hintBtn(n) { return document.getElementById('q' + n + '-hint'); }

/* The finished look: exactly what live play leaves (quizCheck's correct / final-wrong branches). */
function _paintDone(n, q, st) {
  var hb = _hintBtn(n);
  if (hb) hb.style.display = 'none';
  if (st.wasCorrect) {
    quizShowFeedback(n, 'correct', q.fb.correct);
  } else {
    var fb = Object.assign({}, q.fb.wrong);
    if (q.type === 'value-input' && st.slotOk && st.slotOk.some(Boolean)) {
      var partial = ('partial' in q.fb) ? q.fb.partial : 'כמעט! חלק מהתשובות נכונות';
      if (partial) fb.title = partial;
    }
    quizShowFeedback(n, 'wrong', fb);
    if (q.type === 'value-input') {
      var mode = st.tgl;
      quizAnswerToggleAdd(n, q);
      var tb = document.querySelector('#q' + n + '-feedbox .fb-answer-toggle');
      if (mode === 'answer' && tb) tb.click();
    }
  }
  quizFinish(n);   // DOM: stepper, locked options, "שנמשיך?"; st.done is already true
}

/* The rejected attempt, re-shown only while the answer on screen is still the one submitted. */
function _paintRetry(n, q, st, stillSubmitted) {
  var hb = _hintBtn(n);
  if (hb) hb.style.visibility = 'visible';
  if (st.lw && stillSubmitted) {
    quizMarkRetry(n, q);
    quizShowFeedback(n, 'wrong', { title: q.fb.retry, body: '' });
  } else {
    quizHideFeedback(n);
  }
}

function paintChoice(n, q, st) {
  var opts = document.querySelectorAll('#q' + n + ' .scq-opt');
  var picked = q.type === 'multi' ? (st.selectedSet || []) : (st.selected ? [st.selected] : []);
  var hasPick = picked.length > 0;
  if (!st.done && !st.attempts && !hasPick) return;              // clean screen — leave untouched
  opts.forEach(function (o) {
    o.classList.remove('selected', 'correct', 'wrong', 'locked');
    var on = picked.indexOf(o.dataset.id) !== -1;
    if (on) o.classList.add('selected');
    o.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  var check = document.getElementById('q' + n + '-check');
  if (st.done) {
    quizMarkOutcome(n, q, !!st.wasCorrect);
    _paintDone(n, q, st);
    return;
  }
  check.textContent = 'צדקתי?';
  if (st.attempts > 0) {
    var hb = _hintBtn(n);
    if (hb) hb.style.visibility = 'visible';
    /* Nothing new picked since the rejected attempt: show what the learner saw when they left —
       the rejected pick(s) marked wrong and the retry prompt (quizMarkRetry cleared the pick in
       live play). A new pick clears both, as live. */
    if (!hasPick && st.lw) {
      (q.type === 'multi' ? String(st.lw).split('|') : [st.lw]).forEach(function (id) {
        var w = document.querySelector('#q' + n + ' .scq-opt[data-id="' + id + '"]');
        if (w) w.classList.add('wrong');
      });
      quizShowFeedback(n, 'wrong', { title: q.fb.retry, body: '' });
    } else {
      quizHideFeedback(n);
    }
  }
  check.disabled = quizCheckBlocked(q, st, hasPick);
}

function paintValue(n, q, st) {
  var slots = Array.prototype.slice.call(document.querySelectorAll('#q' + n + ' .vi-input'));
  var vals = st.selectedSet || [];
  var typed = vals.some(function (v) { return v !== '' && v != null; });
  if (!st.done && !st.attempts && !typed) return;                 // clean screen — leave untouched
  slots.forEach(function (inp, i) {
    inp.value = vals[i] == null ? '' : vals[i];
    inp.classList.remove('wrong', 'correct', 'mark-ok', 'mark-bad');
    inp.disabled = false;
  });
  var check = document.getElementById('q' + n + '-check');
  if (st.done) {
    quizMarkOutcome(n, q, !!st.wasCorrect);   // recomputes the same slotOk/answerKey from the same selectedSet
    _paintDone(n, q, st);
    return;
  }
  check.textContent = 'צדקתי?';
  var ready = slots.length > 0 && vals.length === slots.length && !vals.some(function (v) { return !v; });
  if (st.attempts > 0) _paintRetry(n, q, st, quizSig(q, st) === st.lw);
  check.disabled = quizCheckBlocked(q, st, ready);
}

/* The hand-built screens render from their own state objects, so their painter is their render:
   idempotent, it draws exactly what the live clicks drew (answered steps locked with their
   feedback, pending picks and placements in place), and the hooks ignore it (resumeIsPainting).
   The class task's screens replay classtask.js's own handlers (_paintTask). */
function paintCustom(n) {
  if (n === 5 && CUSTOM_STATE[5] && typeof carRender === 'function') { carRender(); return; }
  if (n === 8 && CUSTOM_STATE[8] && typeof gRender === 'function') { gRender(); return; }
  if (CUSTOM_STATE[n] && document.querySelector('.ct-screen[data-screen="' + n + '"]')) _paintTask(n);
}

/* Every navigation repaints the target screen from state (engine.js goTo, after resetScreenState):
   the §8.4a hard-lock is "variables say answered, DOM says blank". Skipped while restoring —
   applyExecutionState paints explicitly after its second applyResumeVars. Never an empty catch. */
function repaintScreen(n) {
  if (_restoring) return;
  beginRepaint();
  try {
    restoreScreenUI(n);
    restoreEndedButton();   // D-8: the painter just re-enabled a finished component's button
  } catch (e) { console.error('[resume] repaintScreen', e); }
  finally { endRepaint(); }
}

/* Replay a saved payload onto this component. Two passes of applyResumeVars around goTo(); the
   sender is stubbed across the whole replay so nothing is re-reported; then the library is told
   about the restored answers (B-1 / seed) and the landing screen's item is opened exactly once.
   screenOverride (#screen=N) chooses the SCREEN only, never skips the restore (§8.4b). Both it and
   the saved screen are range-checked against THIS component: engine.js goTo() treats a screen
   outside [PART_FIRST, PART_LAST] as a request to leave the component. */
function applyExecutionState(st, screenOverride) {
  if (!st) return;
  _restoring = true;
  var _origSend = window.sendStatement720;
  window.sendStatement720 = function () {};
  var _inRange = function (v) { return typeof v === 'number' && v >= PART_FIRST && v <= PART_LAST; };
  try {
    applyResumeVars(st);
    var _n = _inRange(screenOverride) ? screenOverride
           : (_inRange(st.currentScreen) ? st.currentScreen : PART_FIRST);
    goTo(_n);
    applyResumeVars(st);
    applyResumeDom(st);
    restoreScreenUI(currentScreen);
    restoreEndedButton();
    /* The progress strip of the landing screen reads quizState, restored above */
    try { quizStepperUpdate(currentScreen); } catch (e) {}
  } catch (e) {
    console.error('[resume] apply', e);
  } finally {
    window.sendStatement720 = _origSend;
    _restoring = false;
  }
  try { xapiSeedAnsweredFromResume(); } catch (e) {}
  xapiCurrentItem = null;
  try { xapiOnScreen(currentScreen); } catch (e) {}
}

/* Pending answers are saved as they are made, not only on the next screen change (O-2 for this
   engine): a pick, a keystroke or a select change arms the debounced save. Bubble phase on
   document, so the element's own inline handler has already updated quizState. The class-task
   boxes are covered too (they carry ids, but the id list would have to name all of them). */
function initQuizFieldSaves() {
  var arm = function (e) {
    var t = e && e.target;
    if (t && t.closest && (t.closest('.quiz-screen') || t.closest('.ct-screen'))) scheduleResumeSave();
  };
  document.addEventListener('input', arm);
  document.addEventListener('change', arm);
  document.addEventListener('click', function (e) {
    if (e.target && e.target.closest && e.target.closest('.quiz-screen .scq-opt, .quiz-screen .stmt-pill')) scheduleResumeSave();
  });
}

/* The part's own boot, called once from 90-boot.js (was engine.js's DOMContentLoaded block):
   build the question screens, scale, land. The other unit-js files register their own
   DOMContentLoaded work, which runs before this (90-boot.js registers last). */
function partBoot() {
  if (typeof quizBuildScreens === 'function') quizBuildScreens();
  scaleApp();
  /* NOT a hard goTo(0): goTo() treats n < PART_FIRST as leaving the component. */
  goTo(firstScreen());
}
