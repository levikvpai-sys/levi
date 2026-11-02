#!/usr/bin/env python3
"""
Embroidery package for the 770 wall piece: the building (all colours) and the
gold text are STITCHED directly into the navy leather (no patch, no glue).

Produces, in output/embroidery/:
  * thread-separated artwork at 1:1 (PNG, 300 dpi, trim size, transparent = bare leather)
  * vector artwork per thread colour for the digitiser (SVG, mm)
  * thread chart: Madeira Classic Rayon No.40 codes, area, suggested stitch (PNG + CSV)
  * stitch simulation mockup of the finished piece (JPG) + 1:1 detail

Usage:  python3 embroidery.py [--preview]
Needs build.py next to it (same layout, text and leather).
"""
import csv
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as BLD  # noqa: E402

OUT = os.path.join(BLD.OUT, "embroidery")
PALETTE = os.path.join(BLD.HERE, "source", "threads", "InkStitch_Madeira_Rayon.gpl")
K_COLOURS = 18            # k-means clusters before snapping to real threads
MIN_ISLAND_MM2 = 2.0      # smaller colour islands cannot be stitched cleanly
MM_PER_PX = 25.4 / (BLD.DPI // BLD.Q)
GOLD_THREAD = ("Metallic", "Madeira Metallic No.40 - bright gold", (214, 170, 72))
rng = np.random.default_rng(770)
log = BLD.log


# ---------------------------------------------------------------------------
# threads
# ---------------------------------------------------------------------------
def load_threads():
    rows = []
    for line in open(PALETTE, encoding="utf-8"):
        parts = line.split()
        if len(parts) >= 4 and all(p.isdigit() for p in parts[:3]):
            rgb = tuple(int(p) for p in parts[:3])
            code = parts[-1]
            name = " ".join(parts[3:-1])
            rows.append((rgb, name, code))
    return rows


def lab(rgb_u8):
    a = np.asarray(rgb_u8, np.float32).reshape(-1, 1, 3) / 255.0
    return cv2.cvtColor(a, cv2.COLOR_RGB2Lab).reshape(-1, 3)


# ---------------------------------------------------------------------------
# colour separation
# ---------------------------------------------------------------------------
def separate(rgba):
    """Building RGBA (trim res) -> half-res label map (-1 = bare leather) + threads."""
    log("separating colours ...")
    h, w = rgba.shape[:2]
    hh, hw = h // 2, w // 2
    half = cv2.resize(rgba, (hw, hh), interpolation=cv2.INTER_AREA)
    region = half[..., 3] > 127
    rgb8 = BLD.to_u8(half[..., :3])
    sm = cv2.pyrMeanShiftFiltering(np.ascontiguousarray(rgb8), sp=5, sr=16)
    L = lab(sm).reshape(hh, hw, 3)

    px = L[region]
    sample = px[rng.choice(len(px), min(len(px), 250000), replace=False)]
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 60, 0.2)
    _, _, centers = cv2.kmeans(sample.astype(np.float32), K_COLOURS, None, crit, 4,
                               cv2.KMEANS_PP_CENTERS)
    threads = load_threads()
    tl = lab([t[0] for t in threads])
    chosen = []
    for c in centers:
        i = int(np.argmin(((tl - c) ** 2).sum(1)))
        if i not in chosen:
            chosen.append(i)
    pal = [threads[i] for i in chosen]
    pl = tl[chosen]

    labels = np.full((hh, hw), len(pal), np.int32)          # len(pal) = leather
    d2 = ((px[:, None, :] - pl[None, :, :]) ** 2).sum(-1)
    labels[region] = np.argmin(d2, 1)

    # majority smoothing (one-hot blur + argmax), leather included as a class
    n = len(pal) + 1
    acc = np.zeros((hh, hw, n), np.float32)
    for k in range(n):
        acc[..., k] = cv2.GaussianBlur((labels == k).astype(np.float32), (0, 0), 1.3)
    labels = np.argmax(acc, -1).astype(np.int32)
    del acc

    # remove islands too small to stitch: give them to the surrounding colour
    min_px = MIN_ISLAND_MM2 / (MM_PER_PX * 2) ** 2
    hole = np.zeros_like(labels, bool)
    for k in range(n):
        cc, num = ndimage.label(labels == k)
        if num:
            sizes = ndimage.sum(np.ones_like(cc), cc, range(1, num + 1))
            small = np.isin(cc, 1 + np.where(sizes < min_px)[0])
            hole |= small
    if hole.any():
        _, (iy, ix) = ndimage.distance_transform_edt(hole, return_indices=True)
        labels = labels[iy, ix]
    labels[labels == len(pal)] = -1
    log(f"  {len(pal)} thread colours")
    return labels, pal


