#!/usr/bin/env python3
"""
Production build for the "Yechi" 770 wall piece, navy leather edition.

Rebuilds the design from scratch as print-ready files:
  * layered PSD (12 x 24 in @ 300 dpi, RGB)
  * print PDF  (full colour page + print-only page + vector gold-foil page)
  * vector gold-foil / emboss artwork (SVG + PDF, spot colour GOLD_FOIL)
  * flat full-resolution JPG and a small preview JPG

Usage:
    python3 build.py              # full resolution (3600 x 7200 px)
    python3 build.py --preview    # quarter resolution, fast check

Edit TEXT_LINES below to change wording; everything else follows.
"""
import os
import struct
import sys
import time

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source")
OUT = os.path.join(HERE, "output")
FONT_PATH = os.path.join(HERE, "fonts", "ShofarDemi-Bold.ttf")

PREVIEW = "--preview" in sys.argv
Q = 4 if PREVIEW else 1                      # downscale for quick iterations
W_IN, H_IN, DPI = 12, 24, 300                # 30.48 x 60.96 cm
W, H = W_IN * DPI // Q, H_IN * DPI // Q      # 3600 x 7200 px at full res
REF_W = 887                                  # width of the reference artwork
S = W / REF_W                                # reference px -> canvas px
NAME = "YECHI-770_navy-leather_12x24in"

# ---------------------------------------------------------------------------
# Text: (layer name, text, ink x-left, ink x-right, body-top y, baseline y, arc, weight)
# Coordinates are measured on the 887 x 1774 reference image (reference_v2).
# arc = radius (reference px) of a convex-up text arc; for arced lines x-left /
# x-right are the chord ends and the y values are taken at the arc's apex.
# weight = extra stroke thickness per side as a fraction of body height.
# ---------------------------------------------------------------------------
TEXT_LINES = [
    ("L1 Yechi ... LeOlam VaEd (arc)", "יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד",
                                                                  50, 836, 227, 255.5, 1650, 0.02),
    ("L2 LeZechut",      "לזכות",                    349, 539, 1398, 1451, None, 0.045),
    ("L3 Names",         "ר׳ לוי יצחק ושיר הכהן כהן", 97, 796, 1489, 1538, None, 0.045),
    ("L4 UMishpachto",   "ומשפחתו",                  299, 586, 1581, 1634, None, 0.045),
]
BODY_REF_CHAR = "מ"   # glyph used to measure body height (top bar to baseline)

# Lines whose wording changed after the reference was drawn: letters are scaled to
# fit the ORIGINAL wording into the measured box, then the new wording is centred
# on it, so letter size stays identical and the line just grows a little.
FIT_TEXT = {
    "L3 Names": "ר לוי יצחק ושיר הכהן כהן",     # reference had no geresh after ר
}

# Building crop from the reference (x0, y0, x1, y1) - matches source/building_crop.png
BUILDING_BOX = (0, 420, 887, 1350)

rng = np.random.default_rng(770)


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')}]", *a, flush=True)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def value_noise(h, w, cell, rng):
    """Smooth noise: random grid upsampled with bicubic interpolation."""
    gh, gw = int(h / cell) + 3, int(w / cell) + 3
    g = rng.standard_normal((gh, gw)).astype(np.float32)
    big = cv2.resize(g, (int(gw * cell), int(gh * cell)), interpolation=cv2.INTER_CUBIC)
    oy, ox = rng.integers(0, int(cell) + 1, 2)
    return big[oy:oy + h, ox:ox + w]


def fbm(h, w, cell, octaves, rng, gain=0.5):
    tot = np.zeros((h, w), np.float32)
    amp, norm = 1.0, 0.0
    for _ in range(octaves):
        tot += amp * value_noise(h, w, max(cell, 2.0), rng)
        norm += amp
        amp *= gain
        cell /= 2.0
    return tot / norm


