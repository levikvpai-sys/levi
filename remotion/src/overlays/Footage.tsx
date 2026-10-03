import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {T} from '../anim';

const EXT = ['mp4', 'mov', 'webm'];

/** Path (relative to public/) of the generated clip for a shot, if it has been dropped in. */
export function footageFor(id: string): string | null {
  const names = new Set(getStaticFiles().map((f) => f.name));
  for (const ext of EXT) {
    const name = `footage/${id}.${ext}`;
    if (names.has(name)) return name;
  }
  return null;
}

const Clip: React.FC<{src: string; duration: number}> = ({src, duration}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  // Slow push-in so even a static AI shot keeps moving through the cut.
  const scale = interpolate(frame, [0, duration], [1.02, 1.08]);
  return (
    <AbsoluteFill style={{opacity}}>
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} />
    </AbsoluteFill>
  );
};

/** Lays every available AI clip over the procedural placeholder world. */
export const Footage: React.FC = () => (
  <>
    {T.shots.map((s) => {
      const src = footageFor(s.id);
      if (!src) return null;
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.duration} name={`shot ${s.id}`}>
          <Clip src={src} duration={s.duration} />
        </Sequence>
      );
    })}
  </>
);

/** Small corner tag naming the shot that still needs a generated clip. */
export const MissingShotLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = T.shots.find((s) => frame >= s.from && frame < s.from + s.duration);
  if (!shot || footageFor(shot.id) || frame >= T.events.shrink[0]) return null;
  return (
    <div style={{position: 'absolute', top: 24, left: 24, padding: '8px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.45)', color: '#fff', fontFamily: 'Heebo', fontSize: 22, direction: 'rtl', opacity: 0.85}}>
      ממלא מקום · footage/{shot.id}.mp4
    </div>
  );
};
