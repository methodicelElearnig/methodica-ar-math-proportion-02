'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02-05 — רכיב 05 מתוך 7 · שקופיות 60-69 — תרגול מתקדם

   CONFIGURATION ONLY. Every behaviour is shared in ../unit-js/.
   The split follows the deck's own "רכיב N" separator slides.
   ═══════════════════════════════════════════════════════════════════ */
/* next/prev are folder paths; engine.js appends index.html (the CDN serves a folder URL as 0 bytes).
   Used only by DEV_NAV walkthroughs (?dev=1) — in production the platform routes (guide §8.12). */
window.PART_CONFIG = { start: 35, end: 44, next: "../methodica-math-proportion-02-06/", prev: "../methodica-math-proportion-02-04/" };

/* ═══════════════════ xAPI (720) — this component's configuration ═══════════════════
   Data only; the shared layer in ../unit-js/ reads it at CALL time. Ids must match
   ../metadata/methodica-math-proportion-02-05.json byte-for-byte (the loader shouts on a mismatch). */
var XAPI_COMP_SLUG     = 'methodica-math-proportion-02-05';
var XAPI_COMP_ID       = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-proportion-02-05.json';

/* Screen -> [item, page in item]. 35 is the transition: no item. 002 spans three screens (א ב ג),
   003 two; 005 is the closing "שיטות מדידה" pair, no question. */
var SCREEN_TO_SUBCONTENT = {
  35: null,
  36: ['001', 1],
  37: ['002', 1],
  38: ['002', 2],
  39: ['002', 3],
  40: ['003', 1],
  41: ['003', 2],
  42: ['004', 1],
  43: ['005', 1],
  44: ['005', 2]
};

/* Screen -> the catalogue questions it answers. */
var XAPI_SCREEN_QUESTIONS = {
  36: ['q1'],
  37: ['q1'],
  38: ['q2'],
  39: ['q3'],
  40: ['q1'],
  41: ['q2'],
  42: ['q1']
};

/* Items carrying a code-graded question (used as a set). Nothing on screen sets a bar: the
   component scores correct ÷ declared and succeeds. */
var XAPI_EVAL_ITEMS = { '001': 1, '002': 1, '003': 1, '004': 1 };
