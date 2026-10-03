import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {prog} from '../anim';
import {camera} from '../camera';
import {House} from './House';
import {Atmosphere, JungleBack, JungleFront, Sky} from './Jungle';

/** The fully procedural jungle world, framed by the animated camera. */
export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  const cam = camera(frame, vertical);
  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={cam.viewBox} preserveAspectRatio="xMidYMid slice">
        <Sky sketch={false} />
        <JungleBack sketch={false} />
        <Atmosphere />
        <House sketch={false} />
        <JungleFront sketch={false} />
      </svg>
      <Rain />
    </AbsoluteFill>
  );
};

/** Screen-space rain for the opening shots. */
export const Rain: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const o = 1 - prog(frame, 240, 340);
  if (o <= 0) return null;
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 140}, (_, i) => {
        const speed = 38 + random(`rs${i}`) * 30;
        const x = random(`rx${i}`) * (width + 200) - 100;
        const y = ((random(`ry${i}`) * (height + 300) + frame * speed) % (height + 300)) - 150;
        const len = 30 + random(`rl${i}`) * 50;
        return <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke="#cfe3ea" strokeWidth={1.6} opacity={o * (0.25 + random(`ro${i}`) * 0.35)} />;
      })}
    </svg>
  );
};
