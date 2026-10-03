// Synthesizes the full score + sound design for the ad, locked to the edit's
// frame timeline, and writes public/audio/music.wav. No samples, no network.
import {mkdirSync, writeFileSync} from 'node:fs';
import timeline from '../src/timeline.json' with {type: 'json'};

const SR = 44100;
const fps = timeline.fps;
const DUR = timeline.durationInFrames / fps;
const ev = timeline.events;
const sec = (frame) => frame / fps;
const L = new Float32Array(Math.ceil(SR * DUR));
const R = new Float32Array(L.length);

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

function add(i, v, pan = 0) {
  if (i < 0 || i >= L.length) return;
  L[i] += v * (1 - Math.max(0, pan));
  R[i] += v * (1 + Math.min(0, pan));
}

/** Sustained pad voice: additive saw-ish tone with slow attack/release. */
function pad(start, dur, freq, amp, {attack = 1.5, release = 1.5, harmonics = 6, pan = 0, detune = 0.003} = {}) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor((dur + release) * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const env = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
    let v = 0;
    for (let h = 1; h <= harmonics; h++) {
      v += (Math.sin(2 * Math.PI * freq * h * t) + Math.sin(2 * Math.PI * freq * (1 + detune) * h * t)) / (h * 1.6);
    }
    add(s0 + k, v * env * amp * (1 + 0.15 * Math.sin(2 * Math.PI * 0.2 * t)), pan);
  }
}

/** Felt-piano-ish note: a few decaying partials with a soft hammer. */
function piano(start, freq, amp, decay = 2.6, pan = 0) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(decay * 3 * SR);
  const partials = [1, 0.45, 0.22, 0.1, 0.05];
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t / decay);
    let v = 0;
    partials.forEach((a, i) => (v += a * Math.sin(2 * Math.PI * freq * (i + 1) * (1 + i * 0.0007) * t) * Math.exp(-t * i * 0.6)));
    add(s0 + k, v * env * amp, pan);
  }
}

/** Plucked string (Karplus–Strong). */
function pluck(start, freq, amp, dur = 2.2, pan = 0) {
  const s0 = Math.floor(start * SR);
  const period = Math.round(SR / freq);
  const buf = Array.from({length: period}, () => rnd());
  const n = Math.floor(dur * SR);
  for (let k = 0; k < n; k++) {
    const i = k % period;
    const v = buf[i];
    buf[i] = 0.4985 * (v + buf[(i + 1) % period]);
    add(s0 + k, v * amp * Math.min(1, (n - k) / (0.2 * SR)), pan);
  }
}

/** Filtered noise: lowpass + optional highpass via one-pole filters. */
function noise(start, dur, amp, {lp = 0.3, hp = 0, env = () => 1, pan = 0} = {}) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  let low = 0;
  let low2 = 0;
  for (let k = 0; k < n; k++) {
    low += lp * (rnd() - low);
    low2 += hp * (low - low2);
    add(s0 + k, (hp ? low - low2 : low) * amp * env(k / SR, dur), pan);
  }
}

/** Pitch-dropping sine hit (thumps, booms). */
function thump(start, f0, f1, amp, decay, pan = 0) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(decay * 4 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const f = f1 + (f0 - f1) * Math.exp(-t * 6);
    ph += (2 * Math.PI * f) / SR;
    add(s0 + k, Math.sin(ph) * Math.exp(-t / decay) * Math.min(1, t / 0.004) * amp, pan);
  }
}

function chirp(start, f0, f1, dur, amp, pan) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / n;
    ph += (2 * Math.PI * (f0 + (f1 - f0) * t)) / SR;
    add(s0 + k, Math.sin(ph) * Math.sin(Math.PI * t) * amp, pan);
  }
}