# ---------------------------------------------------------------------------
# stitch simulation
# ---------------------------------------------------------------------------
def lic(noise, vx, vy, length):
    """Line-integral convolution along an axial (sign-free) direction field."""
    h, w = noise.shape
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    acc = noise.copy()
    for sgn in (1.0, -1.0):
        px, py = xs.copy(), ys.copy()
        pvx, pvy = vx * sgn, vy * sgn
        for _ in range(length):
            px += pvx
            py += pvy
            svx = cv2.remap(vx, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            svy = cv2.remap(vy, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            flip = (svx * pvx + svy * pvy) < 0
            svx[flip] *= -1
            svy[flip] *= -1
            pvx, pvy = svx, svy
            acc += cv2.remap(noise, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    acc /= 2 * length + 1
    s = (acc - acc.mean()) / (acc.std() + 1e-6)
    return np.clip(0.5 + 0.22 * s, 0, 1)


def direction_field(labels_full, fill_angle):
    """Stitch direction like a digitiser lays it: satin straight across narrow,
    coherent columns; parallel tatami rows at a fixed angle per colour elsewhere.
    Orientation comes from a smoothed structure tensor, so it is consistent over
    each shape instead of radiating from its centre."""
    lab_ = labels_full
    edge = np.zeros(lab_.shape, bool)
    edge[1:] |= lab_[1:] != lab_[:-1]
    edge[:, 1:] |= lab_[:, 1:] != lab_[:, :-1]
    d = ndimage.distance_transform_edt(~edge).astype(np.float32)
    gy, gx = np.gradient(cv2.GaussianBlur(d, (0, 0), 1.5))
    sig = 1.2 / MM_PER_PX
    jxx = cv2.GaussianBlur(gx * gx, (0, 0), sig)
    jyy = cv2.GaussianBlur(gy * gy, (0, 0), sig)
    jxy = cv2.GaussianBlur(gx * gy, (0, 0), sig)
    del gx, gy
    th2 = np.arctan2(2 * jxy, jxx - jyy)                      # doubled angle, across columns
    coh = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2) / (jxx + jyy + 1e-6)
    halfw = ndimage.maximum_filter(d, size=int(9 / MM_PER_PX))  # local column half-width
    narrow = 1 - BLD.smoothstep(2.2 / MM_PER_PX, 3.5 / MM_PER_PX, halfw)
    w_satin = (narrow * BLD.smoothstep(0.25, 0.6, coh)).astype(np.float32)
    fa2 = 2 * fill_angle[np.clip(lab_, 0, None)]
    c2 = w_satin * np.cos(th2) + (1 - w_satin) * np.cos(fa2)
    s2 = w_satin * np.sin(th2) + (1 - w_satin) * np.sin(fa2)
    ang = 0.5 * np.arctan2(s2, c2)
    return np.cos(ang).astype(np.float32), np.sin(ang).astype(np.float32), d, w_satin


def stitched(colour_rgb, labels_full, inside, fill_angle, metallic=False):
    """Render threads: LIC streaks, directional sheen, raised edges."""
    vx, vy, d, _ = direction_field(labels_full, fill_angle)
    noise = cv2.GaussianBlur(rng.random(labels_full.shape, dtype=np.float32), (0, 0), 1.1 / BLD.Q)
    streak = lic(noise, vx, vy, max(4, int(2.2 / MM_PER_PX)))
    Ld = np.array([-0.55, -0.83], np.float32)
    sheen = np.abs(vx * Ld[0] + vy * Ld[1]) ** 2
    hgt = BLD.smoothstep(0.0, 0.5 / MM_PER_PX, d) * inside
    nx, ny, nz = BLD.normals(cv2.GaussianBlur(hgt, (0, 0), 1.0), 2.5)
    Lv = np.array([-0.4, -0.6, 0.69], np.float32)
    Lv /= np.linalg.norm(Lv)
    lam = np.clip(nx * Lv[0] + ny * Lv[1] + nz * Lv[2], 0, 1) / Lv[2]
    if metallic:
        t = np.clip(0.18 + 0.55 * streak + 0.20 * sheen + 0.15 * (lam - 1), 0, 1)
        col = BLD.lerp_colors(t, [(0.0, (90, 52, 10)), (0.35, (176, 118, 30)),
                                  (0.6, (226, 172, 64)), (0.82, (250, 214, 120)),
                                  (1.0, (255, 246, 200))])
        spark = (streak > 0.80).astype(np.float32) * sheen
        col += spark[..., None] * 60
    else:
        shade = (0.68 + 0.55 * streak) * (0.86 + 0.24 * sheen) * (0.80 + 0.22 * lam)
        col = colour_rgb * shade[..., None]
    return np.clip(col, 0, 255), hgt


# ---------------------------------------------------------------------------
# outputs
# ---------------------------------------------------------------------------
def write_svg(labels, pal, b_left, b_top, text_polys):
    log("vector svg ...")
    W, H = BLD.W, BLD.H
    mm = MM_PER_PX
    groups = []
    for k, (rgb, name, code) in enumerate(pal):
        m = (labels == k).astype(np.uint8)
        cs, _ = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        ds = []
        for c in cs:
            c = cv2.approxPolyDP(c, 0.7, True).reshape(-1, 2)
            if len(c) < 3:
                continue
            pts = c * 2 + np.array([b_left, b_top])
            ds.append("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z")
        hexc = "#%02x%02x%02x" % rgb
        gid = f"T{k + 1:02d}_Madeira-Rayon-{code}_{name.replace(' ', '-')}"
        groups.append(f'  <g id="{gid}" fill="{hexc}" fill-rule="evenodd">\n'
                      f'    <path d="{" ".join(ds)}"/>\n  </g>')
    tp = " ".join("M" + " L".join(f"{x / BLD.CS - BLD.B:.2f},{y / BLD.CS - BLD.B:.2f}" for x, y in p) + " Z"
                  for t in text_polys for p in t)
    groups.append(f'  <g id="GOLD_METALLIC_THREAD_text_satin" fill="#d6aa48" fill-rule="evenodd">\n'
                  f'    <path d="{tp}"/>\n  </g>')
    svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n'
           f'<svg xmlns="http://www.w3.org/2000/svg" width="{W * mm:.1f}mm" height="{H * mm:.1f}mm" '
           f'viewBox="0 0 {W} {H}">\n'
           f'  <title>EMBROIDERY artwork 1:1 - one group per thread (Madeira Classic Rayon No.40) '
           f'+ gold metallic text. Artboard = trim 304.8 x 609.6 mm. Bare leather = empty.</title>\n'
           f'  <rect id="TRIM_do_not_stitch" x="0" y="0" width="{W}" height="{H}" fill="none" '
           f'stroke="#00a0e0" stroke-width="2"/>\n' + "\n".join(groups) + "\n</svg>\n")
    with open(os.path.join(OUT, "EMBROIDERY_vector_by-thread_1to1.svg"), "w", encoding="utf-8") as f:
        f.write(svg)


def write_chart(pal, labels, satin_frac, text_area_cm2):
    log("thread chart ...")
    px_cm2 = (MM_PER_PX * 2 / 10) ** 2
    rows = []
    for k, (rgb, name, code) in enumerate(pal):
        area = float((labels == k).sum()) * px_cm2
        stitch = "Satin" if satin_frac[k] > 0.6 else ("Tatami fill" if satin_frac[k] < 0.25 else "Fill + satin details")
        rows.append([f"T{k + 1:02d}", f"Madeira Classic Rayon No.40  #{code}", name,
                     "#%02X%02X%02X" % rgb, f"{area:.1f}", stitch, rgb])
    rows.append(["G", GOLD_THREAD[1], "Gold (all text)", "#D6AA48",
                 f"{text_area_cm2:.1f}", "Satin", GOLD_THREAD[2]])
    with open(os.path.join(OUT, "EMBROIDERY_thread-chart.csv"), "w", newline="", encoding="utf-8") as f:
        wr = csv.writer(f)
        wr.writerow(["#", "Thread", "Colour name", "Hex", "Area cm2", "Suggested stitch"])
        for r in rows:
            wr.writerow(r[:6])
    F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
    FB = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    rh = 74
    img = Image.new("RGB", (1980, 150 + rh * len(rows)), "white")
    d = ImageDraw.Draw(img)
    d.text((30, 25), "THREAD CHART - 770 building + text  (embroidered directly on navy leather)", font=FB, fill="black")
    hdr = ["#", "Thread (brand / code)", "Colour", "Hex", "Area cm²", "Stitch"]
    xs = [30, 260, 920, 1250, 1420, 1600]
    for x, t in zip(xs, hdr):
        d.text((x, 90), t, font=FB, fill=(60, 60, 60))
    for i, r in enumerate(rows):
        y = 140 + i * rh
        d.rectangle([110, y, 240, y + rh - 14], fill=tuple(r[6]), outline=(120, 120, 120))
        for x, t in zip(xs, r[:6]):
            if x == 260:
                d.text((x, y + 14), t, font=F, fill="black")
            elif x != 30:
                d.text((x, y + 14), t[:26], font=F, fill="black")
        d.text((30, y + 14), r[0], font=FB, fill="black")
    img.save(os.path.join(OUT, "EMBROIDERY_thread-chart.png"))
    return rows


def main():
    os.makedirs(OUT, exist_ok=True)
    W, H = BLD.W, BLD.H

    # building art + text outlines, exactly as in the print build (trim coordinates)
    b_rgba, b_top, b_left = BLD.building_layer()
    labels, pal = separate(b_rgba)
    texts = []
    for name, txt, x0, x1, ytop, ybase, arc, wt in BLD.TEXT_LINES:
        polys, _, _ = BLD.layout_line(txt, x0, x1, ytop, ybase, arc, wt, BLD.FIT_TEXT.get(name))
        texts.append([[(x + BLD.B * BLD.CS, y + BLD.B * BLD.CS) for x, y in p] for p in polys])

    # ---- 1:1 separation PNG (trim canvas) ----
    log("separation png ...")
    bh, bw = b_rgba.shape[:2]
    lab_full = cv2.resize(labels, (bw, bh), interpolation=cv2.INTER_NEAREST)
    sep = np.zeros((H, W, 4), np.uint8)
    cols = np.array([p[0] for p in pal] + [(0, 0, 0)], np.uint8)
    blk = cols[np.where(lab_full >= 0, lab_full, len(pal))]
    sep[b_top:b_top + bh, b_left:b_left + bw, :3] = blk
    sep[b_top:b_top + bh, b_left:b_left + bw, 3] = np.where(lab_full >= 0, 255, 0)
    tmask = np.zeros((H, W), np.float32)
    for polys in texts:
        m, l, t = BLD.rasterize([[(x - BLD.B * BLD.CS, y - BLD.B * BLD.CS) for x, y in p] for p in polys])
        tmask[t:t + m.shape[0], l:l + m.shape[1]] = np.maximum(tmask[t:t + m.shape[0], l:l + m.shape[1]], m)
    tm = tmask > 0.5
    sep[tm, :3] = GOLD_THREAD[2]
    sep[tm, 3] = 255
    Image.fromarray(sep, "RGBA").save(os.path.join(OUT, "EMBROIDERY_thread-separation_1to1_300dpi.png"),
                                      dpi=(BLD.DPI // BLD.Q,) * 2)

    write_svg(labels, pal, b_left, b_top, texts)

    # ---- stitch simulation ----
    log("stitch simulation ...")
    fill_angle = np.deg2rad((np.arange(len(pal) + 1) * 37 + 25) % 180).astype(np.float32)
    inside_b = (lab_full >= 0).astype(np.float32)
    rgb_b = cols[np.clip(lab_full, 0, len(pal) - 1)].astype(np.float32)
    emb_b, hgt_b = stitched(rgb_b, lab_full, inside_b, fill_angle)
    # satin share per colour (for the chart)
    _, _, _, w_satin = direction_field(lab_full, fill_angle)
    satin = w_satin > 0.5
    satin_frac = [float(satin[lab_full == k].mean()) if (lab_full == k).any() else 0 for k in range(len(pal))]
    del w_satin, satin

    # gold text, satin across the strokes
    ys_, xs_ = np.where(tm)
    pad = 20
    ty0, ty1, tx0, tx1 = max(ys_.min() - pad, 0), min(ys_.max() + pad, H), max(xs_.min() - pad, 0), min(xs_.max() + pad, W)
    tl = np.where(tm[ty0:ty1, tx0:tx1], 1, -1).astype(np.int32)
    zero = np.zeros(2, np.float32)
    emb_t, hgt_t = stitched(None, tl, tm[ty0:ty1, tx0:tx1].astype(np.float32), zero, metallic=True)

    # leather (same as print build) and composition
    log("compose mockup ...")
    dye = BLD.leather_dye(BLD.CH, BLD.CW)
    grain = BLD.grain_overlay(BLD.leather_height(BLD.CH, BLD.CW))
    leather = BLD.overlay_blend(dye, grain, 0.85)[BLD.B:BLD.B + H, BLD.B:BLD.B + W]
    a_b = np.zeros((H, W), np.float32)
    a_b[b_top:b_top + bh, b_left:b_left + bw] = cv2.GaussianBlur(inside_b, (0, 0), 0.7)
    a_t = np.zeros((H, W), np.float32)
    a_t[ty0:ty1, tx0:tx1] = cv2.GaussianBlur(tm[ty0:ty1, tx0:tx1].astype(np.float32), (0, 0), 0.7)
    a_all = np.maximum(a_b, a_t)
    sh = cv2.GaussianBlur(a_all, (0, 0), 0.35 / MM_PER_PX)
    sh = cv2.warpAffine(sh, np.float32([[1, 0, 0.25 / MM_PER_PX], [0, 1, 0.45 / MM_PER_PX]]), (W, H))
    out = leather * (1 - 0.55 * sh[..., None])
    full_b = np.zeros((H, W, 3), np.float32)
    full_b[b_top:b_top + bh, b_left:b_left + bw] = emb_b
    out = out * (1 - a_b[..., None]) + full_b * a_b[..., None]
    full_t = np.zeros((H, W, 3), np.float32)
    full_t[ty0:ty1, tx0:tx1] = emb_t
    out = out * (1 - a_t[..., None]) + full_t * a_t[..., None]
    img = Image.fromarray(BLD.to_u8(out))
    img.save(os.path.join(OUT, "EMBROIDERY_mockup_stitch-simulation_300dpi.jpg"), quality=93,
             dpi=(BLD.DPI // BLD.Q,) * 2)
    img.resize((900, 1800), Image.LANCZOS).save(os.path.join(OUT, "EMBROIDERY_mockup_preview.jpg"), quality=90)
    cx, cy = W // 2, b_top + int(bh * 0.47)
    s = int(450 / BLD.Q)
    img.crop((cx - 2 * s, cy - s, cx + 2 * s, cy + s)).save(os.path.join(OUT, "EMBROIDERY_mockup_detail_1to1.jpg"), quality=92)

    text_area = float(tm.sum()) * (MM_PER_PX / 10) ** 2
    rows = write_chart(pal, labels, satin_frac, text_area)
    total_cm2 = sum(float(r[4]) for r in rows)
    log(f"done: {len(pal)} rayon colours + gold metallic, stitched area ~{total_cm2:.0f} cm2")


if __name__ == "__main__":
    main()
