import type { SVGProps } from 'react';

interface DamageIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/** Realistic steel-panel gradient shared by all three icons — self-contained per icon (unique id) so they never depend on defs rendered elsewhere on the page. */
function PanelDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="45%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
  );
}

/** Asymmetric car-panel silhouette (fender-like, cut corner) — same base shape across all three icons so they read as one family. */
const PANEL_D =
  'M21,4 L48,6 C54,6.5 58,11 57,17 L55,36 C54.5,41 50,44.5 44,44 L17,42.5 C11,42 7,37 7.5,31 L9,15 C9.5,9.5 14,4.5 21,4 Z';

/** Riscos / Abrasão — metal panel raked with parallel scratch scuffs. */
export function IconScratchDamage({ className = '', size = 32, ...rest }: DamageIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 48" className={className} aria-hidden="true" {...rest}>
      <PanelDefs id="scratch" />
      <path d={PANEL_D} fill="url(#scratch-metal)" stroke="#1e293b" strokeWidth="1.25" />
      <path
        d="M19,15 L34,33 M27,12 L42,30 M35,10.5 L48,27"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M19,15 L34,33 M27,12 L42,30 M35,10.5 L48,27"
        stroke="#fff"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.5"
        transform="translate(-0.5,-0.5)"
      />
    </svg>
  );
}

/** Deformação — panel pressed inward with a real dent silhouette + shading rings. */
export function IconDentDamage({ className = '', size = 32, ...rest }: DamageIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 48" className={className} aria-hidden="true" {...rest}>
      <PanelDefs id="dent" />
      <radialGradient id="dent-well" cx="42%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
      </radialGradient>
      <path
        d="M21,4 L48,6 C54,6.5 58,11 57,17 C50,15 44,18.5 43,25 C42,31.5 47,36 55,35.5 C53.5,40 49.5,43.8 44,44 L17,42.5 C11,42 7,37 7.5,31 L9,15 C9.5,9.5 14,4.5 21,4 Z"
        fill="url(#dent-metal)"
        stroke="#1e293b"
        strokeWidth="1.25"
      />
      <ellipse cx="41" cy="25" rx="15" ry="13" fill="url(#dent-well)" />
      <path d="M40,14 C35,17 32,21 32,25.5 C32,30 35,34 39,36.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" fill="none" />
      <path d="M45,13.5 C40,17 37,21 37,25.5 C37,30 40,33.5 44,36" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" fill="none" />
    </svg>
  );
}

/** Dano / Fratura — panel split apart along a jagged break, with a loose chip. */
export function IconBrokenDamage({ className = '', size = 32, ...rest }: DamageIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 48" className={className} aria-hidden="true" {...rest}>
      <PanelDefs id="broken" />
      <clipPath id="broken-clip">
        <path d={PANEL_D} />
      </clipPath>
      <g clipPath="url(#broken-clip)">
        <rect x="0" y="0" width="64" height="48" fill="url(#broken-metal)" />
        <path d="M30,2 L25,13 L34,19 L23,27 L33,34 L27,46 L-2,46 L-2,2 Z" fill="#0f172a" opacity="0.22" />
        <path d="M33,2 L28,13 L37,19 L26,27 L36,34 L30,46 L66,46 L66,2 Z" fill="#0f172a" opacity="0.08" transform="translate(3,0)" />
      </g>
      <path d={PANEL_D} fill="none" stroke="#1e293b" strokeWidth="1.25" />
      <path
        d="M30,2 L25,13 L34,19 L23,27 L33,34 L27,46"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M17,22 L10,19.5 L11,26.5 Z" fill="currentColor" opacity="0.85" stroke="#1e293b" strokeWidth="0.5" />
    </svg>
  );
}