def normals(height, strength):
    gy, gx = np.gradient(height * strength)
    nz = np.ones_like(height)
    inv = 1.0 / np.sqrt(gx * gx + gy * gy + 1.0)
    return -gx * inv, -gy * inv, nz * inv


def lerp_colors(t, stops):
    """Map t (0..1) through a list of (pos, (r,g,b)) colour stops."""
    pos = np.array([p for p, _ in stops], np.float32)
    cols = np.array([c for _, c in stops], np.float32)
    out = np.empty(t.shape + (3,), np.float32)
    for ch in range(3):
        out[..., ch] = np.interp(t, pos, cols[:, ch])
    return out


def to_u8(a):
    return np.clip(a + 0.5, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------------------
# 1. Leather: navy dye colour + pebble grain height map
# ---------------------------------------------------------------------------
def _pebbles(h, w, cell, warp_amt):
    """Voronoi pebble field: soft rounded bumps separated by soft creases."""
    gy, gx = np.mgrid[0:h + cell:cell, 0:w + cell:cell]
    pts = np.stack([gy.ravel(), gx.ravel()], 1).astype(np.float32)
    pts += (rng.random(pts.shape, dtype=np.float32) - 0.5) * cell * 1.1
    lift = rng.random(len(pts), dtype=np.float32)                  # per-pebble height
    tree = cKDTree(pts)
    warp_y = fbm(h, w, cell * 6, 3, rng) * cell * warp_amt
    warp_x = fbm(h, w, cell * 6, 3, rng) * cell * warp_amt
    out = np.empty((h, w), np.float32)
    xs = np.arange(w, dtype=np.float32)
    step = 192
    for y0 in range(0, h, step):
        y1 = min(y0 + step, h)
        yy, xx = np.meshgrid(np.arange(y0, y1, dtype=np.float32), xs, indexing="ij")
        q = np.stack([(yy + warp_y[y0:y1]).ravel(), (xx + warp_x[y0:y1]).ravel()], 1)
        d, idx = tree.query(q, k=2, workers=-1)
        edge = (d[:, 1] - d[:, 0]).reshape(y1 - y0, w)          # 0 on pebble borders
        f1 = d[:, 0].reshape(y1 - y0, w)
        crease = smoothstep(0.0, cell * 0.55, edge) ** 0.8
        dome = 1.0 - np.clip(f1 / (cell * 1.05), 0, 1) ** 2
        lf = lift[idx[:, 0]].reshape(y1 - y0, w)
        out[y0:y1] = crease * (0.45 + 0.35 * dome + 0.20 * lf)
    return out


def leather_height(h, w):
    log("leather grain ...")
    cell = 21.0 / Q                       # ~1.8 mm pebbles at 300 dpi
    height = 0.72 * _pebbles(h, w, cell, 0.5) + 0.28 * _pebbles(h, w, cell * 0.52, 0.4)
    # pores / micro grain + soft large wrinkles
    micro = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), max(0.6, 0.9 / Q))
    wr = fbm(h, w, 900.0 / Q, 4, rng)
    wrinkles = np.exp(-(wr / 0.03) ** 2)                         # thin ridge lines
    height = height + 0.05 * micro - 0.22 * wrinkles
    return cv2.GaussianBlur(height, (0, 0), max(0.5, 1.3 / Q))


def leather_dye(h, w):
    """Navy colour field with natural dye mottling and a soft vignette."""
    mott = fbm(h, w, 1400.0 / Q, 5, rng)
    mott = (mott - mott.mean()) / (mott.std() + 1e-6)
    t = np.clip(0.5 + 0.22 * mott, 0, 1)
    col = lerp_colors(t, [(0.0, (3, 14, 40)), (0.5, (8, 26, 64)), (1.0, (16, 42, 92))])
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w * 0.62)) ** 2 + ((yy - h * 0.47) / (h * 0.62)) ** 2)
    vign = 1.0 - 0.38 * smoothstep(0.55, 1.15, r)
    return col * vign[..., None]


