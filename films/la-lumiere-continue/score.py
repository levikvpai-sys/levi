"""Temp score + sound design for 'La lumiere continue' (50.0 s, 48 kHz stereo).
Every cue is read from timeline.json so picture and sound share one clock."""
import json, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
TL = json.load(open('timeline.json'))
DUR = TL['dur']
N = int(DUR * SR)
rng = np.random.default_rng(11)
cut = {s['id']: s['t0'] for s in TL['shots']}

def buf(): return np.zeros((N, 2))
def idx(t): return int(round(t * SR))
def db(x): return 10 ** (x / 20)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def noise(n, ch=2): return rng.standard_normal((n, ch))
def pink(n, ch=2):
    X = np.fft.rfft(rng.standard_normal((n, ch)), axis=0)
    f = np.maximum(np.fft.rfftfreq(n, 1 / SR), 20)[:, None]
    y = np.fft.irfft(X / np.sqrt(f), n, axis=0)
    return y / np.abs(y).max()
def env(n, a, r, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * t / max(r, 1e-4))
    return e[:, None]
def add(dst, t, sig, g=1.0, pan=0.0):
    i = idx(t)
    if i >= N: return
    sig = sig if sig.ndim == 2 else np.repeat(sig[:, None], 2, 1)
    sig = sig[:N - i] * g
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    dst[i:i + len(sig), 0] += sig[:, 0] * l * 1.414
    dst[i:i + len(sig), 1] += sig[:, 1] * r * 1.414
def gate(t0, t1, fi=0.05, fo=0.05):
    t = np.arange(N) / SR
    g = np.clip((t - t0) / fi, 0, 1) * np.clip((t1 - t) / fo, 0, 1)
    return g[:, None]
def reverb(x, rt=2.2, wet=0.35, tone=5000):
    n = int(rt * SR)
    ir = rng.standard_normal((n, 2)) * np.exp(-6.9 * np.arange(n) / n)[:, None]
    ir = lp(ir, tone); ir /= np.sqrt((ir ** 2).sum(0))
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet * 2.2
def hz(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------------------------------------------------------- riot (0 - 15.0)
riot = buf()
t = np.arange(N) / SR
crowd = bp(pink(N), 280, 2600, 2)
mod = 0.65 + 0.2 * np.sin(2 * np.pi * 0.31 * t + 1) + 0.15 * np.sin(2 * np.pi * 0.83 * t)
crowd *= mod[:, None]
roar = lp(pink(N), 160, 2) * 1.4
bed = (crowd * 0.55 + roar) * gate(0.0, cut[12], 0.02, 0.25)
# side street: the square recedes behind a wall
street = lp(crowd, 600) * 0.45 * gate(cut[12], cut[15], 0.05, 0.01)
riot += bed + street
# distant French two-tone siren
sir = np.zeros(N); ph = 0.0
for i0 in range(idx(0.9), idx(11.4)):
    f = 435 if int((i0 / SR - 0.9) / 0.62) % 2 == 0 else 580
    ph += 2 * np.pi * f / SR; sir[i0] = np.sin(ph) + 0.3 * np.sin(3 * ph)
sir = lp(np.repeat(sir[:, None], 2, 1), 1800) * 0.10 * gate(0.9, 11.4, 1.5, 0.8)
riot += reverb(sir, 1.6, 0.6)
# low hits on the riot cuts (a heartbeat the edit is cut to)
def boom(strength=1.0, f0=95, f1=42, dur=0.9):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 5.5)
    click = hp(noise(n, 1)[:, 0], 1500) * np.exp(-tt * 90) * 0.25
    return (s + click) * strength
for sid in range(2, 12):
    riot_hit = boom(1.0 if sid in (2, 4, 7, 9) else 0.65)
    add(riot, cut[sid], riot_hit, 0.55)
# gas launcher thump + canister hiss
add(riot, cut[5] + 0.18, boom(0.8, 160, 70, 0.4), 0.5, -0.3)
n = int(1.1 * SR); add(riot, cut[6], hp(noise(n), 2500) * env(n, 0.02, 0.9, 2.5), 0.22, 0.2)
# footsteps
for k in range(8):
    n = int(0.12 * SR); s = lp(noise(n), 900) * env(n, 0.002, 0.08, 6)
    add(riot, cut[8] + 0.06 + k * 0.118 + rng.uniform(-.02, .02), s, 0.45, rng.uniform(-.6, .6))
