"""Footage compositor for the ad (runs on the 1-CPU editing box).

  python3 composite.py proxies   -> cut a graded 9:16 proxy per shot from shots.json
  python3 composite.py render    -> A/B tracks + mask.mp4 + gfx.mp4 -> fr/*.jpg in resumable chunks, then out.mp4 with aud/mix.wav
  python3 composite.py patch BASE N0 -> re-composite frames N0.. over an earlier render BASE (its other frames and its mix are kept)

Track A holds even shots, track B odd shots. mask.mp4 is white where B shows.
gfx.mp4 is 1080x3840: premultiplied RGB on top, alpha (as grey) underneath.
"""
import json, math, os, subprocess, sys, time
import numpy as np
from PIL import Image

FF, FP = '/home/user/bin/ffmpeg', '/home/user/bin/ffprobe'
D = os.environ.get('V3', '/home/user/v3')
W, H = 1080, 1920
PW, PH = 1242, 2208            # proxies carry 15% headroom for push-ins and shake
TL = json.load(open(f'{D}/timeline.json'))
SH = {s['i']: s for s in json.load(open(f'{D}/shots.json'))}
FPS, NF = TL['fps'], TL['nf']
SHOTS = TL['shots']

GRADES = {  # baked into the proxy
    'film': 'eq=contrast=1.08:saturation=1.06:gamma=0.98',
    'warm': 'eq=contrast=1.10:saturation=1.05,colorbalance=rs=0.05:bs=-0.06:rm=0.03:bm=-0.04',
    'cold': 'eq=contrast=1.08:saturation=0.92,colorbalance=rs=-0.04:bs=0.06',
    'punch': 'eq=contrast=1.16:saturation=1.12:gamma=0.96',
    'none': 'null',
    # 720p sources cropped to 9:16 get upscaled ~3x: sharpen after the scale
    'film_sharp': 'eq=contrast=1.08:saturation=1.06:gamma=0.98,unsharp=5:5:0.7:5:5:0.0',
    'warm_sharp': 'eq=contrast=1.10:saturation=1.05,colorbalance=rs=0.05:bs=-0.06:rm=0.03:bm=-0.04,unsharp=5:5:0.7:5:5:0.0',
    # aura looks: hard black-and-white, and brand duotones (shadow colour -> highlight colour)
    'bw': 'hue=s=0,eq=contrast=1.28:gamma=0.94',
    'duo_pink': 'hue=s=0,eq=contrast=1.2,lutrgb=r=26+val*217/255:g=15+val*121/255:b=61+val*177/255',
    'duo_cyan': 'hue=s=0,eq=contrast=1.2,lutrgb=r=8+val*139/255:g=18+val*195/255:b=40+val*192/255',
    'duo_violet': 'hue=s=0,eq=contrast=1.2,lutrgb=r=13+val*192/255:g=7+val*153/255:b=38+val*217/255',
}
SHARP = 'unsharp=5:5:0.8:5:5:0.0'   # for 480p/720p sources blown up to the 9:16 proxy


def handles(i):
    tin = TL['trans'].get(str(i), {'D': 0})
    tout = TL['trans'].get(str(i + 1), {'D': 0})
    return math.ceil(tin['D'] / 2), math.ceil(tout['D'] / 2)


def span(i):
    pre, post = handles(i)
    s = SHOTS[i]
    return s['f0'] - pre, s['f1'] + post


def probe(path):
    out = subprocess.run([FP, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    w, h = out.strip().split('\n')[0].split(',')[:2]
    return int(w), int(h)


def make_proxy(i):
    sh = SH[i]; a, b = span(i); n = b - a
    if 'stack' in sh: return make_stack_proxy(i)
    pre = SHOTS[i]['f0'] - a
    src = f"{D}/src/{sh['src']}.mp4"; sw, shh = probe(src)
    if sw / shh > 9 / 16: cw, ch = shh * 9 / 16, shh
    else: cw, ch = sw, sw * 16 / 9
    cw, ch = int(cw) // 2 * 2, int(ch) // 2 * 2
    x = int(min(max(sh.get('cx', 0.5) * sw - cw / 2, 0), sw - cw)); y = int(min(max(sh.get('cy', 0.5) * shh - ch / 2, 0), shh - ch))
    speed = sh.get('speed', 1.0)
    t0 = max(0.0, sh['in'] - pre / FPS * speed)
    vf = [f'setpts=PTS/{speed}' if speed != 1.0 else 'null', f'fps={FPS}', f'crop={cw}:{ch}:{x}:{y}', f'scale={PW}:{PH}:flags=lanczos', GRADES[sh.get('grade', 'film')],
          SHARP if sh.get('sharp') else 'null', 'format=yuv420p']
    out = f'{D}/px/{i:02d}.mp4'
    r = subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{t0:.3f}', '-i', src, '-frames:v', str(n), '-vf', ','.join(vf), '-an',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-threads', '1', out], capture_output=True, text=True)
    return i, r.returncode, r.stderr[-300:]


