import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {EV, prog} from '../anim';

/** Where the frame ends up once it has shrunk onto the sheet of paper. */
export function stageTransform(f: number, width: number, height: number) {
  const vertical = height > width;
  const p = prog(f, EV.shrink[0], EV.shrink[1], Easing.inOut(Easing.cubic));
  const s = 1 - p * (vertical ? 0.42 : 0.48);
  const dx = -p * (vertical ? 0 : width * 0.2);
  const dy = -p * (vertical ? height * 0.14 : 0);
  return {p, css: `translate(${dx}px, ${dy}px) rotate(${-p * 2}deg) scale(${s})`};
}

/** Dark wooden desk under a warm lamp; only visible once the frame shrinks. */
export const Desk: React.FC = () => {
  const {width, height} = useVideoConfig();
  const grain = useMemo(
    () => Array.from({length: 60}, (_, i) => ({y: random(`g${i}`) * height, a: 6 + random(`ga${i}`) * 18, o: 0.05 + random(`go${i}`) * 0.12})),
    [height],
  );
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #3d2516 0%, #2a180d 55%, #1a0f08 100%)'}}>
      <svg width={width} height={height}>
        {grain.map((g, i) => (
          <path key={i} d={`M 0 ${g.y} C ${width * 0.3} ${g.y - g.a}, ${width * 0.6} ${g.y + g.a}, ${width} ${g.y - g.a / 2}`} stroke="#000" strokeWidth={2} fill="none" opacity={g.o} />
        ))}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 20%, rgba(255,200,130,0.35), rgba(0,0,0,0) 60%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Pencil that is set down beside the drawing, plus the seed from the opening. */
export const Pencil: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  const p = prog(f, EV.pencil - 25, EV.pencil + 10, Easing.out(Easing.cubic));
  if (p <= 0) return null;
  const x = vertical ? width * 0.9 : width * 0.33;
  const y = vertical ? height * 0.38 : height * 0.88;
  const rot = vertical ? -78 : -8;
  const seedGlow = 0.6 + Math.sin(f / 10) * 0.25;
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="pshadow"><feDropShadow dx="6" dy="10" stdDeviation="8" floodOpacity="0.5" /></filter>
        <filter id="seedglow"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      <g transform={`translate(${x + (1 - p) * 120} ${y + (1 - p) * 60}) rotate(${rot})`} opacity={p} filter="url(#pshadow)">
        <rect x={-210} y={-11} width={360} height={22} fill="#f2b632" />
        <rect x={-210} y={-11} width={360} height={7} fill="#f7cf63" />
        <rect x={-246} y={-11} width={36} height={22} rx={3} fill="#e98a9c" />
        <rect x={-214} y={-12} width={22} height={24} fill="#b8b8b8" />
        <path d="M 150 -11 L 205 0 L 150 11 Z" fill="#e4c39a" />
        <path d="M 188 -3.5 L 205 0 L 188 3.5 Z" fill="#333" />
      </g>
      <g opacity={prog(f, EV.pencil + 10, EV.pencil + 40)}>
        <circle cx={x + (vertical ? -10 : 270)} cy={y + (vertical ? 260 : 6)} r={20} fill="#ffd77a" opacity={seedGlow * 0.6} filter="url(#seedglow)" />
        <ellipse cx={x + (vertical ? -10 : 270)} cy={y + (vertical ? 260 : 6)} rx={7} ry={10} fill="#ffcf5a" />
      </g>
    </svg>
  );
};

export const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  const at = (delay: number) => interpolate(f, [EV.logo + delay, EV.logo + delay + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  if (f < EV.logo) return null;
  const item = (delay: number): React.CSSProperties => ({opacity: at(delay), transform: `translateY(${(1 - at(delay)) * 24}px)`});
  const wow = at(0);
  return (
    <div
      style={{
        position: 'absolute',
        ...(vertical ? {left: 0, right: 0, top: height * 0.72} : {left: width * 0.6, right: 40, top: 0, bottom: 0, justifyContent: 'center'}),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Heebo',
        color: '#f7efe1',
        textAlign: 'center',
      }}
    >
      <div style={{fontSize: vertical ? 170 : 190, fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1, clipPath: `inset(0 ${(1 - wow) * 100}% 0 0)`, background: 'linear-gradient(180deg, #fff6e0 0%, #e8b65c 100%)', WebkitBackgroundClip: 'text', color: 'transparent'}}>
        WOW
      </div>
      <div style={{...item(10), fontSize: 30, fontWeight: 500, letterSpacing: '0.6em', marginTop: 8, marginRight: '-0.6em'}}>PRODUCTION</div>
      <div style={{...item(18), width: 120 * at(18), height: 3, background: '#e8b65c', margin: '28px 0'}} />
      <div dir="rtl" style={{...item(26), fontSize: vertical ? 54 : 50, fontWeight: 800}}>
        אנחנו בונים חלומות מכלום.
      </div>
      <div style={{...item(40), fontSize: 30, fontWeight: 400, marginTop: 18, color: '#e8b65c', letterSpacing: '0.05em'}}>@wowprod.ai</div>
    </div>
  );
};
