# unit-js — methodica-math-proportion-02

The shared behaviour layer, ONE copy for every component, loaded in this order (identical `?v=` everywhere):

| File | Role |
|---|---|
| *(component `script.js`)* | configuration only — `PART_CONFIG` + the component slug |
| `motion.js` | entrance animations |
| `quiz-engine.js` | the question screens (bounded by `PART_CONFIG` through `inPart()`) |
| `applet-dino.js`, `classtask.js` | the dinosaur applet (screen 13) and the class task (28–32) |
| `questions.js` | every question's content |
| `carousel.js`, `guided.js` | the 12-step carousel (screen 5) and the 7-step guided practice (screen 8) |
| `unit.js` | unit behaviour: screen count, the two characters and their pose assets (`../unit-assets/`) |
| `report-modal.js` | the "מצאתם בעיה?" form |
| `engine.js` | navigation, canvas scaling, the part hops, the DEV bridge — last |

No top-level identifier may exist in both a `script.js` and this layer — the collision is
silent and last-wins. Asset paths inside this layer are written relative to a COMPONENT's
`index.html`: `assets/img/…` lives in the owning component, `../unit-assets/…` is shared.