def grain_overlay(height):
    """Grey shading layer (128 = neutral) used with Overlay blend over the art."""
    nx, ny, nz = normals(height, 5.5 / Q)
    L = np.array([-0.42, -0.58, 0.70], np.float32)
    L /= np.linalg.norm(L)
    lam = (nx * L[0] + ny * L[1] + nz * L[2]) / L[2]
    hv = L + np.array([0, 0, 1], np.float32)
    hv /= np.linalg.norm(hv)
    spec = np.clip(nx * hv[0] + ny * hv[1] + nz * hv[2], 0, 1) ** 28
    g = 0.5 + 0.30 * (lam - 1.0) + 0.10 * (height - 0.6) + 0.10 * spec
    return np.clip(g, 0, 1)


# ---------------------------------------------------------------------------
# 2. Building art (upscaled reference) with a soft painterly mask
# ---------------------------------------------------------------------------
def building_layer():
    log("building ...")
    x0, y0, x1, y1 = BUILDING_BOX
    bw, bh = round((x1 - x0) * S), round((y1 - y0) * S)
    top, left = round(y0 * S), round(x0 * S)
    img = Image.open(os.path.join(SRC, "building_upscaled_4x_v2.png")).convert("RGB")
    img = img.resize((bw, bh), Image.LANCZOS)
    a = np.asarray(img).astype(np.float32)
    navy = np.array([2, 24, 60], np.float32)
    dist = np.sqrt(((a - navy) ** 2).sum(-1))
    alpha = smoothstep(22.0, 85.0, dist)
    # solid core: warm/cream pixels of the building, closed and hole-filled
    warm = (a[..., 0] > a[..., 2] + 25) | (a.mean(-1) > 150)
    k = max(3, int(2 * S))
    core = ndimage.binary_closing(warm, structure=np.ones((k, k)), iterations=2)
    core = ndimage.binary_fill_holes(core)
    core = ndimage.binary_opening(core, structure=np.ones((k, k)))
    lab, n = ndimage.label(core)
    if n:
        sizes = ndimage.sum(core, lab, range(1, n + 1))
        core = lab == (1 + int(np.argmax(sizes)))
        core = ndimage.binary_fill_holes(core)
    core_f = cv2.GaussianBlur(core.astype(np.float32), (0, 0), 0.5 * S)
    alpha = np.maximum(alpha, core_f)
    # feather the crop's top and bottom edges
    fe = max(2, int(14 * S))
    ramp = np.ones(bh, np.float32)
    r = smoothstep(0, 1, np.linspace(0, 1, fe))
    ramp[:fe] = np.minimum(ramp[:fe], r)
    ramp[-fe:] = np.minimum(ramp[-fe:], r[::-1])
    alpha *= ramp[:, None]
    alpha = cv2.GaussianBlur(alpha, (0, 0), max(0.5, 1.2 / Q))
    rgba = np.dstack([a, alpha * 255])
    return rgba, top, left


# ---------------------------------------------------------------------------
# 3. Text: HarfBuzz shaping -> vector outlines -> emboldened -> raster mask.
#    Raster and vector come from the SAME polygons, so the gold image and the
#    foil/emboss die line up exactly.
# ---------------------------------------------------------------------------
CS = 16             # clipper integer scale (1/16 px precision, == cv2 shift 4)


