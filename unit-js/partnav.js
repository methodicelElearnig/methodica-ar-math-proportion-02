/* GENERATED COPY -- DO NOT EDIT.
   Source of truth: _nav-engine/partnav.js (canonical engine copy).
   Edit there, then re-run _nav-engine/sync-partnav.ps1. */
/* ═══════════════════════════════════════════════════════════
   Cross-part navigation trail — partnav.js
   Canonical engine script (source of truth: _nav-engine/partnav.js).
   Shared verbatim by every part of methodica-math-proportion-02.

   WHY THIS EXISTS
   Each part is its own page, so a part's FIRST screen has no sibling
   screen to go back to — every part's S0 therefore shipped without a
   Back button. But the learning journey is a graph, not a line: part
   04 is reached from part 02 (practice passed, remediation skipped)
   OR from part 03 (remediation completed), and "back" has to mean
   whichever one the learner actually came through. That cannot be
   derived from the part number alone, so the crossing is RECORDED as
   it happens and read back on the next page.

   THE TRAIL
   sessionStorage (per tab, gone on tab close — a fresh session must
   not show a stale Back button) holds an array of
     { part: '02', screen: 7 }
   entries, one per part boundary the learner has crossed, in order.
   Every cross-part redirect goes through forward(), which pushes the
   part being LEFT plus the screen it was left from. back() pops the
   last entry and returns there, so the trail always mirrors the real
   route rather than the nominal part order.

   Empty trail = the part was opened directly (deep link / dev / LMS
   entry point) = there is genuinely nowhere to go back to, and the
   Back button stays hidden. That is the whole visibility rule.

   RE-CROSSING FORWARD (forwardOverride)
   Going back lands the learner on the previous part's last screen on
   a FRESH page: none of the in-page state that decided that part's
   exit survives (per-screen state restoration is deliberately out of
   scope here — it belongs to the resume branch). Re-judging the exit
   on empty state would be wrong and in two places actively harmful:
   part 02 would route a learner who had passed into remediation, and
   part 03/05 would refuse to let them out at all. So a page entered
   via back() remembers where it was entered FROM, and re-crossing the
   same boundary skips the gates instead of re-evaluating them — the
   learner already earned that passage on the way through.
   KNOWN LIMIT (same out-of-scope reason): this covers the part's own
   exit only. A learner who goes back INTO a part and then keeps
   navigating backwards inside it can still meet that part's internal
   gates (e.g. part 03's S9 basic-practice gate) with the same empty
   state. Resolved by state restoration, not here.
   ═══════════════════════════════════════════════════════════ */
