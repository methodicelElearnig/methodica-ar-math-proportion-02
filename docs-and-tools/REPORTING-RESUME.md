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

Not done in optimization (owner's decision pending): the character PNGs (~1024 px tall, 0.6–1.3 MB
each) and 07's `expo-*` pictures (1.7–1.8 MB) could be resized to about twice their display size —
roughly 8–10 MB of the unit's 27 MB. The fonts were already one subset variable woff2; the assets
were already hoisted, with no duplicates (md5).

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
| 07 | 001 = s52–58 (q1–q6) | s51 says "5 סעיפים · 4 לפחות" — **there are six** | need 4 over six — **open** |

Video: screen 6's YouTube is a static `youtube-nocookie` iframe with no IFrame API — D-1 (the
`forigin` token leak) cannot happen, and there is no `played` / `paused` to report. No `<video>`
opts in (`data-xapi-report`); the character clips are decoration.

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
- **Nothing has been sent to Kata, uploaded, or run live for this unit yet.** The order, each step
  with the owner's go-ahead: confirm the content URL → `send-metadata.ps1 -Preflight` →
  `-DryRun` → live send → `retrieve-metadata.ps1 -FailOnDrift` → upload the package → live run
  (guide §12) → rotate the token used.

## 7. Open

1. **07's gate:** the screen promises "5 סעיפים · 4 לפחות", the question has six sections. Fix the
   text, or the bar.
2. **02 below its bar:** reported `success:false`, but the metadata routes nowhere
   (`recommendedAfterFail: []`).
3. **Image resize** (§0).
4. ~~Content URL~~ — confirmed 2026-10-08.