class FlattenPen:
    """fontTools pen that flattens curves to polylines (font units)."""

    def __init__(self, glyphset, seg_units):
        from fontTools.pens.basePen import BasePen

        outer = self

        class _P(BasePen):
            def _moveTo(self, p):
                outer.cur = [p]

            def _lineTo(self, p):
                outer.cur.append(p)

            def _curveToOne(self, p1, p2, p3):
                p0 = self._getCurrentPoint()
                L = sum(np.hypot(b[0] - a[0], b[1] - a[1]) for a, b in ((p0, p1), (p1, p2), (p2, p3)))
                n = int(np.clip(L / outer.seg, 3, 96))
                for t in np.linspace(0, 1, n + 1)[1:]:
                    mt = 1 - t
                    outer.cur.append((mt ** 3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t ** 3 * p3[0],
                                      mt ** 3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t ** 3 * p3[1]))

            def _qCurveToOne(self, p1, p2):
                p0 = self._getCurrentPoint()
                L = np.hypot(p1[0] - p0[0], p1[1] - p0[1]) + np.hypot(p2[0] - p1[0], p2[1] - p1[1])
                n = int(np.clip(L / outer.seg, 3, 96))
                for t in np.linspace(0, 1, n + 1)[1:]:
                    mt = 1 - t
                    outer.cur.append((mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
                                      mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]))

            def _closePath(self):
                if len(outer.cur) > 2:
                    outer.contours.append(outer.cur)
                outer.cur = []

            _endPath = _closePath

        self.pen = _P(glyphset)
        self.seg = seg_units
        self.cur, self.contours = [], []


_FONT_CACHE = {}


def _font():
    if not _FONT_CACHE:
        from fontTools.ttLib import TTFont
        tt = TTFont(FONT_PATH)
        _FONT_CACHE.update(tt=tt, gs=tt.getGlyphSet(), order=tt.getGlyphOrder(),
                           cmap=tt.getBestCmap())
    return _FONT_CACHE


def shape(text):
    """HarfBuzz shaping (RTL, visual order). Returns [(glyph, x, y)] in font units."""
    import uharfbuzz as hb
    face = hb.Face(hb.Blob.from_file_path(FONT_PATH))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb.Font(face), buf, {})
    order = _font()["order"]
    placed, x = [], 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        placed.append((order[info.codepoint], x + pos.x_offset, pos.y_offset))
        x += pos.x_advance
    return placed


def glyph_bounds(placed):
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.pens.transformPen import TransformPen
    gs = _font()["gs"]
    bp = BoundsPen(gs)
    for g, gx, gy in placed:
        gs[g].draw(TransformPen(bp, (1, 0, 0, 1, gx, gy)))
    return bp.bounds


def layout_line(text, x0, x1, ytop, ybase, arc=None, weight=0.045, fit_text=None):
    """Fit a line into the reference box and return emboldened polygons (int, x CS)."""
    import pyclipper
    f = _font()
    gs = f["gs"]
    target_body = (ybase - ytop) * S
    target_w = (x1 - x0) * S
    cx = (x0 + x1) / 2 * S
    R = arc * S if arc else None
    if R:
        target_w = 2 * R * np.arcsin(target_w / (2 * R))   # straight length that bends to the chord
    r = weight * target_body
    body_units = glyph_bounds([(f["cmap"][ord(BODY_REF_CHAR)], 0, 0)])[3]
    k = (target_body - 2 * r) / body_units
    placed = shape(text)
    xmin, ymin, xmax, ymax = glyph_bounds(placed)
    fx0, _, fx1, _ = glyph_bounds(shape(fit_text)) if fit_text else (xmin, 0, xmax, 0)
    sx = (target_w - 2 * r) / ((fx1 - fx0) * k)
    actual_w = (xmax - xmin) * k * sx + 2 * r
    left_px = cx - actual_w / 2 + r
    base_px = ybase * S - r
    polys = []
    for g, gx, gy in placed:
        fp = FlattenPen(gs, seg_units=1.2 / k)
        gs[g].draw(fp.pen)
        for c in fp.contours:
            pts = [(left_px + (u + gx - xmin) * k * sx, base_px - (v + gy) * k) for u, v in c]
            if R:   # wrap onto a circle of radius R whose top touches the baseline at cx
                a_ = np.array(pts)
                th = (a_[:, 0] - cx) / R
                rad = R + (base_px - a_[:, 1])
                pts = np.stack([cx + rad * np.sin(th), base_px + R - rad * np.cos(th)], 1).tolist()
            polys.append([(int(round(a * CS)), int(round(b * CS))) for a, b in pts])
    pc = pyclipper.Pyclipper()
    pc.AddPaths(polys, pyclipper.PT_SUBJECT, True)
    merged = pc.Execute(pyclipper.CT_UNION, pyclipper.PFT_NONZERO, pyclipper.PFT_NONZERO)
    off = pyclipper.PyclipperOffset(arc_tolerance=0.15 * CS)
    off.AddPaths(merged, pyclipper.JT_ROUND, pyclipper.ET_CLOSEDPOLYGON)
    bold = off.Execute(r * CS)
    bold = [pyclipper.CleanPolygon(p, 0.2 * CS) for p in bold]
    return [p for p in bold if len(p) > 2], k, sx


