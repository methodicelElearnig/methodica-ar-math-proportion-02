# methodica-math-proportion-02 — kickoff (27.09.26)

יעד 2.2 · מציאת המספר X החסר · unit id `methodica-math-proportion-02`
Source deck: `pptx/methodica-math-proportion-02.pptx` (86 slides, 88 MB)

## Why this is a remake

Elad, 27.09.26: the previous build's **design was not good and did not match the
existing templates**; feedback persisted when it should not, line breaks and
bolds were wrong, and RTL was wrong.

So: **mechanics may be lifted from the old build, its design may not.** The
carousel stepping and the guided-practice flow come across as components; the
look, the copy fidelity and the RTL behaviour are rebuilt on the approved
template system.

Old build kept for reference at `units/methodica-math-proportion-02-02-main-old-nisan`.

## Component split — the deck's own

`רכיב` separator slides 2, 33, 39, 50, 59, 70, 77 each print the folder name.
Identical to the old build's split, which is an independent check.

| comp | deck slides | n | title |
|---|---|---|---|
| 01 | 3–32  | 30 | הוק והקנייה |
| 02 | 34–38 | 5  | תרגול סטנדרטי |
| 03 | 40–49 | 10 | תרגול בסיסי וסטנדרטי ב |
| 04 | 51–58 | 8  | משימת כיתה |
| 05 | 60–69 | 10 | תרגול מתקדם |
| 06 | 71–76 | 6  | שאלת שיא א |
| 07 | 78–86 | 9  | שאלת שיא ב |

## Screen map — component 01 (slides 3–32) + 02's opener

Global screen numbering (`PART_CONFIG` bounds each component), the shape used
by ratio-01-02-main / percent-07-main / ratio-04-main.

| screen | deck | template |
|---|---|---|
| 0  | 3     | TwoOptionSelection — character choice |
| 1  | 4     | HookClosingText |
| 2  | 5     | HookClosingText |
| 3  | 6     | HookClosingText |
| 4  | 7     | HookClosingText |
| 5  | 8–19  | **Carousel — 12 steps on ONE screen**, 4 of them graded |
| 6  | 20    | Video |
| 7  | 22    | TransitionScreen |
| 8  | 23–29 | **Guided — 7 steps on ONE screen** |
| 9  | 30    | TransitionScreen |
| 10 | 31    | ValueInputQuestion (שאלה 1 מתוך 2) |
| 11 | 32    | ValueInputQuestion (שאלה 2 מתוך 2) |
| 12 | 34    | TransitionScreen — component 02 opens |

## Findings that are not obvious from the deck

- **The carousel's dot strip is a static mock.** All 12 slides carry the same
  9 dots with the same one active — the designer never advanced it. Step count
  comes from the slides (12), not the dots. Same class of trap as ratio-04's
  `image24` progress strip.
- **Slide 21 is not a screen.** Slides 20–21 are both pages of the video script
  (`תסריט סרטון – White Board`); the screen is a video player and the clip is
  not yet produced.
- **PDF offset verified by text match**: page N = slide N (checked on the
  separators at 2 and 33). 86 pages, no hidden slides.
- The carousel's 12 slides fall into 5 title groups (2/1/4/1/4). Whether those
  are visual sections inside the one carousel is an OPEN QUESTION.

## Assets

Monster images and clips come from the old build (Elad, 27.09.26 — "ready and
picked"): a **yellow/green** pair with selection, duo, reading, spinning, cube,
squashed, victory, magnifier, calculator and measuring poses. `squashed` is the
hook's distorted-photo pose.