# fireworks: whistle + crackle
n = int(0.6 * SR); tt = np.arange(n) / SR
wh = np.sin(2 * np.pi * np.cumsum(1800 + 2600 * tt / 0.6) / SR) * np.minimum(1, tt / .05) * np.exp(-tt * 1.5)
add(riot, cut[11] - 0.25, wh, 0.05, 0.4)
for k in range(28):
    n = int(0.05 * SR); s = hp(noise(n), 1200) * env(n, 0.0005, 0.03, 5)
    add(riot, cut[11] + 0.35 + rng.uniform(0, 0.55), s, rng.uniform(.15, .4), rng.uniform(-.8, .8))
# tension drone D, swelling to the fire
dr = np.zeros((N, 2))
for m, a in ((38, 1.0), (45, 0.6), (50, 0.35), (51, 0.12)):
    for det in (-0.004, 0.004):
        f = hz(m) * (1 + det)
        for h in range(1, 7):
            dr[:, 0 if det < 0 else 1] += a / h * np.sin(2 * np.pi * f * h * t + h)
dr = lp(dr, 900) * 0.035 * (np.clip(t / 14.5, 0, 1) ** 1.5)[:, None] * gate(0, cut[15], 0.3, 0.01)
riot += dr
# throw: whoosh, then glass + ignition on the cut to the burning car
n = int(0.7 * SR); tt = np.arange(n) / SR
wo = np.zeros((n, 2))
for i0 in range(0, n, 2400):
    seg = slice(i0, min(n, i0 + 2400)); fc = 400 + 2600 * (i0 / n)
    wo[seg] = bp(noise(seg.stop - seg.start), fc * .7, fc * 1.4, 1)
wo *= np.sin(np.pi * tt / tt[-1])[:, None]
add(riot, cut[13] + 0.75, wo, 0.35, -0.2)
n = int(1.0 * SR); tt = np.arange(n) / SR
glass = hp(noise(n), 3000) * np.exp(-tt * 9)[:, None]
for k in range(40):
    f = rng.uniform(3500, 9000); s = np.sin(2 * np.pi * f * tt) * np.exp(-tt * rng.uniform(15, 40))
    glass[:, k % 2] += s * 0.15 * (np.arange(n) > rng.integers(0, int(.15 * SR)))
add(riot, cut[14] - 0.05, glass, 0.35)
n = int(1.6 * SR); tt = np.arange(n) / SR
fwoom = lp(noise(n), 700) * (np.minimum(1, tt / .08) * np.exp(-tt * 1.4))[:, None]
add(riot, cut[14], fwoom, 1.2)
add(riot, cut[14], boom(1.2, 70, 35, 1.4), 0.5)
# fire roar + crackle under the burning car
def fire(dst, t0, t1, g=1.0, grow=False):
    n = idx(t1) - idx(t0); tt = np.arange(n) / SR
    body = lp(pink(n), 500) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.7 * tt + np.sin(2 * np.pi * .7 * tt))))[:, None]
    for k in range(int(n / SR * 40)):
        m = int(0.012 * SR); i0 = rng.integers(0, max(1, n - m))
        body[i0:i0 + m] += hp(noise(m), 2000) * env(m, 0.0003, 0.006, 3) * rng.uniform(.3, 1.2)
    if grow: body *= (np.linspace(0.25, 1, n) ** 2)[:, None]
    add(dst, t0, body, g)
fire(riot, cut[14], cut[15], 1.5)
# riser into the cut to reality
n = idx(cut[15]) - idx(12.0); tt = np.arange(n) / SR; T = tt[-1]
rz = np.zeros((n, 2))
for k, i0 in enumerate(range(0, n, 2400)):
    seg = slice(i0, min(n, i0 + 2400)); fc = 300 * (14 ** (i0 / n))
    rz[seg] = bp(noise(seg.stop - seg.start), fc * .8, min(fc * 1.25, 20000), 1)
rz *= ((tt / T) ** 2.5)[:, None]
add(riot, 12.0, rz, 1.3)
riot *= gate(0, cut[15], 0.01, 0.006)           # hard cut: everything stops on 15.0