def make_stack_proxy(i):
    """Three 16:9 clips stacked as panels on black (keeps 480p sources sharp in a 9:16 frame).
    Panel 0 is there from the first frame; panels 1 and 2 slide in from alternating sides on beats 1 and 2."""
    sh = SH[i]; a, b = span(i); n = b - a
    pre = SHOTS[i]['f0'] - a
    pw = 1150; ph = round(pw * 9 / 16) // 2 * 2; gap = (PH - 3 * ph) // 4; x0 = (PW - pw) // 2
    ins, fc = [], [f'color=c=0x0A0A0C:s={PW}x{PH}:r={FPS}:d={n / FPS + 1:.3f}[bg]']
    last = 'bg'
    for k, p in enumerate(sh['stack']):
        t0 = max(0.0, p['in'] - pre / FPS)
        ins += ['-ss', f'{t0:.3f}', '-i', f"{D}/src/{p['src']}.mp4"]
        fc.append(f"[{k}:v]fps={FPS},scale={pw}:{ph}:flags=lanczos,{GRADES[p.get('grade', sh.get('grade', 'film'))]},{SHARP},setpts=PTS-STARTPTS[p{k}]")
        y = gap + k * (ph + gap)
        if k == 0: x = str(x0)
        else:
            tk = pre / FPS + k * TL['BB']; side = 1 if k % 2 else -1
            x = f"{x0}+{side}*{PW}*pow(max(0,1-(t-{tk:.3f})/0.22),3)"
        fc.append(f"[{last}][p{k}]overlay=x='{x}':y={y}:eof_action=repeat[o{k}]"); last = f'o{k}'
    out = f'{D}/px/{i:02d}.mp4'
    r = subprocess.run([FF, '-v', 'error', '-y'] + ins + ['-filter_complex', ';'.join(fc), '-map', f'[{last}]', '-frames:v', str(n), '-an',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-threads', '1', '-pix_fmt', 'yuv420p', out], capture_output=True, text=True)
    return i, r.returncode, r.stderr[-300:]


class Reader:
    def __init__(self, path, w, h, fmt='rgb24', start=0):
        self.w, self.h, self.ch = w, h, 1 if fmt == 'gray' else 3
        self.fs = w * h * self.ch
        ss = ['-ss', f'{start / FPS:.4f}'] if start > 0 else []
        self.p = subprocess.Popen([FF, '-v', 'error', '-threads', '1'] + ss + ['-i', path, '-f', 'rawvideo', '-pix_fmt', fmt, '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.last = None

    def next(self):
        buf = self.p.stdout.read(self.fs)
        if len(buf) == self.fs: self.last = buf
        if self.last is None: return None
        a = np.frombuffer(self.last, np.uint8)
        return a.reshape(self.h, self.w) if self.ch == 1 else a.reshape(self.h, self.w, 3)

    def close(self):
        try: self.p.kill(); self.p.wait(timeout=5)
        except Exception: pass


class Seq:
    """Frames exploded to image files; reading them in-process keeps memory flat on the small box."""
    def __init__(self, pattern, start=0, mode='RGB'):
        self.pattern, self.k, self.mode, self.last = pattern, start, mode, None

    def next(self):
        f = self.pattern % (self.k + 1); self.k += 1
        if os.path.exists(f):
            im = Image.open(f); im = im.convert(self.mode) if im.mode != self.mode else im
            self.last = np.asarray(im)
        return self.last

    def close(self):
        pass


def explode(only=None):
    """Decode the proxies (all, or only those listed) and both layers to images, one decoder at a time."""
    jobs = [(f'{D}/gfx.mp4', f'{D}/g', '%05d.jpg'), (f'{D}/mask.mp4', f'{D}/m', '%05d.png')] + \
           [(f'{D}/px/{i:02d}.mp4', f'{D}/px/{i:02d}', '%04d.jpg') for i in sorted(SH if only is None else only)]
    for src, out, pat in jobs:
        if os.path.exists(out + '/done'): continue
        os.makedirs(out, exist_ok=True)
        extra = ['-pix_fmt', 'gray'] if pat.endswith('png') else ['-q:v', '2']
        r = subprocess.run([FF, '-v', 'error', '-y', '-threads', '1', '-i', src] + extra + [f'{out}/{pat}'])
        if r.returncode == 0: open(out + '/done', 'w').write('1')
        print(out, r.returncode, flush=True)


def ease(u):
    return 1 - (1 - u) ** 2


def shake(n):
    amp = 0.0
    for ts, d, a in TL.get('shake', []):
        t = n / FPS
        if ts <= t < ts + d: amp = max(amp, (1 - (t - ts) / d) ** 2 * a)
    if amp <= 0: return 0.0, 0.0
    r = np.random.default_rng(n); dx, dy = r.uniform(-1, 1, 2) * amp
    return dx, dy


# hard cuts that land with an impact: a zoom-blur punch, an RGB split, and for splitcut a pink half-frame of the outgoing shot
HIT = {'cut', 'flashcut', 'invertcut', 'pinkflash', 'splitcut'}
CUTS = {SHOTS[int(k)]['f0']: tr['type'] for k, tr in TL['trans'].items() if tr['type'] in HIT}


def frame_for(i, n, img):
    sh = SH[i]; s = SHOTS[i]
    u = min(1, max(0, (n - s['f0']) / max(1, s['f1'] - s['f0'])))
    z = sh.get('z0', 1.0) + (sh.get('z1', 1.06) - sh.get('z0', 1.0)) * ease(u)
    z = min(max(z, 1.0), 1.149)
    bw, bh = PW / z, PH / z
    dx, dy = shake(n)
    ox, oy = sh.get('ox', 0.0), sh.get('oy', 0.0)   # optional drift (fraction of headroom)
    x0 = (PW - bw) / 2 * (1 + ox) + dx; y0 = (PH - bh) / 2 * (1 + oy) + dy
    x0 = min(max(x0, 0), PW - bw); y0 = min(max(y0, 0), PH - bh)
    im = Image.fromarray(img)
    fi = n - s['f0']
    zb = sh.get('zb', 2 if TL['trans'].get(str(i), {}).get('type') in HIT else 0)
    if 0 <= fi < zb:   # zoom-blur: the first frames of a punch are an average of four zoom levels
        acc = np.zeros((H, W, 3), np.float32)
        for q in (1.0, 1.05, 1.10, 1.16):
            cw, ch = bw / q, bh / q; cx, cy = x0 + bw / 2, y0 + bh / 2
            acc += np.asarray(im.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)), np.float32)
        return (acc / 4).astype(np.uint8)
    return np.asarray(im.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + bw, y0 + bh)))


