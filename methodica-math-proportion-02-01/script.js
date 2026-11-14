'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-math-proportion-02-01 — רכיב 01 מתוך 7 · שקופיות 3-32 — הוק והקנייה

   CONFIGURATION ONLY. Every behaviour is shared in ../unit-js/.
   The split follows the deck's own "רכיב N" separator slides.
   ═══════════════════════════════════════════════════════════════════ */
/* next/prev are folder paths; engine.js appends index.html (the CDN serves a folder URL as 0 bytes).
   Used only by DEV_NAV walkthroughs (?dev=1) — in production the platform routes (guide §8.12). */
window.PART_CONFIG = { start: 0, end: 11, next: "../methodica-math-proportion-02-02/", prev: null };

/* ═══════════════════ xAPI (720) — this component's configuration ═══════════════════
   Data only; the shared layer in ../unit-js/ reads it at CALL time. Ids must match
   ../metadata/methodica-math-proportion-02-01.json byte-for-byte (the loader shouts on a mismatch). */
var XAPI_COMP_SLUG     = 'methodica-math-proportion-02-01';
var XAPI_COMP_ID       = XAPI_ID_PREFIX + XAPI_COMP_SLUG + '/';
var XAPI_METADATA_FILE = '../metadata/methodica-math-proportion-02-01.json';

/* Screen -> [item, page in item] (guide §6.2). 0 is the character pick and 9 a transition: no item.
   001 the story hook (1-4) · 002 the carousel s5 (twelve steps, four graded) · 003 the video ·
   004 the guided exercise (7 intro, 8 the seven-step flow) · 005 / 006 the two warm-ups. */
var SCREEN_TO_SUBCONTENT = {
  0: null,
  1: ['001', 1],
  2: ['001', 2],
  3: ['001', 3],
  4: ['001', 4],
  5: ['002', 1],
  6: ['003', 1],
  7: ['004', 1],
  8: ['004', 2],
  9: null,
  10: ['005', 1],
  11: ['006', 1]
};

/* Screen -> the catalogue questions it answers (metadata questions[].questionId, last segment).
   s5: the carousel's graded steps 4, 6, 9, 10 in order are q1-q4 (70-platform.js onCarAnswered);
   s8, the guided exercise (item 004 "נפתור יחד", steps 3 and 5), reports nothing since 2026-11-14:
   unit owner's rule of 10.11 (QA/2026-11-10-guided-items/GUIDED-ITEMS-REPORT.md, group A; as ratio-05
   a572ab3 and ratio-04 f46ec27). Kata declares no question on 01-004; the picks are still kept and
   saved for resume (onGuidedChanged → flushResumeSave), onGuidedAnswered finds no key and sends nothing. */
var XAPI_SCREEN_QUESTIONS = {
  5: ['q1', 'q2', 'q3', 'q4'],
  10: ['q1'],
  11: ['q1']
};

/* Items carrying a code-graded question (used as a set). 001 and 003 have none; 004, the guided
   exercise, is out since 2026-11-14 (see above): its 'completed' carries no result, and part 01
   scores on the six catalogue questions (002 q1-q4, 005 q1, 006 q1) instead of eight. */
var XAPI_EVAL_ITEMS = { '002': 1, '005': 1, '006': 1 };
