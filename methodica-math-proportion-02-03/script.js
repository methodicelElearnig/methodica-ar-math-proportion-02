'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02-03 — רכיב 03 מתוך 7 · שקופיות 40-49 — תרגול בסיסי וסטנדרטי ב

   CONFIGURATION ONLY. Every behaviour is shared in ../unit-js/.
   The split follows the deck's own "רכיב N" separator slides.
   ═══════════════════════════════════════════════════════════════════ */
/* next/prev are folder paths; engine.js appends index.html (the CDN serves a folder URL as 0 bytes).
   Used only by DEV_NAV walkthroughs (?dev=1) — in production the platform routes (guide §8.12). */
window.PART_CONFIG = { start: 17, end: 26, next: "../methodica-math-proportion-02-04/", prev: "../methodica-math-proportion-02-02/" };

/* ═══════════════════ xAPI (720) — this component's configuration ═══════════════════
   Data only; the shared layer in ../unit-js/ reads it at CALL time. Ids must match
   ../metadata/methodica-math-proportion-02-03.json byte-for-byte (the loader shouts on a mismatch). */
var XAPI_COMP_SLUG     = 'methodica-math-proportion-02-03';
var XAPI_COMP_ID       = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-proportion-02-03.json';

/* Screen -> [item, page in item]. 17 and 24 are transitions: no item. 001 and 002 each span two
   screens (א, ב). */
var SCREEN_TO_SUBCONTENT = {
  17: null,
  18: ['001', 1],
  19: ['001', 2],
  20: ['002', 1],
  21: ['002', 2],
  22: ['003', 1],
  23: ['004', 1],
  24: null,
  25: ['005', 1],
  26: ['006', 1]
};

/* Screen -> the catalogue questions it answers. s26's three boxes are ONE declared question. */
var XAPI_SCREEN_QUESTIONS = {
  18: ['q1'],
  19: ['q2'],
  20: ['q1'],
  21: ['q2'],
  22: ['q1'],
  23: ['q1'],
  25: ['q1'],
  26: ['q1']
};

/* Items carrying a code-graded question (used as a set). */
var XAPI_EVAL_ITEMS = { '001': 1, '002': 1, '003': 1, '004': 1, '005': 1, '006': 1 };

/* s17 promises "4 שאלות … ענו נכון על 3 שאלות ומעלה כדי להתקדם": the four stepper stations
   (items 001-004, an item correct when all its questions are), need 3. "כדי להתקדם" makes it the
   gate that ENDS the component on s23, the last of the four, below the bar (70-platform.js
   partGateBlocks) — success:false, and the metadata's recommendedAfterFail sends the learner back
   to 02. At or above the bar the learner goes on to s24-s26 and the component ends on s26. */
var XAPI_GATE = { of: 'items', items: ['001', '002', '003', '004'], need: 3, at: 23 };
