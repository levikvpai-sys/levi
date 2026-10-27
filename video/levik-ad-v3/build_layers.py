"""Render gfx + mask layers with 4 parallel browsers, then encode:
  out/gfx.mp4  1080x3840 H.264: premultiplied RGB on top, alpha as grey below
  out/mask.mp4 1080x1920 H.264 grey matte (white = footage track B)
"""
import json, os, subprocess, sys
import numpy as np
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

os.chdir(os.path.dirname(os.path.abspath(__file__)))
subprocess.run(['python3', 'timeline.py'], check=True)
TL = json.load(open('timeline.json')); NF = TL['nf']; FPS = TL['fps']
FR = os.environ.get('FRAMES', '/tmp/levik_v3_frames')
env = dict(os.environ, PLAYWRIGHT_PATH=os.environ.get('PLAYWRIGHT_PATH', '/opt/node-tools/node_modules/playwright/index.js'))
layers = sys.argv[1:] or ['gfx', 'mask']
jobs = []
for layer in layers:
    step = (NF + 3) // 4
    for a in range(0, NF, step):
        jobs.append(['node', 'render.mjs', 'frames', layer, f'{FR}/{layer}', str(a), str(min(NF, a + step))])
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(lambda j: subprocess.run(j, env=env, capture_output=True, text=True), jobs):
        if r.returncode: print(r.stderr[-800:]); sys.exit(1)


def enc(out, w, h, pix='rgb24'):
    return subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', pix, '-s', f'{w}x{h}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-x264-params', 'ref=1:bframes=0', '-pix_fmt', 'yuv420p', '-g', '30', out], stdin=subprocess.PIPE)


os.makedirs('out', exist_ok=True)
if 'gfx' in layers:
    e = enc('out/gfx.mp4', 1080, 3840)
    for n in range(NF):
        a = np.asarray(Image.open(f'{FR}/gfx/{n:05d}.png').convert('RGBA')).astype(np.uint16)
        al = a[..., 3:4]
        rgb = (a[..., :3] * al // 255).astype(np.uint8)
        e.stdin.write(np.concatenate([rgb, np.repeat(al.astype(np.uint8), 3, axis=2)], axis=0).tobytes())
    e.stdin.close(); e.wait()
if 'mask' in layers:
    e = enc('out/mask.mp4', 1080, 1920, 'gray')
    for n in range(NF):
        e.stdin.write(np.asarray(Image.open(f'{FR}/mask/{n:05d}.png').convert('L')).tobytes())
    e.stdin.close(); e.wait()
for f in ('out/gfx.mp4', 'out/mask.mp4'):
    if os.path.exists(f): print(f, os.path.getsize(f) // 1024, 'KB')
