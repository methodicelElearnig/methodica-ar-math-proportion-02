/* The s6 video (component 01, item 003), real Chrome + the stub library: VideoWatchAndContinue
 * (monday 02-01-003 — המשך locked until the video's END) and played / paused (guide §6.9).
 * YouTube itself is never reached: every youtube request is answered locally and, where the
 * scenario needs a player, a fake YT.Player is installed before the page's scripts, so ENDED,
 * a seek or an error can be fired on demand.
 *   A  the iframe is ours: enablejsapi, origin, nothing from the launch URL (§6.9.1 canary)
 *   B  locked on entry; ArrowLeft and Back-then-return keep it locked
 *   C  played / paused: first start, silent seek, duplicate pause, ENDED, pause after the end,
 *      replay; the item as objectId; the video time carried; no orphan paused
 *   D  leaving the screen pauses the player (closes the open played)
 *   E  ENDED opens המשך, is saved, and survives Back from s7 and a reload; nothing re-reported
 *   F  never trapped: player error, the API script failing, the player never ready — המשך opens,
 *      and that is NOT saved
 *
 *   node _test/video-gate.js [repoRoot]
 */
'use strict';
const { UNIT, LIB, sleep, serve, launch, checker } = require('./lib');
const { ok, report } = checker('video-gate');

/* Runs in the page before any of its scripts. mode: 'ok' | 'error' | 'silent' (never ready). */
const FAKE_YT = (mode) => {
  window.__ytPlayers = [];
  const S = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };
  function Player(el, cfg) {
    this.el = el; this.cfg = cfg; this.t = 0; this.state = S.UNSTARTED; this.paused = 0;
    this.optKeys = Object.keys(cfg || {});
    window.__ytPlayers.push(this);
    const self = this, ev = (cfg && cfg.events) || {};
    if (mode === 'ok') setTimeout(() => ev.onReady && ev.onReady({ target: self }), 10);
    if (mode === 'error') setTimeout(() => ev.onError && ev.onError({ target: self, data: 150 }), 10);
  }
  Player.prototype.getCurrentTime = function () { return this.t; };
  Player.prototype.fire = function (s) { this.state = s; this.cfg.events.onStateChange({ data: s, target: this }); };
  Player.prototype.pauseVideo = function () { this.paused++; if (this.state === S.PLAYING || this.state === S.BUFFERING) this.fire(S.PAUSED); };
  window.YT = { PlayerState: S, Player };
  window.__yt = (s, t) => { const p = window.__ytPlayers[0]; if (!p) return false; if (t != null) p.t = t; p.fire(window.YT.PlayerState[s]); return true; };
};