# ---------------------------------------------------------------- reality (15.0 - 22.0)
fx = buf()
add(fx, cut[15], boom(0.9, 55, 30, 2.0), 0.6)
room = lp(noise(N), 1200) * 0.004 * gate(cut[15], 45, 0.05, 1.0)
fx += room
# fire swallows the frame, then is cut to silence on the extinguished wick
riot_fire = buf()
fire(riot_fire, cut[19], cut[20], 1.7, grow=True)
riot_fire = riot_fire * gate(cut[19], cut[20], 0.1, 0.004)
fx += riot_fire
n = int(0.9 * SR); add(fx, cut[20] + 0.05, hp(noise(n), 3000) * env(n, .2, .9, 2), 0.012)   # smoke whisper
# match strike + flame catching
n = int(0.16 * SR); strike = bp(noise(n), 2500, 7000) * env(n, 0.004, 0.14, 3)
add(fx, cut[21] + 0.02, strike, 0.5, 0.15)
n = int(1.2 * SR); tt = np.arange(n) / SR
flare = lp(noise(n), 900) * (np.minimum(1, tt / .06) * np.exp(-tt * 2.2))[:, None]
add(fx, cut[21] + 0.10, flare, 0.35, 0.1)
fire_soft = lp(pink(idx(cut[22]) - idx(cut[21] + .2)), 380) * 0.10
add(fx, cut[21] + 0.2, fire_soft * np.linspace(1, 0.4, len(fire_soft))[:, None], 1.0)

# ---------------------------------------------------------------- music (15.0 -> 50.0)
mus = buf()
def piano(m, dur=3.0, vel=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR; f = hz(m)
    s = np.zeros(n)
    for h, a in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .07), (6, .04)):
        fh = f * h * (1 + 0.0004 * h * h)
        s += a * np.sin(2 * np.pi * fh * tt) * np.exp(-tt * (0.9 + 0.55 * h) * (1 + (m - 60) / 40))
    s *= np.minimum(1, tt / 0.004) * vel
    return np.stack([s, np.roll(s, 24)], 1)
def pad(ms, t0, t1, g=0.03, att=0.9, rel=1.4, bright=6):
    n = idx(t1 + rel) - idx(t0); tt = np.arange(n) / SR
    s = np.zeros((n, 2))
    for m in ms:
        for c, det in enumerate((-0.0035, 0.0035)):
            f = hz(m) * (1 + det)
            for h in range(1, bright + 1):
                s[:, c] += (1 / h) * np.sin(2 * np.pi * f * h * tt + rng.uniform(0, 6))
    e = np.minimum(1, tt / att) * np.clip((t1 + rel - t0 - tt) / rel, 0, 1)
    add(mus, t0, lp(s, 2200) * e[:, None], g / len(ms))
# chords (MIDI): D major, voiced around middle C
CH = {'D': [50, 57, 62, 66], 'Bm': [47, 54, 59, 62], 'G': [43, 50, 55, 59], 'A': [45, 52, 57, 61],
      'Dhi': [50, 57, 62, 66, 69], 'Gadd9': [43, 50, 57, 59, 62], 'Dres': [38, 50, 57, 62, 66, 69]}
# cold, sparse: the reality section
pad([38, 45, 50], cut[15], cut[19], 0.05, att=0.4, rel=0.3, bright=3)
add(mus, cut[15] + 0.05, piano(50, 4.0, .55), 0.5, -0.1)
add(mus, cut[17] + 0.05, piano(62, 3.0, .45), 0.45, 0.2)          # breath on the man behind the story
add(mus, cut[17] + 0.45, piano(57, 3.0, .35), 0.45, 0.2)
# warm: from the lit wick to the end
plan = [(22.40, cut[22], 'D', 0.55), (cut[22], cut[23], 'D', 0.8), (cut[23], cut[24], 'Bm', 0.8), (cut[24], cut[25], 'G', 0.85),
        (cut[25], cut[26], 'A', 0.85), (cut[26], cut[27], 'Bm', 0.9), (cut[27], cut[28], 'G', 0.95), (cut[28], cut[29], 'Dhi', 1.0),
        (cut[29], cut[30], 'A', 0.5), (cut[30], cut[31], 'Gadd9', 0.8), (cut[31], DUR - 0.2, 'Dres', 0.9)]
STEP = 0.3125                                    # eighth note at 96 BPM
pattern = [0, 2, 3, 1, 2, 3, 2, 1]
for (t0, t1, ch, vel) in plan:
    notes = CH[ch]
    pad(notes, t0, t1, 0.05 * vel, att=0.5 if t0 > 22.5 else 1.2, rel=0.6)
    add(mus, t0, piano(notes[0] - 12 if notes[0] > 40 else notes[0], 3.5, .8 * vel), 0.5)     # bass on the cut
    k = 0; tt = t0 + 0.02
    while tt < t1 - 0.1 and t0 < 45.0:
        m = notes[pattern[k % len(pattern)] % len(notes)] + 12
        if ch == 'Dhi': m += 12 if k % 4 == 3 else 0
        add(mus, tt, piano(m, 2.5, 0.42 * vel * (1.0 if k % 4 == 0 else 0.8)), 0.5, 0.25 * np.sin(k))
        k += 1; tt += STEP
