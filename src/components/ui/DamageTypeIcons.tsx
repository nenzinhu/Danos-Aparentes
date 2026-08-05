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

/** 🟢 SVG BADGE 1: NÍVEL 1: SUPERFICIAL — RISCO / ARRANHADO */
export function IconScratchDamageBadge({ className = '', size = 180, ...rest }: DamageIconProps) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <defs>
        <linearGradient id="green-pill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>

        <linearGradient id="red-door-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="85%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>

        <filter id="green-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="rose-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Top Green Badge Pill: NÍVEL 1: SUPERFICIAL */}
      <g filter="url(#green-glow)">
        <rect x="25" y="10" width="150" height="24" rx="12" fill="url(#green-pill-grad)" stroke="#86efac" strokeWidth="1" />
        <circle cx="37" cy="22" r="5" fill="#ffffff" />
        <circle cx="37" cy="22" r="3" fill="#22c55e" />
        <text x="48" y="26" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.04em">
          NÍVEL 1: SUPERFICIAL
        </text>
      </g>

      {/* Pedestal Base Rings */}
      <ellipse cx="100" cy="152" rx="72" ry="16" fill="none" stroke="#f43f5e" strokeWidth="2" opacity="0.6" filter="url(#rose-glow)" />
      <ellipse cx="100" cy="156" rx="64" ry="13" fill="none" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx="100" cy="160" rx="54" ry="10" fill="none" stroke="#fda4af" strokeWidth="1" opacity="0.4" />

      {/* Sphere Orb with Red Car Door Metallic Fill */}
      <circle cx="100" cy="92" r="52" fill="url(#red-door-metal)" stroke="#ffffff" strokeWidth="2.5" />

      {/* Car Door Body Line Detail */}
      <path d="M 52 75 Q 100 65 148 72" stroke="#991b1b" strokeWidth="2.5" fill="none" opacity="0.6" />
      <path d="M 52 110 Q 100 120 148 108" stroke="#450a0a" strokeWidth="3" fill="none" opacity="0.8" />

      {/* Scratch Marks (3 Claw Gouges) */}
      <g stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.95">
        <path d="M 65 118 C 80 95 105 70 135 52" />
        <path d="M 75 125 C 92 100 118 75 142 60" strokeWidth="4" />
        <path d="M 88 130 C 105 108 128 85 148 72" strokeWidth="3" />
      </g>
      <g stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round">
        <path d="M 65 118 C 80 95 105 70 135 52" />
        <path d="M 75 125 C 92 100 118 75 142 60" />
        <path d="M 88 130 C 105 108 128 85 148 72" />
      </g>

      {/* Flying Paint / Chip Particles */}
      <polygon points="78,92 84,88 82,96" fill="#ffffff" opacity="0.9" />
      <polygon points="112,78 118,74 116,82" fill="#ffffff" opacity="0.9" />
      <polygon points="128,68 134,64 132,72" fill="#ffffff" opacity="0.9" />

      {/* Glass Sphere Arc Highlight */}
      <path d="M 62 68 A 44 44 0 0 1 138 68" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" fill="none" />

      {/* Bottom Text Label */}
      <text x="100" y="195" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.06em">
        RISCO /
      </text>
      <text x="100" y="213" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.06em">
        ARRANHADO
      </text>
    </svg>
  );
}

/** 🟠 SVG BADGE 2: NÍVEL 2: ESTRUTURAL — AMASSADO / DEFORMADO */
export function IconDentDamageBadge({ className = '', size = 180, ...rest }: DamageIconProps) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <defs>
        <linearGradient id="amber-pill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="blue-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor="#2563eb" />
          <stop offset="75%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <radialGradient id="dent-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#1e3a8a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </radialGradient>

        <filter id="amber-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="cyan-glow-2" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Top Amber Badge Pill: NÍVEL 2: ESTRUTURAL */}
      <g filter="url(#amber-glow)">
        <rect x="25" y="10" width="150" height="24" rx="12" fill="url(#amber-pill-grad)" stroke="#fde047" strokeWidth="1" />
        <circle cx="37" cy="22" r="5" fill="#ffffff" />
        <circle cx="37" cy="22" r="3" fill="#f59e0b" />
        <text x="48" y="26" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.04em">
          NÍVEL 2: ESTRUTURAL
        </text>
      </g>

      {/* Pedestal Base Rings */}
      <ellipse cx="100" cy="152" rx="72" ry="16" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.85" filter="url(#cyan-glow-2)" />
      <ellipse cx="100" cy="156" rx="64" ry="13" fill="none" stroke="#0284c7" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="100" cy="160" rx="54" ry="10" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.4" />

      {/* Sphere Orb with Blue Metallic Car Body Fill */}
      <circle cx="100" cy="92" r="52" fill="url(#blue-metal-grad)" stroke="#93c5fd" strokeWidth="2" />

      {/* Blue Panel Body Contour Lines */}
      <path d="M 52 65 C 80 50 120 50 148 65" stroke="#1d4ed8" strokeWidth="3" fill="none" opacity="0.5" />
      <path d="M 52 120 C 80 135 120 135 148 120" stroke="#1e3a8a" strokeWidth="3" fill="none" opacity="0.7" />

      {/* Deep Concave Dent Deformation (Shadow & Rim Shading) */}
      <ellipse cx="110" cy="95" rx="32" ry="24" fill="url(#dent-shadow)" />
      <path d="M 80 80 C 70 95 80 115 110 118 C 135 120 142 105 138 90 C 132 75 110 70 95 76" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M 86 85 C 78 98 86 110 108 112 C 128 114 132 102 128 92" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

      {/* Glass Arc Highlight */}
      <path d="M 62 68 A 44 44 0 0 1 138 68" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" fill="none" />

      {/* Bottom Text Label */}
      <text x="100" y="195" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.06em">
        AMASSADO /
      </text>
      <text x="100" y="213" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.06em">
        DEFORMADO
      </text>
    </svg>
  );
}

