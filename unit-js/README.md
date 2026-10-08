# unit-js — methodica-math-proportion-02

The shared behaviour layer, ONE copy for every component, loaded in this order (identical `?v=`
everywhere; `_test/verify-report.js` asserts both):

| File | Role |
|---|---|
| `10-identity.js` | the id prefix, the unit id (bare slug), `RESUME_ENABLED`, `DEV_NAV` (`?dev=1` without `?registration`) |
| `20-xapi.js` | item open/close, `xapiAnswered`, hint dedupe, the component end, B-1 / B-2 / O-1 / D-8 |
| `40-resume.js` | the per-component state document, ledgers, character and results, the boot cover, `?resetState` |
| `50-loader.js` | `bootXAPI()`: the CDN library (`xapi-720-k`), metadata, the two-phase restore |
| *(component `script.js`)* | configuration only — `PART_CONFIG`, the slug, `SCREEN_TO_SUBCONTENT`, `XAPI_SCREEN_QUESTIONS`, `XAPI_EVAL_ITEMS`, `XAPI_GATE` |
| `motion.js` | entrance animations |
| `quiz-engine.js` | the question screens (bounded by `PART_CONFIG` through `inPart()`); the Retry gate |
| `applet-dino.js`, `classtask.js` | the dinosaur applet (screen 13) and the class task (28–34) |
| `questions.js` | every question's content |
| `carousel.js`, `guided.js` | the 12-step carousel (screen 5) and the 7-step guided practice (screen 8) |
| `unit.js` | unit behaviour: screen count, the two characters and their pose assets (`../unit-assets/`) |
| `report-modal.js` | the "מצאתם בעיה?" form (shared 720 Google Form; identity from `METADATA`) |
| `engine.js` | navigation, canvas scaling, the DEV bridge; calls the platform seams in `goTo` |
| `70-platform.js` | this unit's glue: reporting call sites, scores / gates / results, the component end, resume hooks and painters |
| `90-boot.js` | the only file with top-level side effects — last, in its own tag |

Every file except `90-boot.js` is definition-only. No top-level identifier may exist in two files
(including a `script.js`) — a `var`/`function` collision is silent and last-wins. Asset paths
inside this layer are written relative to a COMPONENT's `index.html`: `assets/img/…` lives in the
owning component, `../unit-assets/…` is shared.

The platform owns routing: in production a component never moves to another; the last click
reports the component and disables its button. `?dev=1` (local only) restores the hops. Design
and decisions: `../docs-and-tools/REPORTING-RESUME.md`.