def rasterize(polys, ss=4):
    """Anti-aliased mask of polygons (even-odd). Returns mask, left, top."""
    allp = np.concatenate([np.array(p) for p in polys])
    pad = 4 * CS
    xmn, ymn = (allp.min(0) - pad) // CS
    xmx, ymx = (allp.max(0) + pad) // CS + 1
    w, h = int(xmx - xmn), int(ymx - ymn)
    big = np.zeros((h * ss, w * ss), np.uint8)
    pts = [((np.array(p) - [xmn * CS, ymn * CS]) * ss).astype(np.int32) for p in polys]
    cv2.fillPoly(big, pts, 255, lineType=cv2.LINE_8, shift=4)
    m = cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    return m, int(xmn), int(ymn)


def gold_shade(mask, body_px):
    """Gold-leaf look: rounded bevel, top light, metallic ramp, fine grain."""
    h, w = mask.shape
    bevel = max(1.5, 0.065 * body_px)
    d = ndimage.distance_transform_edt(mask > 0.5).astype(np.float32) + (mask - 0.5)
    ht = np.clip(d / bevel, 0, 1) ** 0.9                         # chiselled bevel, flat face
    ht = cv2.GaussianBlur(ht, (0, 0), max(0.8, bevel * 0.16))
    nx, ny, nz = normals(ht, bevel * 0.75)
    L = np.array([-0.35, -0.75, 0.56], np.float32)
    L /= np.linalg.norm(L)
    lam = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1) / L[2]   # flat face = 1
    hv = L + np.array([0, 0, 1], np.float32)
    hv /= np.linalg.norm(hv)
    spec = np.clip(nx * hv[0] + ny * hv[1] + nz * hv[2], 0, 1) ** 36
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    leaf = fbm(h, w, max(2.0, body_px * 0.22), 3, rng)          # hammered leaf variation
    env = np.sin(2 * np.pi * (yy * 1.6 + 0.35 * nx + 0.08 * leaf))  # soft metallic reflections
    t = np.clip(0.12 + 0.56 * lam + 0.12 * (1 - yy) + 0.06 * leaf + 0.07 * env, 0, 1)
    col = lerp_colors(t, [
        (0.00, (66, 26, 4)),
        (0.30, (158, 78, 12)),
        (0.55, (226, 148, 30)),
        (0.78, (250, 204, 78)),
        (1.00, (255, 244, 186)),
    ])
    col += spec[..., None] * np.array([255, 245, 210], np.float32) * 0.55
    rim = 1.0 - smoothstep(0.0, max(1.0, bevel * 0.12), d)        # dark hairline edge
    col *= (1.0 - 0.35 * rim)[..., None]
    return np.clip(col, 0, 255)


def shadow_of(mask, body_px):
    sig = max(1.0, 0.07 * body_px)
    dx, dy = 0.025 * body_px, 0.06 * body_px
    pad = int(sig * 3 + max(dx, dy)) + 2
    m = np.pad(mask, pad)
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    m = cv2.warpAffine(m, M, (m.shape[1], m.shape[0]))
    m = cv2.GaussianBlur(m, (0, 0), sig)
    return np.clip(m * 0.85, 0, 1), pad