/** 🔴 SVG BADGE 3: NÍVEL 3: CRÍTICO — QUEBRADO / TRINCADO */
export function IconBrokenGlassSphere({ className = '', size = 180, ...rest }: DamageIconProps) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <defs>
        {/* Red Pill Badge Gradient */}
        <linearGradient id="red-pill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        {/* Glass Orb Gradient */}
        <radialGradient id="glass-orb-grad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="85%" stopColor="#0284c7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
        </radialGradient>

        {/* Outer Halo Glow Filter */}
        <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="red-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Top Red Badge Pill: NÍVEL 3: CRÍTICO */}
      <g filter="url(#red-glow)">
        <rect x="35" y="10" width="130" height="24" rx="12" fill="url(#red-pill-grad)" stroke="#fca5a5" strokeWidth="1" />
        <circle cx="47" cy="22" r="5" fill="#ffffff" />
        <circle cx="47" cy="22" r="3" fill="#ef4444" />
        <text x="58" y="26" fill="#ffffff" fontSize="9.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.04em">
          NÍVEL 3: CRÍTICO
        </text>
      </g>

      {/* Holographic Pedestal / Base Rings */}
      <ellipse cx="100" cy="152" rx="72" ry="16" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.85" filter="url(#cyan-glow)" />
      <ellipse cx="100" cy="156" rx="64" ry="13" fill="none" stroke="#0284c7" strokeWidth="1.5" opacity="0.6" />
      <ellipse cx="100" cy="160" rx="54" ry="10" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.4" />

      {/* Central Glass Orb */}
      <circle cx="100" cy="92" r="52" fill="url(#glass-orb-grad)" stroke="#38bdf8" strokeWidth="2" filter="url(#cyan-glow)" />

      {/* Glass Orb Top Highlight Arc */}
      <path d="M 62 70 A 44 44 0 0 1 138 70" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" fill="none" />

      {/* Central Impact Point */}
      <circle cx="100" cy="92" r="4.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.2" />

      {/* Shattered Glass Crack Lines (Spiderweb Radial Fractures) */}
      <g stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 100 92 L 68 55 M 100 92 L 132 58 M 100 92 L 140 102 M 100 92 L 128 130 M 100 92 L 72 128 M 100 92 L 58 98 M 100 92 L 100 44 M 100 92 L 100 142" />
        {/* Jagged Spiderweb Cross Lines */}
        <path d="M 85 75 L 100 70 L 115 74 L 122 92 L 114 110 L 100 115 L 86 110 L 78 92 Z" fill="none" strokeWidth="1.5" />
        <path d="M 75 62 L 100 56 L 125 61 L 132 92 L 122 122 L 100 128 L 78 122 L 68 92 Z" fill="none" strokeWidth="1.2" />
      </g>

      {/* White Highlight Overlay on Fractures */}
      <g stroke="#ffffff" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d="M 100 92 L 68 55 M 100 92 L 132 58 M 100 92 L 140 102 M 100 92 L 128 130 M 100 92 L 72 128 M 100 92 L 58 98 M 100 92 L 100 44 M 100 92 L 100 142" />
        <path d="M 85 75 L 100 70 L 115 74 L 122 92 L 114 110 L 100 115 L 86 110 L 78 92 Z" fill="none" />
      </g>

      {/* Flying Shards (Triangular Glass Particles) */}
      <polygon points="76,68 83,64 81,72" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" opacity="0.9" />
      <polygon points="120,68 126,74 118,76" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" opacity="0.9" />
      <polygon points="72,112 78,118 70,120" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" opacity="0.9" />
      <polygon points="124,110 130,114 122,120" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" opacity="0.9" />

      {/* Bottom Text Label */}
      <text x="100" y="195" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.06em">
        QUEBRADO /
      </text>
      <text x="100" y="213" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.06em">
        TRINCADO
      </text>
    </svg>
  );
}
