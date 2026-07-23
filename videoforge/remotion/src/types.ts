export type OnscreenKind = 'headline' | 'step' | 'bullet' | 'badge' | 'cta' | 'grid';

export interface StoryboardShot {
  id: string;
  title: string;
  durationSec: number;
  frames: number;
  fromFrame: number;
  toFrame: number;
  slot: string;
  vo: string;
  onscreen: { kind: OnscreenKind; text: string };
  flags: string[];
  voFile: string | null;
}

export interface Storyboard {
  id: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  durationSec: number;
  brand: {
    name: string;
    tagline: string;
    palette: Record<string, string>;
    cta: { primary: string; secondary: string; url: string };
  };
  shots: StoryboardShot[];
}
