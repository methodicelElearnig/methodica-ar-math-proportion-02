/* Computed-style snapshot of every component, every screen, in real Chrome — for proving that a
 * stylesheet (or markup) edit changes nothing the learner can see. A TOOL, not a pass/fail suite:
 * take a snapshot before the edit, one after, and diff them. Used for the styles.css clean-up of
 * 2026-10-08 (305a68c, 40c325b: 170 states, 25,246 element records, 0 differences).
 *
 *   node _test/css-snapshot.js <out.json> [repoRoot]      (COMPS=<regex> limits the components,
 *   node _test/css-snapshot.js --diff a.json b.json        FULL=<regex> keeps full records)
 *
 * Records are hashed per element (the full text of 170 states does not fit one JSON string);
 * FULL=<regex of state keys> keeps the readable record for the states being investigated.
 * Property order is sorted (Chrome enumerates custom properties in a varying order) and every
 * animation is settled before reading, so two snapshots of the same code are identical.
 *
 * Per component: the whole document at load at two viewports (every element, hidden ones too, so
 * rules for other screens are exercised), then per screen the active screen + chrome, and on every
 * quiz screen three driven states: first wrong check, hint open, second wrong check.
 */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');

if (process.argv[2] === '--diff') {
  const a = JSON.parse(fs.readFileSync(process.argv[3])), b = JSON.parse(fs.readFileSync(process.argv[4]));
  let diffs = 0, shown = 0, states = 0, els = 0;
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    states++;
    const A = a[k] || {}, B = b[k] || {};
    for (const e of new Set([...Object.keys(A), ...Object.keys(B)])) {
      if (/(^|>)script:\d+/.test(e)) continue;      // added <script> tags are not rendering
      els++;
      if (A[e] === B[e]) continue;
      diffs++;
      if (shown++ < 25) {
        const pa = Object.fromEntries((A[e] || '').split('\u0001').map((x) => x.split('\u0002')));
        const pb = Object.fromEntries((B[e] || '').split('\u0001').map((x) => x.split('\u0002')));
        const d = [...new Set([...Object.keys(pa), ...Object.keys(pb)])].filter((p) => pa[p] !== pb[p])
          .map((p) => p + ': ' + pa[p] + ' -> ' + pb[p]);
        console.log('DIFF', k, '|', e, '\n   ', d.slice(0, 6).join('\n    '));
      }
    }
  }
  console.log(`states ${states}, element-records ${els}, differing ${diffs}`);
  process.exit(diffs ? 1 : 0);
}

