import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {T} from '../anim';

type Cap = {from: number; to: number; text: string; dark?: boolean};

const Line: React.FC<{cap: Cap; vertical: boolean}> = ({cap, vertical}) => {
  const f = useCurrentFrame();
  const words = cap.text.split(' ');
  const out = interpolate(f, [cap.to - 14, cap.to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: vertical ? 330 : 120,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0 0.32em',
        fontFamily: 'Heebo',
        fontWeight: 800,
        fontSize: vertical ? 78 : 66,
        letterSpacing: '-0.01em',
        color: cap.dark ? '#1a1a1a' : '#fff',
        textShadow: cap.dark ? 'none' : '0 4px 28px rgba(0,0,0,0.55)',
        opacity: out,
      }}
    >
      {words.map((w, i) => {
        const p = interpolate(f, [cap.from + i * 6, cap.from + i * 6 + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: `blur(${(1 - p) * 10}px)`}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  return (
    <>
      {(T.captions as Cap[])
        .filter((c) => f >= c.from && f < c.to)
        .map((c) => (
          <Line key={c.from} cap={c} vertical={vertical} />
        ))}
    </>
  );
};
