"""Music + SFX mix for ad v3. Times come from timeline.json.

The 8-9 s riser of v2 is gone: the track's silence (48.3-51.4 s) cuts straight
into the drop (52.651 s), which lands on TD.
"""
import json, subprocess, sys
import numpy as np

FF = '/home/user/bin/ffmpeg'
D = sys.argv[1] if len(sys.argv) > 1 else '/home/user/v3'
SR = 48000
TL = json.load(open(f'{D}/timeline.json'))
TD, L, DUR = TL['TD'], TL['L'], TL['dur']


def tb(k):
    return TD + k * L


def load(f, s=0, e=None):
    a = [FF, '-v', 'error', '-ss', f'{s:.3f}', '-i', f] + (['-t', f'{e - s:.3f}'] if e else []) + ['-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True).stdout, dtype=np.float32).reshape(-1, 2).copy()


mix = np.zeros((int(DUR * SR) + SR, 2), np.float32)


def place(x, t, g=1.0, fi=0.01, fo=0.01):
    x = x * g; n = len(x); fi_ = int(fi * SR); fo_ = int(fo * SR)
    if fi_ > 0: x[:fi_] *= np.linspace(0, 1, fi_)[:, None]
    if fo_ > 0: x[-fo_:] *= np.linspace(1, 0, fo_)[:, None]
    i = int(round(t * SR)); j = min(len(mix), i + n); mix[i:j] += x[:j - i]


M = f'{D}/aud/detonation.mp3'
DROP = 52.651
place(load(M, 43.45, 51.40), 0.0, 0.8, 0.02, 0.05)                 # hook + silence
place(load(M, DROP, 70.973), TD, 0.8, 0.004, 0.30)                  # the drop, straight out of the silence
seg2 = TD + (70.973 - DROP)                                          # where the first music block ends
place(load(M, 81.58, 89.06), seg2 - 0.30, 0.8, 0.30, 0.06)          # crossfade into the second block
END0 = 218.02
place(load(M, END0, 222.5), tb(14), 0.8, 0.02, 0.4)               # the track's real ending under the end card

A = f'{D}/aud/'
boom, boom2, wh, bwh, tg = (load(A + n) for n in ('boom.mp3', 'boom2.mp3', 'whoosh.mp3', 'bwhoosh.mp3', 'toggle.mp3'))
tg = tg[:int(0.4 * SR)]
place(boom, TD - 0.12, 0.26, 0, 0.3); place(wh, TD - 1.0, 0.45, 0.05, 0.05)
place(boom2, tb(14) - 0.16, 0.45, 0, 0.4); place(bwh, tb(14) - 1.1, 0.35, 0.05, 0.1)
place(bwh, tb(10) - 1.1, 0.45, 0.05, 0.1); place(boom2, tb(10) - 0.16, 0.4, 0, 0.4)
for t, _ in TL['text']['silence']:
    place(tg, t - 0.07, 4.0, 0, 0.02)
# a soft whoosh under every designed transition, apex on the cut
for k, tr in TL['trans'].items():
    if tr['D'] > 0 and tr['type'] != 'lv':
        c = TL['shots'][int(k)]['t0']
        place(wh[:int(0.6 * SR)], c - 0.30, 0.16, 0.05, 0.2)

mix = mix[:int(DUR * SR)]
pk = np.abs(mix).max(); mix = mix / max(1e-6, pk) * 0.97
open(f'{D}/aud/mix_raw.f32', 'wb').write(mix.astype(np.float32).tobytes())
subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', f'{D}/aud/mix_raw.f32', '-af', 'volume=2.0,alimiter=limit=0.84:attack=4:release=60:level=disabled', '-c:a', 'pcm_s16le', f'{D}/aud/mix_pre.wav'])
r = subprocess.run([FF, '-hide_banner', '-i', f'{D}/aud/mix_pre.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(r[r.rfind('{'):r.rfind('}') + 1])
af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run([FF, '-v', 'error', '-y', '-i', f'{D}/aud/mix_pre.wav', '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', f'{D}/aud/mix.wav'])
r = subprocess.run([FF, '-hide_banner', '-i', f'{D}/aud/mix.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print(r[r.find('Integrated'):][:300])
