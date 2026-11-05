#!/usr/bin/env python3
"""
SEWABLE embroidery version of the 770 wall piece, stitched straight into navy
leather (no patch, no glue, no print).

The painted building cannot be embroidered as-is (thousands of tiny colour
islands). It is redrawn here as clean embroidery shapes: 11 thread colours,
fills for walls/glass/roof, satin columns for every frame and trim, bean-stitch
brick coursing, simplified brush-stroke "daubs", and the gold Hebrew text from
build.py. A small stitch engine turns the shapes into real machine stitches
(tatami fill + underlay, satin + underlay, bean/running, tie-ins/offs, trims).

Outputs (output/embroidery/):
  770_EMB_FULL.dst/.pes/.exp            whole piece (large frame)
  770_EMB_A_top-text.dst/.pes           hooping A
  770_EMB_B_building.dst/.pes           hooping B
  770_EMB_C_bottom-text.dst/.pes        hooping C
  770_EMB_vector-artwork.svg/.pdf       sewable vector art, one group per thread
  770_EMB_stitch-preview*.jpg           rendered from the ACTUAL stitches
  770_EMB_production-sheet.png          colour sequence, codes, stitch counts, placement
  770_EMB_thread-sequence.csv
"""
import csv
import math
import os
import sys
from functools import reduce

import cv2
import numpy as np
import pyembroidery as pe
from PIL import Image, ImageDraw, ImageFont
from shapely import affinity
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import substring, unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as BLD  # noqa: E402

OUT = os.path.join(BLD.OUT, "embroidery")
PALETTE = os.path.join(HERE, "source", "threads", "InkStitch_Madeira_Rayon.gpl")
K = 25.4 / 300 * (3600 / 887)          # reference px -> mm  (0.3436)
CX = 445.0                              # building symmetry axis (reference px)
TRIM_W, TRIM_H = 304.8, 609.6           # mm
MARGIN = 12.0                           # keep stitching this far from the trim edge
log = BLD.log


def mm(g):
    return affinity.scale(g, K, K, origin=(0, 0))


def P(*pts):
    return mm(Polygon(pts))


def R(x0, y0, x1, y1):
    return mm(box(x0, y0, x1, y1))


def mirror(g):
    return affinity.scale(g, -1, 1, origin=(CX * K, 0))


def mx(x):
    return 2 * CX - x


# ---------------------------------------------------------------------------
# threads
# ---------------------------------------------------------------------------
COLOURS = {   # target colour -> snapped to the nearest real Madeira Classic Rayon 40
    "deep_blue":  (30, 76, 124),
    "mid_blue":   (58, 128, 170),
    "light_blue": (138, 196, 212),
    "slate":      (36, 88, 98),
    "brick":      (150, 52, 40),
    "teal":       (34, 116, 138),
    "cream":      (238, 222, 186),
    "wood":       (176, 98, 38),
    "dark":       (38, 40, 46),
}
GOLD = ("gold", "Madeira Metallic No.40", "Gold 4 (bright gold)", (214, 170, 72))


def load_threads():
    rows = []
    for line in open(PALETTE, encoding="utf-8"):
        p = line.split()
        if len(p) >= 4 and all(t.isdigit() for t in p[:3]):
            rows.append((tuple(int(t) for t in p[:3]), " ".join(p[3:-1]), p[-1]))
    return rows


def lab(rgb):
    a = np.asarray(rgb, np.float32).reshape(-1, 1, 3) / 255.0
    return cv2.cvtColor(a, cv2.COLOR_RGB2Lab).reshape(-1, 3)


def snap_threads():
    th = load_threads()
    tl = lab([t[0] for t in th])
    out = {}
    bad = np.array([("purple" in t[1].lower() or "violet" in t[1].lower() or "lilac" in t[1].lower()) for t in th])
    for name, rgb in COLOURS.items():
        d2 = ((tl - lab([rgb])[0]) ** 2).sum(1)
        if "blue" in name or name in ("teal", "slate"):
            d2 = d2 + bad * 1e6
        i = int(np.argmin(d2))
        out[name] = ("Madeira Classic Rayon No.40", f"#{th[i][2]} {th[i][1]}", th[i][0])
    out["gold"] = GOLD[1:]
    return out


# ---------------------------------------------------------------------------
# design (reference px -> mm). z = stacking order, higher z knocks out lower fills
# ---------------------------------------------------------------------------
ELEMS = []


def fill(geom, colour, z, angle, spacing=0.45, length=3.5, satin_max=None, section="B", name="",
         brick=None, underlay=True, travel=True):
    ELEMS.append(dict(kind="fill", geom=geom, colour=colour, z=z, angle=angle, spacing=spacing,
                      length=length, satin_max=satin_max, section=section, name=name,
                      brick=brick, underlay=underlay, travel=travel))


def satin(p0, p1, w0, colour, z, w1=None, section="B", name=""):
    """p0/p1/w in reference px."""
    ELEMS.append(dict(kind="satin", p0=(p0[0] * K, p0[1] * K), p1=(p1[0] * K, p1[1] * K),
                      w0=w0 * K, w1=(w1 if w1 is not None else w0) * K,
                      colour=colour, z=z, section=section, name=name))


def run(lines, colour, z, bean=True, length=2.4, section="B", name=""):
    ELEMS.append(dict(kind="run", geom=lines, colour=colour, z=z, bean=bean, length=length,
                      section=section, name=name))


def both(fn):
    """Add an element and its mirror image (left/right wing)."""
    fn(lambda g: g, lambda x: x)
    fn(mirror, mx)


def frame(x0, y0, x1, y1, w, colour, z, name):
    satin((x0, y0 + w / 2), (x1, y0 + w / 2), w, colour, z, name=name)
    satin((x0, y1 - w / 2), (x1, y1 - w / 2), w, colour, z, name=name)
    satin((x0 + w / 2, y0 + w), (x0 + w / 2, y1 - w), w, colour, z, name=name)
    satin((x1 - w / 2, y0 + w), (x1 - w / 2, y1 - w), w, colour, z, name=name)


