/* Layout, real Chrome: the 1280x710 canvas stays centred and inside the window at every size.
 *
 * MOE tester 14.10.26: "ברזולוציה 100 לא ניתן לצפות בכל היחידה". With auto grid tracks, #stage's
 * cell grew to #app's full size whenever the window was smaller, so #app started at the window's
 * edge and scale() (origin: centre) could not pull it back: the canvas slid off-screen with the
 * bottom-bar buttons. Same bug and fix as ratio-06 2d46837 / proportion-01 f135521.
 *
 * For every component at several window sizes: #app is centred (±1px) and lies inside the window,
 * and the first screen has a visible button wholly inside the window. At the two school-laptop
 * sizes, every screen's visible buttons are inside the window too.
 *
 *   node _test/layout.js [repoRoot]
 */
'use strict';
const { serve, launch, components, sleep, checker, watchErrors } = require('./lib');
const { ok, report } = checker('layout');

const SIZES = [[1024, 640], [1366, 640], [1280, 600], [800, 600], [1280, 710], [1366, 768], [1920, 1080], [768, 1024]];
const WALK = [[1024, 640], [1366, 640]];

const measure = (page) => page.evaluate(() => {
  const r = document.getElementById('app').getBoundingClientRect();
  const btns = [...document.querySelectorAll('.screen.active button')]
    .filter((b) => b.offsetParent && /\S/.test(b.innerText))
    .map((b) => { const q = b.getBoundingClientRect(); return { t: b.innerText.trim(), l: q.left, top: q.top, r: q.right, b: q.bottom }; });
  return { vw: innerWidth, vh: innerHeight, l: r.left, t: r.top, r: r.right, b: r.bottom, btns };
});
const inside = (b, m) => b.l >= -1 && b.top >= -1 && b.r <= m.vw + 1 && b.b <= m.vh + 1;
const box = (b) => [b.l, b.top, b.r, b.b].map(Math.round).join(',');

(async () => {
  const srv = await serve(); const browser = await launch();
  try {
    for (const comp of components()) {
      const page = await browser.newPage();
      const errs = []; watchErrors(page, errs);
      await page.setViewport({ width: 1280, height: 710 });
      await page.goto(srv.base + comp + '/index.html', { waitUntil: 'networkidle0' });
      await sleep(1200);
      for (const [w, h] of SIZES) {
        await page.setViewport({ width: w, height: h }); await sleep(250);
        const m = await measure(page);
        const tag = comp.slice(-2) + ' @' + w + 'x' + h;
        const cx = (m.l + m.r) / 2, cy = (m.t + m.b) / 2;
        ok(tag + ' canvas centred', Math.abs(cx - m.vw / 2) <= 1 && Math.abs(cy - m.vh / 2) <= 1,
          cx.toFixed(1) + ',' + cy.toFixed(1) + ' vs ' + m.vw / 2 + ',' + m.vh / 2);
        ok(tag + ' canvas inside the window', inside({ l: m.l, top: m.t, r: m.r, b: m.b }, m), box({ l: m.l, top: m.t, r: m.r, b: m.b }));
        ok(tag + ' first screen has a button', m.btns.length > 0);
        m.btns.forEach((b) => ok(tag + ' "' + b.t + '" reachable', inside(b, m), box(b)));
      }
      const { start, end } = await page.evaluate(() => ({ start: PART_CONFIG.start, end: PART_CONFIG.end }));
      for (const [w, h] of WALK) {
        await page.setViewport({ width: w, height: h }); await sleep(250);
        let off = [];
        for (let n = start; n <= end; n++) {
          await page.evaluate((n) => goTo(n), n); await sleep(200);
          const m = await measure(page);
          m.btns.filter((b) => !inside(b, m)).forEach((b) => off.push('s' + n + ' "' + b.t + '" ' + box(b)));
        }
        ok(comp.slice(-2) + ' @' + w + 'x' + h + ' every screen\'s buttons reachable', !off.length, off.slice(0, 3).join(' | '));
      }
      ok(comp.slice(-2) + ' no page error', !errs.length, errs.slice(0, 2).join(' | '));
      await page.close();
    }
  } finally { await browser.close(); await srv.close(); }
  report();
})().catch((e) => { console.error(e); process.exitCode = 2; });
