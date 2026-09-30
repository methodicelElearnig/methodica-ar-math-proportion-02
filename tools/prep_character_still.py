"""Turn a producer-supplied character still into a unit-ready companion PNG.

Same rule as prep_character_clip.py, for stills: a pixel is BACKGROUND only
when it is near-achromatic AND light AND connected to the frame edge. Never
key on saturation — the white monster is itself near-achromatic and light, and
only the edge-connectivity test keeps her out of the mask.

Output matches this unit's convention: content scaled to 420px tall, bottom
anchored, centred on a transparent canvas at least 423px wide.

Usage: prep_character_still.py <src.png> <out.png> [--spread N] [--luma N]
"""
import argparse
import numpy as np
from PIL import Image
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--spread", type=int, default=14)   # max RGB spread to read as grey
ap.add_argument("--luma",   type=int, default=238)  # min brightness to read as light
ap.add_argument("--speck",  type=float, default=0.15)  # % of frame a blob must fill
ap.add_argument("--height", type=int, default=420)
ap.add_argument("--canvas", type=int, default=423)
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
px = np.asarray(im).astype(np.int16)
h, w, _ = px.shape

cand = ((px.max(2) - px.min(2)) <= a.spread) & (px.mean(2) >= a.luma)
lab, _ = ndimage.label(cand)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
edge.discard(0)
bg = np.isin(lab, list(edge))

# whatever survives in small islands is the contact shadow, not the monster
flab, fn = ndimage.label(~bg, structure=np.ones((3, 3)))
if fn:
    sizes = ndimage.sum(np.ones_like(flab), flab, range(1, fn + 1))
    keep = [j + 1 for j, s in enumerate(sizes) if s >= h * w * a.speck / 100]
    bg |= ~np.isin(flab, keep)

alpha = np.where(bg, 0, 255).astype(np.uint8)
# feather one pixel so the fur edge does not alias against the page
alpha = ndimage.grey_closing(alpha, size=(2, 2))

rgba = Image.fromarray(np.dstack([np.asarray(im), alpha]), "RGBA")
box = rgba.getchannel("A").getbbox()
if box is None:
    raise SystemExit("nothing survived the background pass — loosen --luma")
cut = rgba.crop(box)

scale = a.height / cut.height
cut = cut.resize((max(1, round(cut.width * scale)), a.height), Image.LANCZOS)

cw = max(a.canvas, cut.width)
out = Image.new("RGBA", (cw, a.height), (0, 0, 0, 0))
out.paste(cut, ((cw - cut.width) // 2, 0))
out.save(a.out)
print(f"{a.src} -> {a.out}  src {w}x{h}  content {box[2]-box[0]}x{box[3]-box[1]}  out {out.size}")