def window(g0, g1, panes, w_frame, transom=None, name="window"):
    """g0/g1 = glass corners (reference px). Builds glass, cream surround, mullions."""
    (x0, y0), (x1, y1) = g0, g1
    fill(R(x0, y0, x1, y1), "teal", 30, angle=62, spacing=0.45, name=name + " glass")
    frame(x0 - w_frame, y0 - w_frame, x1 + w_frame, y1 + w_frame, w_frame, "cream", 60, name + " surround")
    pw = (x1 - x0) / panes
    for i in range(1, panes):
        x = x0 + i * pw
        satin((x, y0), (x, y1), 6, "cream", 61, name=name + " mullion")
    if transom:
        satin((x0, transom), (x1, transom), 6, "cream", 61, name=name + " transom")
    # little light glint in each upper pane
    for i in range(panes):
        a = x0 + i * pw
        gl = LineString([(a + pw * 0.22, y0 + 18), (a + pw * 0.55, y0 + 7)])
        run([mm(gl)], "light_blue", 90, name=name + " glint")


def design():
    ELEMS.clear()
    # ---- roof, chimneys, walls -------------------------------------------
    fill(P((68, 666), (108, 584), (782, 584), (822, 666)), "slate", 10, angle=8, name="roof")
    for g, X in ((lambda g: g, lambda x: x), (mirror, mx)):
        fill(g(R(102, 532, 140, 650)), "brick", 12, angle=0, name="chimney", brick=(13 * K, 26 * K, 0.45))
        satin((X(96), 529), (X(146), 529), 9, "cream", 62, name="chimney cap")
        satin((X(98), 565), (X(144), 565), 7, "cream", 62, name="chimney band")
    left = Polygon([(80, 1162), (80, 666), (226, 516), (346, 664), (346, 1162)])
    centre = Polygon([(352, 1162), (352, 674), (445, 562), (538, 674), (538, 1162)])
    walls = unary_union([left, centre, affinity.scale(left, -1, 1, origin=(CX, 0)),
                         box(340, 664, 360, 1162), box(530, 664, 550, 1162)])
    fill(mm(walls), "brick", 20, angle=0, spacing=0.45, length=3.8, name="brick walls", brick=(13 * K, 26 * K, 0.45))

    # ---- gable trims, finials, pinnacles, ornaments ----------------------
    for g, X in ((lambda g: g, lambda x: x), (mirror, mx)):
        satin((X(76), 670), (X(226), 513), 9, "cream", 64, name="gable rake")
        satin((X(226), 513), (X(349), 668), 9, "cream", 64, name="gable rake")
        satin((X(66), 668), (X(94), 668), 8, "cream", 64, name="eave return")
        satin((X(226), 514), (X(226), 496), 8, "cream", 65, w1=4, name="finial")
        fill(g(mm(Point(226, 490).buffer(6.5))), "cream", 66, angle=90, name="finial ball")
        satin((X(360), 690), (X(360), 598), 14, "cream", 63, w1=4, name="pinnacle")
        fill(g(mm(Point(360, 594).buffer(4.5))), "cream", 66, angle=90, name="pinnacle ball")
        fill(g(R(203, 587, 243, 627)), "cream", 66, angle=45, name="gable ornament")
        c = (223, 607)
        star = [LineString([(c[0] - 13 * math.cos(a), c[1] - 13 * math.sin(a)),
                            (c[0] + 13 * math.cos(a), c[1] + 13 * math.sin(a))])
                for a in np.deg2rad([0, 45, 90, 135])]
        run([g(mm(s)) for s in star], "wood", 92, name="ornament star")
        # string course
        satin((X(80), 780), (X(346), 780), 8, "cream", 62, name="string course")
    satin((352, 676), (445, 560), 9, "cream", 64, name="centre rake")
    satin((445, 560), (538, 676), 9, "cream", 64, name="centre rake")
    satin((445, 561), (445, 547), 7, "cream", 65, w1=4, name="centre finial")
    fill(mm(Point(445, 542).buffer(5.5)), "cream", 66, angle=90, name="centre finial ball")
    fill(R(430, 622, 460, 652), "cream", 66, angle=45, name="centre ornament")
    run([mm(LineString([(435, 637), (455, 637)])), mm(LineString([(445, 627), (445, 647)]))],
        "wood", 92, name="centre ornament cross")

    # ---- windows -----------------------------------------------------------
    for g, X in ((lambda g: g, lambda x: x), (mirror, mx)):
        def W(a, b, c, d, panes, wf, transom=None, nm="window"):
            xa, xb = sorted((X(a), X(c)))
            window((xa, b), (xb, d), panes, wf, transom, nm)
        W(176, 703, 276, 771, 3, 15, nm="window row 1")
        W(172, 850, 276, 927, 3, 15, nm="window row 2")
        W(146, 992, 290, 1106, 4, 16, transom=1031, nm="window row 3")
        satin((X(118), 1124), (X(316), 1124), 8, "cream", 62, name="sill")
    window((411, 705), (479, 769), 3, 13, None, "centre window")

    # ---- bay window ------------------------------------------------------
    fill(P((407, 774), (483, 774), (503, 816), (387, 816)), "slate", 32, angle=0, name="bay roof")
    satin((404, 776), (486, 776), 6, "dark", 70, name="bay roof ridge")
    fill(R(391, 818, 499, 921), "teal", 31, angle=62, name="bay glass")
    lat = []
    for t in range(-140, 160, 15):
        lat.append(LineString([(391 + t, 818), (391 + t + 103, 921)]))
        lat.append(LineString([(499 - t, 818), (499 - t - 103, 921)]))
    run([mm(l_) for l_ in lat], "light_blue", 88, name="bay lattice")
    for x in (393, 420, 445, 470, 497):
        satin((x, 818), (x, 921), 5, "dark", 70, name="bay mullion")
    satin((391, 820), (499, 820), 5, "dark", 70, name="bay frame")
    satin((391, 868), (499, 868), 4, "dark", 70, name="bay transom")
    fill(P((385, 921), (505, 921), (495, 948), (472, 975), (418, 975), (395, 948)),
         "cream", 58, angle=0, name="bay corbel")
    run([mm(LineString([(392, 934), (498, 934)])), mm(LineString([(400, 952), (490, 952)]))],
        "wood", 92, name="corbel mouldings")

    # ---- door, surround, lamps, pipes ---------------------------------------
    fill(R(415, 1009, 477, 1118), "wood", 40, angle=90, spacing=0.42, name="door")
    surround = P((393, 1124), (393, 1000), (445, 978), (497, 1000), (497, 1124)).difference(R(415, 1009, 477, 1118))
    fill(surround, "cream", 57, angle=90, name="door surround")
    door_lines = [LineString([(446, 1011), (446, 1116)])]
    for a, b in ((419, 442), (450, 473)):
        door_lines += [LineString([(a, 1016), (b, 1016), (b, 1056), (a, 1056), (a, 1016)]),
                       LineString([(a, 1064), (b, 1064), (b, 1110), (a, 1110), (a, 1064)])]
    run([mm(l_) for l_ in door_lines], "dark", 93, name="door panels")
    for g, X in ((lambda g: g, lambda x: x), (mirror, mx)):
        lamp = P((371, 1030), (381, 1016), (391, 1030), (389, 1058), (373, 1058))
        fill(g(lamp), "dark", 72, angle=90, name="lamp")
        fill(g(R(376, 1032, 386, 1052)), "gold", 73, angle=90, spacing=0.4, name="lamp light")
        satin((X(352), 676), (X(352), 1104), 5, "dark", 71, name="down pipe")
        satin((X(352), 1101), (X(366), 1112), 6, "dark", 71, name="pipe shoe")

    # ---- plinth, pillars, steps ---------------------------------------------
    fill(R(80, 1160, 810, 1181), "cream", 42, angle=0, name="plinth")
    for g, X in ((lambda g: g, lambda x: x), (mirror, mx)):
        fill(g(R(309, 1104, 359, 1195)), "brick", 44, angle=0, name="pillar", brick=(13 * K, 26 * K, 0.45))
        fill(g(P((300, 1104), (334, 1082), (368, 1104))), "cream", 67, angle=90, name="pillar cap")
        satin((X(300), 1106), (X(368), 1106), 6, "cream", 67, name="pillar cap band")
    risers = []
    flights = [(1122, 362, 528), (1140, 362, 528), (1158, 362, 528), (1176, 362, 528),
               (1194, 300, 590), (1212, 290, 600), (1230, 279, 611), (1248, 268, 622)]
    for i, (ty, xa, xb) in enumerate(flights):
        fill(R(xa, ty, xb, ty + 18), "cream", 50 + i, angle=0, spacing=0.5, name="step")
        risers.append(LineString([(xa + 2, ty + 1), (xb - 2, ty + 1)]))
    run([mm(r_) for r_ in risers], "wood", 92, name="step edges")

    # ---- brush-stroke daubs from the reference ------------------------------
    building = unary_union([mm(walls), P((68, 666), (108, 584), (782, 584), (822, 666)),
                            R(96, 524, 146, 650), mirror(R(96, 524, 146, 650)),
                            R(268, 1082, 622, 1266), mm(Point(226, 490).buffer(8)),
                            mirror(mm(Point(226, 490).buffer(8))), mm(Point(445, 542).buffer(7))])
    for tone, polys in daubs(building).items():  # noqa: B007
        z = {"deep_blue": 1, "mid_blue": 2, "light_blue": 3}[tone]
        for pg, ang in polys:
            fill(pg, tone, z, angle=ang, spacing=0.5, length=4.0, name="brush daub")  # noqa

    # ---- gold text (from build.py, same outlines as the print / foil files) -
    for name, txt, x0, x1, ytop, ybase, arc, wt in BLD.TEXT_LINES:
        wt_emb = max(wt, 0.04)                          # thread needs >= ~1.3 mm strokes
        polys, _, _ = BLD.layout_line(txt, x0, x1, ytop, ybase, arc, wt_emb, BLD.FIT_TEXT.get(name))
        rings = [Polygon([(x / BLD.CS * 25.4 / 300, y / BLD.CS * 25.4 / 300) for x, y in p]) for p in polys]
        rings = [r.buffer(0) for r in rings if r.area > 0]
        g = reduce(lambda a, b: a.symmetric_difference(b), rings)
        sec = "A" if ybase < 700 else "C"
        fill(g, "gold", 100, angle=68, spacing=0.42, length=3.2, satin_max=5.0, section=sec, name=name,
             travel=False)                               # small letters: clean trims, no visible travel
    return building


