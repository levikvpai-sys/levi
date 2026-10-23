"""Turn the raw inputs (see README) into render-ready assets under assets/.
Run once; then bake.py, build.py, score.py, render.py."""
import os, glob, subprocess, sys
import numpy as np, cv2
from PIL import Image, ImageFilter

IN = os.environ.get('FILM_INPUT', 'input')
OUT = 'assets/img'; SB = 'assets/sb'
for d in (OUT, SB, 'src', 'audio'): os.makedirs(d, exist_ok=True)
W, H = 2304, 1296   # 1.2x of 1920x1080, so the browser only ever downsamples

def run(*cmd): subprocess.run(cmd, check=True)
def up(im, w=W, h=H, sharpen=True):
    im = im.convert('RGB').resize((w, h), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=55, threshold=2)) if sharpen else im

# --- storyboard frames (the AI reconstructions live only inside the storyboard PDF pages)
run('pdfimages', '-j', f'{IN}/storyboard.pdf', 'src/sb')
def bbox(arr, x0, y0, x1, y1):
    reg = arr[y0:y1, x0:x1].astype(int); bg = reg[2, 2]
    diff = np.abs(reg - bg).sum(2) > 30
    cols = np.where(diff.mean(0) > .5)[0]; rows = np.where(diff.mean(1) > .5)[0]
    return x0 + cols[0], y0 + rows[0], x0 + cols[-1] + 1, y0 + rows[-1] + 1
pages = {0: [(1, (860, 160, 1860, 740))]}          # page 1 carries shot 1 large
for p in range(1, 9):
    f = 1 + (p - 1) * 4
    pages[p] = [(f, (90, 235, 630, 555)), (f + 1, (990, 235, 1530, 555)), (f + 2, (90, 672, 630, 990)), (f + 3, (990, 672, 1530, 990))]
for p, items in pages.items():
    arr = np.array(Image.open(f'src/sb-{p:03d}.jpg').convert('RGB'))
    for shot, reg in items:
        if shot == 1 and p == 1: continue
        b = bbox(arr, *reg)
        Image.fromarray(arr[b[1]:b[3], b[0]:b[2]]).save(f'{SB}/sb{shot:02d}.png')

for i in list(range(1, 15)) + [27]:
    up(Image.open(f'{SB}/sb{i:02d}.png')).save(f'{OUT}/s{i:02d}.jpg', quality=93)
