import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EV, prog} from '../anim';

/**
 * SVG filter that drains color and then turns whatever is underneath
 * (AI footage or the placeholder world) into a pencil sketch via edge detection.
 */
export const SketchFilter: React.FC = () => {
  const f = useCurrentFrame();
  const desat = prog(f, EV.desaturate[0], EV.desaturate[1]);
  const sketch = prog(f, EV.sketch[0], EV.sketch[1]);
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <filter id="sketch" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="saturate" values={String(1 - desat)} result="base" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" result="gray" />
        <feGaussianBlur in="gray" stdDeviation="1.1" result="soft" />
        <feConvolveMatrix in="soft" order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" result="edges" />
        <feComponentTransfer in="edges" result="ink">
          <feFuncR type="linear" slope="-5" intercept="1" />
          <feFuncG type="linear" slope="-5" intercept="1" />
          <feFuncB type="linear" slope="-5" intercept="0.98" />
        </feComponentTransfer>
        <feComposite in="base" in2="ink" operator="arithmetic" k1="0" k2={String(1 - sketch)} k3={String(sketch)} k4="0" />
      </filter>
    </svg>
  );
};

export const sketchActive = (f: number) => f >= EV.desaturate[0];

/** Vignette, warm grade in the "life" act, and film grain. */
export const Grade: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const warm = prog(f, 880, 960) * (1 - prog(f, 1330, 1420));
  const fadeIn = interpolate(f, [0, 20], [1, 0], {extrapolateRight: 'clamp'});
  const sketch = prog(f, EV.sketch[0], EV.sketch[1]);
  const grain = 0.12 * (1 - prog(f, EV.desaturate[0] - 20, EV.desaturate[0]));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)', opacity: 1 - sketch}} />
      <AbsoluteFill style={{background: '#ffb35c', mixBlendMode: 'soft-light', opacity: warm * 0.35}} />
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: grain}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: '#000', opacity: fadeIn}} />
    </AbsoluteFill>
  );
};

/** Cinematic letterbox on the 16:9 cut; slides away when the frame shrinks onto the paper. */
export const Letterbox: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  if (height > width) return null;
  const bar = 60 * (1 - prog(f, EV.shrink[0] - 30, EV.shrink[0]));
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: '#000'}} />
    </>
  );
};