def daubs(building, seed=770):
    """Palette-knife brush strokes as a halo around the building (like the painting):
    rounded diagonal bars, 3 blues, lighter near the walls. Bare leather shows between."""
    rnd = np.random.default_rng(seed)
    halo = building.buffer(30).difference(building.buffer(1.0))
    frame_ = box(MARGIN, 118, TRIM_W - MARGIN, 462)        # strokes must sit wholly inside
    near = building.buffer(14)
    minx, miny, maxx, maxy = halo.bounds
    strokes = {"deep_blue": [], "mid_blue": [], "light_blue": []}
    covered, tries = Polygon(), 0
    while covered.area < 0.55 * halo.area and tries < 4000:
        tries += 1
        c = Point(rnd.uniform(minx, maxx), rnd.uniform(miny, maxy))
        if not halo.contains(c):
            continue
        ang = -22 + rnd.normal(0, 7)
        Lg, w = rnd.uniform(16, 46), rnd.uniform(5.5, 9.0)
        a = math.radians(ang)
        ux, uy = math.cos(a) * Lg / 2, math.sin(a) * Lg / 2
        st = LineString([(c.x - ux, c.y - uy), (c.x + ux, c.y + uy)]).buffer(w / 2, cap_style=1)
        if not frame_.contains(st):
            continue
        st = st.difference(building.buffer(1.0))
        if st.is_empty or st.area < 40 or st.difference(covered).area < 0.35 * st.area:
            continue
        r = rnd.random()
        if near.contains(c):
            tone = "light_blue" if r < 0.45 else ("mid_blue" if r < 0.85 else "deep_blue")
        else:
            tone = "mid_blue" if r < 0.5 else ("deep_blue" if r < 0.85 else "light_blue")
        strokes[tone].append((st, ang))
        covered = covered.union(st)
    return strokes


# ---------------------------------------------------------------------------
# stitch engine (mm). A "path" is a list of (x, y); jumps between paths.
# ---------------------------------------------------------------------------
def resample(coords, length, keep_corners=True):
    pts = [coords[0]]
    for a, b in zip(coords[:-1], coords[1:]):
        d = math.dist(a, b)
        n = max(1, int(math.ceil(d / length)))
        for i in range(1, n + 1):
            t = i / n
            pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    return pts


def run_path(line, length, bean):
    pts = resample(list(line.coords), length)
    if not bean:
        return pts
    out = [pts[0]]
    for a, b in zip(pts[:-1], pts[1:]):
        out += [b, a, b]                                   # triple (bean) stitch
    return out


