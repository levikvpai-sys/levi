import {Easing, interpolate} from 'remotion';
import timeline from './timeline.json';

export const T = timeline;
export const EV = timeline.events;

export const ease = Easing.bezier(0.45, 0, 0.25, 1);

/** 0→1 between frames a and b, clamped and eased. */
export const prog = (f: number, a: number, b: number, easing = ease) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Eased keyframe interpolation of a vector of numbers. */
export function keyframes(f: number, keys: {f: number; v: number[]}[]): number[] {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f <= b.f) {
      const t = ease((f - a.f) / (b.f - a.f));
      return a.v.map((v, j) => v + (b.v[j] - v) * t);
    }
  }
  return keys[keys.length - 1].v;
}

/** Overshooting "grow" curve, used for things that sprout. */
export const grow = (f: number, start: number, dur = 30) =>
  prog(f, start, start + dur, Easing.out(Easing.back(1.6)));