var PartNav = (function () {
  'use strict';

  /* Sibling-folder layout — the same relative path every cross-part
     redirect in this project already used literally. */
  const FOLDER_PREFIX = '../methodica-math-proportion-02-';
  /* Namespaced like CHARACTER_STORAGE_KEY, for the same reason: an LMS
     may host several lomdot on one origin.
     These read percent_02 in both earlier projects — copied along with the
     engine and never repointed, so proportion-01 and percent-02 share one
     nav trail whenever they are served from the same origin. Corrected here;
     fixing it in those projects is a separate task. */
  const TRAIL_KEY  = 'methodica_math_proportion_02_navTrail';
  const RETURN_KEY = 'methodica_math_proportion_02_navReturn';
  /* Defensive cap only. The real trail is at most one entry per part. */
  const MAX_TRAIL  = 16;

  let PART = null;                 // this page's part id, e.g. '04'
  let getScreen = function () { return 0; };
  let forwardTo = null;            // set only when entered via back()

  /* Storage access is wrapped everywhere: a sandboxed iframe or a
     privacy mode can make sessionStorage throw on ACCESS, not just on
     write. Every failure degrades to "no trail" = no Back button. */
  function store() {
    try { return window.sessionStorage; } catch (e) { return null; }
  }
  function read(key) {
    const s = store();
    if (!s) return null;
    try {
      const raw = s.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function write(key, value) {
    const s = store();
    if (!s) return;
    try {
      if (value === null) s.removeItem(key);
      else s.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function trail() {
    const t = read(TRAIL_KEY);
    return Array.isArray(t) ? t : [];
  }
  function partUrl(part) { return FOLDER_PREFIX + part + '/index.html'; }

  /* ── Public API ─────────────────────────────────────────── */

  /* Called once per page, AFTER the part's own initial screen setup
     (see the call site in each main.js): if this page was entered via
     Back, it jumps straight to the screen the learner left from, which
     must happen through the part's own goTo() so the screen gets its
     normal activate + reveal + resetScreenState treatment.

     The jump is DEFERRED to a microtask, and that is not optional: the
     landing screen's resetScreenState() reads that screen's own state
     variables, which in every part are `let`s declared FURTHER DOWN
     main.js than the init() call site. Jumping synchronously hits them
     in the temporal dead zone and throws, which aborts the rest of
     main.js and leaves the page half-initialised (observed on part 02:
     "Cannot access 's7Done' before initialization"). Deferring runs the
     jump once main.js has finished executing — still inside the same
     load task, so nothing has painted yet and there is no flash of S0.
     forwardTo is set synchronously, so forwardOverride() is correct
     immediately regardless. */
  function init(opts) {
    opts = opts || {};
    PART = String(opts.part);
    if (typeof opts.getScreen === 'function') getScreen = opts.getScreen;

    /* An explicit ?screen= wins over a pending cross-part return. The
       return entry is STORED STATE from an earlier session; the query
       string is what the caller asked for right now. Without this guard
       the jump below fires in a microtask AFTER the deep link has already
       run, silently putting the page back on screen 0 — which is how the
       layout checkers came to measure part 02 and part 03's FIRST screen
       for every screen they thought they were checking, and reported them
       clean because nothing matched. */
    try {
      if (new URLSearchParams(window.location.search).has('screen')) return;
    } catch (e) { /* no URLSearchParams: fall through to the normal path */ }

    const pending = read(RETURN_KEY);
    if (!pending || pending.part !== PART) return;
    write(RETURN_KEY, null);              // one-shot: consumed on arrival
    forwardTo = pending.forwardTo || null;
    if (typeof opts.goTo !== 'function' || typeof pending.screen !== 'number') return;
    const jump = function () { opts.goTo(pending.screen); };
    if (typeof queueMicrotask === 'function') queueMicrotask(jump);
    else setTimeout(jump, 0);
  }

  /* Cross a part boundary forward. Replaces the bare
     `window.location.href = '../methodica-math-proportion-01-NN/index.html'`
     every part used to do inline — same navigation, plus the trail
     entry that makes the destination's Back button work. */
  function forward(part) {
    part = String(part);
    const t = trail();
    /* A cycle would otherwise grow the trail forever. There is no cycle
       in the current routing map; this keeps the trail a true path if
       one is ever added. */
    const seenAt = t.findIndex(function (e) { return e && e.part === part; });
    if (seenAt !== -1) t.length = seenAt;
    t.push({ part: PART, screen: getScreen() });
    while (t.length > MAX_TRAIL) t.shift();
    write(TRAIL_KEY, t);
    forwardTo = null;
    window.location.href = partUrl(part);
  }

  function canGoBack() { return trail().length > 0; }

  /* Cross a part boundary backwards, to the last screen of the part the
     learner actually arrived from. No-op (not an error) on an empty
     trail, so a stray keyboard ArrowRight on S0 behaves exactly as it
     did before this module existed. */
  function back() {
    const t = trail();
    const entry = t.pop();
    if (!entry || !entry.part) return;
    write(TRAIL_KEY, t);
    write(RETURN_KEY, {
      part: entry.part,
      screen: typeof entry.screen === 'number' ? entry.screen : 0,
      forwardTo: PART               // so that part can re-cross forward
    });
    window.location.href = partUrl(entry.part);
  }

  /* The part this page was entered FROM via Back, or null. See
     "RE-CROSSING FORWARD" in the header comment. */
  function forwardOverride() { return forwardTo; }

  /* Show/hide a first-screen Back button to match trail state. Called
     from the part's resetScreenState(0) so it is correct on initial
     load and on every return to S0 from within the part. */
  function mountBack(id) {
    const btn = document.getElementById(id || 's0-back');
    if (btn) btn.classList.toggle('hidden', !canGoBack());
  }

  return {
    init: init,
    forward: forward,
    back: back,
    canGoBack: canGoBack,
    forwardOverride: forwardOverride,
    mountBack: mountBack
  };
})();