def rows_fill(poly, angle, spacing, length, satin_max=None, stagger=0.37, brick=None):
    """Tatami/satin-fill: parallel rows at `angle`, boustrophedon chains, staggered points.
    brick=(course_h, brick_len, gap): open mortar rows + aligned joint penetrations
    (an embossed brick bond in a single thread, angle 0 only)."""
    rp = affinity.rotate(poly, -angle, origin=(0, 0))
    minx, miny, maxx, maxy = rp.bounds
    rows, y, k = [], miny + spacing * 0.5, 0
    while y < maxy:
        if brick and (y % brick[0]) < brick[2]:
            y += spacing
            k += 1
            continue
        inter = rp.intersection(LineString([(minx - 1, y), (maxx + 1, y)]))
        segs = []
        for g in getattr(inter, "geoms", [inter]):
            if g.geom_type == "LineString" and g.length > 0.25:
                xs = [c[0] for c in g.coords]
                segs.append((min(xs), max(xs)))
        rows.append((k, y, sorted(segs)))
        y += spacing
        k += 1
    chains, open_ = [], []
    for k, y, segs in rows:
        nxt, used = [], set()
        for a, b in segs:
            best = None
            for ci, ch in enumerate(open_):
                if ci in used:
                    continue
                _, _, la, lb = ch[-1]
                if min(b, lb) - max(a, la) > 0 and abs(a - la) < 3 and abs(b - lb) < 3:
                    best = ci
                    break
            if best is None:
                ch = []
                chains.append(ch)
            else:
                ch = open_[best]
                used.add(best)
            ch.append((k, y, a, b))
            nxt.append(ch)
        open_ = nxt
    paths = []
    for ch in chains:
        pts = []
        for i, (k, y, a, b) in enumerate(ch):
            xa, xb = (a, b) if i % 2 == 0 else (b, a)
            seg = abs(xb - xa)
            row = [(xa, y)]
            if brick:
                cl, bl = brick[0], brick[1]
                course = int(y // cl)
                ofs = (course % 2) * bl / 2
                xs = []
                j = math.floor((min(a, b) - ofs) / bl)
                while ofs + j * bl < max(a, b):
                    jx = ofs + j * bl
                    sh = ((k % 3) * 0.11) * bl
                    for t in (jx, jx + bl * 0.34 + sh, jx + bl * 0.67 + sh):
                        if min(a, b) + 0.6 < t < max(a, b) - 0.6:
                            xs.append(t)
                    j += 1
                xs = sorted(set(round(v, 3) for v in xs), reverse=(xb < xa))
                row += [(x, y) for x in xs]
            elif not (satin_max and seg <= satin_max):
                sgn = 1 if xb > xa else -1
                off = ((k * stagger) % 1.0) * length
                base = min(a, b)
                xs = []
                t = base + off
                while t < max(a, b):
                    if abs(t - a) > 0.6 and abs(t - b) > 0.6:
                        xs.append(t)
                    t += length
                xs = sorted(xs, reverse=(sgn < 0))
                row += [(x, y) for x in xs]
            row.append((xb, y))
            pts += row
        back = affinity.rotate(LineString(pts) if len(pts) > 1 else Point(pts[0]), angle, origin=(0, 0))
        paths.append(list(back.coords))
    return paths


def ring_travel(rings, p, q, maxlen=45.0):
    """Running-stitch travel along an inset ring from p to q (None if not possible)."""
    P_, Q_ = Point(p), Point(q)
    best = None
    for ring in rings:
        L = ring.length
        if L < 1.0 or P_.distance(ring) > 1.6 or Q_.distance(ring) > 1.6:
            continue
        d0, d1 = ring.project(P_), ring.project(Q_)
        fwd, bwd = (d1 - d0) % L, (d0 - d1) % L
        if min(fwd, bwd) > maxlen:
            continue
        if fwd <= bwd:
            parts = [substring(ring, d0, d1)] if d0 <= d1 else [substring(ring, d0, L), substring(ring, 0, d1)]
        else:
            parts = [substring(ring, d0, d1)] if d0 >= d1 else [substring(ring, d0, 0), substring(ring, L, d1)]
        pts = []
        for g in parts:
            if g.geom_type == "LineString":
                pts += list(g.coords)
        if len(pts) >= 2 and (best is None or min(fwd, bwd) < best[0]):
            best = (min(fwd, bwd), pts)
    if best is None:
        return None
    return resample([p] + best[1] + [q], 2.6)[1:-1]


def fill_stitches(geom, angle, spacing, length, satin_max, brick=None, underlay=True, travel=True):
    """Fill one area as few continuous paths as possible: edge-walk underlay, sparse
    cross underlay, then the top rows; moves between sections travel along the edge
    (hidden under the fill) instead of trimming."""
    out = []
    geom = geom.buffer(0.12)                                # pull compensation
    for pg in getattr(geom, "geoms", [geom]):
        if pg.geom_type != "Polygon" or pg.area < 1.0:
            continue
        inset = pg.buffer(-0.45)
        rings = []
        for ip in getattr(inset, "geoms", [inset]):
            if ip.geom_type == "Polygon":
                rings += [LineString(ip.exterior.coords)] + [LineString(r.coords) for r in ip.interiors]
        parts = []
        if underlay:
            for ip in getattr(inset, "geoms", [inset]):     # edge-walk underlay
                if ip.geom_type == "Polygon" and ip.length > 3:
                    parts.append(resample(list(ip.exterior.coords), 2.5))
            if pg.area > 250 and not brick:                 # sparse cross underlay
                ul = pg.buffer(-0.8)
                if not ul.is_empty:
                    parts += nearest_order(rows_fill(ul, angle + 90, 2.6, 4.0))
        parts += nearest_order(rows_fill(pg, angle, spacing, length, satin_max, brick=brick))
        cur = None
        for p in parts:
            if cur is None:
                cur = list(p)
                continue
            if math.dist(cur[-1], p[0]) <= 2.0:
                cur += list(p)
                continue
            tr = ring_travel(rings, cur[-1], p[0]) if travel else None
            if tr is not None:
                cur += tr + list(p)
            else:
                cur += [None] + list(p)        # jump inside the unit: order stays underlay -> top
        if cur:
            out.append(cur)
    return out


def satin_stitches(e, spacing=0.40, pc=0.12):
    (x0, y0), (x1, y1) = e["p0"], e["p1"]
    L = math.dist((x0, y0), (x1, y1))
    if L < 0.3:
        return []
    ux, uy = (x1 - x0) / L, (y1 - y0) / L
    nx, ny = -uy, ux
    under = resample([(x0, y0), (x1, y1)], 2.0)            # centre-walk underlay
    wmax = max(e["w0"], e["w1"])
    if wmax > 2.4:                                          # zig-zag underlay going back
        n = max(2, int(L / 1.8))
        for i in range(n + 1):
            t = 1 - i / n
            w = (e["w0"] + (e["w1"] - e["w0"]) * t) * 0.3
            s = 1 if i % 2 else -1
            under.append((x0 + ux * L * t + nx * w * s, y0 + uy * L * t + ny * w * s))
        start, end = (x0, y0), (x1, y1)
    else:
        start, end = (x1, y1), (x0, y0)
    n = max(2, int(L / spacing))
    top = []
    sx, sy = start
    ex, ey = end
    for i in range(n + 1):
        t = i / n
        cx_, cy_ = sx + (ex - sx) * t, sy + (ey - sy) * t
        tt = t if start == (x0, y0) else 1 - t
        w = (e["w0"] + (e["w1"] - e["w0"]) * tt) / 2 + pc
        s = 1 if i % 2 == 0 else -1
        top.append((cx_ + nx * w * s, cy_ + ny * w * s))
    return [under + top]


def satin_poly(e, shrink=0.0):
    (x0, y0), (x1, y1) = e["p0"], e["p1"]
    L = math.dist((x0, y0), (x1, y1)) or 1e-6
    nx, ny = -(y1 - y0) / L, (x1 - x0) / L
    a, b = e["w0"] / 2 - shrink, e["w1"] / 2 - shrink
    if a <= 0 or b <= 0:
        return Polygon()
    return Polygon([(x0 + nx * a, y0 + ny * a), (x1 + nx * b, y1 + ny * b),
                    (x1 - nx * b, y1 - ny * b), (x0 - nx * a, y0 - ny * a)])


def prepare():
    """Knock out hidden areas (no stacked stitching on leather) and clip line work."""
    log("knock-outs ...")
    foot = []
    for e in ELEMS:
        if e["kind"] == "fill":
            e["area"] = e["geom"].buffer(0)
            foot.append((e["z"], e["area"].buffer(-0.35), e["section"]))
        elif e["kind"] == "satin":
            foot.append((e["z"], satin_poly(e, 0.35), e["section"]))
    for e in ELEMS:
        if e["kind"] != "fill":
            continue
        above = [g for z, g, s in foot if z > e["z"] and s == e["section"] and not g.is_empty]
        if above:
            e["area"] = e["area"].difference(unary_union(above))
    for e in ELEMS:
        if e["kind"] == "run" and e["name"] in ("bay lattice",):
            glass = next(x for x in ELEMS if x["name"] == "bay glass")["area"].buffer(-0.5)
            e["geom"] = [g for ln in e["geom"] for g in getattr(ln.intersection(glass), "geoms", [ln.intersection(glass)])
                         if g.geom_type == "LineString" and g.length > 1.5]


def plan(threads):
    """Order by thread and generate stitches."""
    prepare()
    order = ["deep_blue", "mid_blue", "slate", "brick", "teal", "light_blue",
             "cream", "wood", "dark", "gold"]
    plans = {}
    for sec in ("A", "B", "C"):
        blocks = []
        solid = {c: unary_union([element_shape(e) for e in ELEMS if e["section"] == sec and e["colour"] == c
                                 and e["kind"] != "run"]) for c in order}
        for ci, col in enumerate(order):
            es = [e for e in ELEMS if e["section"] == sec and e["colour"] == col]
            if not es:
                continue
            es.sort(key=lambda e: (e["z"], e["kind"] == "run"))
            paths = []
            for e in es:
                if e["kind"] == "fill" and not e["area"].is_empty:
                    paths += fill_stitches(e["area"], e["angle"], e["spacing"], e["length"], e["satin_max"],
                                           e["brick"], e["underlay"], e["travel"])
                elif e["kind"] == "satin":
                    paths += satin_stitches(e)
                elif e["kind"] == "run":
                    paths += [run_path(g, e["length"], e["bean"]) for g in e["geom"] if g.length > 0.5]
            paths = [p for p in paths if len(p) > 1]
            # a move is hidden if it lies on this colour's stitching or under any solid
            # (fill/satin) stitching sewn afterwards
            own = unary_union([element_shape(e) for e in es if e.get("travel", True)]).buffer(0.3)
            later = unary_union([solid[c] for c in order[ci + 1:]]).buffer(-0.5)
            cover = unary_union([own, later])
            paths = [heal_jumps(p, cover) for p in paths]
            blocks.append((col, join_hidden(nearest_order(paths, allow_reverse=False), cover)))
        plans[sec] = blocks
        log(f"  section {sec}: {len(blocks)} colours, {sum(len(b) for _, b in blocks)} paths")
    return plans


def heal_jumps(path, cover, max_len=30.0):
    """Replace internal jumps (None) by a connector when the move is hidden."""
    if None not in path:
        return path
    out = []
    for i, q in enumerate(path):
        if q is None:
            a, b = out[-1], path[i + 1]
            d = math.dist(a, b)
            if d <= 2.0 or (d <= max_len and LineString([a, b]).within(cover)):
                out += resample([a, b], 2.8)[1:-1]
            else:
                out.append(None)
        else:
            out.append(q)
    return out


def join_hidden(paths, cover, max_len=30.0):
    """Join consecutive paths of one colour without a trim when the move stays on
    that colour's own stitching (corners of frames, pieces of one shape)."""
    out = []
    for p in paths:
        if out:
            a, b = out[-1][-1], p[0]
            d = math.dist(a, b)
            if 2.0 < d <= max_len and LineString([a, b]).within(cover):
                out[-1] = out[-1] + resample([a, b], 2.8)[1:-1] + list(p)
                continue
        out.append(list(p))
    return out


def nearest_order(paths, allow_reverse=True):
    """Greedy path order; may reverse plain paths. Composite paths (underlay + top
    stitching) must never be reversed or the underlay would end up on top."""
    if not paths:
        return []
    left = list(range(len(paths)))
    out, cur = [], (0.0, 0.0)
    starts = np.array([p[0] for p in paths])
    ends = np.array([p[-1] for p in paths])
    alive = np.ones(len(paths), bool)
    for _ in range(len(paths)):
        ds = np.hypot(*(starts - cur).T)
        de = np.hypot(*(ends - cur).T) if allow_reverse else np.full(len(paths), 1e9)
        ds[~alive] = 1e9
        de[~alive] = 1e9
        i, j = int(np.argmin(ds)), int(np.argmin(de))
        if ds[i] <= de[j]:
            p = paths[i]
            alive[i] = False
        else:
            p = paths[j][::-1]
            alive[j] = False
        out.append(p)
        cur = p[-1]
    del left
    return out


# ---------------------------------------------------------------------------
# machine files
# ---------------------------------------------------------------------------
def to_pattern(blocks, threads):
    """Paths may contain None = jump inside one stitching unit (keeps its order)."""
    pat = pe.EmbPattern()
    first = True
    n_stitch = n_trim = 0

    def tie_in(pts):
        sx, sy = pts[0]
        if len(pts) > 1 and pts[1] is not None:
            dx, dy = pts[1][0] - sx, pts[1][1] - sy
            d = math.hypot(dx, dy) or 1
            for f in (0.0, 0.5, 0.0):
                pat.add_stitch_absolute(pe.STITCH, (sx + dx / d * f) * 10, (sy + dy / d * f) * 10)

    def tie_off(a, b):
        dx, dy = a[0] - b[0], a[1] - b[1]
        d = math.hypot(dx, dy) or 1
        for f in (0.5, 0.0):
            pat.add_stitch_absolute(pe.STITCH, (b[0] + dx / d * f) * 10, (b[1] + dy / d * f) * 10)

    for col, paths in blocks:
        brand, desc, rgb = threads[col]
        t = pe.EmbThread()
        t.set_color(*rgb)
        t.description = f"{desc}"
        t.brand = brand.split(" ")[0]
        t.catalog_number = desc.split(" ")[0].lstrip("#") if desc.startswith("#") else "Gold 4"
        pat.add_thread(t)
        if not first:
            pat.color_change()
        first = False
        prev = prev2 = None
        for path in paths:
            runs, curr = [], []
            for q in path:
                if q is None:
                    if curr:
                        runs.append(curr)
                    curr = []
                else:
                    curr.append(q)
            if curr:
                runs.append(curr)
            for r in runs:
                if prev is None or math.dist(prev, r[0]) > 2.0:
                    if prev is not None:
                        if prev2 is not None:
                            tie_off(prev2, prev)
                        pat.trim()
                        n_trim += 1
                    pat.add_stitch_absolute(pe.JUMP, r[0][0] * 10, r[0][1] * 10)
                    tie_in(r)
                for x, y in r:
                    pat.add_stitch_absolute(pe.STITCH, x * 10, y * 10)
                    n_stitch += 1
                prev = r[-1]
                prev2 = r[-2] if len(r) > 1 else prev2
        if prev is not None and prev2 is not None:
            tie_off(prev2, prev)
    pat.trim()
    pat.end()
    return pat, n_stitch, n_trim


def export(plans, threads):
    log("machine files ...")
    info = {}
    names = {"A": "A_top-text", "B": "B_building", "C": "C_bottom-text"}
    full_blocks = plans["B"] + plans["A"] + plans["C"]       # gold sewn once, at the end
    for sec in ("A", "B", "C"):
        blocks = plans[sec]
        pat, ns, nt = to_pattern(blocks, threads)
        x0, y0, x1, y1 = pat.extents()
        centre = ((x0 + x1) / 20, (y0 + y1) / 20)
        pat.move_center_to_origin()
        base = os.path.join(OUT, f"770_EMB_{names[sec]}")
        pe.write_dst(pat, base + ".dst")
        pe.write_pes(pat, base + ".pes", {"version": 6})
        info[sec] = dict(stitches=pat.count_stitches(), trims=nt, colours=[c for c, _ in blocks],
                         size=((x1 - x0) / 10, (y1 - y0) / 10), centre=centre)
    # full piece: merge consecutive identical colours across sections
    merged = []
    for col, paths in full_blocks:
        if merged and merged[-1][0] == col:
            merged[-1] = (col, merged[-1][1] + paths)
        else:
            merged.append((col, paths))
    pat, ns, nt = to_pattern(merged, threads)
    x0, y0, x1, y1 = pat.extents()
    pat.move_center_to_origin()
    base = os.path.join(OUT, "770_EMB_FULL")
    pe.write_dst(pat, base + ".dst")
    pe.write_pes(pat, base + ".pes", {"version": 6})
    pe.write(pat, base + ".exp")
    info["FULL"] = dict(stitches=pat.count_stitches(), trims=nt, colours=[c for c, _ in merged],
                        size=((x1 - x0) / 10, (y1 - y0) / 10), centre=((x0 + x1) / 20, (y0 + y1) / 20))
    # verify by reading the DST back
    chk = pe.read(base + ".dst")
    info["FULL"]["dst_readback_stitches"] = chk.count_stitches()
    return info, merged


# ---------------------------------------------------------------------------
# vector artwork
# ---------------------------------------------------------------------------
def element_shape(e):
    if e["kind"] == "fill":
        return e["area"]
    if e["kind"] == "satin":
        return satin_poly(e)
    return unary_union([g.buffer(0.25) for g in e["geom"]]) if e["geom"] else Polygon()


def write_vector(threads):
    log("vector artwork ...")
    order = ["deep_blue", "mid_blue", "slate", "brick", "teal", "light_blue",
             "cream", "wood", "dark", "gold"]
    groups, shapes = [], {}
    for col in order:
        g = unary_union([element_shape(e) for e in ELEMS if e["colour"] == col])
        shapes[col] = g
        rgb = threads[col][2]
        d = []
        for pg in getattr(g, "geoms", [g]):
            if pg.geom_type != "Polygon" or pg.is_empty:
                continue
            for ring in [pg.exterior] + list(pg.interiors):
                d.append("M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in ring.coords) + " Z")
        gid = f"{col}__{threads[col][0].replace(' ', '-')}_{threads[col][1].replace(' ', '-').replace('#', '')}"
        groups.append(f'  <g id="{gid}" fill="#%02x%02x%02x" fill-rule="evenodd"><path d="{" ".join(d)}"/></g>' % rgb)
    svg = (f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" '
           f'width="{TRIM_W}mm" height="{TRIM_H}mm" viewBox="0 0 {TRIM_W} {TRIM_H}">\n'
           f'  <title>770 - SEWABLE embroidery artwork, 1:1 mm, one group per thread (stitch order)</title>\n'
           f'  <rect id="leather_navy_TRIM" x="0" y="0" width="{TRIM_W}" height="{TRIM_H}" fill="#0a1f4a"/>\n'
           + "\n".join(groups) + "\n</svg>\n")
    with open(os.path.join(OUT, "770_EMB_vector-artwork.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    from reportlab.lib.colors import Color
    from reportlab.pdfgen import canvas
    k = 72 / 25.4
    c = canvas.Canvas(os.path.join(OUT, "770_EMB_vector-artwork.pdf"), pagesize=(TRIM_W * k, TRIM_H * k))
    c.setFillColor(Color(10 / 255, 31 / 255, 74 / 255))
    c.rect(0, 0, TRIM_W * k, TRIM_H * k, stroke=0, fill=1)
    for col in order:
        rgb = threads[col][2]
        c.setFillColor(Color(*[v / 255 for v in rgb]))
        p = c.beginPath()
        g = shapes[col]
        for pg in getattr(g, "geoms", [g]):
            if pg.geom_type != "Polygon" or pg.is_empty:
                continue
            for ring in [pg.exterior] + list(pg.interiors):
                pts = [(x * k, (TRIM_H - y) * k) for x, y in ring.coords]
                p.moveTo(*pts[0])
                for q in pts[1:]:
                    p.lineTo(*q)
                p.close()
        c.drawPath(p, stroke=0, fill=1, fillMode=0)
    c.showPage()
    c.save()


# ---------------------------------------------------------------------------
# stitch-accurate preview
# ---------------------------------------------------------------------------
def render(merged, threads, ppm=11.811):
    log("render stitches ...")
    W, H = int(TRIM_W * ppm), int(TRIM_H * ppm)
    dye = BLD.leather_dye(BLD.CH, BLD.CW)
    grain = BLD.grain_overlay(BLD.leather_height(BLD.CH, BLD.CW))
    img = BLD.overlay_blend(dye, grain, 0.85)[BLD.B:BLD.B + H, BLD.B:BLD.B + W].astype(np.float32)
    sh = np.zeros((H, W), np.float32)
    segs = []
    for col, paths in merged:
        rgb = np.array(threads[col][2], np.float32)
        metallic = col == "gold"
        for p in paths:
            for q0, q1 in zip(p[:-1], p[1:]):
                if q0 is None or q1 is None:
                    continue
                x0, y0, x1, y1 = q0[0] * ppm, q0[1] * ppm, q1[0] * ppm, q1[1] * ppm
                if (x1 - x0) ** 2 + (y1 - y0) ** 2 < 0.04:
                    continue
                segs.append((x0, y0, x1, y1, rgb, metallic))
    for x0, y0, x1, y1, _, _ in segs:
        cv2.line(sh, (int(x0 * 4), int(y0 * 4)), (int(x1 * 4), int(y1 * 4)), 1.0, 6, cv2.LINE_AA, shift=2)
    sh = cv2.GaussianBlur(sh, (0, 0), 2.2)
    sh = cv2.warpAffine(sh, np.float32([[1, 0, 2.0], [0, 1, 3.0]]), (W, H))
    img *= (1 - 0.55 * np.clip(sh, 0, 1))[..., None]
    light = math.radians(-35)
    for x0, y0, x1, y1, rgb, met in segs:
        ang = math.atan2(y1 - y0, x1 - x0)
        sheen = abs(math.cos(ang - light))
        if met:
            base = rgb * (0.80 + 0.55 * sheen ** 1.5)
        else:
            base = rgb * (0.70 + 0.42 * sheen)
        p0 = (int(x0 * 4), int(y0 * 4))
        p1 = (int(x1 * 4), int(y1 * 4))
        cv2.line(img, p0, p1, tuple(float(v) for v in rgb * 0.45), 5, cv2.LINE_AA, shift=2)
        cv2.line(img, p0, p1, tuple(float(v) for v in np.clip(base, 0, 255)), 3, cv2.LINE_AA, shift=2)
        cv2.line(img, p0, p1, tuple(float(v) for v in np.clip(base * 1.18 + 12, 0, 255)), 1, cv2.LINE_AA, shift=2)
    for x0, y0, x1, y1, rgb, _ in segs:                     # needle penetrations
        for (x, y) in ((x0, y0), (x1, y1)):
            cv2.circle(img, (int(x * 4), int(y * 4)), 3, tuple(float(v) for v in rgb * 0.35), -1, cv2.LINE_AA, shift=2)
    out = Image.fromarray(BLD.to_u8(img))
    out.save(os.path.join(OUT, "770_EMB_stitch-preview_300dpi.jpg"), quality=92, dpi=(300, 300))
    out.resize((900, 1800), Image.LANCZOS).save(os.path.join(OUT, "770_EMB_stitch-preview.jpg"), quality=90)
    cx, cy = int(148 * ppm), int(300 * ppm)
    out.crop((cx - 900, cy - 500, cx + 900, cy + 500)).save(os.path.join(OUT, "770_EMB_stitch-preview_detail-1to1.jpg"), quality=92)
    out.crop((int(95 * ppm), int(62 * ppm), int(95 * ppm) + 1800, int(62 * ppm) + 700)).save(
        os.path.join(OUT, "770_EMB_stitch-preview_text-1to1.jpg"), quality=92)
    return out


# ---------------------------------------------------------------------------
# production sheet
# ---------------------------------------------------------------------------
def sheet(info, threads, preview):
    log("production sheet ...")
    Fb = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    Fs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    cjk = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
    Fc = ImageFont.truetype(cjk, 24) if os.path.exists(cjk) else F
    Fh = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    S = Image.new("RGB", (2480, 3508), "white")                   # A4 @ 300 dpi
    d = ImageDraw.Draw(S)
    pv = preview.resize((900, 1800), Image.LANCZOS)
    S.paste(pv, (60, 160))
    d.text((60, 50), "770  -  EMBROIDERY ON NAVY LEATHER  -  production sheet", font=Fb, fill="black")
    d.text((60, 100), "Direct embroidery into the leather. NO patch, NO applique, NO glue, NO print.",
           font=F, fill=(160, 0, 0))
    x = 1010
    y = 160
    d.text((x, y), "Finished piece (trim): 304.8 x 609.6 mm, portrait", font=F, fill="black")
    y += 40
    pos = {"A": "Hooping A - top text (gold)", "B": "Hooping B - building", "C": "Hooping C - bottom text (gold)"}
    for sec in ("A", "B", "C"):
        i = info[sec]
        d.text((x, y), pos[sec], font=Fb, fill="black")
        y += 42
        d.text((x, y), f"design {i['size'][0]:.0f} x {i['size'][1]:.0f} mm   |   {i['stitches']:,} stitches   |   "
                       f"{len(i['colours'])} colours", font=F, fill="black")
        y += 34
        d.text((x, y), f"design centre: {i['centre'][0]:.1f} mm from LEFT edge, {i['centre'][1]:.1f} mm from TOP edge",
               font=F, fill=(0, 70, 150))
        y += 34
        for n, col in enumerate(i["colours"], 1):
            brand, desc, rgb = threads[col]
            d.rectangle([x, y, x + 60, y + 30], fill=tuple(rgb), outline=(90, 90, 90))
            d.text((x + 75, y + 2), f"{n:>2}.  {brand}  {desc}", font=Fs, fill="black")
            y += 36
        y += 18
    f = info["FULL"]
    d.text((x, y), f"Single-frame alternative: 770_EMB_FULL.dst  ({f['size'][0]:.0f} x {f['size'][1]:.0f} mm, "
                   f"{f['stitches']:,} stitches)", font=F, fill="black")
    y += 50
    notes = [
        "Leather: 1.2-1.6 mm, firm; cut-away stabiliser on the back; do not hoop the leather face -",
        "  float it on sticky backing or use a clamp frame (hoop burn marks leather permanently).",
        "Needle 75/11-80/12 sharp / leather point; metallic gold: 90/14 metallic needle, slower speed.",
        "Densities are already reduced for leather (fill 0.45-0.50 mm rows, satin 0.40 mm).",
        "Files: DST (Tajima) + PES (Brother); colours above in stitch order (DST has no colours).",
        "Sew one test on the same leather first and compare with the preview before production.",
        "Hebrew reads right-to-left - never retype the text, use these files as they are.",
    ]
    for t in notes:
        d.text((x, y), t, font=Fs, fill="black")
        y += 30
    y += 14
    zh = ["工艺：直接在皮革上刺绣 —— 不做贴布、不用胶、不印刷。",
          "按 A/B/C 三次上框，位置见上（距左边、上边的毫米数）。DST 无颜色，请按上表顺序换线。",
          "皮革 1.2-1.6mm，背面加可剪衬，不要直接用绣框夹皮面（会留压痕），用粘衬或夹框。",
          "金线用 90/14 金属线针并降低车速。量产前请先在同样皮革上打样。",
          "希伯来文从右向左，严禁重新输入文字。"]
    for t in zh:
        d.text((x, y), t, font=Fc, fill="black")
        y += 34
    y += 10
    d.text((2420, y), "רקמה ישירה לתוך העור, בלי פאץ׳ ובלי הדבקה. 3 חישוקים: A, B, C", font=Fh,
           fill="black", anchor="ra", direction="rtl")

    # ---- placement diagram + 1:1 stitch details --------------------------------
    top = 2010
    d.line([(60, top - 30), (2420, top - 30)], fill=(180, 180, 180), width=2)
    d.text((60, top), "Placement on the leather (mm from the top-left trim corner)", font=Fb, fill="black")
    sc = 2.1
    ox, oy = 170, top + 70
    d.rectangle([ox, oy, ox + TRIM_W * sc, oy + TRIM_H * sc], fill=(14, 34, 78), outline="black", width=3)
    cols_ = {"A": (214, 170, 72), "B": (230, 120, 90), "C": (214, 170, 72)}
    for sec in ("A", "B", "C"):
        i = info[sec]
        cx_, cy_ = i["centre"]
        w_, h_ = i["size"]
        x0_, y0_ = ox + (cx_ - w_ / 2) * sc, oy + (cy_ - h_ / 2) * sc
        d.rectangle([x0_, y0_, x0_ + w_ * sc, y0_ + h_ * sc], outline=cols_[sec], width=4)
        px_, py_ = ox + cx_ * sc, oy + cy_ * sc
        d.line([(px_ - 14, py_), (px_ + 14, py_)], fill="white", width=3)
        d.line([(px_, py_ - 14), (px_, py_ + 14)], fill="white", width=3)
        d.text((x0_ + 8, y0_ + 6), sec, font=Fb, fill=cols_[sec])
        d.text((ox + TRIM_W * sc + 20, py_ - 14), f"{sec}: centre ({cx_:.0f}, {cy_:.0f}) mm, {w_:.0f} x {h_:.0f} mm",
               font=Fs, fill="black")
    d.text((ox, oy + TRIM_H * sc + 12), "304.8 mm", font=Fs, fill="black")
    d.text((ox - 110, oy + TRIM_H * sc / 2), "609.6 mm", font=Fs, fill="black")
    det = Image.open(os.path.join(OUT, "770_EMB_stitch-preview_detail-1to1.jpg"))
    txt = Image.open(os.path.join(OUT, "770_EMB_stitch-preview_text-1to1.jpg"))
    dx_, dw_ = 1260, 1160
    det = det.resize((dw_, int(det.height * dw_ / det.width)), Image.LANCZOS)
    S.paste(det, (dx_, top + 110))
    d.text((dx_, top + 72), "Stitch detail 1:1 (satin frames, brick-pattern fill, lattice)", font=Fs, fill="black")
    txt = txt.crop((0, 80, txt.width, 420))
    txt = txt.resize((dw_, int(txt.height * dw_ / txt.width)), Image.LANCZOS)
    y2 = top + 110 + det.height + 70
    d.text((dx_, y2 - 40), "Gold metallic text, satin-style fill 1:1", font=Fs, fill="black")
    S.paste(txt, (dx_, y2))
    S.save(os.path.join(OUT, "770_EMB_production-sheet.png"), dpi=(300, 300))

    with open(os.path.join(OUT, "770_EMB_thread-sequence.csv"), "w", newline="", encoding="utf-8") as fcsv:
        w = csv.writer(fcsv)
        w.writerow(["file", "order", "thread", "code / name", "hex"])
        for sec, fname in (("A", "770_EMB_A_top-text"), ("B", "770_EMB_B_building"),
                           ("C", "770_EMB_C_bottom-text"), ("FULL", "770_EMB_FULL")):
            for n, col in enumerate(info[sec]["colours"], 1):
                brand, desc, rgb = threads[col]
                w.writerow([fname, n, brand, desc, "#%02X%02X%02X" % rgb])


def main():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    threads = snap_threads()
    design()
    plans = plan(threads)
    info, merged = export(plans, threads)
    write_vector(threads)
    preview = render(merged, threads)
    sheet(info, threads, preview)
    for k_, v in info.items():
        log(f"  {k_}: {v['stitches']:,} stitches, {v.get('trims', 0)} trims, {v['size'][0]:.0f}x{v['size'][1]:.0f} mm")
    log(f"  DST read-back stitches: {info['FULL']['dst_readback_stitches']:,}")


if __name__ == "__main__":
    main()