# fire / wick / match close-ups: de-band at source size, upscale soft (they are shallow-focus anyway)
for i in (19, 20, 21):
    a = np.array(Image.open(f'{SB}/sb{i:02d}.png').convert('RGB')).astype(np.float32)
    a = cv2.GaussianBlur(cv2.bilateralFilter(a, 9, 18, 5), (0, 0), 0.8)
    a = cv2.GaussianBlur(cv2.resize(a, (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 1.2)
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(f'{OUT}/s{i:02d}.jpg', quality=94)
# shot 30: remove the storyboard's baked-in text, then add headroom above the flame
a = np.array(Image.open(f'{SB}/sb30.png').convert('RGB')).astype(int)
m = ((a.mean(2) > 140) & (a[..., 0] - a[..., 2] < 60)).astype(np.uint8) * 255
m[:, 200:] = 0
m = cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=2)
clean = cv2.inpaint(a.astype(np.uint8), m, 7, cv2.INPAINT_TELEA)
pad = 60
big = np.zeros((288 + pad, 512, 3), np.uint8); big[pad:] = clean
mask = np.zeros(big.shape[:2], np.uint8); mask[:pad + 1] = 255
r1 = cv2.inpaint(big, mask, 25, cv2.INPAINT_TELEA)
r1b = r1.copy(); r1b[:pad + 8] = cv2.GaussianBlur(r1[:pad + 8], (0, 0), 6)
ramp = np.linspace(0, 1, 12)[:, None, None]
r1b[pad - 4:pad + 8] = (r1b[pad - 4:pad + 8] * (1 - ramp) + r1[pad - 4:pad + 8] * ramp).astype(np.uint8)
g = np.ones(r1b.shape[0]); g[:72] = np.linspace(0.72, 1, 72)
r1b = (r1b * g[:, None, None]).clip(0, 255).astype(np.uint8)
im = Image.fromarray(r1b)
im.resize((W, round(W * im.size[1] / im.size[0])), Image.LANCZOS).filter(
    ImageFilter.UnsharpMask(radius=2.2, percent=55, threshold=2)).save(f'{OUT}/s30.jpg', quality=93)

# --- real photos: crop box in source px -> 16:9
photos = {15: ('15_car_front.jpg', (0, 760, 1500, 1604)), 16: ('16_car_rear.jpg', (0, 560, 1500, 1404)),
          17: ('17_rabbi_car.jpg', (0, 130, 1500, 974)), 22: ('22_room.jpg', (0, 640, 1500, 1484)),
          23: ('23_selfie.jpg', (0, 110, 2000, 1235)), 24: ('24_tefillin.jpg', (0, 210, 1512, 1061)),
          25: ('25_sukkah.jpg', (0, 160, 2000, 1285)), 26: ('26_prayer.jpg', (0, 720, 1500, 1564)),
          28: ('28_torah.jpg', (0, 500, 1500, 1344))}
for k, (f, box) in photos.items():
    up(Image.open(f'{IN}/{f}').crop(box), sharpen=False).save(f'{OUT}/s{k:02d}.jpg', quality=93)

# --- video: shot 18 = 18_damage.mp4 2.5-3.9 s (landscape crop of the vertical clip), shot 29 = 29_song.mp4 3.0-5.0 s
for shot, f, ss, dur, box in ((18, '18_damage.mp4', 2.5, 1.4, (0, 230, 478, 499)), (29, '29_song.mp4', 3.0, 2.0, None)):
    os.makedirs(f'src/v{shot}', exist_ok=True); os.makedirs(f'{OUT}/v{shot}', exist_ok=True)
    run('ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-i', f'{IN}/{f}', '-t', str(dur), '-vsync', '0', f'src/v{shot}/%03d.png')
    for p in sorted(glob.glob(f'src/v{shot}/*.png')):
        im = Image.open(p)
        if box: im = im.crop(box)
        up(im, 1920, 1080).save(f'{OUT}/v{shot}/' + os.path.basename(p).replace('.png', '.jpg'), quality=90)
run('ffmpeg', '-v', 'error', '-y', '-i', f'{IN}/29_song.mp4', '-vn', '-ac', '2', '-ar', '48000', 'audio/song_full.wav')

# --- logo: unmix from white -> RGBA; split the grey brush stroke from the mark so they reveal separately
L = np.array(Image.open(f'{IN}/logo.jpg').convert('RGB')).astype(np.float32)
alpha = np.clip(((255 - L).max(2) / 255.0 - 0.02) / 0.98, 0, 1)
rgb = np.clip(np.where(alpha[..., None] > 1e-3, (L - 255 * (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-3), 0), 0, 255)
sat = L.max(2) - L.min(2)
stroke = (sat < 22) & (L.min(2) > 150) & (alpha > 0.02)
ys, xs = np.where(alpha > 0.03); x0, x1, y0, y1 = xs.min() - 8, xs.max() + 9, ys.min() - 8, ys.max() + 9
for sel, name in ((stroke, 'logo_stroke'), (~stroke, 'logo_mark'), (np.ones_like(stroke), 'logo_full')):
    img = np.dstack([rgb, np.where(sel, alpha, 0) * 255]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(img, 'RGBA').save(f'{OUT}/{name}.png')
print('logo crop', x1 - x0, 'x', y1 - y0, '(timeline.json logo.flame/split are in these pixels)')

# --- film grain tiles (frame f uses tile f % 8)
rng = np.random.default_rng(7); os.makedirs(f'{OUT}/grain', exist_ok=True)
for i in range(8):
    n = cv2.GaussianBlur(rng.normal(0, 1, (540, 960)), (0, 0), 0.7)
    Image.fromarray((128 + n / n.std() * 38).clip(0, 255).astype(np.uint8)).save(f'{OUT}/grain/g{i}.png')
print('assets ready')