const puppeteer = require('puppeteer-core');
const OUT = process.argv[2], ROOT = path.resolve(process.argv[3] || path.join(__dirname, '..'));
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const UNIT = path.basename(ROOT);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': T[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* In-page: computed style of a subtree, keyed by a stable DOM path. */
const COLLECT = (scopeSel) => {
  /* Settle time: finite animations jump to their end, infinite ones park at 0. */
  document.getAnimations().forEach((a) => {
    try {
      const t = a.effect && a.effect.getComputedTiming();
      if (t && Number.isFinite(t.endTime)) a.finish(); else { a.pause(); a.currentTime = 0; }
    } catch (e) { try { a.pause(); a.currentTime = 0; } catch (e2) {} }
  });
  const pathOf = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      let i = 0; for (let s = n; (s = s.previousElementSibling);) if (s.tagName === n.tagName) i++;
      parts.unshift(n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + ':' + i);
    }
    return parts.join('>');
  };
  /* Full text only when window.__FULL is set (targeted re-run); otherwise a 53-bit hash. */
  const hash = (str) => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };
  const ser = (cs) => { const o = []; for (let i = 0; i < cs.length; i++) { const p = cs[i]; o.push(p + '\u0002' + cs.getPropertyValue(p)); } const t = o.sort().join('\u0001'); return window.__FULL ? t : hash(t); };
  const roots = scopeSel === '*' ? [document.documentElement]
    : [...document.querySelectorAll(scopeSel)];
  const out = {};
  const seen = new Set();
  roots.forEach((r) => [r, ...r.querySelectorAll('*')].forEach((el) => {
    if (seen.has(el)) return; seen.add(el);
    if (scopeSel !== '*' && el.closest('.screen') && !el.closest('.screen.active')) return;
    const k = pathOf(el);
    out[k] = ser(getComputedStyle(el));
    for (const pe of ['::before', '::after']) {
      const c = getComputedStyle(el, pe);
      if (c.content && c.content !== 'none' && c.content !== 'normal') out[k + pe] = ser(c);
    }
  }));
  return out;
};

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const FULL = process.env.FULL || '';  // regex of state keys to record in full
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const snap = {};
  const errors = [];
  const comps = fs.readdirSync(ROOT).filter((d) => /^methodica-.*-\d\d$/.test(d) && (!process.env.COMPS || new RegExp(process.env.COMPS).test(d))).sort();
  try {
    for (const comp of comps) {
      const ctx = await browser.createBrowserContext(); const page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(comp + ': ' + e.message));
      for (const [w, h] of [[1280, 710], [900, 560]]) {
        await page.setViewport({ width: w, height: h });
        await page.goto(base + comp + '/index.html', { waitUntil: 'networkidle0' });
        await sleep(1500);
        await page.evaluate((f) => { window.__FULL = f; }, !!FULL && new RegExp(FULL).test(`${comp}|load|${w}x${h}`));
        snap[`${comp}|load|${w}x${h}`] = await page.evaluate(COLLECT, '*');
      }
      await page.setViewport({ width: 1280, height: 710 });
      await page.goto(base + comp + '/index.html', { waitUntil: 'networkidle0' });
      await sleep(800);
      const range = await page.evaluate(() => [PART_CONFIG.start, PART_CONFIG.end]);
      const full = (k) => page.evaluate((f) => { window.__FULL = f; }, !!FULL && new RegExp(FULL).test(k));
      const SCOPE = '#app > :not(.screen), .screen.active, body > :not(#app):not(script)';
      for (let n = range[0]; n <= range[1]; n++) {
        await page.evaluate((n) => goTo(n), n); await sleep(1300);
        await full(`${comp}|s${n}`);
        snap[`${comp}|s${n}`] = await page.evaluate(COLLECT, SCOPE);
        const q = await page.evaluate((n) => {
          const q = (typeof QUESTIONS !== 'undefined') && QUESTIONS.find((x) => x.screen === n);
          return q ? { type: q.type, correct: q.correct || null } : null;
        }, n);
        if (!q) continue;
        const wrong = async () => page.evaluate((n, q) => {
          const sec = document.getElementById('q' + n);
          if (q.type === 'single') {
            const opt = [...sec.querySelectorAll('[data-id]')].find((o) => o.dataset.id !== String(q.correct));
            if (opt) quizSelect(n, opt);
          } else {
            sec.querySelectorAll('input').forEach((i) => { i.value = '987'; i.dispatchEvent(new Event('input', { bubbles: true })); });
          }
          quizCheck(n);
        }, n, q);
        await wrong(); await sleep(900);
        await full(`${comp}|s${n}|w1`);
        snap[`${comp}|s${n}|w1`] = await page.evaluate(COLLECT, SCOPE);
        await page.evaluate((n) => quizOpenHint(n), n); await sleep(700);
        await full(`${comp}|s${n}|hint`);
        snap[`${comp}|s${n}|hint`] = await page.evaluate(COLLECT, SCOPE);
        await page.evaluate((n) => { if (typeof quizCloseHint === 'function') quizCloseHint(n); }, n); await sleep(400);
        await wrong(); await sleep(900);
        await full(`${comp}|s${n}|w2`);
        snap[`${comp}|s${n}|w2`] = await page.evaluate(COLLECT, SCOPE);
      }
      await ctx.close();
      process.stdout.write(comp + ' ');
    }
  } finally { await browser.close(); server.close(); }
  fs.writeFileSync(OUT, JSON.stringify(snap));
  console.log('\nstates', Object.keys(snap).length, 'pageerrors', errors.length);
  errors.slice(0, 10).forEach((e) => console.log('  ' + e));
})();
