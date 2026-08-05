import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { ShotBackground, TextOverlay, LogoMark } from './components/Scene';
import type { Storyboard } from './types';

export function AdFromStoryboard({ storyboard: sb }: { storyboard: Storyboard }) {
  const { palette, cta } = sb.brand;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg }}>
      {sb.shots.map((shot, i) => (
        <Sequence key={shot.id} from={shot.fromFrame} durationInFrames={shot.frames} name={`Shot ${shot.id}`}>
          <ShotBackground
            shotIndex={i}
            totalShots={sb.shots.length}
            onscreenKind={shot.onscreen.kind}
            bg={palette.bg}
            gradient={palette.bgGradient}
            primary={palette.primary}
          />
          {shot.onscreen.kind === 'cta' ? (
            <>
              <LogoMark primary={palette.primary} />
              <TextOverlay
                kind="cta"
                text={`${cta.primary} + ${cta.secondary.replace(' de crédito', '')}`}
                primary={palette.primary}
                textColor={palette.text}
                muted={palette.textMuted}
                shotIndex={i}
              />
            </>
          ) : (
            <TextOverlay
              kind={shot.onscreen.kind}
              text={shot.onscreen.text}
              primary={palette.primary}
              textColor={palette.text}
              muted={palette.textMuted}
              shotIndex={i}
            />
          )}
          {shot.voFile && <Audio src={staticFile(shot.voFile)} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

export function adMeta(sb: Storyboard) {
  return {
    durationInFrames: sb.durationInFrames,
    fps: sb.fps,
    width: sb.width,
    height: sb.height,
  };
}
