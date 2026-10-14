# `_test/` — the unit's harness (never deployed)

Nothing here ships: the stub library shares its basename with the real CDN build **by design**, so
the whole folder stays out of every package (guide §11.1). Built 2026-10-08 with the platform
layer (`ADDING-REPORTING-AND-RESUME.md`). Unlike the jsdom harness of proportion-01, every
behaviour suite here drives **real Chrome** (puppeteer-core), from a **subpath**, with paths
resolved **case-exact** (`lib.js`), so layout, CSS `[hidden]`, media and the `../` depth are
exercised as on the CDN.

| File | What it asserts |
|---|---|
| `verify-report.js` | Static contracts, no browser: the 17-tag script order and one `?v=` on every code reference in all seven `index.html`; the boot cover; `-k` inside the `XAPI_USING_G` gate; no top-level name in two files; every file parses; `script.js` is data only; the character / result / nav-edge keys agree across `unit.js`, `40-resume.js` and the stub; no donor slug in code; ids byte for byte against `metadata/` (unit, component, every item and question); `SCREEN_TO_SUBCONTENT` = exactly the component's screens = exactly the catalogue's items; `XAPI_SCREEN_QUESTIONS` asks every declared question exactly once and nothing undeclared; every quiz screen mapped; `XAPI_EVAL_ITEMS` = the items with questions; `XAPI_GATE.need` = the number the component's first screen promises, and its "N סעיפים" = the component's question screens; seam ordering in `goTo`, `quizCheck` (report before marking, flush last — D-13), `quizOpenHint`, every Retry-gated handler, `carNext`, the guided first pick, `taskCheck`; the root launcher names a file. |
| `smoke.js` | No platform parameters (the plain-page regression gate, §6.8): every component lands on its first screen, walks every screen with no page / console error and no failed request, drops the boot cover, hides the cross-component "חזרה"; the production end reports, disables and stays; `?dev=1` hops; the old character key migrates. |
| `walk-404.js` | Every screen of every component from a subpath, case-exact, lazy images forced: no failed or 4xx request (§15.4 step 7). Lists the shipped files only requested after interaction (informational). |
| `statement-flow.js` | Against the stub: every component walked end to end (right; wrong for 02, 03, 06) and ended by its own last click. One component `initialized` / `completed` with the expected result and verdict; every catalogue item opened and completed exactly once, after its answers; every declared question one `answered.last` with the right success and an answer text; every id in `metadata/`; no unit-level statement; no duplicate; no navigation; 03 below its bar ends on s23 and never opens 005 / 006. |
| `issue-report.js` | The "מצאתם בעיה?" form in every component, with and without metadata. `fetch` is replaced and requests to Google aborted, so **nothing reaches the shared 720 form**. Dialogs hidden at rest; focus; empty submit; confirm-on-Escape; one no-cors POST with unit / component / item / page / type / text / date; the thanks state hides the form; reset; the screen never moves. |
| `resume.js` | Against the stub, reload of the same tab (§8): quiz single and value-input (attempts, the Retry signature, the retry look, the hint button, the toggle view), carousel, guided flow, class task (pending and checked, idempotent), nothing re-reported (answered, `requested.1`), B-1 seed, D-8 ended button, the 03 gate after a reload, the character carried into 02's own document, `?resetState`, one document per component. |
| `mutations.js` | 17 deliberate breaks, applied to a **copy** of the repo in the temp folder; each must turn its suite red; each file restored and byte-compared (§10.4). |
| `layout.js` | Real Chrome, 8 window sizes (1024×640 … 1920×1080, 768×1024): in every component the 1280×710 canvas is centred and wholly inside the window, the first screen's buttons are reachable, and at 1024×640 / 1366×640 every screen's buttons are. MOE tester 14.10.26 ("ברזולוציה 100 לא ניתן לצפות בכל היחידה"): 119 fails on the old `#stage`, 0 after. |
| `run-all.js` | The seven pass/fail suites in order; exit code 1 if any is red. |
| `live-kata.js` | **Live** Kata + live CDN, NOT in run-all (it writes to Kata — owner's go-ahead): launch links for two test learners from Kata's launcher, kept inside the process (no token printed); every component on its pass path with a mid-way reload (resume from Kata), the fail paths of 02 / 03 / 06; Kata's status on every statement and state request, the statements actually sent, the document read back, D-8. 2026-10-08: 295 / 295. |
| `css-snapshot.js` | A tool, not a suite: hashed computed style of every element, 7 components × every screen + three driven quiz states, at two window sizes; `--diff` two snapshots. How the `styles.css` clean-up was proven (0 differences). |
| `lib.js` | Shared: the subpath / case-exact server, Chrome, `checker()`, `ready()`, `readMeta()`. |
| `xapi-720-k.js` | Local stand-in for the CDN library over `sessionStorage` (from proportion-01, keys retargeted). Loaded only via `?xapiLib=../_test/xapi-720-k.js` on localhost. Console helpers: `__stmts() __state() __dupes() __reset() __failWrites(bool\|status) __setState(doc)`. |

## Running

Dependencies live **outside** the OneDrive tree (guide §10.1): `puppeteer-core` (and `css-tree`
for style work) in one folder — on this machine `%TEMP%/lomda-test`. Chrome is
`C:/Program Files/Google/Chrome/Application/chrome.exe` unless `CHROME` says otherwise. From the
repo root:

```bash
NODE_PATH=C:/Users/Vadim/AppData/Local/Temp/lomda-test/node_modules node _test/run-all.js
NODE_PATH=C:/Users/Vadim/AppData/Local/Temp/lomda-test/node_modules node _test/mutations.js
```

Each suite also runs alone (`node _test/resume.js`) and takes an optional repo root.

State on 2026-10-08: **verify-report 518 · smoke 57 · walk-404 2 · statement-flow 347 ·
issue-report 364 · resume 50 — 1,338 checks green (~3.5 min); 17 / 17 mutations caught (~12 min).**

## In a browser

```
http://localhost:<port>/methodica-math-proportion-02/methodica-math-proportion-02-01/index.html?xapiLib=../_test/xapi-720-k.js
```

Serve the folder **above** the repo so the unit sits on a subpath. Add `&resetState` for a clean
document, `&dev=1` for free navigation and the hops between components. Stub `fetch` before
trying the issue form — its endpoint is the real, shared 720 Google Form.

## Not covered here

A real Kata run (guide §12): the stub proves the **shape** of what is sent, not its **arrival**;
the real Google Form row in the shared sheet; the save on leaving the page (Chrome blocks a
synchronous request in `pagehide` — `Documentation/reporting-and-resume/KNOWN-ISSUE-dismissal-state-write.md`);
the iframe applets' internal state (not persisted by design — their answers are).