# ---------------------------------------------------------------------------
# Compositing helpers (numpy, matches Photoshop Normal / Overlay)
# ---------------------------------------------------------------------------
def over(dst, rgba, top, left, opacity=1.0):
    h, w = rgba.shape[:2]
    y0, x0 = max(top, 0), max(left, 0)
    y1, x1 = min(top + h, dst.shape[0]), min(left + w, dst.shape[1])
    src = rgba[y0 - top:y1 - top, x0 - left:x1 - left]
    a = src[..., 3:4] / 255.0 * opacity
    dst[y0:y1, x0:x1] = src[..., :3] * a + dst[y0:y1, x0:x1] * (1 - a)


def overlay_blend(base, grey, opacity):
    b = base / 255.0
    s = grey[..., None]
    o = np.where(b < 0.5, 2 * b * s, 1 - 2 * (1 - b) * (1 - s))
    return (b * (1 - opacity) + o * opacity) * 255.0


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    os.makedirs(OUT, exist_ok=True)
    log(f"canvas {W}x{H}px  ({W_IN}x{H_IN} in @ {DPI // Q} dpi)")

    dye = leather_dye(H, W)
    height = leather_height(H, W)
    grain = grain_overlay(height)

    b_rgba, b_top, b_left = building_layer()

    log("text ...")
    texts = []
    for name, txt, x0, x1, ytop, ybase, arc, wt in TEXT_LINES:
        polys, k, sx = layout_line(txt, x0, x1, ytop, ybase, arc, wt, FIT_TEXT.get(name))
        mask, left, top = rasterize(polys)
        body_px = (ybase - ytop) * S
        gold = gold_shade(mask, body_px)
        g_rgba = np.dstack([gold, mask * 255])
        sh, pad = shadow_of(mask, body_px)
        s_rgba = np.dstack([np.zeros(sh.shape + (3,), np.float32), sh * 255])
        texts.append(dict(name=name, text=txt, mask=mask, gold=g_rgba, left=left, top=top,
                          shadow=s_rgba, s_left=left - pad, s_top=top - pad, polys=polys))
        log(f"  {name}: stretch {sx:.3f}, {len(polys)} contours")

    # combined foil mask
    foil = np.zeros((H, W), np.float32)
    for t in texts:
        h, w = t["mask"].shape
        y0, x0 = max(t["top"], 0), max(t["left"], 0)
        y1, x1 = min(t["top"] + h, H), min(t["left"] + w, W)
        foil[y0:y1, x0:x1] = np.maximum(foil[y0:y1, x0:x1],
                                        t["mask"][y0 - t["top"]:y1 - t["top"], x0 - t["left"]:x1 - t["left"]])

    # grain strength: full on bare leather, softer on the painting, light on gold
    bh_, bw_ = b_rgba.shape[:2]
    factor = np.ones((H, W), np.float32)
    factor[b_top:b_top + bh_, b_left:b_left + bw_] -= 0.62 * b_rgba[..., 3] / 255.0
    factor = np.minimum(factor, 1.0 - 0.85 * cv2.GaussianBlur(foil, (0, 0), 2.0))
    grain = 0.5 + (grain - 0.5) * factor

    # ---- flatten (full colour) ----
    log("flatten ...")
    GRAIN_OPACITY = 0.85
    base = dye.copy()
    over(base, b_rgba, b_top, b_left)
    print_only = overlay_blend(base, grain, GRAIN_OPACITY)       # page 2: no text
    for t in texts:
        over(base, t["shadow"], t["s_top"], t["s_left"], 0.75)
        over(base, t["gold"], t["top"], t["left"])
    full = overlay_blend(base, grain, GRAIN_OPACITY)
    full_img = Image.fromarray(to_u8(full))
    print_img = Image.fromarray(to_u8(print_only))

    suffix = "_PREVIEW-LOWRES" if PREVIEW else ""
    full_img.save(os.path.join(OUT, f"{NAME}_FULL-COLOR_300dpi{suffix}.jpg"), quality=95,
                  dpi=(DPI // Q, DPI // Q), subsampling=0)
    prev = full_img.resize((900, 1800), Image.LANCZOS)
    prev.save(os.path.join(OUT, f"{NAME}_preview{suffix}.jpg"), quality=90)
    if PREVIEW:
        log("preview done")
        return

    write_vectors(texts)
    write_pdf(full_img, print_img, texts)
    write_psd(dye, grain, GRAIN_OPACITY, b_rgba, b_top, b_left, texts, foil)
    log("all done")


def poly_d(p):
    """Clipper int polygon -> SVG path data in canvas px."""
    return "M" + " L".join(f"{x / CS:.2f},{y / CS:.2f}" for x, y in p) + " Z"


def write_vectors(texts):
    log("svg ...")
    mm = 25.4 / DPI
    groups = "\n".join(
        f'  <g id="{t["name"].replace(" ", "_")}">\n'
        f'    <path d="{" ".join(poly_d(p) for p in t["polys"])}"/>\n  </g>' for t in texts)
    svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
           f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * mm:.1f}mm" height="{H * mm:.1f}mm" '
           f'viewBox="0 0 {W} {H}">\n'
           f'  <title>GOLD FOIL / EMBOSS - {NAME} - 1:1 scale, outlines (fill = foil)</title>\n'
           f'  <rect id="TRIM_do_not_print" x="0" y="0" width="{W}" height="{H}" fill="none" '
           f'stroke="#00a0e0" stroke-width="2"/>\n'
           f'  <g id="GOLD_FOIL" fill="#000000" fill-rule="evenodd">\n{groups}\n  </g>\n</svg>\n')
    with open(os.path.join(OUT, f"{NAME}_GOLD-FOIL_vector.svg"), "w", encoding="utf-8") as f:
        f.write(svg)


