import React, {useMemo} from 'react';
import {interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import {EV, prog} from '../anim';

type Tree = {x: number; ground: number; w: number; top: number; blobs: {dx: number; dy: number; r: number}[]};

function makeTrees(seed: string, n: number, opts: {ground: number; minW: number; maxW: number; top: [number, number]; r: [number, number]; avoid?: [number, number]}): Tree[] {
  const trees: Tree[] = [];
  for (let i = 0; i < n; i++) {
    let x = -200 + (2320 * (i + random(`${seed}-x-${i}`) * 0.8)) / n;
    if (opts.avoid && x > opts.avoid[0] && x < opts.avoid[1]) {
      x = x < (opts.avoid[0] + opts.avoid[1]) / 2 ? opts.avoid[0] - 40 : opts.avoid[1] + 40;
    }
    const w = opts.minW + random(`${seed}-w-${i}`) * (opts.maxW - opts.minW);
    const top = opts.top[0] + random(`${seed}-t-${i}`) * (opts.top[1] - opts.top[0]);
    const blobs = Array.from({length: 9}, (_, j) => ({
      dx: (random(`${seed}-bx-${i}-${j}`) - 0.5) * 420,
      dy: (random(`${seed}-by-${i}-${j}`) - 0.6) * 260,
      r: opts.r[0] + random(`${seed}-br-${i}-${j}`) * (opts.r[1] - opts.r[0]),
    }));
    trees.push({x, ground: opts.ground, w, top, blobs});
  }
  return trees;
}

const TreeLayer: React.FC<{trees: Tree[]; trunk: string; leaf: string; leafHi: string; sketch: boolean; sway: number}> = ({trees, trunk, leaf, leafHi, sketch, sway}) => {
  const stroke = sketch ? '#222' : 'none';
  return (
    <g>
      {trees.map((t, i) => (
        <g key={i}>
          <path
            d={`M ${t.x - t.w / 2} ${t.ground} C ${t.x - t.w * 0.35} ${t.ground - 200}, ${t.x - t.w * 0.2} ${t.top + 200}, ${t.x - t.w * 0.18} ${t.top} L ${t.x + t.w * 0.18} ${t.top} C ${t.x + t.w * 0.2} ${t.top + 200}, ${t.x + t.w * 0.35} ${t.ground - 200}, ${t.x + t.w / 2} ${t.ground} Z`}
            fill={sketch ? '#fff' : trunk}
            stroke={stroke}
            strokeWidth={2.5}
          />
          <g transform={`rotate(${Math.sin(sway + i) * 0.6} ${t.x} ${t.ground})`}>
            {t.blobs.map((b, j) => (
              <circle key={j} cx={t.x + b.dx} cy={t.top + b.dy} r={b.r} fill={sketch ? '#fff' : j % 3 === 0 ? leafHi : leaf} stroke={stroke} strokeWidth={2.5} />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
};

const Fern: React.FC<{x: number; y: number; s: number; color: string; flip?: boolean; sketch: boolean; phase: number}> = ({x, y, s, color, flip, sketch, phase}) => {
  const frame = useCurrentFrame();
  const fronds = [-70, -48, -26, -6, 14, 36, 58];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {fronds.map((a, i) => (
        <g key={i} transform={`rotate(${a + Math.sin(frame / 25 + phase + i) * 3})`}>
          <path d="M0 0 Q 18 -160 0 -320 Q -18 -160 0 0 Z" fill={sketch ? '#fff' : color} stroke={sketch ? '#222' : 'none'} strokeWidth={2.5} />
          {!sketch &&
            Array.from({length: 7}, (_, k) => (
              <path key={k} d={`M0 ${-40 - k * 38} l ${22 - k * 2} -26 M0 ${-40 - k * 38} l ${-22 + k * 2} -26`} stroke={color} strokeWidth={9} strokeLinecap="round" />
            ))}
        </g>
      ))}
    </g>
  );
};

export const Sky: React.FC<{sketch: boolean}> = ({sketch}) => {
  const f = useCurrentFrame();
  if (sketch) return <rect x={-3000} y={-4000} width={8000} height={8000} fill="#fff" />;
  const keys = [0, 300, 620, 960];
  const top = interpolateColors(f, keys, ['#0b1c2b', '#1f4a5e', '#3f86a8', '#6db4d4']);
  const bottom = interpolateColors(f, keys, ['#3e6b74', '#c9a066', '#f2c983', '#fde3b4']);
  return (
    <>
      <defs>
        <linearGradient id="sky" x1="0" y1="-1800" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id="sun" cx="1320" cy="-250" r="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3c4" stopOpacity={prog(f, 150, 420) * 0.9} />
          <stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-3000} y={-4000} width={8000} height={8000} fill="url(#sky)" />
      <rect x={-3000} y={-4000} width={8000} height={8000} fill="url(#sun)" />
    </>
  );
};

/** Background jungle layers. Rendered behind the house. */
export const JungleBack: React.FC<{sketch: boolean}> = ({sketch}) => {
  const f = useCurrentFrame();
  const far = useMemo(() => makeTrees('far', 16, {ground: 780, minW: 30, maxW: 60, top: [-150, 250], r: [70, 140]}), []);
  const mid = useMemo(() => makeTrees('mid', 9, {ground: 815, minW: 50, maxW: 95, top: [-500, 0], r: [110, 200], avoid: [700, 1220]}), []);
  const warm = prog(f, 300, 950);
  const farLeaf = interpolateColors(warm, [0, 1], ['#26484a', '#4f7f5c']);
  const midLeaf = interpolateColors(warm, [0, 1], ['#163626', '#2c5a32']);
  const ground = interpolateColors(warm, [0, 1], ['#16261a', '#2e4a26']);
  return (
    <g>
      <TreeLayer trees={far} trunk="#2d3b37" leaf={farLeaf} leafHi={interpolateColors(warm, [0, 1], ['#2e5655', '#6a9a66'])} sketch={sketch} sway={f / 60} />
      {/* distant waterfall */}
      {!sketch && (
        <g opacity={0.55}>
          <rect x={1580} y={330} width={46} height={450} fill="#dfeff0" opacity={0.5} />
          {Array.from({length: 6}, (_, i) => (
            <line key={i} x1={1586 + i * 7} x2={1586 + i * 7} y1={330} y2={780} stroke="#fff" strokeWidth={3} strokeDasharray="30 50" strokeDashoffset={-f * 9 - i * 13} />
          ))}
        </g>
      )}
      <TreeLayer trees={mid} trunk="#24301f" leaf={midLeaf} leafHi={interpolateColors(warm, [0, 1], ['#1f4630', '#3d7240'])} sketch={sketch} sway={f / 45} />
      <path d="M -3000 812 Q 400 790 960 818 T 4900 805 L 4900 4000 L -3000 4000 Z" fill={sketch ? '#fff' : ground} stroke={sketch ? '#222' : 'none'} strokeWidth={2.5} />
      {/* the clearing */}
      <ellipse cx={960} cy={835} rx={560} ry={52} fill={sketch ? '#fff' : '#3a2a1c'} stroke={sketch ? '#222' : 'none'} strokeWidth={2} opacity={sketch ? 1 : 0.85} />
    </g>
  );
};

/** Foreground jungle: canopy, vines and ferns that frame the shot. */
export const JungleFront: React.FC<{sketch: boolean}> = ({sketch}) => {
  const f = useCurrentFrame();
  const near = useMemo(
    () => [
      ...makeTrees('nearL', 2, {ground: 1100, minW: 110, maxW: 150, top: [-900, -700], r: [180, 280]}).map((t, i) => ({...t, x: -40 + i * 300})),
      ...makeTrees('nearR', 2, {ground: 1100, minW: 110, maxW: 150, top: [-950, -720], r: [180, 280]}).map((t, i) => ({...t, x: 1700 + i * 300})),
    ],
    [],
  );
  const canopy = useMemo(
    () => Array.from({length: 46}, (_, i) => ({x: -400 + i * 62 + random(`c${i}`) * 50, y: -1050 + random(`cy${i}`) * 420, r: 120 + random(`cr${i}`) * 140})),
    [],
  );
  const vines = useMemo(
    () => Array.from({length: 12}, (_, i) => ({x: 80 + i * 160 + random(`v${i}`) * 90, len: 500 + random(`vl${i}`) * 650})),
    [],
  );
  const warm = prog(f, 300, 950);
  const leaf = interpolateColors(warm, [0, 1], ['#0b1a11', '#173a1c']);
  const leafHi = interpolateColors(warm, [0, 1], ['#12281a', '#24562a']);
  const stroke = sketch ? '#222' : 'none';
  return (
    <g>
      {canopy.map((c, i) => (
        <circle key={i} cx={c.x + Math.sin(f / 50 + i) * 4} cy={c.y} r={c.r} fill={sketch ? '#fff' : i % 4 === 0 ? leafHi : leaf} stroke={stroke} strokeWidth={2.5} />
      ))}
      {vines.map((v, i) => {
        const sway = Math.sin(f / 40 + i) * 26;
        return <path key={i} d={`M ${v.x} -700 Q ${v.x + sway} ${-700 + v.len / 2} ${v.x + sway * 1.6} ${-700 + v.len}`} stroke={sketch ? '#222' : leaf} strokeWidth={sketch ? 2.5 : 7} fill="none" />;
      })}
      <TreeLayer trees={near} trunk="#121a10" leaf={leaf} leafHi={leafHi} sketch={sketch} sway={f / 35} />
      <Fern x={120} y={1090} s={1.25} color={leafHi} sketch={sketch} phase={0} />
      <Fern x={1820} y={1095} s={1.3} color={leafHi} flip sketch={sketch} phase={2} />
      <Fern x={470} y={850} s={0.55} color={leaf} sketch={sketch} phase={1} />
      <Fern x={1460} y={852} s={0.6} color={leaf} flip sketch={sketch} phase={3} />
      <Fern x={420} y={1120} s={0.9} color={leaf} sketch={sketch} phase={4} />
      <Fern x={1520} y={1120} s={0.85} color={leaf} flip sketch={sketch} phase={5} />
    </g>
  );
};

/** God rays, mist, the falling seed and its splash. World-space effects. */
export const Atmosphere: React.FC = () => {
  const f = useCurrentFrame();
  const rays = prog(f, 200, 330) * (1 - prog(f, 880, 1000) * 0.6);
  const mist = 1 - prog(f, 500, 900) * 0.75;
  const seedT = prog(f, 330, EV.seedLand, (t) => t * t);
  const seedY = interpolate(seedT, [0, 1], [380, 818]);
  const landed = f >= EV.seedLand;
  const splash = prog(f, EV.seedLand, EV.seedLand + 22);
  const glow = landed ? 1 - prog(f, EV.seedLand + 30, 520) : prog(f, 320, 340);
  return (
    <g>
      <defs>
        <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe7a8" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffe7a8" stopOpacity={0} />
        </linearGradient>
        <filter id="blur40"><feGaussianBlur stdDeviation={40} /></filter>
        <filter id="blur8"><feGaussianBlur stdDeviation={8} /></filter>
      </defs>
      <g opacity={rays * (0.75 + Math.sin(f / 13) * 0.08)} style={{mixBlendMode: 'screen'}}>
        {[0, 1, 2, 3].map((i) => (
          <polygon key={i} points={`${1180 + i * 70},-500 ${1260 + i * 70},-500 ${1060 + i * 40},860 ${880 + i * 50},860`} fill="url(#ray)" opacity={0.5 - i * 0.08} />
        ))}
      </g>
      <g opacity={mist} filter="url(#blur40)">
        {Array.from({length: 7}, (_, i) => (
          <ellipse key={i} cx={((i * 400 + f * (1.2 + i * 0.2)) % 2600) - 300} cy={620 + (i % 3) * 70} rx={360} ry={60} fill="#dfe9e6" opacity={0.35} />
        ))}
      </g>
      {f >= 320 && f < 560 && (
        <g>
          <circle cx={960} cy={seedY} r={26} fill="#ffd77a" opacity={glow * 0.6} filter="url(#blur8)" />
          <ellipse cx={960} cy={seedY} rx={7} ry={10} fill="#ffcf5a" opacity={landed ? glow : 1} />
          {landed &&
            Array.from({length: 10}, (_, i) => {
              const a = Math.PI + (i / 9) * Math.PI;
              const d = splash * (24 + (i % 3) * 10);
              return <circle key={i} cx={960 + Math.cos(a) * d} cy={818 + Math.sin(a) * d * 0.8 + splash * splash * 18} r={2.4} fill="#5a4630" opacity={1 - splash} />;
            })}
        </g>
      )}
    </g>
  );
};
