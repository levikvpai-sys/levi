import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/800.css';
import '@fontsource/heebo/900.css';
import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import {T} from './anim';
import {JungleAd} from './JungleAd';

const fontHandle = delayRender('Loading Heebo');
Promise.all([400, 500, 800, 900].map((w) => document.fonts.load(`${w} 40px Heebo`, 'אבג ABC')))
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="JungleAd" component={JungleAd} durationInFrames={T.durationInFrames} fps={T.fps} width={1920} height={1080} />
    <Composition id="JungleAdVertical" component={JungleAd} durationInFrames={T.durationInFrames} fps={T.fps} width={1080} height={1920} />
  </>
);