def write_pdf(full_img, print_img, texts):
    log("pdf ...")
    from reportlab.lib.colors import CMYKColorSep
    from reportlab.lib.utils import ImageReader
    from reportlab.pdfgen import canvas

    pw, ph = W_IN * 72, H_IN * 72
    k = 72.0 / DPI
    foil_col = CMYKColorSep(0.0, 0.25, 0.80, 0.10, spotName="GOLD_FOIL", density=1)

    def foil_paths(c):
        c.setFillColor(foil_col)
        for t in texts:
            p = c.beginPath()
            for poly in t["polys"]:
                pts = [(x / CS * k, (H - y / CS) * k) for x, y in poly]
                p.moveTo(*pts[0])
                for q in pts[1:]:
                    p.lineTo(*q)
                p.close()
            c.drawPath(p, stroke=0, fill=1, fillMode=0)   # even-odd

    def save_tmp(img, name):
        fp = os.path.join(OUT, name)
        img.save(fp, quality=95, dpi=(DPI, DPI), subsampling=0)
        return fp

    tmp_full = save_tmp(full_img, "_tmp_full.jpg")
    tmp_print = save_tmp(print_img, "_tmp_print.jpg")

    # print file: 3 pages
    c = canvas.Canvas(os.path.join(OUT, f"{NAME}_PRINT.pdf"), pagesize=(pw, ph))
    c.setTitle(f"{NAME} - print file")
    c.drawImage(ImageReader(tmp_full), 0, 0, pw, ph)               # p1 full colour
    c.showPage()
    c.drawImage(ImageReader(tmp_print), 0, 0, pw, ph)              # p2 print layer (no text)
    c.showPage()
    foil_paths(c)                                                  # p3 foil / emboss vector
    c.showPage()
    c.save()

    # standalone foil vector PDF
    c = canvas.Canvas(os.path.join(OUT, f"{NAME}_GOLD-FOIL_vector.pdf"), pagesize=(pw, ph))
    c.setTitle(f"{NAME} - GOLD FOIL / EMBOSS vector (1:1)")
    foil_paths(c)
    c.showPage()
    c.save()
    os.remove(tmp_full)
    os.remove(tmp_print)


