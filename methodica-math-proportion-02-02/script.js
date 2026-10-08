'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02-02 — רכיב 02 מתוך 7 · שקופיות 34-38 — תרגול סטנדרטי

   CONFIGURATION ONLY. Every behaviour is shared in ../unit-js/.
   The split follows the deck's own "רכיב N" separator slides.
   ═══════════════════════════════════════════════════════════════════ */
/* next/prev are folder paths; engine.js appends index.html (the CDN serves a folder URL as 0 bytes).
   Used only by DEV_NAV walkthroughs (?dev=1) — in production the platform routes (guide §8.12). */
window.PART_CONFIG = { start: 12, end: 16, next: "../methodica-math-proportion-02-03/", prev: "../methodica-math-proportion-02-01/" };

/* ═══════════════════ xAPI (720) — this component's configuration ═══════════════════
   Data only; the shared layer in ../unit-js/ reads it at CALL time. Ids must match
   ../metadata/methodica-math-proportion-02-02.json byte-for-byte (the loader shouts on a mismatch). */
var XAPI_COMP_SLUG     = 'methodica-math-proportion-02-02';
var XAPI_COMP_ID       = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-proportion-02-02.json';

/* Screen -> [item, page in item]. 12 is the transition: no item. One item per stepper station. */
var SCREEN_TO_SUBCONTENT = {
  12: null,
  13: ['001', 1],
  14: ['002', 1],
  15: ['003', 1],
  16: ['004', 1]
};

/* Screen -> the catalogue questions it answers. */
var XAPI_SCREEN_QUESTIONS = {
  13: ['q1'],
  14: ['q1'],
  15: ['q1'],
  16: ['q1']
};

/* Items carrying a code-graded question (used as a set). */
var XAPI_EVAL_ITEMS = { '001': 1, '002': 1, '003': 1, '004': 1 };

/* s12 promises "נענה על 4 שאלות · צריך לענות נכון על 3 שאלות לפחות": the 4 items, need 3. Checked
   at the component's end; below it the component reports success:false and the platform routes
   (guide §6.4). Nothing on screen says the learner is stopped, so the gate has no `at`. */
var XAPI_GATE = { of: 'items', need: 3 };
