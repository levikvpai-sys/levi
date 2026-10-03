import React from 'react';
import {AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {T} from './anim';
import {Captions} from './overlays/Captions';
import {Desk, Logo, Pencil, stageTransform} from './overlays/Desk';
import {Footage, MissingShotLabel} from './overlays/Footage';
import {Grade, Letterbox, SketchFilter, sketchActive} from './overlays/Look';
import {World} from './world/World';

const VO_LENGTH = 80; // frames of music ducking per voice line

export const JungleAd: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const stage = stageTransform(frame, width, height);
  const files = new Set(getStaticFiles().map((f) => f.name));
  const voice = T.voice.filter((v) => files.has(`audio/${v.file}`));

  const musicVolume = (f: number) => {
    const ducked = voice.some((v) => f >= v.from - 6 && f < v.from + VO_LENGTH);
    return ducked ? 0.55 : 0.9;
  };

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <SketchFilter />
      {stage.p > 0 && <Desk />}
      <AbsoluteFill style={{transform: stage.css, transformOrigin: '50% 50%'}}>
        {stage.p > 0 && (
          <div style={{position: 'absolute', inset: '-3.5%', background: '#fbfaf6', boxShadow: `0 30px 80px rgba(0,0,0,${0.6 * stage.p})`}} />
        )}
        <AbsoluteFill style={{overflow: 'hidden', filter: sketchActive(frame) ? 'url(#sketch)' : undefined}}>
          <World />
          <Footage />
          <Grade />
        </AbsoluteFill>
      </AbsoluteFill>
      <Letterbox />
      <Pencil />
      <Captions />
      <Logo />
      <MissingShotLabel />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(frame, [T.durationInFrames - 20, T.durationInFrames], [0, 1], {extrapolateLeft: 'clamp'})}} />

      {files.has('audio/music.wav') && <Audio src={staticFile('audio/music.wav')} volume={musicVolume} />}
      {voice.map((v) => (
        <Sequence key={v.file} from={v.from} name={`VO ${v.file}`}>
          <Audio src={staticFile(`audio/${v.file}`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
