/* Resume (guide §8), real Chrome + the stub library (state and statement log in sessionStorage, so
 * both survive a reload of the same tab). Each scenario works, reloads, and checks what came back
 * and that nothing was reported twice: quiz (single, value-input, Retry gate, toggle), carousel,
 * guided flow, class task, the ended button (D-8), the 03 gate, the character across components,
 * ?resetState, one document per component.
 *
 *   node _test/resume.js [repoRoot]
 */
'use strict';
const { UNIT, LIB, sleep, serve, launch, checker } = require('./lib');
const { ok, report } = checker('resume');

(async () => {
  const srv = await serve(); const base = srv.base; const browser = await launch();
  const errs = [];
  const fresh = async () => {
    const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
    await page.setViewport({ width: 1280, height: 710 });
    page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console ' + m.text()); });
    return { ctx, page };
  };
  const ready = async (page) => {
    await page.waitForFunction(() => window.METADATA && window.XAPI_USING_G && typeof _resumeReady !== 'undefined' && _resumeReady && !document.getElementById('boot-cover'), { timeout: 15000 });
    await sleep(250);
  };
  const open = async (page, comp, q = '') => { await page.goto(base + UNIT + '-' + comp + '/index.html' + LIB + q, { waitUntil: 'networkidle0' }); await ready(page); };
  const reload = async (page) => { await sleep(1000); await page.reload({ waitUntil: 'networkidle0' }); await ready(page); };
  const log = (page) => page.evaluate(() => __stmts());
  const count = (L, pred) => L.filter(pred).length;
  const ansFor = (L, qidEnd) => L.filter((s) => s.verb.startsWith('answered') && s.opts && s.opts.questionId && s.opts.questionId.endsWith(qidEnd));

  /* in-page answer helpers */
  const setVal = (page, n, vals) => page.evaluate((n, vals) => {
    const ins = [...document.querySelectorAll('#q' + n + ' .vi-input')];
    ins.forEach((i, k) => { i.value = String(vals[k]); });
    quizInputChange(n);
  }, n, vals);
  const pick = (page, n, id) => page.evaluate((n, id) => quizSelect(n, document.querySelector('#q' + n + ' .scq-opt[data-id="' + id + '"]')), n, id);
  const check = (page, n) => page.evaluate((n) => document.getElementById('q' + n + '-check').click(), n);
  const Q = (page, n) => page.evaluate((n) => { const q = QUESTIONS.find((x) => x.screen === n); return { type: q.type, correct: q.correct, inputs: q.correctInputs, wrongIds: (q.options || []).map((o) => o.id).filter((id) => id !== q.correct) }; }, n);

  /* ══ A · value-input + single: done right, retry pending (lw), pending typed; reload ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '03');
    await page.evaluate(() => goTo(18));
    const q18 = await Q(page, 18);
    await pick(page, 18, q18.correct); await check(page, 18);                       // 001 q1 right
    await page.evaluate(() => goTo(19));
    await setVal(page, 19, [999]); await check(page, 19);                           // 001 q2 wrong once (retry)
    await page.evaluate(() => quizOpenHint(19)); await page.evaluate(() => quizCloseHint());   // hint once
    await setVal(page, 19, [999]);                                                  // same wrong answer again: gate
    ok('A retry gate blocks the same answer', await page.evaluate(() => document.getElementById('q19-check').disabled));
    const before = await log(page);
    await reload(page);
    const s = await page.evaluate(() => ({ cur: currentScreen, st: quizState[19], btn: document.getElementById('q19-check').disabled,
      val: document.querySelector('#q19 .vi-input').value, hint: getComputedStyle(document.getElementById('q19-hint')).visibility,
      fb: document.getElementById('q19-feedbox').className }));
    ok('A lands on the screen it left (19)', s.cur === 19, s.cur);
    ok('A attempts / lw restored', s.st.attempts === 1 && !!s.st.lw && !s.st.done, JSON.stringify(s.st));
    ok('A value repainted', s.val === '999', s.val);
    ok('A check blocked on the same answer after reload', s.btn === true);
    ok('A hint button still offered', s.hint === 'visible', s.hint);
    ok('A wrong look while the answer is the submitted one', /is-wrong|wrong/.test(s.fb), s.fb);
    await page.evaluate(() => goTo(18)); await sleep(100);
    const p18 = await page.evaluate(() => ({ correct: !!document.querySelector('#q18 .scq-opt.correct'), btn: document.getElementById('q18-check').textContent, dis: document.getElementById('q18-check').disabled }));
    ok('A answered single repainted (correct mark, שנמשיך?)', p18.correct && p18.btn === 'שנמשיך?' && !p18.dis, JSON.stringify(p18));
    const after1 = await log(page);
    ok('A reload re-reported nothing', count(after1, (x) => x.verb.startsWith('answered') || x.verb.startsWith('requested')) === count(before, (x) => x.verb.startsWith('answered') || x.verb.startsWith('requested')));
    await page.evaluate(() => goTo(19));
    await page.evaluate(() => quizOpenHint(19)); await page.evaluate(() => quizCloseHint());
    const q19 = await Q(page, 19);
    await setVal(page, 19, q19.inputs); await check(page, 19);                       // now right: answered.last
    const L = await log(page);
    ok('A hint requested once across the reload', count(L, (x) => x.verb === 'requested.1') === 1, count(L, (x) => x.verb === 'requested.1'));
    const a19 = ansFor(L, '-001/q2').map((x) => x.verb);
    ok('A 001/q2: answered then answered.last', JSON.stringify(a19) === '["answered","answered.last"]', JSON.stringify(a19));
    ok('A 001/q1 reported once', ansFor(L, '-001/q1').length === 1);
    /* B-1 / seed: leaving 001 forward after a reload must still send its completed */
    await page.evaluate(() => goTo(20)); await sleep(100);
    const L2 = await log(page);
    ok('A item 001 completed once after the reload', count(L2, (x) => x.verb === 'completed' && x.objectId && x.objectId.endsWith('-001/')) === 1);
    await ctx.close();
  }

  /* ══ B · value-input final wrong + toggle on "my answer"; reload ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '03');
    await page.evaluate(() => goTo(22));
    await setVal(page, 22, [1111]); await check(page, 22);
    await setVal(page, 22, [2222]); await check(page, 22);
    await page.evaluate(() => document.querySelector('#q22-feedbox .fb-answer-toggle').click());
    const shown = await page.evaluate(() => document.querySelector('#q22 .vi-input').value);
    await reload(page);
    const s = await page.evaluate(() => ({ cur: currentScreen, val: document.querySelector('#q22 .vi-input').value,
      mode: (document.querySelector('#q22-feedbox .fb-answer-toggle') || { dataset: {} }).dataset.mode, btn: document.getElementById('q22-check').textContent }));
    ok('B lands on 22', s.cur === 22);
    ok('B toggle mode restored (my answer)', s.mode === 'answer', s.mode);
    ok('B shows the learner\'s own value as before', s.val === shown && shown === '2222', s.val + ' / ' + shown);
    ok('B finished look (שנמשיך?)', s.btn === 'שנמשיך?', s.btn);
    const L = await log(page);
    ok('B two answered, the second last, no more', JSON.stringify(ansFor(L, '-003/q1').map((x) => x.verb)) === '["answered","answered.last"]');
    await ctx.close();
  }

  /* ══ C · carousel + guided (component 01); reload mid-carousel and mid-guided ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '01');
    await page.evaluate(() => goTo(5));
    await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let i = 1; i <= 7; i++) {
        const g = CAR[i - 1].grade;
        if (g && !carState.answered[i]) {
          if (g.kind === 'drag') { const sl = g.slots || [1, 2, 3]; carState.placed[i] = {}; sl.forEach((s, k) => { carState.placed[i][String(s)] = g.correct[k]; }); }
          else carState.picked[i] = i === 6 ? [g.opts.findIndex((_, k) => !g.correct.includes(k))] : g.correct.slice();   // step 6 wrong
          carRender(); document.getElementById('car-next').click(); await w(10);
        }
        if (i < 7) { document.getElementById('car-next').click(); await w(10); }
      }
    });
    const st0 = await page.evaluate(() => JSON.stringify({ s: carState.step, a: carState.answered }));
    await reload(page);
    const st1 = await page.evaluate(() => JSON.stringify({ s: carState.step, a: carState.answered }));
    ok('C lands on the carousel', (await page.evaluate(() => currentScreen)) === 5);
    ok('C carousel step + answers restored', st0 === st1, st0 + ' vs ' + st1);
    await page.evaluate(() => { carState.step = 6; carRender(); });
    const c6 = await page.evaluate(() => ({ fb: document.getElementById('car-fb').className, btn: document.getElementById('car-next').textContent, wrong: !!document.querySelector('#s5 .car-opt.wrong') }));
    ok('C answered step 6 repainted wrong + locked', /is-wrong/.test(c6.fb) && c6.btn === 'המשך' && c6.wrong, JSON.stringify(c6));
    /* finish the carousel and answer the guided q1, then reload on s8 */
    await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms));
      carState.step = 8; carRender();
      for (let i = 8; i <= CAR.length; i++) {
        const g = CAR[i - 1].grade;
        if (g && !carState.answered[i]) {
          if (g.kind === 'drag') { const sl = g.slots || [1, 2, 3]; carState.placed[i] = {}; sl.forEach((s, k) => { carState.placed[i][String(s)] = g.correct[k]; }); }
          else carState.picked[i] = g.correct.slice();
          carRender(); document.getElementById('car-next').click(); await w(10);
        }
        document.getElementById('car-next').click(); await w(10);
      }
      goTo(7); goTo(8);
      for (let i = 1; i <= GUIDED.length; i++) {
        const cfg = GUIDED[i - 1];
        if (cfg.opts) { document.querySelector('#s8 .gc-opt[data-k="' + cfg.correct + '"]').click(); await w(10); break; }
        document.getElementById('g-next').click(); await w(10);
      }
    });
    const g0 = await page.evaluate(() => JSON.stringify({ s: gState.step, p: gState.picked }));
    await reload(page);
    const g1 = await page.evaluate(() => JSON.stringify({ s: gState.step, p: gState.picked }));
    ok('C guided step + pick restored', g0 === g1 && (await page.evaluate(() => currentScreen)) === 8, g0 + ' vs ' + g1);
    ok('C guided answered step repainted (revealed, המשך open)', await page.evaluate(() => !!document.querySelector('#s8 .gc-opt.correct') && !document.getElementById('g-next').disabled));
    const L = await log(page);
    ['-002/q1', '-002/q2', '-002/q3', '-002/q4'].forEach((k) => ok('C ' + k + ' reported once', ansFor(L, k).length === 1, ansFor(L, k).length));
    /* 2026-11-14: the guided exercise (004) reports nothing (GUIDED-ITEMS-REPORT group A); the pick is still restored above */
    ['-004/q1', '-004/q2'].forEach((k) => ok('C ' + k + ' (guided) never reported', ansFor(L, k).length === 0, ansFor(L, k).length));
    ok('C 002/q2 (step 6) reported wrong', ansFor(L, '-002/q2')[0] && ansFor(L, '-002/q2')[0].result.success === false);
    ok('C item 002 completed once', count(L, (x) => x.verb === 'completed' && x.objectId && x.objectId.endsWith('-01-002/')) === 1);
    await ctx.close();
  }

  /* ══ D · class task: checked wrong + toggle, pending typed; reload ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '04');
    await page.evaluate(() => goTo(28));
    await page.evaluate(() => { document.getElementById('s28-in-0').value = '7'; taskOnInput('s28'); taskCheck('s28'); });
    await page.evaluate(() => document.querySelector('#s28 .fb-answer-toggle').click());
    await page.evaluate(() => goTo(29));
    await page.type('#s29-in-0', '3');
    await reload(page);
    const d = await page.evaluate(() => ({ cur: currentScreen, v0: document.getElementById('s29-in-0').value, v1: document.getElementById('s29-in-1').value, btn: document.getElementById('s29-check').disabled }));
    ok('D lands on 29', d.cur === 29, d.cur);
    ok('D pending box restored, button still closed (one of two filled)', d.v0 === '3' && d.v1 === '' && d.btn === true, JSON.stringify(d));
    ok('D keyboard holds an unchecked keyed screen', await page.evaluate(() => keyboardForwardAllowed() === false));
    await page.evaluate(() => goTo(28)); await sleep(100);
    const s28 = await page.evaluate(() => ({ dis: document.getElementById('s28-in-0').disabled, val: document.getElementById('s28-in-0').value,
      fb: (document.querySelector('#s28 .quiz-feedbox') || {}).className, mode: (document.querySelector('#s28 .fb-answer-toggle') || { dataset: {} }).dataset.mode,
      btn: document.getElementById('s28-check').textContent, kb: keyboardForwardAllowed() }));
    ok('D checked screen repainted: locked, wrong card, my-answer view, המשך', s28.dis && /is-wrong/.test(s28.fb || '') && s28.mode === 'answer' && s28.val === '7' && s28.btn === 'המשך', JSON.stringify(s28));
    ok('D keyboard allows a checked screen', s28.kb === true);
    /* a second visit does not re-run the check */
    await page.evaluate(() => { goTo(29); goTo(28); });
    ok('D repaint is idempotent', await page.evaluate(() => document.querySelectorAll('#s28 .fb-answer-toggle').length === 1));
    await ctx.close();
  }

  /* ══ E · ended button stays ended after a reload (D-8), and no second completed ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '07');
    await page.evaluate(() => goTo(59));
    await page.click('#s59 .btn-continue'); await sleep(300);
    await reload(page);
    const e = await page.evaluate(() => ({ cur: currentScreen, dis: document.querySelector('#s59 .btn-continue').disabled }));
    ok('E lands on 59, button still disabled', e.cur === 59 && e.dis === true, JSON.stringify(e));
    await page.evaluate(() => { const b = document.querySelector('#s59 .btn-continue'); b.disabled = false; b.click(); goTo(60); });
    await sleep(200);
    const L = await log(page);
    ok('E one component completed in total', count(L, (x) => x.verb === 'completed' && x.objectType === 'onlinelesson') === 1);
    ok('E one component initialized per load (2 loads)', count(L, (x) => x.verb === 'initialized' && x.objectType === 'onlinelesson') === 2);
    await ctx.close();
  }

  /* ══ F · gate end (03 below the bar on s23) survives a reload ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '03');
    for (const n of [18, 19, 20, 21, 22, 23]) {
      await page.evaluate((n) => goTo(n), n);
      const q = await Q(page, n);
      for (let t = 0; t < 2; t++) {
        if (q.type === 'single') await pick(page, n, q.wrongIds[t % q.wrongIds.length]); else await setVal(page, n, [5000 + t]);
        await check(page, n);
      }
    }
    await page.evaluate(() => document.getElementById('q23-check').click()); await sleep(200);
    ok('F below the bar the component ends on 23', (await page.evaluate(() => currentScreen)) === 23);
    await reload(page);
    const f = await page.evaluate(() => ({ cur: currentScreen, dis: document.getElementById('q23-check').disabled, res: getUnitResult(partResultKey()) }));
    ok('F after reload: on 23, ended, verdict fail', f.cur === 23 && f.dis === true && f.res === 'fail', JSON.stringify(f));
    await page.evaluate(() => goTo(24)); await sleep(200);
    ok('F the gate still holds after the reload', (await page.evaluate(() => currentScreen)) === 23);
    const L = await log(page);
    ok('F one component completed (fail)', count(L, (x) => x.verb === 'completed' && x.objectType === 'onlinelesson') === 1);
    await ctx.close();
  }

  /* ══ G · the character: picked in 01, adopted by 02's own document ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '01');
    await page.evaluate(() => selectOption(document.querySelector('#s0 .option-card[data-value="character-green"]')));
    /* synchronously into THIS component's document — not only the localStorage mirror (§8.13) */
    ok('G the pick is in the saved document of 01 at once', await page.evaluate(() => { const d = __state(); return !!(d && d.ui && d.ui.character === 'character-green'); }));
    await sleep(200);
    await reload(page);
    ok('G 01 remembers the pick after reload', await page.evaluate(() => lomdaState.selectedCharacter === 'character-green' && getUnitCharacter() === 'character-green'));
    await open(page, '02');
    await sleep(300);
    const g = await page.evaluate(() => ({ mem: lomdaState.selectedCharacter, doc: _unitState && _unitState.ui && _unitState.ui.character,
      src: (document.querySelector('#s12 video, #s12 img[src*="character"]') || {}).getAttribute ? (document.querySelector('[id^="s12"] video, [id^="s12"] img') || { getAttribute: () => '' }).getAttribute('src') : '' }));
    ok('G 02 adopts the character into its own document', g.mem === 'character-green' && g.doc === 'character-green', JSON.stringify(g));
    await ctx.close();
  }

  /* ══ H · ?resetState starts clean ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '02');
    await page.evaluate(() => goTo(13));
    const q = await Q(page, 13);
    await setVal(page, 13, q.inputs); await check(page, 13);
    await page.evaluate(() => goTo(14)); await sleep(900);
    await page.goto(base + UNIT + '-02/index.html' + LIB + '&resetState', { waitUntil: 'networkidle0' }); await ready(page);
    const h = await page.evaluate(() => ({ cur: currentScreen, done: quizState[13].done, url: location.search }));
    ok('H reset: first screen, nothing answered, flag stripped from the URL', h.cur === 12 && !h.done && !/resetState/.test(h.url), JSON.stringify(h));
    await ctx.close();
  }

  /* ══ I · a component's document is its own: 02's answers never appear in 03 ══ */
  {
    const { ctx, page } = await fresh();
    await open(page, '02');
    await page.evaluate(() => goTo(14)); await sleep(900);
    await open(page, '03');
    ok('I 03 opens on its own first screen', (await page.evaluate(() => currentScreen)) === 17);
    ok('I 03 document names 03', await page.evaluate(() => _unitState.component === 'methodica-math-proportion-02-03'));
    await ctx.close();
  }

  await browser.close(); await srv.close();
  ok('no page / console errors', errs.length === 0, errs.slice(0, 5).join(' | '));
  report();
})();
