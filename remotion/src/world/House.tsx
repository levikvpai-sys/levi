import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {EV, grow, prog} from '../anim';

const GROUND = 805;
const POLES = [
  {x: 600, top: 600},
  {x: 730, top: 428},
  {x: 860, top: 428},
  {x: 1060, top: 428},
  {x: 1190, top: 428},
  {x: 1320, top: 428},
];
const WOOD = '#8a5a32';
const WOOD_DARK = '#5e3b1f';
const INK = '#222';

const roofY = (x: number) => {
  // quadratic roof curve from (680,432) through control (1035,300) to (1390,432)
  const t = (x - 680) / 710;
  return (1 - t) * (1 - t) * 432 + 2 * (1 - t) * t * 300 + t * t * 432;
};

export const House: React.FC<{sketch: boolean}> = ({sketch}) => {
  const f = useCurrentFrame();
  if (f < EV.seedLand) return null;
  const fill = (c: string) => (sketch ? '#fff' : c);
  const stroke = sketch ? INK : 'none';
  const sw = 2.5;

  const roots = prog(f, EV.seedLand + 10, 520);
  const beam = (start: number) => prog(f, start, start + 40);
  const roof = grow(f, EV.roof, 40);
  const pool = prog(f, EV.pool, EV.pool + 45);
  const deck = prog(f, 650, 700);
  const interior = prog(f, 880, 960);

  const panels = [
    ...[600, 730, 860, 1060, 1190].map((x, i) => ({x: x + 4, y: 604, w: [130, 130, 200, 130, 130][i] - 8, h: GROUND - 608})),
    ...[730, 860, 1060, 1190].map((x, i) => ({x: x + 4, y: 434, w: [130, 200, 130, 130][i] - 8, h: 162, slats: i === 1})),
  ];

  return (
    <g>
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe3ea" stopOpacity={0.85} />
          <stop offset="0.45" stopColor="#6a9fae" stopOpacity={0.6} />
          <stop offset="0.5" stopColor="#e9f7fa" stopOpacity={0.8} />
          <stop offset="1" stopColor="#3b6a74" stopOpacity={0.7} />
        </linearGradient>
        <radialGradient id="warmInside" cx="0.5" cy="0.6" r="0.7">
          <stop offset="0" stopColor="#ffd69a" />
          <stop offset="1" stopColor="#c27a3e" />
        </radialGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fe0e0" />
          <stop offset="1" stopColor="#1f8fa6" />
        </linearGradient>
        <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="14" stroke={INK} strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* roots growing out of the seed toward every pole */}
      <g opacity={1 - prog(f, 600, 680) * 0.6}>
        {POLES.map((p, i) => (
          <path key={i} d={`M 960 818 C 960 ${860 + i * 4}, ${p.x} ${870 - i * 3}, ${p.x} ${GROUND}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - roots} stroke={sketch ? INK : '#6b4a2b'} strokeWidth={sketch ? 2.5 : 7} fill="none" strokeLinecap="round" />
        ))}
      </g>

      {/* interior: warm light + furniture silhouettes */}
      <g opacity={interior}>
        <rect x={604} y={604} width={712} height={GROUND - 604} fill={sketch ? '#fff' : 'url(#warmInside)'} />
        <rect x={734} y={434} width={582} height={166} fill={sketch ? '#fff' : 'url(#warmInside)'} />
        <rect x={880} y={720} width={160} height={50} rx={14} fill={fill('#efe2c8')} stroke={stroke} strokeWidth={sw} />
        <line x1={960} y1={604} x2={960} y2={650} stroke={sketch ? INK : '#3a2614'} strokeWidth={2} />
        <circle cx={960} cy={660} r={14} fill={fill('#fff1c8')} stroke={stroke} strokeWidth={sw} />
        <rect x={1220} y={500} width={70} height={96} fill={fill('#2f5d3a')} rx={30} stroke={stroke} strokeWidth={sw} />
      </g>

      {/* glass panels slide in from the sides */}
      {panels.map((p, i) => {
        const start = EV.glass[i] ?? EV.glass[EV.glass.length - 1];
        const t = prog(f, start, start + 28);
        const dx = (1 - t) * (p.x < 960 ? -140 : 140);
        if ('slats' in p && p.slats) {
          return (
            <g key={i} opacity={t}>
              {Array.from({length: 12}, (_, k) => (
                <rect key={k} x={p.x + k * (p.w / 12)} y={p.y} width={p.w / 12 - 4} height={p.h * grow(f, start + k * 2, 22)} fill={fill(k % 2 ? WOOD : WOOD_DARK)} stroke={stroke} strokeWidth={1.5} />
              ))}
            </g>
          );
        }
        return (
          <g key={i} transform={`translate(${dx} 0)`} opacity={t}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill={sketch ? 'url(#hatch)' : 'url(#glass)'} opacity={sketch ? 0.35 : 1 - interior * 0.45} stroke={sketch ? INK : 'rgba(255,255,255,0.5)'} strokeWidth={sw} />
          </g>
        );
      })}

      {/* bamboo poles */}
      {POLES.map((p, i) => {
        const g = grow(f, EV.poles[i], 34);
        const h = GROUND - p.top;
        return (
          <g key={i} transform={`translate(${p.x} ${GROUND}) scale(1 ${g})`}>
            <rect x={-11} y={-h} width={22} height={h} rx={6} fill={fill('#b9a05a')} stroke={stroke} strokeWidth={sw} />
            {!sketch && <rect x={-11} y={-h} width={7} height={h} fill="#d8c27d" />}
            {Array.from({length: Math.floor(h / 64)}, (_, k) => (
              <rect key={k} x={-12} y={-50 - k * 64} width={24} height={5} fill={sketch ? INK : '#7c6a33'} />
            ))}
          </g>
        );
      })}

      {/* beams, drawn outward from the center */}
      {[
        {y: 596, x1: 580, x2: 1340, s: EV.beams},
        {y: 424, x1: 710, x2: 1340, s: EV.beams + 18},
        {y: GROUND - 6, x1: 560, x2: 1360, s: EV.beams - 10},
      ].map((b, i) => {
        const p = beam(b.s);
        const c = (b.x1 + b.x2) / 2;
        const half = ((b.x2 - b.x1) / 2) * p;
        return <rect key={i} x={c - half} y={b.y} width={half * 2} height={14} fill={fill(WOOD)} stroke={stroke} strokeWidth={sw} />;
      })}

      {/* curved leaf roof + lower flat roof */}
      <g transform={`translate(1035 0) scale(${roof} 1) translate(-1035 0)`} opacity={Math.min(1, roof * 2)}>
        <path d="M 670 434 Q 1035 292 1400 434 L 1400 452 Q 1035 318 670 452 Z" fill={fill(WOOD_DARK)} stroke={stroke} strokeWidth={sw} />
        {Array.from({length: 26}, (_, k) => {
          const x = 690 + k * 27;
          const pop = grow(f, EV.roof + 20 + k * 2, 20);
          return (
            <g key={k} transform={`translate(${x} ${roofY(x) - 2}) scale(${pop})`}>
              <path d="M -14 0 Q -10 -26 -2 -34 Q 0 -14 4 -38 Q 8 -16 14 -28 Q 14 -10 16 0 Z" fill={fill(k % 2 ? '#4f8a3a' : '#3c7330')} stroke={stroke} strokeWidth={1.5} />
            </g>
          );
        })}
      </g>
      <rect x={580 + (1 - roof) * 80} y={590} width={170 * roof} height={12} fill={fill(WOOD_DARK)} stroke={stroke} strokeWidth={sw} />

      {/* deck */}
      <g opacity={deck}>
        <rect x={540} y={GROUND} width={840} height={16} fill={fill('#a06c3c')} stroke={stroke} strokeWidth={sw} />
        {Array.from({length: 20}, (_, k) => (
          <line key={k} x1={540 + k * 42} y1={GROUND} x2={540 + k * 42} y2={GROUND + 16} stroke={sketch ? INK : '#6e4723'} strokeWidth={1.5} />
        ))}
      </g>

      {/* infinity pool */}
      <g opacity={pool}>
        <path d="M 600 822 L 1320 822 L 1390 884 L 530 884 Z" fill={sketch ? '#fff' : '#d9cbb0'} stroke={stroke} strokeWidth={sw} />
        <g transform={`translate(0 ${822 + (1 - pool) * 50}) scale(1 ${pool}) translate(0 -822)`}>
          <path d="M 612 828 L 1308 828 L 1366 876 L 552 876 Z" fill={sketch ? '#fff' : 'url(#water)'} stroke={stroke} strokeWidth={sw} />
          {Array.from({length: 5}, (_, k) => {
            const y = 836 + k * 8;
            const o = (f * (1.5 + k * 0.3)) % 60;
            return <path key={k} d={`M ${640 - k * 14 + o} ${y} q 30 -5 60 0 t 60 0 t 60 0 M ${980 + o} ${y + 3} q 30 -5 60 0 t 60 0`} stroke={sketch ? INK : '#e9ffff'} strokeWidth={sketch ? 1.2 : 2} fill="none" opacity={0.7} />;
          })}
        </g>
      </g>

      {/* stepping-stone path toward camera */}
      {Array.from({length: 7}, (_, k) => {
        const p = grow(f, 800 + k * 7, 18);
        const x = 1390 + k * 26 + Math.sin(k) * 12;
        const y = 900 + k * 28;
        return <ellipse key={k} cx={x} cy={y} rx={(22 + k * 6) * p} ry={(8 + k * 2.2) * p} fill={fill('#9a958a')} stroke={stroke} strokeWidth={2} />;
      })}

      <Family sketch={sketch} />
      <Birds sketch={sketch} />
      <Dust />
    </g>
  );
};

const Person: React.FC<{x: number; s: number; top: string; hair: string; skin: string; sketch: boolean; swing: number}> = ({x, s, top, hair, skin, sketch, swing}) => {
  const stroke = sketch ? INK : 'none';
  const fill = (c: string) => (sketch ? '#fff' : c);
  return (
    <g transform={`translate(${x} 822) scale(${s})`}>
      <path d={`M -5 0 L ${-7 + swing} 26 M 5 0 L ${7 - swing} 26`} stroke={sketch ? INK : skin} strokeWidth={6} strokeLinecap="round" />
      <path d="M -14 0 Q -16 -34 -10 -46 L 10 -46 Q 16 -34 14 0 Z" fill={fill(top)} stroke={stroke} strokeWidth={2} />
      <circle cx={0} cy={-58} r={11} fill={fill(skin)} stroke={stroke} strokeWidth={2} />
      <path d="M -12 -60 Q -10 -74 0 -72 Q 12 -74 12 -58 Q 14 -40 10 -36 L 9 -58 Q 0 -66 -9 -58 Z" fill={fill(hair)} stroke={stroke} strokeWidth={1.5} />
    </g>
  );
};

const Family: React.FC<{sketch: boolean}> = ({sketch}) => {
  const f = useCurrentFrame();
  const o = prog(f, 920, 980);
  if (o <= 0) return null;
  const sw = Math.sin(f / 9) * 3;
  return (
    <g opacity={o}>
      <Person x={900} s={1} top="#efe3c8" hair="#2a1a12" skin="#c99a72" sketch={sketch} swing={sw} />
      <Person x={1000} s={1.08} top="#fbfbf6" hair="#3a2a1e" skin="#b98a62" sketch={sketch} swing={-sw} />
      <Person x={952} s={0.72} top="#f4c430" hair="#6b4426" skin="#d6a77d" sketch={sketch} swing={sw * 1.6} />
    </g>
  );
};

const Toucan: React.FC<{x: number; y: number; s: number; sketch: boolean}> = ({x, y, s, sketch}) => {
  const f = useCurrentFrame();
  const flap = Math.sin(f / 3) * 0.9;
  const stroke = sketch ? INK : 'none';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={26} ry={12} fill={sketch ? '#fff' : '#111'} stroke={stroke} strokeWidth={2} />
      <path d="M -24 -4 Q -50 -2 -56 8 Q -40 4 -22 4 Z" fill={sketch ? '#fff' : '#f39c1f'} stroke={stroke} strokeWidth={2} />
      <circle cx={-18} cy={-2} r={5} fill={sketch ? '#fff' : '#ffe14d'} stroke={stroke} strokeWidth={1.5} />
      <path d={`M -4 -4 Q 6 ${-40 * flap} 22 ${-30 * flap} L 12 -2 Z`} fill={sketch ? '#fff' : '#1a1a1a'} stroke={stroke} strokeWidth={2} />
      <path d="M 24 0 L 46 6 L 24 8 Z" fill={sketch ? '#fff' : '#111'} stroke={stroke} strokeWidth={2} />
    </g>
  );
};

const Birds: React.FC<{sketch: boolean}> = ({sketch}) => {
  const f = useCurrentFrame();
  const flights = [
    {start: 960, dur: 200, y: 260, s: 1.1},
    {start: 990, dur: 230, y: 330, s: 0.8},
    {start: 1150, dur: 210, y: 200, s: 1.3},
  ];
  return (
    <g>
      {flights.map((b, i) => {
        if (f < b.start || f > b.start + b.dur) return null;
        const x = interpolate(f, [b.start, b.start + b.dur], [2200, -300]);
        return <Toucan key={i} x={x} y={b.y + Math.sin(f / 12 + i) * 18} s={b.s} sketch={sketch} />;
      })}
    </g>
  );
};

const Dust: React.FC = () => {
  const f = useCurrentFrame();
  const o = prog(f, 500, 540) * (1 - prog(f, 840, 900));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      {Array.from({length: 40}, (_, i) => {
        const t = ((f * (0.6 + (i % 5) * 0.15) + i * 37) % 300) / 300;
        return <circle key={i} cx={560 + ((i * 97) % 800) + Math.sin(f / 20 + i) * 20} cy={810 - t * 420} r={1.5 + (i % 3)} fill="#ffe4b0" opacity={(1 - t) * 0.7} />;
      })}
    </g>
  );
};