(async () => {
  const srv = await serve(); const base = srv.base; const browser = await launch();
  const errs = [];
  /* api: 'fake-ok' | 'fake-error' | 'fake-silent' | 'fail' (no YT, the API script aborted) */
  const fresh = async (api) => {
    const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
    await page.setViewport({ width: 1280, height: 710 });
    page.on('pageerror', (e) => errs.push(api + ' pageerror ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(api + ' console ' + m.text()); });
    const yt = [];
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = r.url();
      if (!/youtube|ytimg|googlevideo/.test(u)) return r.continue();
      yt.push(u);
      if (api === 'fail' && /iframe_api/.test(u)) return r.abort();
      r.respond({ status: 200, contentType: /iframe_api/.test(u) ? 'text/javascript' : 'text/html', body: '' });
    });
    if (api.startsWith('fake-')) await page.evaluateOnNewDocument(FAKE_YT, api.slice(5));
    return { ctx, page, yt };
  };
  const ready = async (page) => {
    await page.waitForFunction(() => window.METADATA && window.XAPI_USING_G && typeof _resumeReady !== 'undefined' && _resumeReady && !document.getElementById('boot-cover'), { timeout: 15000 });
    await sleep(250);
  };
  const open = async (page, q = '') => { await page.goto(base + UNIT + '-01/index.html' + LIB + q, { waitUntil: 'networkidle0' }); await ready(page); };
  const reload = async (page) => { await sleep(1000); await page.reload({ waitUntil: 'networkidle0' }); await ready(page); };
  const btn = (page) => page.evaluate(() => document.querySelector('#s6 .btn-continue').disabled);
  const vids = async (page) => (await page.evaluate(() => __stmts())).filter((s) => s.verb === 'played' || s.verb === 'paused');
  const yt = (page, s, t) => page.evaluate((s, t) => __yt(s, t), s, t);

  /* ══ A + B · the iframe, the lock ══ */
  {
    const { ctx, page, yt: reqs } = await fresh('fake-ok');
    await open(page, '&registration=DEADBEEF-QA&canary=CANARYxyz');
    ok('B s6 not built before the first visit', await page.evaluate(() => (document.getElementById('s6-yt') || {}).tagName === 'DIV'));
    await page.evaluate(() => goTo(6)); await sleep(150);
    const f = await page.evaluate(() => { const e = document.getElementById('s6-yt') || {}; return { tag: e.tagName, src: e.src || '', title: e.title, opts: __ytPlayers[0] && __ytPlayers[0].optKeys, el: !!__ytPlayers[0] && __ytPlayers[0].el === e }; });
    ok('A the slot became an iframe', f.tag === 'IFRAME', f.tag);
    ok('A youtube-nocookie, the right video', /^https:\/\/www\.youtube-nocookie\.com\/embed\/QGF81fTZDGE\?/.test(f.src), f.src);
    ok('A enablejsapi=1', /[?&]enablejsapi=1(&|$)/.test(f.src), f.src);
    ok('A origin is the page origin', f.src.includes('origin=' + encodeURIComponent(new URL(base).origin)), f.src);
    ok('A no canary / registration in the src', !/CANARY|DEADBEEF|slxapi|xapiLib/i.test(f.src), f.src);
    ok('A no forigin / widget_referrer', !/forigin|widget_referrer/.test(f.src), f.src);
    ok('A title kept', f.title === 'טבלת פרופורציה', f.title);
    ok('A YT.Player attached to OUR iframe, events only', f.el && JSON.stringify(f.opts) === '["events"]', JSON.stringify(f.opts));
    ok('A no youtube request carries the launch URL', !reqs.some((u) => /CANARY|DEADBEEF/.test(decodeURIComponent(u))), reqs.find((u) => /CANARY|DEADBEEF/.test(decodeURIComponent(u))));
    ok('B locked on entry', await btn(page));
    await page.keyboard.press('ArrowLeft'); await sleep(150);
    ok('B ArrowLeft does not pass the lock', await page.evaluate(() => currentScreen) === 6);
    await page.evaluate(() => { goTo(7); goTo(6); }); await sleep(100);
    ok('B Back from s7 before watching: still locked', await btn(page));
    ok('B one player only after a revisit', await page.evaluate(() => __ytPlayers.length) === 1);
    ok('B the s6 item is 003', await page.evaluate(() => JSON.stringify(SCREEN_TO_SUBCONTENT[6])) === '["003",1]');
    await ctx.close();
  }

  /* ══ C + E · played / paused, ENDED, saved ══ */
  {
    const { ctx, page } = await fresh('fake-ok');
    await open(page);
    await page.evaluate(() => goTo(6)); await sleep(150);
    await yt(page, 'PLAYING', 0);
    let v = await vids(page);
    ok('C first start sends played', v.length === 1 && v[0].verb === 'played', JSON.stringify(v.map((s) => s.verb)));
    ok('C objectId = item 003', v[0] && /methodica-math-proportion-02-01-003\/$/.test(v[0].objectId), v[0] && v[0].objectId);
    await yt(page, 'BUFFERING', 30); await yt(page, 'PLAYING', 30);
    ok('C a seek is silent', (await vids(page)).length === 1);
    await yt(page, 'PAUSED', 42);
    await yt(page, 'PAUSED', 42);
    v = await vids(page);
    ok('C pause sends one paused (duplicate silent)', v.length === 2 && v[1].verb === 'paused', JSON.stringify(v.map((s) => s.verb)));
    ok('C the video time is carried', v[1] && v[1].opts && v[1].opts.time === 42, JSON.stringify(v[1] && v[1].opts));
    ok('C still locked after a pause', await btn(page));
    await yt(page, 'PLAYING', 42);
    await yt(page, 'ENDED', 90);
    v = await vids(page);
    ok('C resume sends played, ENDED sends nothing', v.map((s) => s.verb).join() === 'played,paused,played', v.map((s) => s.verb).join());
    ok('E ENDED opens המשך', !(await btn(page)));
    await yt(page, 'PAUSED', 90);
    ok('C a pause on an ended clip is silent', (await vids(page)).length === 3);
    await yt(page, 'PLAYING', 0);
    v = await vids(page);
    ok('C a replay sends played', v.length === 4 && v[3].verb === 'played');
    let open1 = 0, orphan = 0;
    v.forEach((s) => { if (s.verb === 'played') open1++; else if (open1 > 0) open1--; else orphan++; });
    ok('C no orphan paused', orphan === 0, orphan);
    await page.evaluate(() => goTo(7)); await sleep(150);
    v = await vids(page);
    ok('D leaving s6 pauses the player and closes the played', v.length === 5 && v[4].verb === 'paused' && await page.evaluate(() => (__ytPlayers[0] || {}).paused) >= 1, v.map((s) => s.verb).join());
    await page.evaluate(() => goTo(6)); await sleep(100);
    ok('E Back from s7 after watching: open', !(await btn(page)));
    ok('E saved in the component state', await page.evaluate(() => !!(CUSTOM_STATE[6] && CUSTOM_STATE[6].watched)));
    const before = (await vids(page)).length;
    await reload(page);
    const r = await page.evaluate(() => ({ cur: currentScreen, w: !!(CUSTOM_STATE[6] && CUSTOM_STATE[6].watched) }));
    ok('E reload lands on s6', r.cur === 6, r.cur);
    ok('E watched restored', r.w);
    ok('E open after the reload, with no new viewing', !(await btn(page)));
    await page.keyboard.press('ArrowLeft'); await sleep(150);
    ok('E ArrowLeft passes once watched', await page.evaluate(() => currentScreen) === 7);
    ok('E the reload re-reported nothing', (await vids(page)).length === before, (await vids(page)).length);
    await ctx.close();
  }

  /* ══ F · never trapped, never saved ══ */
  for (const api of ['fake-error', 'fail']) {
    const { ctx, page } = await fresh(api);
    await open(page);
    await page.evaluate(() => goTo(6)); await sleep(1500);
    ok('F ' + api + ': המשך opens', !(await btn(page)));
    ok('F ' + api + ': not saved as watched', await page.evaluate(() => !(CUSTOM_STATE[6] && CUSTOM_STATE[6].watched)));
    if (api === 'fake-error') {
      await reload(page);
      const reopened = await page.evaluate(() => currentScreen === 6 && !!document.querySelector('#s6 iframe'));
      ok('F fake-error: after a reload the player is tried again', reopened);
    }
    await ctx.close();
  }
  {
    const { ctx, page } = await fresh('fake-silent');
    await open(page);
    await page.evaluate(() => goTo(6)); await sleep(1000);
    ok('F never ready: locked while the player may still come up', await btn(page));
    await sleep(15000);
    ok('F never ready: המשך opens after VIDEO_READY_MS', !(await btn(page)));
    await ctx.close();
  }

  ok('no page / console error', errs.length === 0, errs.slice(0, 3).join(' | '));
  await browser.close(); await srv.close();
  report();
})().catch((e) => { console.error(e); process.exitCode = 1; });
