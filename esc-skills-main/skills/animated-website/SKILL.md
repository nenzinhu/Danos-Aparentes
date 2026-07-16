---
name: animated-website
description: |
  Build or upgrade marketing/product websites with intentional motion: hero choreography,
  scroll reveals, micro-interactions, and performance-safe animation. Use when the user
  says "animated website", "site animado", "landing animada", "Apple-style motion",
  "scroll storytelling", or wants a page that feels alive without becoming a motion demo.
  Composes frontend-design + animation-systems + GSAP/animejs + emilkowalski-motion.
version: "1.0.0"
updated: "2026-07-16"
---

# Animated Website

Ship websites where **motion creates hierarchy and presence** — not noise.

## Upstream skills (read when needed)

| Skill | When |
|---|---|
| `frontend-design` | Visual direction, typography, layout, anti-slop |
| `animation-systems` | Product-grade motion principles (Stripe/Linear/Apple) |
| `emilkowalski-motion` | Polish after layout exists |
| `gsap` / `gsap-scrolltrigger` | Scroll timelines, pin, scrub |
| `animejs` | Lightweight timelines / staggers already in repo |
| `responsive-design` | Mobile parity |
| `core-web-vitals` | Keep LCP/CLS healthy |
| `guimkt-landing-page` | Conversion-structured landing (if marketing) |

Load the relevant `SKILL.md` before coding non-trivial motion.

## Hard rules (composition)

1. **One composition in the first viewport** — brand, one headline, one supporting line, one CTA group, one dominant visual. No stats strips, card grids, or promo chips in the hero.
2. **Brand first** — product name is hero-level; headline must not overpower brand.
3. **Full-bleed hero** — edge-to-edge visual plane; no inset media cards in the hero.
4. **No hero overlays** — no floating badges, pills, or callout stickers on media.
5. **Cards only for interaction** — default: no cards.
6. **Ship 2–3 intentional motions** minimum for visually led work; delete the rest.
7. **Respect `prefers-reduced-motion`** — instant state or opacity-only fallbacks.
8. **Avoid AI-default looks** — no purple-on-white, cream+terracotta cliché, broadsheet hairlines, glow soup, emoji decoration.

## Motion budget (pick a lane)

### Lane A — Product SaaS (default for Danos Aparentes)
- Hero: brand fade-rise → headline stagger → CTA settle → visual parallax/idle (subtle)
- Sections: scroll reveal once per section (`opacity` + `y`, 1 strong ease)
- CTA: hover scale ≤ 1.02 + color/shadow; no bounce

### Lane B — Cinematic marketing
- GSAP ScrollTrigger chapters (pin sparingly)
- One signature scroll moment (clip-path / parallax / sticky product)
- Keep copy short; motion carries the story

### Lane C — Polish-only
- Layout already done → `emilkowalski-motion` only
- Entry + hover + state transitions; no new sections

## Implementation checklist

1. **Audit** current page: list existing animations, libraries (`framer-motion`, `animejs`, GSAP), LCP image, hero structure.
2. **Choose lane** A/B/C and name the 2–3 motions you will keep.
3. **Prefer one motion library** already in the project. Danos Aparentes home uses `framer-motion` + `animejs` in TrustSection — do not add GSAP unless the task needs scroll scrub/pin.
4. **Animate transforms/opacity only** (`x`, `y`, `scale`, `rotate`, `opacity`). Never animate layout (`top/left/width/height`) for entrances.
5. **Stagger ≤ 80ms** between siblings; hero primary element leads.
6. **Duration**: entrances 400–700ms, micro 120–200ms, ease soft settle (`easeOut` / `power2.out`).
7. **Mobile**: reduce parallax intensity; disable heavy idle loops under 768px if janky.
8. **A11y**: `useReducedMotion` / `matchMedia('(prefers-reduced-motion: reduce)')` gates.
9. **Perf**: no animation on LCP image decode path; defer below-fold motion; avoid layout thrash.

## Deliverable shape

When invoked without extra scope:

1. State the motion lane + the 2–3 motions.
2. Implement on the target page/components.
3. Note files changed and how reduced-motion is handled.
4. Do not invent new marketing sections unless asked.

## Anti-patterns (delete on sight)

- Autoplaying decorative Lottie/particles in hero
- Infinite bouncing CTAs
- Animating every card on scroll
- Purple gradient glow + glassmorphism by default
- Scroll-jacking the whole page
- Motion that delays primary CTA interaction

## Quick prompts

- `/animated-website` polish home hero motion
- `/animated-website` lane B for `/planos`
- `/animated-website` reduce TrustSection animejs; unify on framer-motion
