import {keyframes} from './anim';

// World is drawn in a 1920×1080 frame (ground at y≈820) with sky and canopy
// extending upward to y≈-1800. Each key is [centerX, centerY, zoom].
const WIDE = [
  {f: 0, v: [960, -620, 1]},
  {f: 210, v: [960, 540, 1]},
  {f: 300, v: [960, 600, 1.15]},
  {f: 390, v: [960, 760, 2.6]},
  {f: 450, v: [960, 790, 3.2]},
  {f: 520, v: [960, 760, 2.4]},
  {f: 660, v: [960, 560, 1]},
  {f: 900, v: [960, 520, 0.97]},
  {f: 1060, v: [960, 650, 1.35]},
  {f: 1260, v: [960, 570, 1.05]},
  {f: 1350, v: [960, 540, 1]},
  {f: 1480, v: [960, 470, 0.85]},
];

const TALL = [
  {f: 0, v: [960, -1000, 1]},
  {f: 210, v: [960, 150, 1]},
  {f: 300, v: [960, 280, 1.1]},
  {f: 390, v: [960, 700, 2.2]},
  {f: 450, v: [960, 760, 2.8]},
  {f: 520, v: [960, 720, 2.1]},
  {f: 660, v: [960, 300, 1]},
  {f: 900, v: [960, 260, 0.97]},
  {f: 1060, v: [960, 600, 1.5]},
  {f: 1260, v: [960, 320, 1.05]},
  {f: 1350, v: [960, 280, 1]},
  {f: 1480, v: [960, 200, 0.85]},
];

export function camera(frame: number, vertical: boolean) {
  const [cx, cy, zoom] = keyframes(frame, vertical ? TALL : WIDE);
  const w = (vertical ? 1100 : 1920) / zoom;
  const h = (vertical ? 1955 : 1080) / zoom;
  return {cx, cy, zoom, viewBox: `${cx - w / 2} ${cy - h / 2} ${w} ${h}`};
}
