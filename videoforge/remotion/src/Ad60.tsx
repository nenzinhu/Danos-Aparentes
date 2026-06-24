import React from 'react';
import { AdFromStoryboard } from './AdComposition';
import sb60 from '../public/storyboards/video-60s.pt.json';
import type { Storyboard } from './types';

export const Ad60: React.FC = () => <AdFromStoryboard storyboard={sb60 as Storyboard} />;

const sb = sb60 as Storyboard;
export const AD60_DURATION = sb.durationInFrames;
export const AD60_FPS = sb.fps;
export const AD60_WIDTH = sb.width;
export const AD60_HEIGHT = sb.height;
