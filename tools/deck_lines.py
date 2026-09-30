"""Print a slide's text exactly as the DECK BREAKS IT.

maven-skills §1b: where the deck breaks a line, we break it. The pptx XML gives
paragraphs, not rendered lines — a paragraph that wraps in the deck's own text
box looks like one line in the XML. Only the RENDERED page knows where the
break falls, so this reads spec/deck.pdf.

Lines are grouped into blocks (one deck text box) and printed in reading order
with a <br> marker between them, ready to paste.

Usage: deck_lines.py <slide-number> [more...]
"""
import sys, fitz

doc = fitz.open('spec/deck.pdf')
for n in [int(a) for a in sys.argv[1:]]:
    page = doc[n - 1]
    sx, sy = 1280 / page.rect.width, 720 / page.rect.height
    print(f'════════ slide {n} ════════')
    blocks = [b for b in page.get_text('dict')['blocks'] if b['type'] == 0]
    blocks.sort(key=lambda b: (round(b['bbox'][1] / 12), -b['bbox'][2]))
    for b in blocks:
        # PyMuPDF splits a rendered line into several `lines` entries when the
        # runs differ (a bold word, an OMML fraction, a latin numeral). Those
        # share a BASELINE and are one line on the page — reporting them as
        # separate lines invites a <br> that the deck does not have. Merge by
        # baseline first, then read.
        merged, by_base = [], {}
        for l in b['lines']:
            key = round(l['bbox'][1] / 3)      # ~3pt tolerance
            by_base.setdefault(key, []).append(l)
        for key in sorted(by_base):
            group = sorted(by_base[key], key=lambda l: -l['bbox'][2])   # RTL: right first
            merged.append({'spans': [sp for l in group for sp in l['spans']]})

        lines = []
        for l in merged:
            # Bold is per SPAN, not per line. Marking the whole line bold when
            # any span on it was bold produced exactly the defect this tool is
            # meant to prevent: a build that bolds a whole sentence where the
            # deck bolds one word. Each span is marked on its own.
            parts = []
            for sp in l['spans']:
                t = sp['text']
                if not t:
                    continue
                bold = 'bold' in sp['font'].lower() or bool(sp['flags'] & 2 ** 4)
                parts.append(f'**{t}**' if bold else t)
            line = ''.join(parts).strip()
            # collapse the seam between two adjacent bold spans
            line = line.replace('****', '')
            if line:
                lines.append(line)
        if not lines:
            continue
        x0, y0, x1, y1 = b['bbox']
        print(f'  ── box x={x0*sx:.0f}..{x1*sx:.0f} y={y0*sy:.0f}  ({len(lines)} line(s))')
        print('     ' + '<br>\n     '.join(lines))