# swell toward the song
n = idx(cut[29]) - idx(37.6); tt = np.arange(n) / SR
sw = lp(noise(n), 1800) * ((tt / tt[-1]) ** 3)[:, None]
add(mus, 37.6, sw, 0.05)
# light: shimmer into the white, one bell when the lantern lights, the words, the stroke
n = idx(45.0) - idx(43.9); tt = np.arange(n) / SR; sh = np.zeros((n, 2))
for m in (74, 78, 81, 86, 90):
    sh += np.sin(2 * np.pi * hz(m) * tt + rng.uniform(0, 6))[:, None] * np.array([1, .9])
add(mus, 43.9, sh * ((tt / tt[-1]) ** 2.2)[:, None], 0.018)
L = TL['logo']
def bell(m, dur=4.0):
    n = int(dur * SR); tt = np.arange(n) / SR; f = hz(m)
    s = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * d) for r, a, d in ((1, 1, 1.2), (2.76, .5, 2.4), (5.4, .25, 4), (8.9, .1, 6)))
    return np.stack([s, s], 1) * np.minimum(1, tt / .002)[:, None]
add(mus, L['lamp'][0], bell(81, 4.5), 0.13, 0.0)
add(mus, L['words'][0] + 0.05, bell(86, 3.5), 0.07, -0.3)
add(mus, L['words'][0] + 0.05, bell(78, 3.5), 0.06, 0.3)
n = int(L['stroke'][1] * SR); tt = np.arange(n) / SR
brush = bp(noise(n), 1500, 6000) * (np.sin(np.pi * tt / tt[-1]) ** 2)[:, None]
add(mus, L['stroke'][0], brush, 0.025)
add(mus, TL['cta']['textIn'], piano(74, 3.0, .5), 0.4, 0.1)
add(mus, TL['cta']['textIn'] + 0.31, piano(78, 3.0, .45), 0.4, -0.1)
add(mus, TL['cta']['textIn'] + 0.62, piano(81, 3.0, .4), 0.4, 0.1)

mus = reverb(mus, 2.6, 0.38)
fx = reverb(fx, 1.4, 0.2)

# ---------------------------------------------------------------- original song (shot 29)
w = wave.open('audio/song_full.wav'); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2) / 32768
s0, s1 = 3.0, 5.0                                 # source in/out from the storyboard
song = a[int(s0 * SR):int((s1 + 0.25) * SR)].astype(float)
n = len(song); tt = np.arange(n) / SR
song *= (np.clip(tt / 0.08, 0, 1) * np.clip((s1 - s0 + 0.25 - tt) / 0.35, 0, 1))[:, None]
songbus = buf(); add(songbus, cut[29], song, db(-4))
duck = 1 - 0.6 * gate(cut[29] - 0.05, cut[30] + 0.1, 0.12, 0.3)
mus *= duck

# ---------------------------------------------------------------- mix
tt_ = np.arange(N) / SR
mus_auto = db(-2.0 * np.clip((tt_ - 23.0) / 0.5, 0, 1) * np.clip((38.0 - tt_) / 0.6, 0, 1))[:, None]   # sit lower until the Torah lift
mix = riot * db(1.5) + fx * db(2) + mus * db(-3.5) * mus_auto + songbus
mix *= gate(0, DUR, 0.01, 0.6)
peak = np.abs(mix).max(); mix *= 0.5 / peak
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open('audio/score_raw.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(out.tobytes())
print('score_raw.wav', len(out) / SR, 's, pre-norm peak', round(20 * np.log10(peak), 1))

# ---------------------------------------------------------------- master: gain into a true-peak limiter, aim -15 LUFS
import subprocess, re
def lufs(path):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', o)[-1])
g = 0.0
for it in range(4):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/score_raw.wav', '-af',
                    f'volume={g}dB,alimiter=limit=0.82:attack=3:release=80:level=false,aresample=192000,alimiter=limit=0.84:attack=1:release=40:level=false,aresample=48000',
                    'audio/score.wav'], check=True)
    I, P = lufs('audio/score.wav'); print(f'pass {it}: gain {g:+.1f} dB -> {I} LUFS, true peak {P} dBTP')
    if abs(I + 15) < 0.3: break
    g += (-15 - I)
