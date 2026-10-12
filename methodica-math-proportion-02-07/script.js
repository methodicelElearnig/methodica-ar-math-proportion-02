'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02-07 — רכיב 07 מתוך 7 · שקופיות 78-86 — שאלת שיא ב

   CONFIGURATION ONLY. Every behaviour is shared in ../unit-js/.
   The split follows the deck's own "רכיב N" separator slides.
   ═══════════════════════════════════════════════════════════════════ */
/* next/prev are folder paths; engine.js appends index.html (the CDN serves a folder URL as 0 bytes).
   Used only by DEV_NAV walkthroughs (?dev=1) — in production the platform routes (guide §8.12). */
window.PART_CONFIG = { start: 51, end: 59, next: null, prev: "../methodica-math-proportion-02-06/" };

/* ═══════════════════ xAPI (720) — this component's configuration ═══════════════════
   Data only; the shared layer in ../unit-js/ reads it at CALL time. Ids must match
   ../metadata/methodica-math-proportion-02-07.json byte-for-byte (the loader shouts on a mismatch). */
var XAPI_COMP_SLUG     = 'methodica-math-proportion-02-07';
var XAPI_COMP_ID       = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-proportion-02-07.json';

/* Screen -> [item, page in item]. 51 is the transition and 59 the closing picture: no item. The
   peak question is ONE item: its story (52) and its six sections, one screen each. */
var SCREEN_TO_SUBCONTENT = {
  51: null,
  52: ['001', 1],
  53: ['001', 2],
  54: ['001', 3],
  55: ['001', 4],
  56: ['001', 5],
  57: ['001', 6],
  58: ['001', 7],
  59: null
};

/* Screen -> the catalogue questions it answers. */
var XAPI_SCREEN_QUESTIONS = {
  53: ['q1'],
  54: ['q2'],
  55: ['q3'],
  56: ['q4'],
  57: ['q5'],
  58: ['q6']
};

var XAPI_EVAL_ITEMS = { '001': 1 };

/* s51 promises "יש בה 6 סעיפים. עליכם להצליח ב-4 לפחות": the six section screens, need 4.
   (Until 2026-10-12 the text said 5 sections — the screens (א-ו) and the metadata (q1-q6) always
   had six; decided by the team: 4 of 6, the text fixed.) */
var XAPI_GATE = { of: 'screens', need: 4 };
