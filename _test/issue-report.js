/* The issue report ("מצאתם בעיה?", guide §7) in every component, real Chrome. window.fetch is
 * replaced before the page's scripts run and any request to Google is aborted, so NOTHING reaches
 * the shared 720 Google Form — the captured body is asserted instead. Run with the stub library
 * (METADATA loaded) and without it (the folder-path fallback).
 *
 *   node _test/issue-report.js [repoRoot]
 */
'use strict';
const { sleep, serve, launch, checker, components } = require('./lib');
const { ok, report } = checker('issue-report');
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSfFq5XFtH1pPpLgV5RWT4m3NanYPW5GKremqTvkp6zKjEGqcw/formResponse';

(async () => {
  const srv = await serve(); const base = srv.base; const browser = await launch();
  const comps = components();
  for (const withMeta of [true, false]) {
    for (const comp of comps) {
      const tag = comp.slice(-2) + (withMeta ? '/meta' : '/nometa');
      const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 710 });
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      /* any real request to Google would be a leak — block and record it */
      await page.setRequestInterception(true);
      const leaked = [];
      page.on('request', (q) => { if (/docs\.google\.com/.test(q.url())) { leaked.push(q.url()); q.abort(); } else q.continue(); });
      await page.evaluateOnNewDocument(() => {
        window.__posts = [];
        const real = window.fetch;
        window.fetch = function (url, init) {
          if (/docs\.google\.com\/forms/.test(String(url))) {
            window.__posts.push({ url: String(url), init: { method: init.method, mode: init.mode }, body: init.body.toString() });
            return Promise.resolve({ ok: true, type: 'opaque' });   // what a no-cors POST resolves to
          }
          return real.apply(this, arguments);
        };
      });
      await page.goto(base + comp + '/index.html' + (withMeta ? '?xapiLib=../_test/xapi-720-k.js' : ''), { waitUntil: 'networkidle0' });
      if (withMeta) await page.waitForFunction(() => !!window.METADATA, { timeout: 15000 });
      await sleep(300);
      /* a screen that maps to an item, else the first */
      const target = await page.evaluate(() => {
        const keys = Object.keys(SCREEN_TO_SUBCONTENT).map(Number).filter((n) => SCREEN_TO_SUBCONTENT[n]);
        return keys.length ? keys[keys.length - 1] : PART_FIRST;
      });
      await page.evaluate((n) => goTo(n), target); await sleep(300);
      const vis = (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getClientRects().length > 0; }, sel);
      ok(tag + ' dialogs hidden at rest', !(await vis('#report-modal')) && !(await vis('#report-confirm-modal')));
      ok(tag + ' flag visible', await vis('.flag-btn'));
      await page.click('.flag-btn'); await sleep(150);
      ok(tag + ' flag opens the form', await vis('#report-modal'));
      ok(tag + ' focus on the type field', await page.evaluate(() => document.activeElement && document.activeElement.id === 'report-type'));
      ok(tag + ' thanks hidden in the form', !(await vis('#report-thanks')));
      /* submit empty -> error, nothing sent */
      await page.evaluate(() => submitReport()); await sleep(50);
      ok(tag + ' empty submit shows the error', await vis('#report-error'));
      ok(tag + ' empty submit sends nothing', (await page.evaluate(() => __posts.length)) === 0);
      /* partly filled + Escape -> confirm dialog; back to the form */
      await page.type('#report-text', 'בדיקה');
      await page.keyboard.press('Escape'); await sleep(50);
      ok(tag + ' Escape on a filled form asks to confirm', (await vis('#report-confirm-modal')) && !(await vis('#report-modal')));
      await page.evaluate(() => backToReportForm()); await sleep(50);
      ok(tag + ' back to the form keeps the text', await page.evaluate(() => document.getElementById('report-text').value === 'בדיקה'));
      /* real submit */
      await page.select('#report-type', 'technical');
      await page.evaluate(() => { const t = document.getElementById('report-text'); t.value = 'בדיקת QA אוטומטית'; t.dispatchEvent(new Event('input', { bubbles: true })); });
      ok(tag + ' char counter', await page.evaluate(() => document.getElementById('report-char-count').textContent === 'בדיקת QA אוטומטית'.length + ' / 250'));
      await page.click('#report-modal .report-actions .report-submit-btn'); await sleep(100);
      const posts = await page.evaluate(() => __posts);
      ok(tag + ' one POST', posts.length === 1, posts.length);
      const p = posts[0] || { body: '' };
      const b = Object.fromEntries(new URLSearchParams(p.body));
      ok(tag + ' to the shared form, no-cors POST', p.url === FORM && p.init && p.init.method === 'POST' && p.init.mode === 'no-cors', JSON.stringify(p.init));
      ok(tag + ' unit slug', b['entry.1933069481'] === 'methodica-math-proportion-02', b['entry.1933069481']);
      ok(tag + ' component slug', b['entry.2070680092'] === comp, b['entry.2070680092']);
      const map = await page.evaluate((n) => SCREEN_TO_SUBCONTENT[n], target);
      ok(tag + ' item', b['entry.1555704258'] === (map ? comp + '-' + map[0] : ''), b['entry.1555704258']);
      ok(tag + ' page', b['entry.1671046914'] === (map ? String(map[1]) : String(target)), b['entry.1671046914']);
      ok(tag + ' type text', b['entry.1179822443'] === 'תקלה טכנית או שמשהו לא עובד', b['entry.1179822443']);
      ok(tag + ' free text', b['entry.806447525'] === 'בדיקת QA אוטומטית');
      ok(tag + ' date/time fields', ['entry.301404029_year', 'entry.301404029_month', 'entry.301404029_day', 'entry.2066097581_hour', 'entry.2066097581_minute'].every((k) => /^\d+$/.test(b[k] || '')));
      ok(tag + ' thanks shown, form parts hidden', (await vis('#report-thanks')) && !(await vis('#report-modal .report-actions')) && !(await vis('#report-modal .report-field')));
      await page.click('#report-thanks .report-submit-btn'); await sleep(80);
      ok(tag + ' close resets and hides', !(await vis('#report-modal')) && await page.evaluate(() => document.getElementById('report-text').value === '' && document.getElementById('report-type').value === ''));
      /* re-open shows a clean form again */
      await page.click('.flag-btn'); await sleep(80);
      ok(tag + ' re-open shows the form, not the thanks', (await vis('#report-modal .report-actions')) && !(await vis('#report-thanks')));
      await page.keyboard.press('Escape'); await sleep(50);
      ok(tag + ' Escape on an empty form just closes', !(await vis('#report-modal')) && !(await vis('#report-confirm-modal')));
      /* the screen under it did not move, and nothing was reported to xAPI by the report */
      ok(tag + ' screen unchanged', (await page.evaluate(() => currentScreen)) === target);
      ok(tag + ' no page errors', errs.length === 0, errs.join(' | '));
      ok(tag + ' nothing leaked to Google', leaked.length === 0, leaked.join(','));
      await page.close();
    }
  }
  await browser.close(); await srv.close();
  report();
})();
