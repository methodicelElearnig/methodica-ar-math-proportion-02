/* Every pass/fail suite, in order, against one repo; exit code 1 if any is red.
 *   node _test/run-all.js [repoRoot]          (mutations.js and css-snapshot.js run separately)
 */
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const SUITES = ['verify-report.js', 'smoke.js', 'walk-404.js', 'statement-flow.js', 'issue-report.js', 'resume.js'];
let red = [];
for (const s of SUITES) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(__dirname, s), root], { encoding: 'utf8', env: process.env });
  const lines = (r.stdout || '').trim().split('\n');
  const summary = lines.find((l) => /^\[[\w-]+\] pass \d+ fail \d+/.test(l)) || '(no summary) ' + (r.stderr || '').split('\n')[0];
  console.log(summary + `  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  lines.filter((l) => /^\s+FAIL /.test(l)).forEach((l) => console.log(l));
  if (r.status !== 0) red.push(s);
}
console.log(red.length ? 'RED: ' + red.join(', ') : 'ALL GREEN');
process.exitCode = red.length ? 1 : 0;
