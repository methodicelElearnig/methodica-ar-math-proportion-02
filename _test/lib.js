/* Shared by every suite in _test/ (never deployed — guide §11.1).
 *
 *   ROOT     the repo to test: argv[2], else the repo this file sits in. mutations.js points the
 *            suites at a mutated copy this way.
 *   serve()  a static server that mounts ROOT under /<unit>/ — a SUBPATH, so a wrong `../` depth
 *            fails here as it would on the CDN (browsers clamp `..` at the server root, guide
 *            §15.3) — and resolves paths CASE-EXACT (Windows' filesystem would not).
 *   launch() headless Chrome (puppeteer-core; CHROME overrides the executable).
 *   checker() ok(name, cond, detail) / report() — prints the failures, sets the exit code.
 */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const UNIT = path.basename(ROOT);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const LIB = '?xapiLib=../_test/xapi-720-k.js';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.webp': 'image/webp' };

function caseExact(file) {
  const rel = path.relative(ROOT, file).split(path.sep);
  let d = ROOT;
  for (const seg of rel) {
    if (!fs.existsSync(d) || !fs.readdirSync(d).includes(seg)) return false;
    d = path.join(d, seg);
  }
  return fs.statSync(file).isFile();
}

/* Resolves to { base, served:Set, close() }. base = http://127.0.0.1:<port>/<unit>/ */
function serve() {
  const served = new Set();
  const server = http.createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    if (!u.startsWith('/' + UNIT + '/')) { r.writeHead(404); return r.end(); }
    const f = path.join(ROOT, u.slice(UNIT.length + 2));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || !caseExact(f)) { r.writeHead(404); return r.end(); }
    served.add(path.relative(ROOT, f).replace(/\\/g, '/'));
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
  return new Promise((res) => server.listen(0, '127.0.0.1', () => res({
    base: `http://127.0.0.1:${server.address().port}/${UNIT}/`, served,
    close: () => new Promise((c) => server.close(c)),
  })));
}

function launch() {
  const puppeteer = require('puppeteer-core');
  return puppeteer.launch({ executablePath: CHROME, headless: 'new' });
}

/* The component folders, sorted: <unit>-01 … <unit>-07 */
function components() {
  return fs.readdirSync(ROOT).filter((d) => new RegExp('^' + UNIT + '-\\d\\d$').test(d)).sort();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function checker(suite) {
  let pass = 0; const fail = [];
  return {
    ok(name, cond, detail) { if (cond) pass++; else fail.push(name + (detail !== undefined && detail !== '' ? ' -> ' + detail : '')); },
    report() {
      console.log(`[${suite}] pass ${pass} fail ${fail.length}`);
      fail.forEach((f) => console.log('  FAIL ' + f));
      process.exitCode = fail.length ? 1 : 0;
      return fail.length;
    },
  };
}

/* Page errors and console errors on a page; network errors ("Failed to load resource") are the
   caller's business (walk-404.js). */
function watchErrors(page, into) {
  page.on('pageerror', (e) => into.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) into.push('console ' + m.text()); });
}

/* Once the platform layer has booted against the stub: metadata in, writes open, cover gone. */
async function ready(page) {
  await page.waitForFunction(() => window.METADATA && window.XAPI_USING_G && typeof _resumeReady !== 'undefined' &&
    _resumeReady && !document.getElementById('boot-cover'), { timeout: 15000 });
  await sleep(250);
}

function readMeta(comp) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'metadata', comp + '.json'), 'utf8').replace(/^\uFEFF/, ''));
}

module.exports = { ROOT, UNIT, LIB, serve, launch, components, sleep, checker, watchErrors, ready, readMeta };