def write_psd(dye, grain, grain_opacity, b_rgba, b_top, b_left, texts, foil):
    log("psd ...")
    from psd_tools import PSDImage
    from psd_tools.constants import BlendMode, Compression, Resource
    from psd_tools.psd.image_resources import ImageResource

    psd = PSDImage.new("RGB", (W, H), color=(8, 26, 64), depth=8)
    # 300 dpi resolution info (resource 1005)
    fixed = int(DPI * 65536)
    res = struct.pack(">IHHIHH", fixed, 1, 1, fixed, 1, 1)
    psd.image_resources[Resource.RESOLUTION_INFO] = ImageResource(
        key=Resource.RESOLUTION_INFO, data=res)

    def rgba_u8(arr, clear=True):
        """uint8 RGBA with real layer transparency; colour zeroed where fully clear."""
        u = to_u8(arr)
        if clear:
            u[..., :3][u[..., 3] == 0] = 0
        return u

    def rgb_u8(arr):
        return to_u8(arr)

    C = Compression.RLE
    Z = Compression.ZIP_WITH_PREDICTION     # Photoshop-readable; keeps the PSD < 100 MB
    flat = psd.create_pixel_layer_from_array(rgb_u8(np.broadcast_to(np.array([8, 26, 64], np.float32), (H, W, 3))),
                                  name="BG - flat navy (alternative)", compression=C)
    flat.visible = False
    dye_l = psd.create_pixel_layer_from_array(rgb_u8(dye), name="BG - navy leather dye colour", compression=Z)
    psd.create_group([flat, dye_l], name="BACKGROUND")

    psd.create_pixel_layer_from_array(rgba_u8(b_rgba), name="ART - 770 building",
                           top=b_top, left=b_left, compression=Z)

    text_layers = []
    for t in texts:
        sh = psd.create_pixel_layer_from_array(rgba_u8(t["shadow"]), name=f"{t['name']} - shadow",
                                    top=t["s_top"], left=t["s_left"], compression=C,
                                    opacity=int(255 * 0.75), blend_mode=BlendMode.MULTIPLY)
        gl = psd.create_pixel_layer_from_array(rgba_u8(t["gold"]), name=f"{t['name']} - gold",
                                    top=t["top"], left=t["left"], compression=C)
        text_layers += [sh, gl]
    psd.create_group(text_layers, name="GOLD TEXT")

    # Leather grain as two Overlay layers carrying the texture in their alpha:
    # white @ a=max(2g-1,0) + black @ a=max(1-2g,0) is mathematically identical to
    # one grey Overlay layer, but stores ~1/3 of the data (solid RGB + one alpha).
    hi = np.clip(2 * grain - 1, 0, 1) * 255
    lo = np.clip(1 - 2 * grain, 0, 1) * 255
    white = np.full((H, W, 3), 255, np.float32)
    g_hi = psd.create_pixel_layer_from_array(rgba_u8(np.dstack([white, hi]), clear=False), name="LEATHER GRAIN - light (Overlay)",
                                  compression=Z, opacity=int(round(255 * grain_opacity)),
                                  blend_mode=BlendMode.OVERLAY)
    g_lo = psd.create_pixel_layer_from_array(rgba_u8(np.dstack([white * 0, lo]), clear=False), name="LEATHER GRAIN - shadow (Overlay)",
                                  compression=Z, opacity=int(round(255 * grain_opacity)),
                                  blend_mode=BlendMode.OVERLAY)
    psd.create_group([g_lo, g_hi], name="LEATHER GRAIN - hide when printing on real leather")

    fm = np.dstack([np.zeros((H, W, 3), np.float32), foil * 255])
    fl = psd.create_pixel_layer_from_array(rgba_u8(fm), name="PRODUCTION - gold foil / emboss mask (black = foil)",
                                compression=C)
    fl.visible = False
    psd.create_group([fl], name="PRODUCTION (hidden)")

    # merged composite (psd-tools renders it on save), ZIP-compressed
    out = os.path.join(OUT, f"{NAME}_300dpi_LAYERED.psd")
    psd._record.image_data.compression = Z
    psd.save(out)
    log(f"psd saved {os.path.getsize(out) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