function birdsong(from, to, density, amp) {
  for (let t = from; t < to; t += 0.6 + Math.abs(rnd()) * density) {
    const base = 2600 + rnd() * 900;
    const pan = rnd() * 0.8;
    const notes = 2 + Math.floor(Math.abs(rnd()) * 4);
    for (let j = 0; j < notes; j++) chirp(t + j * 0.09, base, base + 700 + rnd() * 400, 0.07, amp, pan);
  }
}

// ── ACT 1: nothing (0–15s) ───────────────────────────────────────────────
noise(0, 13.5, 0.22, {lp: 0.35, env: (t) => Math.min(1, t / 1.2) * Math.max(0, Math.min(1, (13.5 - t) / 4)), pan: -0.2});
noise(0, 13.5, 0.22, {lp: 0.28, env: (t) => Math.min(1, t / 1.2) * Math.max(0, Math.min(1, (13.5 - t) / 4)), pan: 0.2});
for (let i = 0; i < 70; i++) {
  const t = Math.abs(rnd()) * 12;
  thump(t, 1800 + rnd() * 600, 900, 0.03, 0.01, rnd()); // leaf drips
}
birdsong(3, 13, 1.4, 0.035);
pad(0, 45, hz(45), 0.03, {attack: 6, release: 6, harmonics: 3});
pad(4, 41, hz(52), 0.02, {attack: 6, release: 6, harmonics: 3, pan: 0.3});
piano(sec(ev.seedLand), hz(69), 0.42, 3.2);
piano(sec(ev.seedLand) + 0.004, hz(81), 0.08, 2.2, 0.3);
thump(sec(ev.seedLand), 140, 60, 0.18, 0.08);

// ── ACT 2: the build (15–30s) — rising strings + construction hits ───────
const chords = [
  [15, 4, [57, 60, 64]], // Am
  [19, 4, [53, 57, 60]], // F
  [23, 3.5, [48, 55, 64]], // C
  [26.5, 3.6, [55, 59, 62]], // G
];
chords.forEach(([start, dur, notes], i) => {
  const amp = 0.018 + i * 0.008;
  notes.forEach((m, j) => pad(start, dur, hz(m), amp, {attack: 1.2, release: 1.2, pan: (j - 1) * 0.4}));
  pad(start, dur, hz(notes[0] - 12), amp * 0.9, {attack: 1, release: 1.2, harmonics: 4});
});
for (let t = 15; t < 30; t += 60 / 90 / 2) {
  thump(t, 90, 55, 0.05 + ((t - 15) / 15) * 0.07, 0.07); // heartbeat pulse building in tempo
}
ev.poles.forEach((f, i) => {
  thump(sec(f) + 0.18, 120, 48, 0.4, 0.18, (i - 2.5) * 0.15);
  noise(sec(f) + 0.18, 0.35, 0.25, {lp: 0.08, env: (t, d) => Math.exp(-t * 14)});
});
noise(sec(ev.beams), 1.4, 0.12, {lp: 0.05, env: (t, d) => Math.sin((Math.PI * t) / d) * (0.6 + 0.4 * Math.sin(t * 40))}); // wood creak
ev.glass.forEach((f, i) => {
  piano(sec(f) + 0.5, hz(88 + (i % 3) * 3), 0.05, 0.35, (i % 2 ? 0.5 : -0.5));
  noise(sec(f), 0.45, 0.05, {lp: 0.6, hp: 0.2, env: (t, d) => Math.sin((Math.PI * t) / d)});
});
noise(sec(ev.roof), 1.6, 0.1, {lp: 0.5, hp: 0.05, env: (t, d) => Math.sin((Math.PI * t) / d)}); // leaves unfolding
noise(sec(ev.pool), 1.6, 0.14, {lp: 0.25, env: (t, d) => Math.exp(-t * 2.2)}); // water filling
thump(29.6, 70, 40, 0.35, 0.5);

