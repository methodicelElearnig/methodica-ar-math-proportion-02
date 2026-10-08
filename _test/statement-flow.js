/* Statement flow, real Chrome + the stub library (?xapiLib=../_test/xapi-720-k.js).
 * Every component walked end to end answering everything (right; and wrong for the gated 02, 03,
 * 06), the component ended with its own last click, and the statement log checked against
 * metadata/: one component initialized / completed with the expected result, every item opened
 * and completed exactly once after its answers, every declared question one answered.last with
 * the right success, every id present in the catalogue, no duplicate, no navigation; 03 below its
 * bar ends on s23 and never opens 005 / 006 (guide §6.4, §6.8).
 *
 *   node _test/statement-flow.js [repoRoot]
 */
'use strict';
const { UNIT, LIB, serve, launch, sleep, checker, watchErrors, ready, readMeta } = require('./lib');
const { ok, report } = checker('statement-flow');

/* In-page: answer one screen through the screen's own handlers. mode 'right' | 'wrong'. */
const ANSWER = async (n, mode) => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  if (currentScreen !== n) goTo(n);
  await wait(60);
  const q = QUESTIONS.find((x) => x.screen === n);
  if (q && quizState[n] && !quizState[n].done) {
    const tries = mode === 'right' ? 1 : q.maxAttempts;
    for (let t = 0; t < tries; t++) {
      if (q.type === 'single') {
        const opts = [...document.querySelectorAll('#q' + n + ' .scq-opt')];
        const wrong = opts.filter((o) => o.dataset.id !== String(q.correct));
        quizSelect(n, mode === 'right' ? opts.find((o) => o.dataset.id === String(q.correct)) : wrong[t % wrong.length]);
      } else {
        const ins = [...document.querySelectorAll('#q' + n + ' .vi-input')];
        ins.forEach((inp, i) => { inp.value = mode === 'right' ? String(q.correctInputs[i]) : String(9870 + t); });
        quizInputChange(n);
      }
      const btn = document.getElementById('q' + n + '-check');
      if (btn.disabled) return 'check disabled on s' + n;
      btn.click();
      await wait(40);
    }
    return 'ok';
  }
  if (n === 5) {                                     // the carousel
    for (let i = carState.step; i <= CAR.length; i++) {
      const g = CAR[i - 1].grade;
      if (g && !carState.answered[i]) {
        if (g.kind === 'drag') {
          const slots = g.slots || [1, 2, 3];
          const vals = mode === 'right' ? g.correct : g.correct.slice().reverse();
          carState.placed[i] = {}; slots.forEach((s, k) => { carState.placed[i][String(s)] = vals[k]; });
        } else {
          const all = g.opts.map((_, k) => k);
          carState.picked[i] = mode === 'right' ? g.correct.slice() : [all.find((k) => !g.correct.includes(k))];
        }
        carRender(); document.getElementById('car-next').click(); await wait(20);
      }
      if (i < CAR.length) { document.getElementById('car-next').click(); await wait(20); }
    }
    return 'ok';
  }
  if (n === 8) {                                     // the guided flow
    for (let i = gState.step; i <= GUIDED.length; i++) {
      const cfg = GUIDED[i - 1];
      if (cfg.opts && gState.picked[i] === undefined) {
        const k = mode === 'right' ? cfg.correct : cfg.opts.findIndex((_, j) => j !== cfg.correct);
        document.querySelector('#s8 .gc-opt[data-k="' + k + '"]').click(); await wait(20);
      }
      if (i < GUIDED.length) { document.getElementById('g-next').click(); await wait(20); }
    }
    return 'ok';
  }
  const sid = 's' + n;                               // the class task
  if (typeof TASK_KEYS !== 'undefined' && document.querySelector('#' + sid + ' .task-input')) {
    const key = TASK_KEYS[sid] || [];
    document.querySelectorAll('#' + sid + ' .task-input').forEach((inp, i) => { inp.value = key[i] || '5'; });
    taskOnInput(sid);
    if (TASK_KEYS[sid]) taskCheck(sid);
  }
  return 'ok';
};

