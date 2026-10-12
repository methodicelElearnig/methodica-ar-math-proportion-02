/* Static contracts — no browser, no dependencies (guide §3, §6, §8.3, §10.2). Every check reads
 * the source as shipped:
 *   - every component's index.html: the same 17 tags, in the platform order, 90-boot.js last;
 *     one ?v= on every code reference, identical everywhere (§3.4); the boot cover first in <body>
 *   - 50-loader.js: the library letter inside the XAPI_USING_G gate (§3.5)
 *   - no top-level name declared in two files (§3.3); every file parses
 *   - script.js is data only
 *   - the character key and the result keys agree across unit.js, 40-resume.js and the stub
 *   - no donor unit's slug in code (comments may name the donor)
 *   - ids: XAPI_COMP_ID / XAPI_UNIT_ID = metadata byte for byte; SCREEN_TO_SUBCONTENT has exactly
 *     the component's screens and covers exactly the catalogue's items; XAPI_SCREEN_QUESTIONS asks
 *     every declared question exactly once and nothing undeclared; every quiz screen is mapped and
 *     asks a question; XAPI_EVAL_ITEMS = the items with questions; XAPI_GATE.need = the number the
 *     component's first screen promises
 *   - seam ordering in the core: goTo, quizCheck (report before marking, flush last), quizOpenHint
 *     (report after the done-guard), carNext, the guided first pick, taskCheck (§8.3, D-13)
 *   - the repo-only root launcher names a FILE (§5.2); .gitattributes pins LF
 *
 *   node _test/verify-report.js [repoRoot]
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT, UNIT, components, checker, readMeta } = require('./lib');
const { ok, report } = checker('verify-report');
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');

const ORDER = ['../unit-js/10-identity.js', '../unit-js/20-xapi.js', '../unit-js/40-resume.js', '../unit-js/50-loader.js',
  'script.js', '../unit-js/motion.js', '../unit-js/quiz-engine.js', '../unit-js/applet-dino.js', '../unit-js/classtask.js',
  '../unit-js/questions.js', '../unit-js/carousel.js', '../unit-js/guided.js', '../unit-js/unit.js',
  '../unit-js/report-modal.js', '../unit-js/engine.js', '../unit-js/70-platform.js', '../unit-js/90-boot.js'];
const comps = components();

/* ── markup ── */
const versions = new Set();
comps.forEach((c) => {
  const html = rd(c + '/index.html');
  const srcs = [...html.matchAll(/<script src="([^"?]+)(\?v=([^"]+))?"/g)].map((m) => m[1]);
  ok(c + ' script order', JSON.stringify(srcs) === JSON.stringify(ORDER), srcs.join(','));
  [...html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^"]+)"/g)].forEach((m) => {
    const v = /\?v=([^"&]+)/.exec(m[1]);
    ok(c + ' ?v= on ' + m[1].split('?')[0], !!v);
    if (v) versions.add(v[1]);
  });
  const body = html.slice(html.indexOf('<body'));
  ok(c + ' boot cover first in <body>, inline-styled', /^<body[^>]*>\s*<!--[\s\S]*?-->\s*<div id="boot-cover" style="[^"]+"><\/div>/.test(body));
  ok(c + ' one global flag', (html.match(/class="flag-btn"/g) || []).length === 1);
});
ok('one ?v= value everywhere', versions.size === 1, [...versions].join(','));

/* ── the library gate ── */
const loader = rd('unit-js/50-loader.js');
const lib = /var LIB720 = CDN \+ \(RESUME_ENABLED \? '(xapi-720-(\w)\.js)'/.exec(loader);
const gate = /XAPI_USING_G = \/xapi-720-\[(\w+)\]\\\.js\/\.test\(LIB720\)/.exec(loader);
ok('library letter is -k', lib && lib[2] === 'k', lib && lib[1]);
ok('the letter is inside the XAPI_USING_G regex', lib && gate && gate[1].includes(lib[2]), gate && gate[1]);

/* ── names and parsing ── */
const jsFiles = fs.readdirSync(path.join(ROOT, 'unit-js')).filter((f) => f.endsWith('.js')).map((f) => 'unit-js/' + f);
const names = {};
jsFiles.concat(comps.map((c) => c + '/script.js')).forEach((f) => {
  const src = rd(f);
  try { new vm.Script(src, { filename: f }); ok(f + ' parses', true); } catch (e) { ok(f + ' parses', false, e.message); }
  if (/\/script\.js$/.test(f) && !f.endsWith(comps[0] + '/script.js')) return;   // one script.js stands for all (same names)
  for (const m of src.matchAll(/^(?:function\s+([A-Za-z_$][\w$]*)|(?:var|let|const)\s+([A-Za-z_$][\w$]*))/gm)) {
    const n = m[1] || m[2]; (names[n] = names[n] || new Set()).add(f);
  }
});
const dup = Object.entries(names).filter(([, fs2]) => fs2.size > 1);
ok('no top-level name declared in two files', dup.length === 0, dup.map(([n, f]) => n + ' in ' + [...f].join('+')).join('; '));

/* ── script.js is data only: no function, no arrow, no call — declarations of literals ── */
comps.forEach((c) => {
  const code = stripComments(rd(c + '/script.js'));
  const m = /\bfunction\b|=>|[A-Za-z_$][\w$]*\s*\(/.exec(code);
  ok(c + ' script.js is data only', !m, m && m[0]);
});

/* ── keys ── */
const charKey = (s, re) => (re.exec(s) || [])[1];
const kUnit = charKey(rd('unit-js/unit.js'), /const CHARACTER_STORAGE_KEY = '([^']+)'/);
const kRes = charKey(rd('unit-js/40-resume.js'), /var UI_CHARACTER_KEY = '([^']+)'/);
const stub = rd('_test/xapi-720-k.js');
ok('character key: unit.js = 40-resume.js = per unit (D-6)', kUnit && kUnit === kRes && kUnit === UNIT.replace(/-/g, '_') + '_selectedCharacter', kUnit + ' / ' + kRes);
ok('the stub clears the same character key', stub.includes("'" + kRes + "'"));
const resultKeys = (/var RESULT_KEYS\s*=\s*\[([\s\S]*?)\]/.exec(rd('unit-js/40-resume.js')) || [])[1].match(/'[^']+'/g) || [];
ok('RESULT_KEYS: one per component', resultKeys.length === comps.length, resultKeys.length);
ok('RESULT_KEYS match partResultKey()', comps.every((c) => resultKeys.includes("'proportion02_c" + c.slice(-2) + "_result'")));
ok('the stub clears the same result keys', resultKeys.every((k) => stub.includes(k)));
ok('NAV_EDGE_KEY names this unit', rd('unit-js/40-resume.js').includes("NAV_EDGE_KEY = 'lomda_nav_edges::" + UNIT + "'"));

/* ── no donor slug in code ── */
jsFiles.concat(comps.map((c) => c + '/script.js'), ['_test/xapi-720-k.js']).forEach((f) => {
  const code = stripComments(rd(f));
  const m = /proportion[-_]?01|ratio-0\d|percent-0\d/.exec(code);
  ok(f + ' carries no donor slug in code', !m, m && m[0]);
});

/* ── ids and maps, against metadata/ ── */
const identity = rd('unit-js/10-identity.js');
const ctxBase = {};
vm.createContext(ctxBase);
vm.runInContext('var window = this;' + identity.replace(/var DEV_NAV[\s\S]*$/, ''), ctxBase);
const unitMeta = readMeta(UNIT + '_unit');
ok('XAPI_UNIT_ID = metadata unit id', ctxBase.XAPI_UNIT_ID === unitMeta.id, ctxBase.XAPI_UNIT_ID);
const QSRC = rd('unit-js/questions.js');
const quizScreens = [...QSRC.matchAll(/^\s{4}screen:\s*(\d+),/gm)].map((m) => Number(m[1]));
comps.forEach((c) => {
  const ctx = { XAPI_ID_PREFIX: ctxBase.XAPI_ID_PREFIX, window: {} };
  vm.createContext(ctx);
  vm.runInContext(rd(c + '/script.js').replace(/^'use strict';/, ''), ctx);
  const M = readMeta(c);
  const P = ctx.window.PART_CONFIG;
  ok(c + ' XAPI_COMP_ID = metadata id', ctx.XAPI_COMP_ID === M.id, ctx.XAPI_COMP_ID + ' vs ' + M.id);
  ok(c + ' XAPI_COMP_SLUG = folder', ctx.XAPI_COMP_SLUG === c);
  ok(c + ' XAPI_METADATA_FILE', ctx.XAPI_METADATA_FILE === '../metadata/' + c + '.json');
  ok(c + ' learningUnitId = unit id', M.learningUnitId === unitMeta.id);
  const map = ctx.SCREEN_TO_SUBCONTENT || {};
  const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
  const want = []; for (let n = P.start; n <= P.end; n++) want.push(n);
  ok(c + ' SCREEN_TO_SUBCONTENT has exactly screens ' + P.start + '-' + P.end, JSON.stringify(keys) === JSON.stringify(want), keys.join(','));
  const sfx = (id) => String(id).replace(/\/+$/, '').slice(-3);
  const metaItems = new Set(M.subContent.map((s) => sfx(s.id)));
  const mapped = new Set(Object.values(map).filter(Boolean).map((v) => v[0]));
  ok(c + ' every catalogue item has a screen', [...metaItems].every((i) => mapped.has(i)), [...metaItems].filter((i) => !mapped.has(i)).join(','));
  ok(c + ' every mapped item is in the catalogue', [...mapped].every((i) => metaItems.has(i)), [...mapped].filter((i) => !metaItems.has(i)).join(','));
  M.subContent.forEach((s) => ok(c + ' item id shape ' + sfx(s.id), s.id === M.id + c + '-' + sfx(s.id) + '/', s.id));
  /* questions: asked exactly once each, nothing undeclared */
  const declared = {}; M.subContent.forEach((s) => (s.questions || []).forEach((q) => {
    ok(c + ' question id prefixed by its item', q.questionId.startsWith(s.id), q.questionId);
    declared[sfx(s.id) + '/' + q.questionId.split('/').pop()] = 0;
  }));
  const sq = ctx.XAPI_SCREEN_QUESTIONS || {};
  Object.keys(sq).forEach((n) => {
    ok(c + ' s' + n + ' asks questions only on a mapped screen', !!map[n], n);
    if (!map[n]) return;
    sq[n].forEach((k) => {
      const key = map[n][0] + '/' + k;
      ok(c + ' s' + n + ' asks a declared question ' + key, key in declared, key);
      if (key in declared) declared[key]++;
    });
  });
  Object.entries(declared).forEach(([k, v]) => ok(c + ' ' + k + ' asked exactly once', v === 1, v));
  quizScreens.filter((n) => n >= P.start && n <= P.end).forEach((n) => ok(c + ' quiz s' + n + ' is mapped and asks', !!map[n] && !!(sq[n] && sq[n].length)));
  const evalSet = Object.keys(ctx.XAPI_EVAL_ITEMS || {}).sort();
  const withQs = M.subContent.filter((s) => (s.questions || []).length).map((s) => sfx(s.id)).sort();
  ok(c + ' XAPI_EVAL_ITEMS = the items with questions', JSON.stringify(evalSet) === JSON.stringify(withQs), evalSet + ' vs ' + withQs);
  /* the gate = what the first screen promises */
  const html = rd(c + '/index.html');
  const first = (new RegExp('<section[^>]*data-screen="' + P.start + '"[^>]*>([\\s\\S]*?)</section>').exec(html) || [])[1] || '';
  const text = first.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const promise = /(?:על|ב\s*-\s*)\s*(\d+)\s*(?:שאלות\s*)?(?:לפחות|ומעלה)/.exec(text);
  const g = ctx.XAPI_GATE;
  if (promise) ok(c + ' XAPI_GATE.need = the promise on s' + P.start + ' (' + promise[1] + ')', g && g.need === Number(promise[1]), g && g.need);
  else ok(c + ' no promise on screen -> no gate', !g);
  /* "יש בה N סעיפים" must count the component's own question screens (07 said 5 over six, fixed 2026-10-12) */
  const sections = /יש בה\s*(\d+)\s*סעיפים/.exec(text);
  if (sections) ok(c + ' s' + P.start + ' "' + sections[1] + ' סעיפים" = the question screens', Number(sections[1]) === Object.keys(sq).length, Object.keys(sq).length);
  if (g && g.at != null) ok(c + ' the gate screen is a mapped quiz screen in range', g.at >= P.start && g.at <= P.end && quizScreens.includes(g.at));
});

/* ── seam ordering in the core (§8.3, D-13) ── */
const fnBody = (src, name) => {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) return '';
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (!d) return src.slice(j, k + 1); } }
  return '';
};
const before = (s, a, b) => s.indexOf(a) >= 0 && s.indexOf(b) >= 0 && s.indexOf(a) < s.indexOf(b);
const eng = rd('unit-js/engine.js'), qe = rd('unit-js/quiz-engine.js');
const goTo = fnBody(eng, 'goTo');
ok('goTo: gate first', goTo.indexOf('partGateBlocks') > 0 && goTo.indexOf('partGateBlocks') < goTo.indexOf('PART_CONFIG.end'));
ok('goTo: resetScreenState, then repaint, item, save', before(goTo, 'resetScreenState(n)', 'repaintScreen(n)') && before(goTo, 'repaintScreen(n)', 'xapiOnScreen(n)') && before(goTo, 'xapiOnScreen(n)', 'scheduleResumeSave()'));
ok('goTo: part edges go to partExit', (stripComments(goTo).match(/partExit\([+-]1\)/g) || []).length === 2);
const qc = fnBody(qe, 'quizCheck');
ok('quizCheck: reported before any marking', before(qc, 'onQuizAnswered', 'quizMarkOutcome') && before(qc, 'onQuizAnswered', 'quizMarkRetry'));
const qcCode = stripComments(qc);
ok('quizCheck: flush after the last commitment', qcCode.lastIndexOf('onQuizCommitted(screen)') > qcCode.lastIndexOf('st.lw =') && qcCode.lastIndexOf('onQuizCommitted(screen)') > qcCode.lastIndexOf('quizFinish('));
ok('quizCheck: lw set before quizMarkRetry clears the pick', before(qc, 'st.lw = quizSig', 'quizMarkRetry'));
const qh = fnBody(qe, 'quizOpenHint');
ok('quizOpenHint: reported after the done-guard, before the overlay opens', before(qh, 'if (st.done) return;', 'onQuizHint') && before(qh, 'onQuizHint', "classList.remove('hidden')"));
['quizSelect', 'quizInputChange', 'quizDualChange', 'quizDropdownChange', 'quizStatementPick'].forEach((f) => {
  const b = fnBody(qe, f);
  ok(f + ': every check-button write goes through quizCheckBlocked', !/-check`\)\.disabled = (?!quizCheckBlocked)/.test(b));
});
const car = fnBody(rd('unit-js/carousel.js'), 'carNext');
ok('carNext: reported right after the answer is set', before(car, "carState.answered[i] = ok ? 'ok' : 'no';", 'onCarAnswered'));
ok('carRender: mirrors the state at its end', /onCarChanged\(\)[\s\S]{0,120}\}\s*$/.test(fnBody(rd('unit-js/carousel.js'), 'carRender')));
const gr = fnBody(rd('unit-js/guided.js'), 'gRender');
ok('guided: only the FIRST pick is reported', /const first = gState\.picked\[i\] === undefined;[\s\S]*if \(first && typeof onGuidedAnswered/.test(gr));
const tc = fnBody(rd('unit-js/classtask.js'), 'taskCheck');
ok('taskCheck: flush after done is set', before(tc, 'st.done = true;\n  const btn', 'onTaskChecked'));
const pl = rd('unit-js/70-platform.js');
['onQuizCommitted', 'onCarAnswered', 'onGuidedAnswered', 'onTaskChecked'].forEach((f) => {
  const b = fnBody(pl, f);
  ok(f + ' flushes', /flushResumeSave\(\)/.test(b));
});
['onCarAnswered', 'onGuidedAnswered', 'onTaskChecked', 'onCarChanged', 'onGuidedChanged'].forEach((f) =>
  ok(f + ' ignores a painter replay', /resumeIsPainting\(\)/.test(fnBody(pl, f))));
ok('RESUME_Q_FIELDS carry lw and tgl', /RESUME_Q_FIELDS = \[[^\]]*'lw'[^\]]*'tgl'/.test(pl));

/* ── repo hygiene ── */
const root = rd('index.html');
ok('root launcher names a FILE, keeps the query', root.includes("'./" + UNIT + "-01/index.html' + window.location.search"));
ok('.gitattributes pins LF', /\* text=auto eol=lf/.test(rd('.gitattributes')));
ok('.gitignore keeps the Kata key out', /kata-api-key\.txt/.test(rd('.gitignore')));

report();