// ── ACT 3: life (30–45s) — warm guitar arpeggio at 90bpm ────────────────
const step = 60 / 90 / 2;
const prog = [
  [57, 61, 64, 69, 64, 61, 64, 61], // A
  [54, 57, 61, 66, 61, 57, 61, 57], // F#m
  [50, 54, 57, 62, 57, 54, 57, 54], // D
  [52, 56, 59, 64, 59, 56, 59, 56], // E
];
let t = 30;
for (let bar = 0; t < 45; bar++) {
  const notes = prog[bar % 4];
  pad(t, 8 * step, hz(notes[0] - 12), 0.012, {attack: 0.8, release: 1, harmonics: 3});
  notes.forEach((m, i) => pluck(t + i * step, hz(m), 0.16, 2, (i % 2 ? 0.35 : -0.35)));
  t += 8 * step;
}
birdsong(30, 45, 1.0, 0.03);
[sec(990), sec(1150)].forEach((s) => {
  for (let k = 0; k < 3; k++) chirp(s + k * 0.22, 900, 650, 0.16, 0.06, -0.4); // toucan croaks
});
noise(sec(1080), 0.8, 0.12, {lp: 0.4, env: (t2) => Math.exp(-t2 * 6)}); // splash
noise(31, 14, 0.035, {lp: 0.1, env: (t2, d) => Math.min(1, t2 / 2) * Math.min(1, (d - t2) / 2)}); // breeze

// ── ACT 4: the twist (45–60s) ────────────────────────────────────────────
const cut = sec(ev.silence);
[57, 64, 69, 72, 76].forEach((m, i) => pad(45, cut - 45 - 0.02, hz(m), 0.02 + i * 0.004, {attack: cut - 45 - 1, release: 0.02, pan: (i - 2) * 0.3}));
noise(46, cut - 46, 0.4, {lp: 0.15, env: (t2, d) => (t2 / d) ** 3});
for (let k = 0; k < 14; k++) {
  const s = sec(ev.pencil) + k * 0.045;
  noise(s, 0.05, 0.25, {lp: 0.9, hp: 0.6, env: (t2, d) => Math.sin((Math.PI * t2) / d)});
}
noise(sec(ev.pencil) + 0.85, 0.12, 0.3, {lp: 0.3, env: (t2) => Math.exp(-t2 * 30)}); // pencil set down
thump(sec(ev.boom), 70, 32, 0.95, 0.9);
noise(sec(ev.boom), 3, 0.35, {lp: 0.03, env: (t2) => Math.exp(-t2 * 1.4)});
piano(sec(ev.boom) + 0.05, hz(69), 0.3, 4);
piano(sec(ev.boom) + 0.05, hz(57), 0.18, 4, -0.2);
piano(sec(ev.boom) + 0.05, hz(64), 0.14, 4, 0.2);

// Hard silence before the pencil, as scripted.
const s0 = Math.floor(cut * SR);
const s1 = Math.floor((sec(ev.pencil) - 0.85) * SR);
for (let i = s0; i < s1; i++) L[i] = R[i] = 0;

// ── master: normalize + soft clip + 16-bit WAV ───────────────────────────
let peak = 0;
for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.95 / peak;
const out = Buffer.alloc(44 + L.length * 4);
out.write('RIFF', 0);
out.writeUInt32LE(36 + L.length * 4, 4);
out.write('WAVEfmt ', 8);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28);
out.writeUInt16LE(4, 32);
out.writeUInt16LE(16, 34);
out.write('data', 36);
out.writeUInt32LE(L.length * 4, 40);
for (let i = 0; i < L.length; i++) {
  out.writeInt16LE(Math.round(Math.tanh(L[i] * gain * 1.2) * 32767 * 0.9), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.tanh(R[i] * gain * 1.2) * 32767 * 0.9), 46 + i * 4);
}
mkdirSync(new URL('../public/audio/', import.meta.url), {recursive: true});
writeFileSync(new URL('../public/audio/music.wav', import.meta.url), out);
console.log(`music.wav: ${DUR}s, peak gain ${gain.toFixed(2)}`);
