# methodica-math-proportion-02 (new-main)

יעד 2.2 — מציאת המספר X החסר בפרופורציה. The client's multi-component delivery repo (`…-new-main`, since `…-main` names the old build), built
from the single-folder unit `units/methodica-math-proportion-02/` on 04.10.26 (hoisted shape of
`methodica-math-ratio-04-main`).

## Shape

Global screen numbering: screens keep one 0..59 range across the whole unit and
`window.PART_CONFIG` in each component's `script.js` bounds that component.

| component | screens | deck slides | content |
|---|---|---|---|
| 01 | 0–11 | 3-32 | הוק והקנייה |
| 02 | 12–16 | 34-38 | תרגול סטנדרטי |
| 03 | 17–26 | 40-49 | תרגול בסיסי וסטנדרטי ב |
| 04 | 27–34 | 51-58 | משימת כיתה |
| 05 | 35–44 | 60-69 | תרגול מתקדם |
| 06 | 45–50 | 71-76 | שאלת שיא א |
| 07 | 51–59 | 78-86 | שאלת שיא ב |

The split is the deck's own: slides 2, 33, 39, 50, 59, 70 and 77 are `רכיב N` separators
that print the folder name to use. It was not inferred.

## Layout

- `index.html` — redirects to component 01 (`…-01/index.html`, query string kept). Local
  browsing only: **never packaged** — the platforms launch each component by its own link.
- `index_dev.html` — the unit's dev bar over all seven components (the single-folder unit's
  harness plus component routing). Never packaged.
- `<unit>-0N/` — one folder per component: `index.html` (that component's static screens only),
  `script.js` (CONFIGURATION ONLY — `PART_CONFIG` and the component slug), `assets/img/` (only
  the images its own screens reference), `applets/` (only the applet pages its screens embed),
  and `index_dev.html`, a dev bar that iframes the component's `index.html`.
- `unit-js/` — the shared behaviour layer, ONE copy, including the platform layer
  (`10-identity.js` … `90-boot.js`) — see `unit-js/README.md`.
- `unit-css/styles.css` — the one stylesheet.
- `unit-assets/` — fonts (Assistant, local), the two companion characters' stills and clips,
  shared by every component.
- `metadata/` — the catalogue records (unit + one per component); every reported id comes from here.
- `_test/` — the harness (real Chrome; never packaged) — see `_test/README.md`.
- `docs-and-tools/` — the unit record `REPORTING-RESUME.md`, the Kata metadata tools and the
  packaging scripts. Never packaged.

## The platform owns routing

The unit reports to Kata (xAPI), carries the "מצאתם בעיה?" issue report and resumes each
component where the learner left it. In production a component never moves to another: its last
click reports the component and disables the button, and the platform launches the next one.
Local walks between components: `?dev=1` (the dev bars add it). Design, decisions and what is
still open: `docs-and-tools/REPORTING-RESUME.md`.

## Packaging

`pwsh -File docs-and-tools/build-package.ps1` writes `../../deployments/<date>/` from the
allowlist (`package-allowlist.ps1`: `metadata/`, `unit-js/`, `unit-css/`, `unit-assets/`, and per
component `index.html`, `script.js`, `assets/`, `applets/`) and verifies it. Nothing at the root
ships.

`file://` will not do cross-component hops — serve it (`python3 -m http.server`).
