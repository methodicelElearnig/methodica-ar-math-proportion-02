/* Smoke, real Chrome, NO platform parameters (the lomda as a plain page — guide §6.8 regression
 * gate): every component lands on its first screen, walks every screen with no page / console
 * error and no failed request, drops the boot cover, hides the cross-component "חזרה" in
 * production; the component end reports and stays put; ?dev=1 hops; the character key migrates.
 *
 *   node _test/smoke.js [repoRoot]
 */
'use strict';
const { serve, launch, components, sleep, checker, watchErrors } = require('./lib');
const { ok, report } = checker('smoke');

(async () => {
  const srv = await serve(); const browser = await launch();
  const comps = components();
  const open = async (url) => {
    const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 710 });
    const errs = []; watchErrors(page, errs);
    page.on('response', (res) => { if (res.status() >= 400 && !/favicon\.ico$/.test(res.url())) errs.push('http ' + res.status() + ' ' + res.url()); });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await sleep(1200);
    return { page, errs };
  };
  try {
    for (const comp of comps) {
      const { page, errs } = await open(srv.base + comp + '/index.html');
      const info = await page.evaluate(() => ({
        cover: !!document.getElementById('boot-cover'), dev: DEV_NAV, scr: currentScreen, start: PART_CONFIG.start, end: PART_CONFIG.end,
        slug: currentPartSlug(), comp: XAPI_COMP_SLUG
      }));
      ok(comp + ' cover dropped', !info.cover);
      ok(comp + ' DEV_NAV off', info.dev === false);
      ok(comp + ' lands on its first screen', info.scr === info.start, JSON.stringify(info));
      ok(comp + ' slug from the path = config', info.slug === info.comp, info.slug + ' vs ' + info.comp);
      for (let n = info.start; n <= info.end; n++) { await page.evaluate((n) => goTo(n), n); await sleep(250); }
      ok(comp + ' walk reaches the last screen', (await page.evaluate(() => currentScreen)) === info.end);
      if (comp.slice(-2) !== '01') {
        const hidden = await page.evaluate((s) => { const b = document.querySelector('.screen[data-screen="' + s + '"] .btn-back'); return !b || (b.hidden && b.style.display === 'none'); }, info.start);
        ok(comp + ' first-screen "חזרה" hidden in production', hidden);
      }
      ok(comp + ' no errors', errs.length === 0, errs.slice(0, 3).join(' | '));
      await page.close();
    }

    /* production end: 07's "סיימתי" reports, disables, stays */
    {
      const { page, errs } = await open(srv.base + comps[6] + '/index.html');
      await page.evaluate(() => goTo(59)); await sleep(300);
      const before = await page.evaluate(() => location.pathname);
      await page.click('#s59 .btn-continue'); await sleep(500);
      const r = await page.evaluate(() => ({ p: location.pathname, dis: document.querySelector('#s59 .btn-continue').disabled, res: localStorage.getItem('proportion02_c07_result') }));
      ok('07 end: stays on the page', r.p === before, r.p);
      ok('07 end: button disabled', r.dis === true);
      ok('07 end: verdict recorded (nothing answered -> below the gate)', r.res === 'fail', r.res);
      ok('07 end: no errors', errs.length === 0, errs.join(' | '));
      await page.close();
    }
    /* production: no hop past the last screen */
    {
      const { page } = await open(srv.base + comps[0] + '/index.html');
      await page.evaluate(() => { goTo(11); quizState[11].done = true; }); await sleep(300);
      const p0 = await page.evaluate(() => location.pathname);
      await page.evaluate(() => goTo(12)); await sleep(800);
      ok('01 production: no hop past the end', (await page.evaluate(() => location.pathname)) === p0);
      await page.close();
    }
    /* ?dev=1 hops, the query kept */
    {
      const { page } = await open(srv.base + comps[0] + '/index.html?dev=1');
      ok('?dev=1 sets DEV_NAV', await page.evaluate(() => DEV_NAV === true));
      await page.evaluate(() => { goTo(11); quizState[11].done = true; }); await sleep(300);
      await Promise.all([page.waitForNavigation({ timeout: 8000 }).catch(() => null), page.evaluate(() => goTo(12))]);
      await sleep(800);
      const u = await page.evaluate(() => location.pathname + location.search);
      ok('?dev=1 hops 01 -> 02', /-02\/index\.html\?dev=1/.test(u), u);
      await page.close();
    }
    /* the character key: the pre-integration key migrates once; a pick writes the namespaced key */
    {
      const page = await browser.newPage();
      await page.goto(srv.base + comps[0] + '/index.html', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => { localStorage.clear(); localStorage.setItem('proportion02_selectedCharacter', 'character-green'); });
      await page.reload({ waitUntil: 'networkidle0' }); await sleep(800);
      const c = await page.evaluate(() => ({ sel: lomdaState.selectedCharacter, nk: localStorage.getItem('methodica_math_proportion_02_selectedCharacter'), old: localStorage.getItem('proportion02_selectedCharacter') }));
      ok('legacy character key migrates', c.sel === 'character-green' && c.nk === 'character-green' && c.old === null, JSON.stringify(c));
      await page.evaluate(() => selectOption(document.querySelector('#s0 .option-card[data-value="character-yellow"]')));
      ok('a pick writes the namespaced key', (await page.evaluate(() => localStorage.getItem('methodica_math_proportion_02_selectedCharacter'))) === 'character-yellow');
      await page.close();
    }
  } finally { await browser.close(); await srv.close(); }
  report();
})();
