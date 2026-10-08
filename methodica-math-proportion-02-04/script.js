'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02-04 — רכיב 04 מתוך 7 · שקופיות 51-58 — משימת כיתה

   CONFIGURATION ONLY. Every behaviour is shared in ../unit-js/.
   The split follows the deck's own "רכיב N" separator slides.
   ═══════════════════════════════════════════════════════════════════ */
/* next/prev are folder paths; engine.js appends index.html (the CDN serves a folder URL as 0 bytes).
   Used only by DEV_NAV walkthroughs (?dev=1) — in production the platform routes (guide §8.12). */
window.PART_CONFIG = { start: 27, end: 34, next: "../methodica-math-proportion-02-05/", prev: "../methodica-math-proportion-02-03/" };

/* ═══════════════════ xAPI (720) — this component's configuration ═══════════════════
   Data only; the shared layer in ../unit-js/ reads it at CALL time. Ids must match
   ../metadata/methodica-math-proportion-02-04.json byte-for-byte (the loader shouts on a mismatch). */
var XAPI_COMP_SLUG     = 'methodica-math-proportion-02-04';
var XAPI_COMP_ID       = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-proportion-02-04.json';

/* Screen -> [item, page in item]. 27 is the transition: no item. The class task is one catalogue
   item over its seven screens. */
var SCREEN_TO_SUBCONTENT = {
  27: null,
  28: ['001', 1],
  29: ['001', 2],
  30: ['001', 3],
  31: ['001', 4],
  32: ['001', 5],
  33: ['001', 6],
  34: ['001', 7]
};

/* The class task declares no catalogue question: it is checked on screen against the deck's keys
   (classtask.js) but never 'answered', and the component reports success with no score (§6.4). */
var XAPI_SCREEN_QUESTIONS = {};
var XAPI_EVAL_ITEMS = {};
