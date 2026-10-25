# methodica-math-proportion-02 — xAPI reporting, issue reporting, resume

The unit record. The family guide is
`2026/Documentation/reporting-and-resume/ADDING-REPORTING-AND-RESUME.md`; this file says only what
is specific to this unit and what was decided. Branch `vadimr/feat/reporting-resume`, 2026-10-08.

## 0. History

| Commit | Phase |
|---|---|
| `31f52ec` | owner's `metadata/` (7 components, 24 items, 38 questions) |
| `d5cee6f` `347d887` | `.gitattributes` (LF) / `.gitignore`; stray QA probe removed |
| `305a68c` `40c325b` `2ab4eb9` | **optimization:** `styles.css` 259,520 → 186,735 B — 1,258 declarations that can never win (later same selector, same context) and the rules of 214 class / id names used nowhere; proven by a 170-state computed-style snapshot in Chrome, 0 differences (`_test/css-snapshot.js`) |
| `07503d8` | the platform layer installed (from proportion-01) |
| `0ebfa0f` | per-component maps and gates; the carousel and guided flow report |
| `d4c1f40` | issue report; fixed the form staying visible under the thanks message |
| `3a136a8` | resume of the class task; the resume path verified |
| `300f13e` | `_test/` harness: 1,336 checks, 16 / 16 mutations |
| `c8bebba` | tooling, docs, `?v=20261008b` — **package `deployments/2026-10-08`, uploaded by the owner** |
| `74ccab9` | content URL confirmed; the upload checked: 109 / 109 files byte-identical on the CDN |
| — | **metadata sent to Kata and the live run — §6** |
| `2773ad0` | **image resize** (owner's go-ahead "if it preserves quality"), `?v=20261008c` |
| `791bfe2` | **the unused `calculator` / `measuring` stills removed** (owner's go-ahead, −3.7 MB), `?v=20261008d` |
| `fef19f7` | **package `deployments/2026-10-08b` uploaded by the owner — verified 105 / 105 byte-identical on the CDN**; the seven components **published** in Kata by the owner (`send-metadata.ps1 -Status`: published=7, draft=0) |
| `9f6c06c` (PR #2, merged `c52c1fb`) | **the two unused green clips removed** (−2.1 MB), `?v=20261008e` — **package `deployments/2026-10-08c` (103 files) uploaded by the owner, verified 103 / 103 byte-identical on the CDN** |
| `vadimr/fix/s6-video-gate` (2026-10-25) | **s6 video: המשך locked until the END** (content team, monday 02-01-003) **and `played` / `paused` reported** against item 003 (guide §6.9); the `<video>` latch replaced by the state machine; `?v=20261025a`; `_test/video-gate.js` — package `deployments/2026-10-25` |

**Image resize.** Every raster image was measured at the largest size it is displayed at (canvas
pixels, every screen, every carousel / guided step, both companions, every zoom view) and kept at
≥ 2.5× that; only files ≥ 25 % above it were resized (Lanczos, new names): `expo-print.jpg`
1865×2476 → 565×750, `character-squashed-yellow` 1064×633 → 715×425, `character-victory-yellow`
418×1024 → 328×804 — −1.43 MB. Screens showing them, captured at device-pixel-ratio 2 before /
after: mean change 2–2.7 / 255, at most 17 of 3.6 M pixels flagged visible (edges). Lossless PNG
re-compression gains nothing (already optimal). Not resized: everything else is shown at or near
its stored size — the `expo-intro` / `expo-end` backgrounds (1.8 MB each) fill the canvas from
1400×933, and smaller files would need lossy re-encoding.
**Removed:** the `calculator` and `measuring` stills, both colours (3.7 MB) — listed in
`unit.js CHARACTER_ASSETS` but never used, checked three ways: no mention anywhere but that map;
no screen, step config (`cfg.monster`) or `POSE_FALLBACK` chain asks for those poses (`calc` is the
clip, another pose); a full walk with each companion — every screen, carousel and guided step,
every question answered wrong twice with its hint — never requested the files. After removal: both
companions walked, 449 requests, 0 failed; `run-all` green.
**Removed too (owner's go-ahead, PR #2):** two green
clips, never used — `character-green-selection.mp4` (1,579,618 B; 01's s0 card plays
`character-green-ball.mp4` in its markup and nothing asks for the `selection` pose) and
`character-green-cube.mp4` (506,177 B; the `cube` pose is only `cube2`'s fallback, and green has
its own `cube2`). Same three checks; the runtime walk waited for each screen's media and requested
all 15 other clips, `cube2` included, never these two. After removal: both companions, 449
requests, 0 failed; `run-all` green. `?v=20261008e`. The fonts were already one subset variable woff2; the assets were already
hoisted, with no duplicates (md5).

## 1. The layer

Copied from **methodica-math-proportion-01** — the same 720-core engine (`engine.js`,
`quiz-engine.js`), itself from ratio-04 — so B-1, B-2, O-1, D-7, D-8, D-13 and the Retry gate came
with it. Library `xapi-720-k` (`50-loader.js`; the letter is inside the `XAPI_USING_G` gate).
Script order and the role of each file: `unit-js/README.md`.

Ids (`unit-js/10-identity.js`): prefix `https://lomdot.education.gov.il/metodica/720active/math/proportion/02/`;
unit id the bare slug `methodica-math-proportion-02` (= `metadata/*_unit.json`); component
`<prefix><slug>/`; item `<component id><slug>-NNN/`; question `<item id>qN`. Verified byte for
byte by `_test/verify-report.js`.

What this unit added to the donor's glue (`unit-js/70-platform.js`):
- **the carousel (s5, item 002)** — its four graded steps (4, 6, 9, 10) are q1–q4, one attempt
  each; `carousel.js` calls `onCarAnswered` / `onCarChanged`; `carState` travels in the payload
- **the guided flow (s8, item 004)** — its two question steps are q1, q2; the first click is the
  answer (`onGuidedAnswered`); `gState` travels in the payload
- **the class task (s28–s34, item 04-001)** — declares no question, so it reports nothing, but it is
  resumed: the learner's values (their own, not the revealed key), which screens were checked, the
  answer-toggle view; `classtask.js` calls `onTaskChecked`; `_paintTask` replays its handlers
- ArrowLeft leaves s5 / s8 only from their last step, a keyed class-task screen only once checked
- the answer toggle's view (`st.tgl`, values `solution` / `answer`) is persisted for quiz screens
  and the class task alike

Changes to the vendored core (all guarded with `typeof`, so the core runs without the layer):
`engine.js` (gate, `partExit` at the part edges, repaint / item / save after every `goTo`, keyboard
gate, boot handed to `partBoot`), `quiz-engine.js` (Retry gate, `onQuizAnswered` /
`onQuizCommitted` / `onQuizHint`, toggle view), `unit.js` (character key, see §4), `carousel.js`,
`guided.js`, `classtask.js` (one hook call each).

## 2. Map, questions, gates

Screens keep the unit's global numbering (0–59); every component's `script.js` maps exactly its
own screens. Transitions, the character pick (s0) and 07's closing picture (s59) carry no item.

| Comp | Items → screens | Gate (what the first screen promises) | Result |
|---|---|---|---|
| 01 | 001 s1–4 · 002 s5 · 003 s6 (video) · 004 s7–8 · 005 s10 · 006 s11 | none | correct ÷ declared, success |
| 02 | 001–004 = s13–16 | s12 "4 שאלות · 3 לפחות" → items, need 3 | below 3: success false; **no `recommendedAfterFail`** (open) |
| 03 | 001 s18–19 · 002 s20–21 · 003 s22 · 004 s23 · 005 s25 · 006 s26 | s17 "3 … כדי להתקדם" → items 001–004, need 3, **at s23** | below 3 the component ENDS on s23, success false; `recommendedAfterFail` → 02 |
| 04 | 001 = s28–34 (class task) | none | success, no score (§6.4) |
| 05 | 001 s36 · 002 s37–39 · 003 s40–41 · 004 s42 · 005 s43–44 | none | correct ÷ declared, success |
| 06 | 001 = s46–50 (q1–q5) | s45 "5 סעיפים · 4 לפחות" → screens, need 4 | |
| 07 | 001 = s52–58 (q1–q6) | s51 "6 סעיפים · 4 לפחות" → screens, need 4 | (the text said 5 until 2026-10-12 — fixed, team's decision) |

Video (since 2026-10-25): screen 6's YouTube (item 003) is VideoWatchAndContinue — המשך, and
ArrowLeft, stay locked until the video reaches its END (content team, monday 02-01-003). `unit.js`
builds the `youtube-nocookie` iframe itself (`enablejsapi=1`, `origin`, nothing from the launch
URL) and attaches `YT.Player` with events only, so D-1 (the `forigin` token leak, §6.9.1) cannot
happen. `played` / `paused` go out through `xapiYouTubeState` (§6.9.2: one flag per player, the
first `played` sent, no orphan `paused`, seeks silent, ENDED reports nothing; objectId = item 003);
leaving s6 pauses the player. The gate is state (§6.9.3): `CUSTOM_STATE[6] = { watched: true }`,
flushed on ENDED, so a reload, Back from s7 or a resume never asks again. Never trapped: if the
IFrame API fails to load, the player errors, or it is not ready within 15 s, המשך opens for that
page load (not saved). No `<video>` opts in (`data-xapi-report`); the character clips are decoration.
Checked with the real player (headless Chrome, 2026-10-25): locked → ENDED → open and saved;
`played@0 · paused@2 · played@50` on 003; 33 YouTube requests, none carrying the launch query.

## 3. Issue report

`unit-js/report-modal.js` from proportion-01: the shared 720 Google Form; unit and component from
`METADATA` (folder path as the fallback), item and page from `SCREEN_TO_SUBCONTENT`. Fixed here:
`.report-field` / `.report-actions` set `display:flex`, which beat `[hidden]`, so after sending the
whole form stayed under "תודה! הדיווח נשלח" (present since the unit was built) —
`#report-modal [hidden] { display: none; }`.

## 4. Character

Picked on 01's s0. The key is now `methodica_math_proportion_02_selectedCharacter` (QA D-6);
`unit.js` moves the pre-integration key `proportion02_selectedCharacter` once. The pick goes
through `setUnitCharacter` into 01's own document at once; later components adopt it from the
localStorage mirror into their own document (`adoptUnitCharacter`).

## 5. Tests

`_test/README.md`. `run-all.js` — 1,336 checks in real Chrome from a subpath; `mutations.js` —
16 / 16. Not covered: a live Kata run (§6), the real row in the shared form's sheet, the save on
leaving the page (`KNOWN-ISSUE-dismissal-state-write.md`), the iframe applets' internal state
(not persisted by design; their answers are).

## 6. Catalogue, package, live run

- `send-metadata.ps1` / `retrieve-metadata.ps1` / `SEND-METADATA.md` from proportion-01, retargeted:
  `$ContentBaseUrl = …/720/math/proportion/02` (family convention, **confirmed by the owner 2026-10-08**; package uploaded there the same day),
  `$IdBase = …/720active/math/proportion/02`. `kata-api-key.txt` is git-ignored and never shipped.
- `package-allowlist.ps1` — this unit also ships each component's **`applets/`** (proportion-01
  hoisted its applets, so its allowlist had only `assets/`).
- `build-package.ps1` → `../../deployments/<date>/`, `verify-package.ps1`.
- **Kata, 2026-10-08** (the owner's go-ahead for each step; logs git-ignored in this folder):
  `-Preflight` → `absent=8 exists=0` (key accepted); `-DryRun` → `created=32 updated=1 failed=0`,
  the seven `hostedContentRef` = `…/720/math/proportion/02/<component>/index.html` (the URLs the
  upload check covered); **live → 32 × HTTP 201** (1 unit, 7 components, 24 items) and **03's
  `recommendedAfterFail` → 02 linked (HTTP 200)**, `failed=0`; `retrieve-metadata.ps1 -FailOnDrift`
  → 1 / 7 / 24, `warnings=0`, and an independent comparison of `metadata-from/` with `metadata/`:
  53 / 53 equal (ids, items, question ids, routing). Components are created as `draft` — not
  published (`-Publish` is one-way and was not run).

## 6a. Live Kata run — 2026-10-08

`_test/live-kata.js`, headless Chrome, the **uploaded** package on the live CDN against live Kata.
Launch links from Kata's launcher for two pseudonymous learners, `resetState:true`, kept inside the
process — **no token entered the transcript**. Observed: the statement bodies the page actually
POSTed to Kata, Kata's status on every statement and state request, `stateLastResult720()`, the
state document read back. **295 / 295.**

| Comp. | Path (registration) | Component `completed` | Also verified live |
|---|---|---|---|
| 01 | A pass (`9249bbf1`) | `true / 1` | reload on the carousel → state read 200, landed on s5, verdicts restored, nothing re-sent |
| 02 | A pass (`0d1c55c1`) | `true / 1` | reload on s14 |
| 02 | B fail (`566ccd63`) | `false / 0` | below the 3-of-4 bar |
| 03 | A pass (`5e65965f`) | `true / 1` | reload on s19 (the second half of item 001) |
| 03 | B fail (`5ebe3727`) | `false / 0` **on s23** | the gate ends the component; 005 / 006 never opened |
| 04 | A (`8280285b`) | `true`, no score | reload on s30 (class task) |
| 05 | A (`6b044691`) | `true / 1` | reload on s39 |
| 06 | A pass (`08bf6236`) | `true / 1` | reload on s47 |
| 06 | B fail (`28c1df6f`) | `false / 0` | below 4 of 5 |
| 07 | A pass (`536a9581`) | `true / 1` | reload on s55; "סיימתי" ends it |

**Everywhere:** preflight (`XAPI_DISABLED` false, `XAPI_USING_G` true, `DEV_NAV` false,
`METADATA.id === XAPI_COMP_ID`, registration present, first screen); first state read `404
absent`; every object id sent is in the catalogue, no unit-level statement, every declared
question answered, every item reached completed exactly once; exactly one component `completed`
with the expected result; the button disabled and `location.pathname` unchanged; Kata's document
holds `done` and the verdict; **D-8:** after a reload still on the end screen, disabled, a forced
second click sends no `completed`; **every statement request and every state write 2xx**; no page
or console error.

**Not covered live:** the issue report into the shared sheet (covered with the POST stubbed); the
save on leaving the page; Kata's routing between components; the LRS side (the reporting token
cannot read statements back).

**Data left in Kata:** `VADIM-P02-A` — all seven registrations finished (pass); `VADIM-P02-B` —
02, 03, 06 finished (fail). The links reset (`resetState:true`) on the next run. **Token:** the
links carry the test learners' reporting token; there is no self-service rotation (guide §12) —
ask the Kata team to rotate it.

The live run covered `c8bebba`'s package. The later package (`fef19f7`: the image resize and the
removed stills) changes no reporting, resume or issue-report code; it is uploaded and verified
(105 / 105). The seven pre-resize / removed images are still on the CDN, unreferenced.
**Token:** the owner decided (2026-10-08) not to rotate the test learners' reporting token for now.

## 7. Open

1. ~~**07's gate**~~ — fixed 2026-10-12 (team's decision): s51 now says "6 סעיפים · 4 לפחות", the
   gate was already 4 of the six sections.
2. **02 below its bar:** reported `success:false`, but the metadata routes nowhere
   (`recommendedAfterFail: []`).
3. ~~Image resize~~ — done (`2773ad0`); upload the new package.
4. ~~Content URL~~ — confirmed 2026-10-08.
5. ~~The unused `calculator` / `measuring` stills~~ — removed; ~~the two unused green clips~~ — removed.
6. ~~Publish~~ — published by the owner 2026-10-08 (all seven).
7. Still on the CDN, unreferenced since the uploads of 2026-10-08 (optional to delete): the two
   green clips, the three pre-resize images (`expo-print.jpg`, `character-squashed-yellow.png`,
   `character-victory-yellow.png`) and the four removed stills (`character-calculator-*`,
   `character-measuring-*`).
8. Items 1 and 2: the owner will handle them later. A metadata change after publishing (e.g. 02's
   `recommendedAfterFail`) goes through `send-metadata.ps1` (upsert) and `retrieve-metadata.ps1
   -FailOnDrift`; a text change on s51 needs a `?v=` bump, a new package and an upload.
