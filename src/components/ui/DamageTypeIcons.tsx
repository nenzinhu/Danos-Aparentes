'use client';
import { useId, type SVGProps } from 'react';

interface DamageIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  /** When true, accent strokes pulse gently (respects prefers-reduced-motion via CSS). */
  animated?: boolean;
}

function uid(prefix: string, reactId: string) {
  return `${prefix}-${reactId.replace(/:/g, '')}`;
}

/**
 * Shared car-body panel silhouette — same family across all three icons
 * so the inspector reads “type of damage on metal”, not three unrelated glyphs.
 */
const PANEL =
  'M14,6 H46 C52,6 56,10 56,16 V34 C56,40 52,44 46,44 H14 C8,44 4,40 4,34 V16 C4,10 8,6 14,6 Z';

/** Riscos / Arranhado — parallel scrape grooves catching light across a steel panel. */
export function IconScratchDamage({ className = '', size = 32, animated = false, ...rest }: DamageIconProps) {
  const rid = useId();
  const metal = uid('scratch-metal', rid);
  const sheen = uid('scratch-sheen', rid);
  const glow = uid('scratch-glow', rid);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 50"
      className={`damage-icon damage-icon--scratch ${animated ? 'damage-icon--live' : ''} ${className}`}
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id={metal} x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="40%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={sheen} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
          <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={PANEL} fill={`url(#${metal})`} stroke="#0f172a" strokeWidth="1.35" />
      {/* soft panel highlight */}
      <path
        d="M12,12 H48 C50,12 51,13.5 50.5,15.5 L48,22 H12 C10.5,22 10,20 10.5,18 Z"
        fill="#ffffff"
        opacity="0.18"
      />

      <g className="damage-icon__mark" filter={`url(#${glow})`} strokeLinecap="round">
        <path d="M16,16 L40,36" stroke={`url(#${sheen})`} strokeWidth="3.2" />
        <path d="M22,13 L46,33" stroke={`url(#${sheen})`} strokeWidth="2.6" opacity="0.9" />
        <path d="M28,11 L50,30" stroke={`url(#${sheen})`} strokeWidth="2.1" opacity="0.75" />
        {/* bright core lines */}
        <path d="M16,16 L40,36" stroke="#fff7ed" strokeWidth="0.9" opacity="0.7" />
        <path d="M22,13 L46,33" stroke="#fff7ed" strokeWidth="0.75" opacity="0.55" />
      </g>
    </svg>
  );
}

/** Amassado / Deformado — concave impact crater with depth rings. */
export function IconDentDamage({ className = '', size = 32, animated = false, ...rest }: DamageIconProps) {
  const rid = useId();
  const metal = uid('dent-metal', rid);
  const well = uid('dent-well', rid);
  const rim = uid('dent-rim', rid);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 50"
      className={`damage-icon damage-icon--dent ${animated ? 'damage-icon--live' : ''} ${className}`}
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id={metal} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id={well} cx="42%" cy="44%" r="55%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#1e293b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={rim} cx="58%" cy="38%" r="45%">
          <stop offset="0%" stopColor="#fdba74" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Panel warped inward on the right */}
      <path
        d="M14,6 H42 C50,6 55,11 54,18 C46,17 40,20 39,27 C38,34 44,38 53,37.5 C51.5,42 47,44 42,44 H14 C8,44 4,40 4,34 V16 C4,10 8,6 14,6 Z"
        fill={`url(#${metal})`}
        stroke="#0f172a"
        strokeWidth="1.35"
      />
      <ellipse cx="40" cy="26" rx="14" ry="12" fill={`url(#${well})`} />
      <ellipse cx="43" cy="22" rx="9" ry="7" fill={`url(#${rim})`} />

      <g className="damage-icon__mark" fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M39,14 C33,18 30,22 30,27 C30,32 34,36 39,39" strokeWidth="1.5" opacity="0.45" />
        <path d="M43,13 C36,18 34,22 34,27 C34,32 37,36 42,38.5" strokeWidth="2.1" opacity="0.9" />
        <path d="M46,15 C41,19 39,23 39,27 C39,31 41,34 45,36.5" strokeWidth="1.3" opacity="0.55" />
      </g>
    </svg>
  );
}

/** Quebrado / Trincado — panel split along a jagged fracture with a loose chip. */
export function IconBrokenDamage({ className = '', size = 32, animated = false, ...rest }: DamageIconProps) {
  const rid = useId();
  const metal = uid('broken-metal', rid);
  const clip = uid('broken-clip', rid);
  const crack = uid('broken-crack', rid);

  const crackPath = 'M30,5 L25,14 L34,20 L22,28 L33,35 L26,45';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 50"
      className={`damage-icon damage-icon--broken ${animated ? 'damage-icon--live' : ''} ${className}`}
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id={metal} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <clipPath id={clip}>
          <path d={PANEL} />
        </clipPath>
        <linearGradient id={crack} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="60" height="50" fill={`url(#${metal})`} />
        {/* Left half darker — separation */}
        <path d="M30,5 L25,14 L34,20 L22,28 L33,35 L26,45 L0,45 L0,5 Z" fill="#0f172a" opacity="0.28" />
        {/* Right half slightly shifted */}
        <path
          d="M33,5 L28,14 L37,20 L25,28 L36,35 L29,45 L60,45 L60,5 Z"
          fill="#0f172a"
          opacity="0.1"
          transform="translate(2.5,0)"
        />
      </g>

      <path d={PANEL} fill="none" stroke="#0f172a" strokeWidth="1.35" />

      <g className="damage-icon__mark">
        <path
          d={crackPath}
          stroke={`url(#${crack})`}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={crackPath}
          stroke="#fecaca"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
        {/* Loose chip */}
        <path
          d="M15,23 L8,20 L9.5,28 Z"
          className="damage-icon__chip"
          fill="currentColor"
          stroke="#0f172a"
          strokeWidth="0.6"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
