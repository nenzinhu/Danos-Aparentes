import React from 'react';
import { AdFromStoryboard } from './AdComposition';
import sb15 from '../public/storyboards/video-15s.pt.json';
import type { Storyboard } from './types';

export const Ad15: React.FC = () => <AdFromStoryboard storyboard={sb15 as Storyboard} />;

const sb = sb15 as Storyboard;
export const AD15_DURATION = sb.durationInFrames;
export const AD15_FPS = sb.fps;
export const AD15_WIDTH = sb.width;
export const AD15_HEIGHT = sb.height;
