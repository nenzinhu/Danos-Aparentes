import React from 'react';
import { AdFromStoryboard } from './AdComposition';
import sb30 from '../public/storyboards/video-30s.pt.json';
import type { Storyboard } from './types';

export const Ad30: React.FC = () => <AdFromStoryboard storyboard={sb30 as Storyboard} />;

const sb = sb30 as Storyboard;
export const AD30_DURATION = sb.durationInFrames;
export const AD30_FPS = sb.fps;
export const AD30_WIDTH = sb.width;
export const AD30_HEIGHT = sb.height;
