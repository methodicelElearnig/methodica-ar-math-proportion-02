/* The asset walk (guide §15.4 step 7), real Chrome: every screen of every component served from a
 * SUBPATH and resolved CASE-EXACT (lib.js serve()), every lazy image forced, and every local
 * request that fails or answers >= 400 is a failure. Then the shipped files the walk never asked
 * for are listed — informational: the other companion's media, the carousel's later steps, the
 * zoomed pictures and the hint sprite are only requested after interaction.
 *
 *   node _test/walk-404.js [repoRoot]
 */
'use strict';
const { execSync } = require('child_process');
const { ROOT, serve, launch, components, sleep, checker, watchErrors } = require('./lib');
const { ok, report } = checker('walk-404');

(async () => {
  const srv = await serve(); const browser = await launch();
  const bad = []; const errs = [];
  try {
    for (const comp of components()) {
      const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 710 });
      watchErrors(page, errs);
      page.on('response', (res) => { if (res.url().startsWith('http://127.0.0.1') && res.status() >= 400 && !/favicon\.ico$/.test(res.url())) bad.push(comp + ' ' + res.status() + ' ' + res.url().replace(srv.base, '')); });
      page.on('requestfailed', (q) => { if (q.url().startsWith('http://127.0.0.1') && !/favicon\.ico$/.test(q.url())) bad.push(comp + ' FAIL ' + q.url().replace(srv.base, '') + ' ' + (q.failure() || {}).errorText); });
      await page.goto(srv.base + comp + '/index.html', { waitUntil: 'networkidle0' });
      const [a, b] = await page.evaluate(() => [PART_CONFIG.start, PART_CONFIG.end]);
      for (let n = a; n <= b; n++) {
        await page.evaluate((n) => goTo(n), n); await sleep(500);
        await page.evaluate(() => document.querySelectorAll('.screen.active img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }));
      }
      await sleep(1500); await page.close();
    }
  } finally { await browser.close(); await srv.close(); }
  ok('no failed / 4xx local request', bad.length === 0, [...new Set(bad)].slice(0, 10).join(' | '));
  ok('no page / console errors', errs.length === 0, errs.slice(0, 5).join(' | '));
  /* informational: tracked, shippable files the walk never requested */
  try {
    const tracked = execSync('git ls-files', { cwd: ROOT }).toString().split('\n').filter(Boolean)
      .filter((f) => !/(^|\/)(index_dev\.html|README\.md|\.git\w+)$|^(metadata|_test|docs-and-tools)\//.test(f) && f !== 'index.html');
    const never = tracked.filter((f) => !srv.served.has(f));
    console.log(`[walk-404] served ${srv.served.size} files; ${never.length} shippable files only requested after interaction:`);
    never.forEach((f) => console.log('    ' + f));
  } catch (e) { /* not a git checkout (a mutation copy) */ }
  report();
})();
