"""Footage compositor for ad v3 (runs on the 1-CPU editing box).

  python3 composite.py proxies   -> cut a graded 9:16 proxy per shot from shots.json
  python3 composite.py render    -> A/B tracks + mask.mp4 + gfx.mp4 -> fr/*.jpg in resumable chunks, then out.mp4 with aud/mix.wav

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
}


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


def make_card_proxy(i):
    """A still portrait as a rounded card over its own blurred backdrop, with a slow push inside the card.
    The card sits exactly where gfx.html draws its border (TL['card'], frame coords)."""
    from PIL import ImageDraw, ImageFilter
    sh = SH[i]; a, b = span(i); n = b - a
    src = Image.open(f"{D}/src/{sh['src']}.jpg").convert('RGB').crop(tuple(sh['image']))
    k = PW / W
    cx, cy, cw, ch = [round(v * k) for v in TL['card']]
    bg = src.resize((PW, round(PW * src.height / src.width)), Image.BICUBIC)
    bg = bg.crop((0, (bg.height - PH) // 2, PW, (bg.height - PH) // 2 + PH)) if bg.height >= PH else bg.resize((PW, PH))
    bg = Image.eval(bg.filter(ImageFilter.GaussianBlur(40)), lambda v: int(v * 0.42))
    m = Image.new('L', (cw, ch), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=round(36 * k), fill=255)
    enc = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{PW}x{PH}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-threads', '1', '-pix_fmt', 'yuv420p', f'{D}/px/{i:02d}.mp4'], stdin=subprocess.PIPE)
    for j in range(n):
        z = 1.0 + 0.07 * j / max(1, n - 1)
        box_w = min(src.width, src.height * cw / ch) / z; box_h = box_w * ch / cw
        x0 = (src.width - box_w) / 2; y0 = (src.height - box_h) * 0.35
        card = src.resize((cw, ch), Image.BICUBIC, box=(x0, y0, x0 + box_w, y0 + box_h))
        fr = bg.copy(); fr.paste(card, (cx, cy), m)
        enc.stdin.write(fr.tobytes())
    enc.stdin.close(); enc.wait()
    return i, enc.returncode, ''


def make_proxy(i):
    sh = SH[i]; a, b = span(i); n = b - a
    if 'image' in sh: return make_card_proxy(i)
    pre = SHOTS[i]['f0'] - a
    src = f"{D}/src/{sh['src']}.mp4"; sw, shh = probe(src)
    if sw / shh > 9 / 16: cw, ch = shh * 9 / 16, shh
    else: cw, ch = sw, sw * 16 / 9
    cw, ch = int(cw) // 2 * 2, int(ch) // 2 * 2
    x = int(min(max(sh.get('cx', 0.5) * sw - cw / 2, 0), sw - cw)); y = int(min(max(sh.get('cy', 0.5) * shh - ch / 2, 0), shh - ch))
    speed = sh.get('speed', 1.0)
    t0 = max(0.0, sh['in'] - pre / FPS * speed)
    vf = [f'setpts=PTS/{speed}' if speed != 1.0 else 'null', f'fps={FPS}', f'crop={cw}:{ch}:{x}:{y}', f'scale={PW}:{PH}:flags=bicubic', GRADES[sh.get('grade', 'film')], 'format=yuv420p']
    out = f'{D}/px/{i:02d}.mp4'
    r = subprocess.run([FF, '-v', 'error', '-y', '-ss', f'{t0:.3f}', '-i', src, '-frames:v', str(n), '-vf', ','.join(vf), '-an',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-threads', '1', out], capture_output=True, text=True)
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
    im = Image.frombuffer('RGB', (PW, PH), img.tobytes(), 'raw', 'RGB', 0, 1)
    return np.asarray(im.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + bw, y0 + bh)))


def render(n0, n1):
    """Composite frames [n0, n1) to JPEGs in fr/ (chunked so memory stays low and a restart can resume)."""
    os.makedirs(f'{D}/fr', exist_ok=True)
    spans = {i: span(i) for i in SH}
    inv = {SHOTS[int(k)]['f0'] for k, tr in TL['trans'].items() if tr['type'] == 'invertcut'}
    gfx = Reader(f'{D}/gfx.mp4', W, 2 * H, start=n0); mask = Reader(f'{D}/mask.mp4', W, H, 'gray', start=n0)
    readers = {}; t0 = time.time()
    black = np.zeros((H, W, 3), np.uint8)
    for n in range(n0, n1):
        tracks = [None, None]
        for i, (a, b) in spans.items():
            if a <= n < b:
                if i not in readers: readers[i] = Reader(f'{D}/px/{i:02d}.mp4', PW, PH, start=n - a)
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
        if n in inv: base = 255 - base
        rgb, al = g[:H], g[H:, :, :1].astype(np.uint16)
        out = (base.astype(np.uint16) * (255 - al) // 255 + rgb).clip(0, 255).astype(np.uint8)
        Image.fromarray(out).save(f'{D}/fr/{n:05d}.jpg', quality=94, subsampling=0)
        if n % 30 == 0:
            open(f'{D}/render.progress', 'w').write(f'{n}/{NF} {time.time() - t0:.0f}s\n')
    for r in list(readers.values()) + [gfx, mask]: r.close()


def encode():
    a = f'{D}/aud/mix.wav'
    cmd = [FF, '-v', 'error', '-y', '-framerate', str(FPS), '-i', f'{D}/fr/%05d.jpg'] + (['-i', a] if os.path.exists(a) else []) + \
          ['-vf', 'noise=alls=4:allf=t', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-threads', '1', '-x264-params', 'rc-lookahead=10',
           '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart'] + \
          (['-c:a', 'aac', '-b:a', '192k', '-shortest'] if os.path.exists(a) else []) + [f'{D}/out.mp4']
    return subprocess.run(cmd).returncode


if __name__ == '__main__':
    if sys.argv[1] == 'proxies':
        os.makedirs(f'{D}/px', exist_ok=True)
        only = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else sorted(SH)
        for i in only:
            print(*make_proxy(i), flush=True)
    elif sys.argv[1] == 'render':
        CH = 150
        for n0 in range(0, NF, CH):
            ok = f'{D}/fr/chunk_{n0}.ok'
            if os.path.exists(ok): continue
            for attempt in range(3):   # the box is small; a decoder can get OOM-killed, so retry the chunk
                subprocess.run(['pkill', '-f', 'rawvideo -pix_fmt'])   # stray decoders from a failed chunk hold memory
                r = subprocess.run([sys.executable, __file__, 'chunk', str(n0), str(min(NF, n0 + CH))])
                if r.returncode == 0: break
            if r.returncode == 0: open(ok, 'w').write('1')
            else: sys.exit(r.returncode)
        sys.exit(encode())
    elif sys.argv[1] == 'chunk':
        try:
            render(int(sys.argv[2]), int(sys.argv[3]))
        finally:
            subprocess.run(['pkill', '-f', 'rawvideo -pix_fmt'])