(async () => {
  const srv = await serve(); const browser = await launch();
  const errs = [];

  const run = async (c, mode, opts = {}) => {
    const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
    await page.setViewport({ width: 1280, height: 710 });
    watchErrors(page, errs);
    await page.goto(srv.base + UNIT + '-' + c + '/index.html' + LIB, { waitUntil: 'networkidle0' });
    await ready(page);
    const [a, b] = await page.evaluate(() => [PART_FIRST, PART_LAST]);
    let stop = null;
    for (let n = a; n <= b; n++) {
      const r = await page.evaluate(ANSWER, n, mode);
      if (r !== 'ok') errs.push(c + '/' + mode + ': ' + r);
      if (n === opts.stopAt) { stop = n; break; }
    }
    const endAt = stop != null ? stop : b;
    const p0 = await page.evaluate(() => location.pathname);
    await page.evaluate((n) => {                     // the component's last click
      if (currentScreen !== n) goTo(n);
      if (quizState[n]) document.getElementById('q' + n + '-check').click();
      else if (typeof TASK_KEYS !== 'undefined' && document.getElementById('s' + n + '-check')) taskCheck('s' + n);
      else document.querySelector('.screen[data-screen="' + n + '"] .btn-continue').click();
    }, endAt);
    await sleep(900);
    const st = await page.evaluate(() => ({ log: __stmts(), dupes: __dupes(), path: location.pathname,
      ended: (lastScreenButton() || {}).disabled, res: getUnitResult(partResultKey()) }));
    await ctx.close();
    return { ...st, p0 };
  };

  const check = (c, mode, r, expect) => {
    const tag = c + '/' + mode;
    const M = readMeta(UNIT + '-' + c);
    const ids = new Set([M.id]); M.subContent.forEach((s) => { ids.add(s.id); (s.questions || []).forEach((q) => ids.add(q.questionId)); });
    ok(tag + ' no duplicate completed', r.dupes.length === 0, r.dupes.join(','));
    ok(tag + ' stays on the page', r.path === r.p0, r.path);
    ok(tag + ' end button disabled', r.ended === true);
    const comp = r.log.filter((s) => s.objectType === 'onlinelesson');
    ok(tag + ' one component initialized', comp.filter((s) => s.verb === 'initialized').length === 1);
    const cc = comp.filter((s) => s.verb === 'completed');
    ok(tag + ' one component completed', cc.length === 1, cc.length);
    const res = cc[0] && cc[0].result;
    ok(tag + ' component result ' + JSON.stringify(expect.result), JSON.stringify(res) === JSON.stringify(expect.result), JSON.stringify(res));
    ok(tag + ' verdict recorded', r.res === (expect.result.success ? 'pass' : 'fail'), r.res);
    const bad = r.log.filter((s) => (s.objectId && !ids.has(s.objectId)) || (s.opts && s.opts.questionId && !ids.has(s.opts.questionId)));
    ok(tag + ' every id is in metadata', bad.length === 0, JSON.stringify(bad[0] && (bad[0].objectId || bad[0].opts.questionId)));
    ok(tag + ' no unit-level statement', !r.log.some((s) => s.objectId === 'methodica-math-proportion-02' || (s.opts && s.opts.scope === 'unit')));
    const items = M.subContent.filter((s) => !(expect.skipItems || []).includes(s.id.replace(/\/$/, '').slice(-3)));
    items.forEach((s) => {
      const sfx = s.id.slice(-4, -1);
      const ini = r.log.filter((x) => x.verb === 'initialized' && x.objectId === s.id).length;
      const com = r.log.filter((x) => x.verb === 'completed' && x.objectId === s.id).length;
      ok(tag + ' item ' + sfx + ' initialized', ini >= 1, ini);
      ok(tag + ' item ' + sfx + ' completed once', com === 1, com);
      (s.questions || []).forEach((q) => {
        const key = q.questionId.split('/').slice(-2).join('/');
        const an = r.log.filter((x) => x.verb.startsWith('answered') && x.opts && x.opts.questionId === q.questionId);
        const last = an.filter((x) => x.verb === 'answered.last');
        ok(tag + ' ' + key + ' answered.last once', last.length === 1, an.map((x) => x.verb).join(','));
        if (last[0]) ok(tag + ' ' + key + ' success=' + (mode === 'right'), last[0].result.success === (mode === 'right'), JSON.stringify(last[0].result));
        if (last[0]) ok(tag + ' ' + key + ' carries the answer text', Array.isArray(last[0].result.extensions.student_answer) && last[0].result.extensions.student_answer[0] !== '');
      });
    });
    (expect.skipItems || []).forEach((sfx) => {
      const id = M.subContent.find((s) => s.id.replace(/\/$/, '').endsWith('-' + sfx)).id;
      ok(tag + ' item ' + sfx + ' never opened', !r.log.some((x) => x.objectId === id));
    });
    M.subContent.forEach((s) => {
      const iC = r.log.findIndex((x) => x.verb === 'completed' && x.objectId === s.id);
      const iA = r.log.map((x, k) => (x.opts && x.opts.parentId === s.id ? k : -1)).filter((k) => k >= 0).pop();
      if (iC >= 0 && iA != null) ok(tag + ' item ' + s.id.slice(-4, -1) + ' completed after its answers', iC > iA);
    });
  };

  try {
    const R = (s, sc) => (sc === undefined ? { success: s } : { success: s, score: { scaled: sc } });
    check('01', 'right', await run('01', 'right'), { result: R(true, 1) });
    check('02', 'right', await run('02', 'right'), { result: R(true, 1) });
    check('02', 'wrong', await run('02', 'wrong'), { result: R(false, 0) });
    check('03', 'right', await run('03', 'right'), { result: R(true, 1) });
    check('03', 'wrong', await run('03', 'wrong', { stopAt: 23 }), { result: R(false, 0), skipItems: ['005', '006'] });
    check('04', 'right', await run('04', 'right'), { result: R(true) });
    check('05', 'right', await run('05', 'right'), { result: R(true, 1) });
    check('06', 'right', await run('06', 'right'), { result: R(true, 1) });
    check('06', 'wrong', await run('06', 'wrong'), { result: R(false, 0) });
    check('07', 'right', await run('07', 'right'), { result: R(true, 1) });
    ok('no page / console errors', errs.length === 0, errs.slice(0, 5).join(' | '));
  } finally { await browser.close(); await srv.close(); }
  report();
})();