def hit_fx(n, base, prev):
    """RGB split on the first frames after a hard cut (and while the frame shakes); splitcut keeps a pink half of the outgoing shot."""
    c = max((c for c in CUTS if c <= n), default=None)
    f = n - c if c is not None else 99
    if CUTS.get(c) == 'splitcut' and f < 4 and prev is not None:
        L = (prev.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)) / 255.0
        duo = np.stack([26 + L * 217, 15 + L * 121, 61 + L * 177], -1).astype(np.uint8)
        cut = int(W * 0.42); base = base.copy(); base[:, :cut] = duo[:, :cut]
    k = [12, 7, 3][f] if f < 3 else 0
    amp = math.hypot(*shake(n)); k = int(round(k + amp * 0.5))
    if k:
        base = base.copy(); base[..., 0] = np.roll(base[..., 0], k, axis=1); base[..., 2] = np.roll(base[..., 2], -k, axis=1)
    return base


def render(n0, n1):
    """Composite frames [n0, n1) to JPEGs in fr/ (chunked so memory stays low and a restart can resume)."""
    os.makedirs(f'{D}/fr', exist_ok=True)
    spans = {i: span(i) for i in SH}
    inv = {SHOTS[int(k)]['f0'] for k, tr in TL['trans'].items() if tr['type'] == 'invertcut'}
    gfx = Seq(f'{D}/g/%05d.jpg', n0); mask = Seq(f'{D}/m/%05d.png', n0, 'L')
    readers = {}; t0 = time.time()
    black = np.zeros((H, W, 3), np.uint8)
    prev = np.asarray(Image.open(f'{D}/fr/{n0 - 1:05d}.jpg').convert('RGB')) if n0 > 0 and os.path.exists(f'{D}/fr/{n0 - 1:05d}.jpg') else None
    held = None   # the outgoing shot, kept for a splitcut
    for n in range(n0, n1):
        tracks = [None, None]
        for i, (a, b) in spans.items():
            if a <= n < b:
                if i not in readers: readers[i] = Seq(f'{D}/px/{i:02d}/%04d.jpg', n - a)
                img = readers[i].next()
                if img is not None: tracks[SHOTS[i]['track']] = frame_for(i, n, img)
            elif n >= b and i in readers:
                readers[i].close(); del readers[i]
        g = gfx.next(); m = mask.next()
        A = tracks[0] if tracks[0] is not None else black
        B = tracks[1] if tracks[1] is not None else black
        mx = int(m.max()); mn = int(m.min())
        if mx == 0: base = A
        elif mn == 255: base = B
        else:
            mm = m.astype(np.uint16)[..., None]
            base = ((A.astype(np.uint16) * (255 - mm) + B.astype(np.uint16) * mm) // 255).astype(np.uint8)
        if n in CUTS: held = prev
        prev = base
        base = hit_fx(n, base, held)
        if n in inv: base = 255 - base
        rgb, al = g[:H], g[H:, :, :1].astype(np.uint16)
        out = (base.astype(np.uint16) * (255 - al) // 255 + rgb).clip(0, 255).astype(np.uint8)
        Image.fromarray(out).save(f'{D}/fr/{n:05d}.jpg', quality=94, subsampling=0)
        if n % 30 == 0:
            open(f'{D}/render.progress', 'w').write(f'{n}/{NF} {time.time() - t0:.0f}s\n')
    for r in list(readers.values()) + [gfx, mask]: r.close()


def encode():
    """Encode fr/*.jpg in 4 s segments (a single long x264 run gets OOM-killed on the 1 GB box), then join and add the mix."""
    os.makedirs(f'{D}/segs', exist_ok=True)
    for s0 in range(0, NF, 120):
        out = f'{D}/segs/seg_{s0:04d}.mp4'
        if os.path.exists(out + '.ok'): continue
        for attempt in range(3):
            r = subprocess.run([FF, '-v', 'error', '-y', '-framerate', str(FPS), '-start_number', str(s0), '-i', f'{D}/fr/%05d.jpg', '-frames:v', str(min(120, NF - s0)),
                                '-vf', 'noise=alls=4:allf=t', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-threads', '1', '-x264-params', 'rc-lookahead=6:ref=2:keyint=60',
                                '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-an', out])
            if r.returncode == 0: open(out + '.ok', 'w').write('1'); break
        else:
            return r.returncode
    with open(f'{D}/segs/list.txt', 'w') as fp:
        for s0 in range(0, NF, 120): fp.write(f"file '{D}/segs/seg_{s0:04d}.mp4'\n")
    a = f'{D}/aud/mix.wav'
    return subprocess.run([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{D}/segs/list.txt', '-i', a, '-map', '0:v', '-map', '1:a',
                           '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', f'{D}/out.mp4']).returncode


def render_chunks(start=0, CH=150):
    for n0 in range(start, NF, CH):
        ok = f'{D}/fr/chunk_{n0}.ok'
        if os.path.exists(ok): continue
        for attempt in range(3):   # the box is small; a decoder can get OOM-killed, so retry the chunk
            subprocess.run(['pkill', '-f', 'rawvideo -pix_fmt'])   # stray decoders from a failed chunk hold memory
            r = subprocess.run([sys.executable, __file__, 'chunk', str(n0), str(min(NF, n0 + CH))])
            if r.returncode == 0: break
        if r.returncode == 0: open(ok, 'w').write('1')
        else: return r.returncode
    return 0


def patch(base, n0):
    """Keep frames [0, n0) and the mix of an earlier render; re-composite [n0, NF) from the current shots.json."""
    os.makedirs(f'{D}/fr', exist_ok=True); os.makedirs(f'{D}/aud', exist_ok=True); os.makedirs(f'{D}/px', exist_ok=True)
    if not os.path.exists(f'{D}/fr/base.ok'):
        subprocess.run([FF, '-v', 'error', '-y', '-threads', '1', '-i', base, '-start_number', '0', '-q:v', '2', f'{D}/fr/%05d.jpg'], check=True)
        open(f'{D}/fr/base.ok', 'w').write('1')
    if not os.path.exists(f'{D}/aud/mix.wav'):
        subprocess.run([FF, '-v', 'error', '-y', '-i', base, '-vn', '-ac', '2', '-ar', '48000', f'{D}/aud/mix.wav'], check=True)
    need = [i for i in sorted(SH) if span(i)[1] > n0]
    for i in need:
        if not os.path.exists(f'{D}/px/{i:02d}.mp4'): print(*make_proxy(i), flush=True)
    explode(need)
    return render_chunks(n0) or encode()


if __name__ == '__main__':
    if sys.argv[1] == 'proxies':
        os.makedirs(f'{D}/px', exist_ok=True)
        only = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else sorted(SH)
        for i in only:
            print(*make_proxy(i), flush=True)
    elif sys.argv[1] == 'render':
        explode()
        sys.exit(render_chunks() or encode())
    elif sys.argv[1] == 'patch':
        sys.exit(patch(sys.argv[2], int(sys.argv[3])))
    elif sys.argv[1] == 'chunk':
        try:
            render(int(sys.argv[2]), int(sys.argv[3]))
        finally:
            subprocess.run(['pkill', '-f', 'rawvideo -pix_fmt'])
