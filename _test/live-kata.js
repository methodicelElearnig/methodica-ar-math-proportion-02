/* Live Kata run (guide §12) — the LIVE CDN + LIVE Kata, headless Chrome. Not part of run-all:
 * it writes to Kata (statements and state documents for two test learners) — run it only with
 * the owner's go-ahead, after the package is uploaded and the metadata sent.
 *
 * Launch links come from POST /api/v1/launcher/context (X-API-Key from the git-ignored
 * docs-and-tools/kata-api-key.txt) for two pseudonymous learners — VADIM-P02-A walks every
 * component on its pass path with a reload mid-way, VADIM-P02-B the fail paths of 02, 03, 06 —
 * always with resetState:true. The links stay INSIDE this process: no URL, token or slxapi
 * envelope is ever printed (page console text is redacted before use).
 * Observation only: the bodies of the statement requests the page sends to Kata (no header, so no
 * token), Kata's HTTP status on every /statements and /activities/state request,
 * stateLastResult720(), and the state document read back through the page's own loadState720.
 *
 *   node _test/live-kata.js [repoRoot]
 */
'use strict';
const fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer-core');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const UNIT = path.basename(ROOT);
const KEY = fs.readFileSync(path.join(ROOT, 'docs-and-tools', 'kata-api-key.txt'), 'utf8').trim();
const KATA = 'https://kata.cet.ac.il';
const CONTENT = 'https://lomdot.education.gov.il/metodica/720/math/proportion/02/';
const ID = 'https://lomdot.education.gov.il/metodica/720active/math/proportion/02/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0; const fail = []; const notes = [];
const ok = (n, c, d) => { if (c) pass++; else fail.push(n + (d !== undefined ? ' -> ' + d : '')); };
const redact = (s) => String(s).replace(/Bearer\s+[A-Za-z0-9._\-+/=]+/g, 'Bearer REDACTED').replace(/slxapi=[^&\s"]+/g, 'slxapi=REDACTED').replace(/"auth"\s*:\s*"[^"]*"/g, '"auth":"REDACTED"');

async function launch(comp, learner, reset) {
  const r = await fetch(KATA + '/api/v1/launcher/context', {
    method: 'POST', headers: { 'X-API-Key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ componentId: ID + comp + '/', studentId: learner, platformUrl: 'https://no-platform.com', resetState: !!reset }),
  });
  if (!r.ok) throw new Error('launcher HTTP ' + r.status + ' for ' + comp);
  const j = await r.json();
  const u = new URL(j.launchUrl);
  const env = JSON.parse(u.searchParams.get('slxapi'));
  /* validated without printing it */
  ok(comp + '/' + learner + ' link: path', u.origin + u.pathname === CONTENT + comp + '/index.html', u.pathname);
  ok(comp + '/' + learner + ' link: registration', u.searchParams.get('registration') === j.registrationId);
  ok(comp + '/' + learner + ' link: component', u.searchParams.get('component') === comp);
  ok(comp + '/' + learner + ' link: Bearer + Kata endpoint + learner', /^Bearer \S+$/.test(env.auth) && /kata\.cet\.ac\.il\/api\/v1\/xapi\/?$/.test(env.endpoint) && env.actor && env.actor.account && env.actor.account.name === learner);
  return { url: j.launchUrl, reg: j.registrationId.slice(0, 8) };
}

/* In-page answer helper — the same as _test/statement-flow.js. */
const ANSWER = async (n, mode) => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  if (currentScreen !== n) goTo(n);
  await wait(150);
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
      await wait(250);
    }
    return 'ok';
  }
  if (n === 5) {
    for (let i = carState.step; i <= CAR.length; i++) {
      const g = CAR[i - 1].grade;
      if (g && !carState.answered[i]) {
        if (g.kind === 'drag') { const sl = g.slots || [1, 2, 3]; const v = mode === 'right' ? g.correct : g.correct.slice().reverse(); carState.placed[i] = {}; sl.forEach((s, k) => { carState.placed[i][String(s)] = v[k]; }); }
        else { const all = g.opts.map((_, k) => k); carState.picked[i] = mode === 'right' ? g.correct.slice() : [all.find((k) => !g.correct.includes(k))]; }
        carRender(); document.getElementById('car-next').click(); await wait(150);
      }
      if (i < CAR.length) { document.getElementById('car-next').click(); await wait(80); }
    }
    return 'ok';
  }
  if (n === 8) {
    for (let i = gState.step; i <= GUIDED.length; i++) {
      const cfg = GUIDED[i - 1];
      if (cfg.opts && gState.picked[i] === undefined) {
        const k = mode === 'right' ? cfg.correct : cfg.opts.findIndex((_, j) => j !== cfg.correct);
        document.querySelector('#s8 .gc-opt[data-k="' + k + '"]').click(); await wait(150);
      }
      if (i < GUIDED.length) { document.getElementById('g-next').click(); await wait(80); }
    }
    return 'ok';
  }
  const sid = 's' + n;
  if (typeof TASK_KEYS !== 'undefined' && document.querySelector('#' + sid + ' .task-input')) {
    const key = TASK_KEYS[sid] || [];
    document.querySelectorAll('#' + sid + ' .task-input').forEach((inp, i) => { inp.value = key[i] || '5'; });
    taskOnInput(sid);
    if (TASK_KEYS[sid]) taskCheck(sid);
    await wait(250);
  }
  return 'ok';
};

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const meta = (c) => JSON.parse(fs.readFileSync(path.join(ROOT, 'metadata', c + '.json'), 'utf8').replace(/^\uFEFF/, ''));

  const open = async (url) => {
    const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
    await page.setViewport({ width: 1280, height: 710 });
    const net = []; const errs = []; const sentLog = [];
    /* what actually went to Kata: the POST /statements bodies (no header, so no token) */
    page.on('request', (req) => {
      if (req.method() !== 'POST' || !/kata\.cet\.ac\.il\/api\/v1\/xapi\/statements/.test(req.url())) return;
      try {
        const body = JSON.parse(req.postData() || '[]');
        (Array.isArray(body) ? body : [body]).forEach((st) => sentLog.push({
          verb: String(st.verb && st.verb.id || '').split('/').pop(),
          objectId: st.object && st.object.id,
          result: st.result ? { success: st.result.success, scaled: st.result.score && st.result.score.scaled } : null,
        }));
      } catch (e) { errs.push('unparsable statement body'); }
    });
    page.on('response', (res) => {
      const u = res.url();
      if (/kata\.cet\.ac\.il\/api\/v1\/xapi\/statements/.test(u) && res.request().method() !== 'OPTIONS') net.push({ kind: 'stmt', status: res.status() });
      if (/kata\.cet\.ac\.il\/api\/v1\/xapi\/activities\/state/.test(u) && res.request().method() !== 'OPTIONS') net.push({ kind: 'state', method: res.request().method(), status: res.status() });
    });
    page.on('pageerror', (e) => errs.push(redact(e.message)));
    page.on('console', (m) => { if (m.type() === 'error') { const t = redact(m.text()); if (!/Failed to load resource/.test(t)) errs.push(t); } });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForFunction(() => typeof _resumeReady !== 'undefined' && _resumeReady && !document.getElementById('boot-cover') && window.METADATA, { timeout: 30000 });
    await sleep(1200);
    return { ctx, page, net, errs, sentLog };
  };
  const reload = async (o) => {
    await sleep(1500);
    await o.page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
    await o.page.waitForFunction(() => typeof _resumeReady !== 'undefined' && _resumeReady && !document.getElementById('boot-cover'), { timeout: 30000 });
    await sleep(1200);
  };
  const sent = async (o) => o.sentLog.slice();
  const lastClick = (o, n) => o.page.evaluate((n) => {
    if (currentScreen !== n) goTo(n);
    if (quizState[n]) document.getElementById('q' + n + '-check').click();
    else if (typeof TASK_KEYS !== 'undefined' && document.getElementById('s' + n + '-check')) taskCheck('s' + n);
    else document.querySelector('.screen[data-screen="' + n + '"] .btn-continue').click();
  }, n);

  /* one component, one path */
  const walk = async (comp, learner, mode, opts = {}) => {
    const tag = comp.slice(-2) + '/' + learner.slice(-1) + '/' + mode;
    const L = await launch(comp, learner, true);
    const o = await open(L.url);
    const pf = await o.page.evaluate(() => ({ dis: window.XAPI_DISABLED, g: window.XAPI_USING_G, dev: DEV_NAV, id: METADATA.id === XAPI_COMP_ID,
      reg: !!new URLSearchParams(location.search).get('registration'), first: currentScreen === PART_FIRST, st: window.stateLastResult720 && stateLastResult720() }));
    ok(tag + ' preflight: reporting on, -k gate, DEV_NAV off, ids match, registration', pf.dis === false && pf.g === true && pf.dev === false && pf.id && pf.reg, JSON.stringify({ ...pf, st: undefined }));
    ok(tag + ' lands on its first screen', pf.first);
    ok(tag + ' first state read: 404 absent (fresh registration)', pf.st && pf.st.op === 'load' && pf.st.status === 404 && pf.st.reason === 'absent', JSON.stringify(pf.st));
    const [a, b] = await o.page.evaluate(() => [PART_FIRST, PART_LAST]);
    let reloaded = false;
    for (let n = a; n <= b; n++) {
      const r = await o.page.evaluate(ANSWER, n, mode);
      if (r !== 'ok') o.errs.push(r);
      if (opts.reloadAt === n && !reloaded) {
        /* resume probe: reload mid-component */
        const before = (await sent(o)).length;
        const s0 = await o.page.evaluate(() => ({ scr: currentScreen, q: JSON.stringify(XAPI_Q_RESULTS) }));
        await reload(o);
        const s1 = await o.page.evaluate(() => ({ scr: currentScreen, q: JSON.stringify(XAPI_Q_RESULTS), dis: window.XAPI_DISABLED, st: stateLastResult720() }));
        ok(tag + ' reload: state read 200 from Kata', s1.st && s1.st.op === 'load' && s1.st.status === 200, JSON.stringify(s1.st));
        ok(tag + ' reload: lands where it left, verdicts restored', s1.scr === s0.scr && s1.q === s0.q, s0.scr + '/' + s1.scr);
        ok(tag + ' reload: reporting still on', s1.dis === false);
        const after = (await sent(o)).slice(before);
        ok(tag + ' reload: nothing re-reported (only the component + landing item initialized)', after.every((x) => x.verb === 'initialized'), JSON.stringify(after.map((x) => x.verb)));
        reloaded = true;
      }
      if (n === opts.stopAt) break;
    }
    const endAt = opts.stopAt != null ? opts.stopAt : b;
    const p0 = await o.page.evaluate(() => location.pathname);
    await lastClick(o, endAt);
    await sleep(2500);
    const end = await o.page.evaluate(() => ({ p: location.pathname, scr: currentScreen, btn: (lastScreenButton() || {}).disabled,
      doc: loadState720(RESUME_STATE_ID) }));
    const S = await sent(o);
    const M0 = meta(comp);
    const cc = S.filter((x) => x.verb === 'completed' && x.objectId === M0.id);
    ok(tag + ' one component completed', cc.length === 1, cc.length);
    if (opts.expect) ok(tag + ' component result ' + JSON.stringify(opts.expect), cc[0] && JSON.stringify(cc[0].result) === JSON.stringify(opts.expect), cc[0] && JSON.stringify(cc[0].result));
    ok(tag + ' stays on the page, button disabled', end.p === p0 && end.btn === true, end.p === p0);
    if (opts.stopAt != null) ok(tag + ' ends on s' + opts.stopAt, end.scr === opts.stopAt, end.scr);
    const slug = comp;
    ok(tag + ' Kata document: done, verdict recorded', end.doc && end.doc.done && end.doc.done[slug] === true && end.doc.results && end.doc.results['proportion02_c' + comp.slice(-2) + '_result'] === (opts.expect && opts.expect.success === false ? 'fail' : 'pass'),
      end.doc && JSON.stringify({ done: end.doc.done, results: end.doc.results, v: end.doc.v }));
    /* every item of the catalogue reached was closed once; ids in the catalogue */
    const M = meta(comp);
    const ids = new Set([M.id]); M.subContent.forEach((s) => { ids.add(s.id); (s.questions || []).forEach((q) => ids.add(q.questionId)); });
    ok(tag + ' every object id sent is in the catalogue', S.every((x) => ids.has(x.objectId)), JSON.stringify(S.filter((x) => !ids.has(x.objectId)).map((x) => x.objectId).slice(0, 3)));
    ok(tag + ' no unit-level statement', !S.some((x) => /proportion-02\/?$/.test(x.objectId) && !/-0\d\/?$/.test(x.objectId)));
    (M.subContent).forEach((s) => (s.questions || []).forEach((q) => { if (!opts.items || opts.items.includes(s.id)) ok(tag + ' ' + q.questionId.split('/').slice(-2).join('/') + ' answered', S.some((x) => x.verb === 'answered' && x.objectId === q.questionId)); }));
    (opts.items || M.subContent.map((s) => s.id)).forEach((id) => ok(tag + ' item ' + id.slice(-4, -1) + ' completed once', S.filter((x) => x.verb === 'completed' && x.objectId === id).length === 1));
    /* D-8 after the end: reload, still ended, a forced click sends nothing */
    await reload(o);
    const d8 = await o.page.evaluate(() => ({ scr: currentScreen, btn: (lastScreenButton() || {}).disabled }));
    ok(tag + ' D-8: after a reload still on the end screen, button disabled', d8.btn === true && d8.scr === endAt, JSON.stringify(d8));
    const before = (await sent(o)).length;
    await o.page.evaluate((n) => { const b = lastScreenButton(); if (b) { b.disabled = false; b.click(); } goTo(n + 1); }, endAt);
    await sleep(1500);
    const extra = (await sent(o)).slice(before).filter((x) => x.verb === 'completed');
    ok(tag + ' D-8: a forced second click sends no completed', extra.length === 0, extra.length);
    /* Kata accepted everything */
    const st = o.net.filter((x) => x.kind === 'stmt');
    ok(tag + ' Kata accepted every statement request (2xx)', st.length > 0 && st.every((x) => x.status >= 200 && x.status < 300), JSON.stringify(st.map((x) => x.status)));
    const sv = o.net.filter((x) => x.kind === 'state' && x.method === 'PUT');
    ok(tag + ' state writes accepted', sv.length > 0 && sv.every((x) => x.status >= 200 && x.status < 300), JSON.stringify(sv.map((x) => x.status)));
    ok(tag + ' no page / console error', o.errs.length === 0, o.errs.slice(0, 3).join(' | '));
    notes.push(`${tag} reg ${L.reg}: ${S.length} sent (${st.length} statement requests), component ${cc[0] ? JSON.stringify(cc[0].result) : '—'}`);
    await o.ctx.close();
  };

  const A = 'VADIM-P02-A', B = 'VADIM-P02-B';
  const C = (n) => UNIT + '-0' + n;
  try {
    await walk(C(1), A, 'right', { reloadAt: 5, expect: { success: true, scaled: 1 } });
    await walk(C(2), A, 'right', { reloadAt: 14, expect: { success: true, scaled: 1 } });
    await walk(C(3), A, 'right', { reloadAt: 19, expect: { success: true, scaled: 1 } });
    await walk(C(4), A, 'right', { reloadAt: 30, expect: { success: true } });
    await walk(C(5), A, 'right', { reloadAt: 39, expect: { success: true, scaled: 1 } });
    await walk(C(6), A, 'right', { reloadAt: 47, expect: { success: true, scaled: 1 } });
    await walk(C(7), A, 'right', { reloadAt: 55, expect: { success: true, scaled: 1 } });
    await walk(C(2), B, 'wrong', { expect: { success: false, scaled: 0 } });
    const M3 = meta(C(3));
    await walk(C(3), B, 'wrong', { stopAt: 23, expect: { success: false, scaled: 0 }, items: M3.subContent.slice(0, 4).map((s) => s.id) });
    await walk(C(6), B, 'wrong', { expect: { success: false, scaled: 0 } });
  } catch (e) { fail.push('RUN ABORTED: ' + redact(e.message)); }
  await browser.close();
  notes.forEach((n) => console.log('  ' + n));
  console.log('[live] pass', pass, 'fail', fail.length); fail.forEach((f) => console.log('  FAIL ' + f));
})();
