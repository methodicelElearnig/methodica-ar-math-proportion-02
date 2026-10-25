/* Mutation tests (guide §10.4): a suite that cannot fail proves nothing. Each mutation below is a
 * real way this integration has broken in the family; applied to a COPY of the repo (never the
 * working tree), it must turn its suite red. Each file is restored and byte-compared afterwards.
 *
 *   node _test/mutations.js            (all; ~10 min — the browser suites run once per mutation)
 *   node _test/mutations.js 3 8        (only those numbers)
 */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const SRC = path.resolve(__dirname, '..');
const UNIT = path.basename(SRC);
const COPY = path.join(os.tmpdir(), UNIT + '-mutations', UNIT);

const M = [
  ['the library letter left out of the XAPI_USING_G regex (§3.5)', 'verify-report.js', 'unit-js/50-loader.js',
    '/xapi-720-[ghijk]\\.js/', '/xapi-720-[ghij]\\.js/'],
  ['a screen missing from SCREEN_TO_SUBCONTENT (§6.2 trap 1)', 'verify-report.js', UNIT + '-01/script.js',
    '  9: null,\n', ''],
  ['a declared question never asked (D-9)', 'verify-report.js', UNIT + '-01/script.js',
    "  8: ['q1', 'q2'],", "  8: ['q1'],"],
  ['a gate that is not the number on screen (§6.4)', 'verify-report.js', UNIT + '-06/script.js',
    "var XAPI_GATE = { of: 'screens', need: 4 };", "var XAPI_GATE = { of: 'screens', need: 5 };"],
  ['03 below its bar no longer ends on s23', 'statement-flow.js', UNIT + '-03/script.js',
    ', need: 3, at: 23 };', ', need: 3 };'],
  ['the character key not namespaced per unit (D-6)', 'verify-report.js', 'unit-js/40-resume.js',
    "var UI_CHARACTER_KEY = 'methodica_math_proportion_02_selectedCharacter';", "var UI_CHARACTER_KEY = 'selectedCharacter';"],
  ['no flush after the answer is committed (D-13)', 'verify-report.js', 'unit-js/quiz-engine.js',
    'try { onQuizCommitted(screen); }', 'try { }'],
  ['the Retry signature not saved (§8.8 rule 9)', 'resume.js', 'unit-js/70-platform.js',
    "'selected', 'selectedSet', 'lw', 'tgl']", "'selected', 'selectedSet', 'tgl']"],
  ['the class-task painter off (§8.9)', 'resume.js', 'unit-js/70-platform.js',
    "document.querySelector('.ct-screen[data-screen=\"' + n + '\"]')) _paintTask(n);", "false) _paintTask(n);"],
  ['no repaint on navigation (§8.4a)', 'resume.js', 'unit-js/engine.js',
    'try { repaintScreen(n); }', 'try { }'],
  ['the carousel answer not reported', 'statement-flow.js', 'unit-js/carousel.js',
    'try { onCarAnswered(i, ok); }', 'try { }'],
  ['the guided answer not reported', 'statement-flow.js', 'unit-js/guided.js',
    'try { onGuidedAnswered(i, +b.dataset.k); }', 'try { }'],
  ['the character pick bypasses the document', 'resume.js', 'unit-js/unit.js',
    "if (typeof setUnitCharacter === 'function') setUnitCharacter(cardEl.dataset.value);", "if (false) setUnitCharacter(cardEl.dataset.value);"],
  ['[hidden] loses to display:flex in the report form (§9)', 'issue-report.js', 'unit-css/styles.css',
    '#report-modal [hidden] { display: none; }', ''],
  ['the issue report loses the item', 'issue-report.js', 'unit-js/report-modal.js',
    "return { item: reportComponentId() + '-' + map[0], page: String(map[1]) };", "return { item: '', page: String(map[1]) };"],
  ['the intro promises a section count the component does not have (07, fixed 2026-10-12)', 'verify-report.js', UNIT + '-07/index.html',
    'יש בה 6 סעיפים', 'יש בה 5 סעיפים'],
  ['the hint reported on every open (D-7 dedupe off)', 'resume.js', 'unit-js/20-xapi.js',
    'if (XAPI_HINTS_SENT[_k]) return;', '',
    /* the ledger still dedupes across reloads — remove it too, as the bug was */
    ['unit-js/40-resume.js', 'if (alreadySent(ledger, key)) return true;', '']],
  ['the s6 video gate never entered (monday 02-01-003)', 'video-gate.js', 'unit-js/unit.js',
    '    case 6: videoGateEnter(6); break;', ''],
  ['the s6 player reports no played / paused (§6.9.2)', 'video-gate.js', 'unit-js/unit.js',
    "try { if (typeof xapiYouTubeState === 'function') xapiYouTubeState(e, item); } catch (err) {}", ''],
  ['the watch gate not saved — the video asked again after a reload (§6.9.3)', 'video-gate.js', 'unit-js/70-platform.js',
    'CUSTOM_STATE[n] = { watched: true };', ''],
];

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === '.out') continue;
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyTree(a, b); else fs.copyFileSync(a, b);
  }
}

