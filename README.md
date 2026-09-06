# methodica-math-proportion-02 — מציאת המספר X החסר (יעד 2.2)

The 60-screen unit in the client's multi-component structure. Shape follows
`units/methodica-math-ratio-01-02-main`, which the client approved.

## Where the split comes from

**The deck itself.** `pptx/methodica-math-proportion-02-02.pptx` carries a
"רכיב" separator slide before each component, and each one prints the folder
name to use. Those seven slides — 2, 33, 39, 50, 59, 70 and 77 — are the
boundaries, and the folder names below are the deck's own:

| | screens | deck slides | |
|---|---|---|---|
| 01 | 0–11 | 3–32  | הוק והקנייה |
| 02 | 0–4  | 34–38 | תרגול סטנדרטי |
| 03 | 0–9  | 40–49 | תרגול בסיסי וסטנדרטי ב |
| 04 | 0–7  | 51–58 | משימת כיתה |
| 05 | 0–9  | 60–69 | תרגול מתקדם |
| 06 | 0–5  | 71–76 | שאלת שיא א |
| 07 | 0–8  | 78–86 | שאלת שיא ב |

The deck also carries a PowerPoint section list of 24 pedagogical sections.
Every one of those nests inside a component — no section crosses a boundary —
which is an independent check that the split is right. Slide 1 is the
production cover and the seven separators are not built as screens; 86 deck
slides, 60 built screens.

## Layout

- `index.html` — launcher; resolves which component to open and carries the
  query string across.
- `index_dev.html` — the producer harness, unit-wide: it drives all 60 screens
  through an iframe and reloads it when a jump crosses a component.
- `methodica-math-proportion-02-01 … -07/` — seven component apps
  (`index.html` + `script.js` + `styles.css` + `assets/` + their own
  `index_dev.html`).
- `unit-js/` — the shared layer, one copy: `motion.js` (Animation System),
  `partnav.js` (the cross-component trail) and `question.js` (the question
  contract). These were duplicated into all seven parts in the working build.
- `metadata/` — unit + per-component JSONs. **Drafts** pending the מפתחת; see
  "Open" below.
- `_test/` — from the client example.

## Screen numbering

Screens are numbered **per component** (each starts at 0), not unit-wide.
`partnav.js` carries the learner across a boundary and remembers the trail, so
Back returns to the screen they actually left from. This differs from
ratio-01-02-main, which keeps one global 0–51 range bounded by `PART_CONFIG`;
both shapes ship, and this unit was authored on the per-component one.

## Open — needs the מפתחת

1. **Two metadata codes are placeholders.** `subTopic` and `learningObjective`
   are written as `…RATIO-PROP-SCL.PROPORTION` / `….PROPORTION.FIND-MISSING`,
   by analogy with the ratio unit's codes. They have not been confirmed.
2. **The unit slug.** The deck names the components
   `methodica-math-proportion-02-01 … -07`, which makes the unit
   `methodica-math-proportion-02`, and that is what the metadata uses. The
   working folder is named `methodica-math-proportion-02-02` — a repo-side
   name that collides with component 02's.
3. **`_test/` does not run against this unit.** It is the client example's
   suite verbatim, and it expects a different architecture (a
   `capturePartPayload` / `applyResumeVars` / `bootXAPI` hook contract this
   unit does not implement, and a different component list). Shipped as the
   reference unit ships it — as a template to port, not as working tests.

## Excluded from this copy

`assets/video/_source-originals/` — the producer's raw clips, kept beside the
processed ones in the working build for re-runs. 37MB, referenced by nothing.

The working build stays at `units/methodica-math-proportion-02-02/`.
