'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02-06 — רכיב 06 מתוך 7 · שקופיות 71-76 — שאלת שיא א

   CONFIGURATION ONLY. Every behaviour is shared in ../unit-js/.
   The split follows the deck's own "רכיב N" separator slides.
   ═══════════════════════════════════════════════════════════════════ */
/* next/prev are folder paths; engine.js appends index.html (the CDN serves a folder URL as 0 bytes).
   Used only by DEV_NAV walkthroughs (?dev=1) — in production the platform routes (guide §8.12). */
window.PART_CONFIG = { start: 45, end: 50, next: "../methodica-math-proportion-02-07/", prev: "../methodica-math-proportion-02-05/" };

/* ═══════════════════ xAPI (720) — this component's configuration ═══════════════════
   Data only; the shared layer in ../unit-js/ reads it at CALL time. Ids must match
   ../metadata/methodica-math-proportion-02-06.json byte-for-byte (the loader shouts on a mismatch). */
var XAPI_COMP_SLUG     = 'methodica-math-proportion-02-06';
var XAPI_COMP_ID       = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-proportion-02-06.json';

/* Screen -> [item, page in item]. 45 is the transition: no item. The peak question is ONE item,
   its five sections one screen each. */
var SCREEN_TO_SUBCONTENT = {
  45: null,
  46: ['001', 1],
  47: ['001', 2],
  48: ['001', 3],
  49: ['001', 4],
  50: ['001', 5]
};

/* Screen -> the catalogue questions it answers. */
var XAPI_SCREEN_QUESTIONS = {
  46: ['q1'],
  47: ['q2'],
  48: ['q3'],
  49: ['q4'],
  50: ['q5']
};

var XAPI_EVAL_ITEMS = { '001': 1 };

/* s45 promises "יש בה 5 סעיפים. עליכם להצליח ב-4 לפחות": the five section screens, need 4. */
var XAPI_GATE = { of: 'screens', need: 4 };
