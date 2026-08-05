import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import type { OnscreenKind } from './types';

const SAFE_TOP = 108;
const SAFE_BOTTOM = 108;

interface Props {
  kind: OnscreenKind;
  text: string;
  primary: string;
  textColor: string;
  muted: string;
  shotIndex: number;
}

export const TextOverlay: React.FC<Props> = ({ kind, text, primary, textColor, muted, shotIndex }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, 1000], [0, 1, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(frame, [0, 12], [24, 0], { extrapolateRight: 'clamp' });

  const base: React.CSSProperties = {
    position: 'absolute',
    left: 48,
    right: 48,
    opacity,
    transform: `translateY(${y}px)`,
    fontFamily: 'Outfit, system-ui, sans-serif',
    zIndex: 20,
  };

  if (kind === 'headline') {
    return (
      <div style={{ ...base, top: SAFE_TOP + 40, textAlign: 'center', left: 32, right: 32 }}>
        <p style={{ margin: 0, fontSize: 56, fontWeight: 800, lineHeight: 1.1, color: textColor }}>
          {text}
        </p>
        <div
          style={{
            margin: '20px auto 0',
            width: 64,
            height: 4,
            borderRadius: 2,
            background: primary,
          }}
        />
      </div>
    );
  }

  if (kind === 'step') {
    return (
      <div style={{ ...base, bottom: SAFE_BOTTOM + 80 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            borderRadius: 12,
            background: 'rgba(31,182,255,0.15)',
            border: `1px solid ${primary}55`,
            color: primary,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {text}
        </span>
      </div>
    );
  }

  if (kind === 'bullet') {
    const parts = text.split('·').map((s) => s.trim());
    return (
      <div style={{ ...base, bottom: SAFE_BOTTOM + 60, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {parts.map((p) => (
          <span
            key={p}
            style={{
              padding: '12px 18px',
              borderRadius: 999,
              background: 'rgba(10,20,40,0.85)',
              border: `1px solid ${primary}33`,
              color: textColor,
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {p}
          </span>
        ))}
      </div>
    );
  }

  if (kind === 'badge') {
    return (
      <div style={{ ...base, top: '42%', left: 0, right: 0, textAlign: 'center' }}>
        <span
          style={{
            padding: '16px 32px',
            borderRadius: 16,
            background: 'rgba(34,197,94,0.2)',
            border: '2px solid #22c55e',
            color: '#86efac',
            fontSize: 40,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {text}
        </span>
      </div>
    );
  }

  if (kind === 'grid') {
    return (
      <div style={{ ...base, top: '40%', left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 600, margin: '0 auto' }}>
          {['🚗', '🏍️', '🚛', '🚐', '🚌', '⚙️'].map((icon) => (
            <span
              key={icon}
              style={{
                width: 72,
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                borderRadius: 16,
                background: 'rgba(10,20,40,0.85)',
                border: `1px solid ${primary}33`,
              }}
            >
              {icon}
            </span>
          ))}
        </div>
        <p style={{ marginTop: 20, fontSize: 28, fontWeight: 700, color: textColor }}>{text}</p>
      </div>
    );
  }

  if (kind === 'cta') {
    const lines = text.split('+').map((s) => s.trim());
    return (
      <div
        style={{
          ...base,
          bottom: SAFE_BOTTOM + 48,
          left: 40,
          right: 40,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            padding: '20px 40px',
            borderRadius: 20,
            background: `linear-gradient(135deg, ${primary} 0%, #72C5EE 100%)`,
            color: '#fff',
            fontSize: 36,
            fontWeight: 800,
            boxShadow: `0 20px 60px ${primary}44`,
          }}
        >
          {lines[0] ?? text}
        </div>
        {lines[1] && (
          <p style={{ margin: 0, fontSize: 26, color: muted, fontWeight: 600 }}>{lines[1]}</p>
        )}
        <p style={{ margin: '8px 0 0', fontSize: 20, color: muted, opacity: 0.8 }}>danosaparentes.vercel.app</p>
      </div>
    );
  }

  return (
    <div style={{ ...base, top: SAFE_TOP, color: textColor, fontSize: 32 }}>
      {text}
    </div>
  );
};

interface LogoMarkProps {
  primary: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ primary }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 20], [0.85, 1], { extrapolateRight: 'clamp' });
  const glow = interpolate(frame, [0, 30], [0.3, 0.6], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
      <div style={{ transform: `scale(${scale})`, textAlign: 'center' }}>
        <Img
          src={staticFile('logo.svg')}
          style={{
            width: 200,
            height: 200,
            objectFit: 'contain',
            filter: `drop-shadow(0 0 40px rgba(31,182,255,${glow}))`,
          }}
        />
        <p
          style={{
            marginTop: 24,
            fontSize: 42,
            fontWeight: 800,
            color: '#e8f4ff',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Danos Aparentes
        </p>
      </div>
    </AbsoluteFill>
  );
};

interface BgProps {
  shotIndex: number;
  totalShots: number;
  onscreenKind: string;
  bg: string;
  gradient: string;
  primary: string;
}

function pickVisual(shotIndex: number, totalShots: number, kind: string): string {
  if (kind === 'cta') return 'cta';
  if (kind === 'grid') return 'vehicles';
  if (kind === 'badge' && kind.includes('WhatsApp')) return 'whatsapp';
  if (totalShots <= 3) {
    return ['hook', 'phone', 'cta'][shotIndex] ?? 'hook';
  }
  const longForm = ['hook', 'plate', 'phone', 'vehicles', 'pdf', 'whatsapp', 'offline', 'cta'];
  return longForm[shotIndex] ?? 'hook';
}

export const ShotBackground: React.FC<BgProps> = ({
  shotIndex,
  totalShots,
  onscreenKind,
  bg,
  gradient,
  primary,
}) => {
  const visual = pickVisual(shotIndex, totalShots, onscreenKind);
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 300], [0, 1], { extrapolateRight: 'extend' });
  const accents = [
    { x: '20%', y: '15%', c: primary, o: 0.12 },
    { x: '80%', y: '70%', c: '#72C5EE', o: 0.08 },
    { x: '50%', y: '45%', c: '#7c3aed', o: visual === 'offline' ? 0.06 : 0.03 },
  ];

  return (
    <AbsoluteFill style={{ background: bg }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 120% 80% at 50% ${10 + drift * 5}%, ${gradient} 0%, ${bg} 55%, #020408 100%)`,
        }}
      />
      {accents.map((a, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: a.x,
            top: a.y,
            width: 400,
            height: 400,
            marginLeft: -200,
            marginTop: -200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${a.c}${Math.round(a.o * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            transform: `translate(${Math.sin(drift * Math.PI * 2 + i) * 20}px, ${Math.cos(drift * Math.PI + i) * 15}px)`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,170,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,170,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.5,
        }}
      />
      {visual === 'hook' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: 0.35 }}>
          <div style={{ fontSize: 120 }}>📋</div>
        </AbsoluteFill>
      )}
      {visual === 'plate' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              padding: '24px 40px',
              borderRadius: 16,
              background: 'rgba(5,15,35,0.9)',
              border: `2px solid ${primary}55`,
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: 6,
              color: '#e8f4ff',
            }}
          >
            ABC1D23
          </div>
        </AbsoluteFill>
      )}
      {visual === 'phone' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              width: 280,
              height: 520,
              borderRadius: 32,
              border: `3px solid ${primary}66`,
              background: 'rgba(5,15,35,0.9)',
              boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 40px ${primary}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 80,
            }}
          >
            🚗
          </div>
        </AbsoluteFill>
      )}
      {visual === 'pdf' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              width: 320,
              height: 440,
              borderRadius: 12,
              background: '#fff',
              color: '#111',
              padding: 24,
              fontSize: 14,
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>LAUDO DE VISTORIA</div>
            <div style={{ color: '#666', marginBottom: 12 }}>Hash SHA-256 · QR verificável</div>
            <div style={{ width: 80, height: 80, background: '#eee', margin: '0 auto' }} />
          </div>
        </AbsoluteFill>
      )}
      {visual === 'offline' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 40, flexDirection: 'row' }}>
          <span style={{ fontSize: 100, opacity: 0.5 }}>📡</span>
          <span style={{ fontSize: 60, color: '#22c55e' }}>→</span>
          <span style={{ fontSize: 100 }}>☁️</span>
        </AbsoluteFill>
      )}
      {visual === 'whatsapp' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: 140, filter: 'drop-shadow(0 0 30px #22c55e88)' }}>💬</div>
        </AbsoluteFill>
      )}
      {visual === 'vehicles' && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: 0.25 }}>
          <div style={{ fontSize: 64, letterSpacing: 12 }}>🚗 🏍️ 🚛 🚐 🚌</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