const only = process.argv.slice(2).map(Number).filter(Boolean);
fs.rmSync(path.dirname(COPY), { recursive: true, force: true });
copyTree(SRC, COPY);
console.log('[mutations] copy at ' + COPY);

let caught = 0, missed = [], broken = [];
M.forEach((m, i) => {
  const n = i + 1;
  if (only.length && !only.includes(n)) return;
  const [name, suite, file, from, to, extra] = m;
  const edits = [[file, from, to]].concat(extra ? [extra] : []);
  const saved = edits.map(([f]) => [f, fs.readFileSync(path.join(COPY, f))]);
  let applied = true;
  for (const [f, a, b] of edits) {
    const p = path.join(COPY, f), s = fs.readFileSync(p, 'utf8');
    if (s.split(a).length !== 2) { applied = false; broken.push(n + ' anchor not found exactly once in ' + f); break; }
    fs.writeFileSync(p, s.replace(a, b));
  }
  if (applied) {
    const r = spawnSync(process.execPath, [path.join(COPY, '_test', suite), COPY], { encoding: 'utf8', env: process.env, timeout: 15 * 60000 });
    /* Red means the suite RAN and failed an assertion. A crash (syntax error, no summary line) is
       not a catch — it would make any mutation look caught. */
    const fails = (r.stdout || '').split('\n').filter((l) => /^\s+FAIL /.test(l));
    const ran = /\] pass \d+ fail \d+/.test(r.stdout || '');
    if (!ran) broken.push(n + ' suite did not run: ' + ((r.stderr || '').split('\n').find(Boolean) || 'no output'));
    const red = ran && r.status !== 0 && fails.length > 0;
    console.log(`  ${red ? 'CAUGHT' : 'MISSED'} #${n} ${name} [${suite}]` + (red ? ` — ${fails.length} failing, e.g. ${(fails[0] || '').trim().slice(0, 110)}` : ''));
    if (red) caught++; else missed.push(n);
  }
  saved.forEach(([f, buf]) => {
    fs.writeFileSync(path.join(COPY, f), buf);
    if (!fs.readFileSync(path.join(COPY, f)).equals(fs.readFileSync(path.join(SRC, f)))) broken.push(n + ' restore mismatch ' + f);
  });
});
const total = only.length ? only.length : M.length;
console.log(`[mutations] caught ${caught} / ${total}` + (missed.length ? ' — MISSED ' + missed.join(',') : '') + (broken.length ? ' — BROKEN ' + broken.join('; ') : ''));
fs.rmSync(path.dirname(COPY), { recursive: true, force: true });
process.exitCode = (caught === total && !broken.length) ? 0 : 1;
