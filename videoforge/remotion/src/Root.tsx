import React from 'react';
import { Composition } from 'remotion';
import { Ad15, AD15_DURATION, AD15_FPS, AD15_HEIGHT, AD15_WIDTH } from './Ad15';
import { Ad30, AD30_DURATION, AD30_FPS, AD30_HEIGHT, AD30_WIDTH } from './Ad30';
import { Ad60, AD60_DURATION, AD60_FPS, AD60_HEIGHT, AD60_WIDTH } from './Ad60';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Ad15"
      component={Ad15}
      durationInFrames={AD15_DURATION}
      fps={AD15_FPS}
      width={AD15_WIDTH}
      height={AD15_HEIGHT}
      defaultProps={{}}
    />
    <Composition
      id="Ad30"
      component={Ad30}
      durationInFrames={AD30_DURATION}
      fps={AD30_FPS}
      width={AD30_WIDTH}
      height={AD30_HEIGHT}
      defaultProps={{}}
    />
    <Composition
      id="Ad60"
      component={Ad60}
      durationInFrames={AD60_DURATION}
      fps={AD60_FPS}
      width={AD60_WIDTH}
      height={AD60_HEIGHT}
      defaultProps={{}}
    />
  </>
);
