# DESIGN.md — Danos Aparentes (App Tour Video)

> Brand cheat sheet for HyperFrames. Sources: `capture/` (home) + app CSS tokens from live product. Fast-path (~80 lines) for product-demo beats.

## 1. Visual Theme

Danos Aparentes is **two surfaces**: marketing is light-first cream/charcoal with terracotta accent (`#9E4428`); the **in-app workspace** is dark navy/cyan (`#020617` → `#1fb6ff`) for field focus. The video should feel **professional and evidentiary** — proof, not hype. Distinctive: vehicle diagram + damage pins + PDF hash/QR. Avoid purple SaaS gradients and generic glassmorphism.

## 2. Quick Reference

### Colors — Marketing (home)

- **Charcoal Ink** (`#141413`): Display/headlines on light — on `#FAF9F5` ✅
- **Cream Paper** (`#FAF9F5` / `#E8E6DC`): Page backgrounds
- **Terracotta** (`#9E4428`): Brand accent / energy — CTA sparingly; on cream ✅ for large text
- **Warm Gold** (`#8A5508`): Supporting accent (eyebrows) — on cream ✅
- **Stone** (`#44433F` / `#B0AEA5`): Secondary text / neutrals — `#B0AEA5` on cream ⚠ prefer `#44433F` for body
- **White** (`#FFFFFF`): Cards, buttons text on dark CTAs

### Colors — App (in-product UI) — PRIMARY for tool tour beats

- **Void Navy** (`#020617`): App canvas
- **Signal Cyan** (`#1fb6ff` / `#00d4ff`): Primary actions, diagram hover — on navy ✅
- **Ice Text** (`#e8f4ff`): Primary text on dark ✅
- **Muted Slate** (`#9bb4d0`): Secondary labels on dark ✅
- **Severity Low** (`#94a3b8`) / **Med** (`#f97316`) / **High** (`#ef4444`): Damage pins
- **Signal Amber** (`#f5a623`): Sheet lines / measurement accents

**Do not** put `#9bb4d0` on cream marketing surfaces as primary body. **Do not** put charcoal `#141413` as body on void navy without lightening.

### Typography

| Role | Family | Weight | Notes |
|------|--------|--------|-------|
| Display / beat titles | **Saira Condensed** | 700 | Captured 500–700; condensed impact |
| Body / UI | **Outfit** | 400–700 (variable 100–900) | Full variable range available in capture |
| Meta / hash / GPS | **IBM Plex Mono** | 400–600 | Technical proof moments |

Fonts on disk: `capture/assets/` (Outfit variable, Saira Condensed, IBM Plex Mono). Prefer local `@font-face` from capture.

### Components (video-safe)

- **CTA pill**: dark fill `#141413` or cyan `#1fb6ff`, white text, radius ~9999 or 12px control
- **Cards**: cream or glass navy (`#0c162af5`), radius ~20px, subtle border
- **Damage pin**: circular, severity color, number in ice text
- **PDF sheet**: paper white with amber hash line — never fake “5 stars”

## 3. Do's / Don'ts

**Do**
- Lead with **diagram → photo/GPS → assinatura → PDF+QR** as the tool story
- Use real product chrome (dark app) for tool beats; cream only for open/close brand cards
- Show hash / QR / dual signature as proof props
- Keep motion on transform/opacity; prefer-reduced-motion off-ramps

**Don't**
- Invent testimonials, star ratings, or fake client logos
- Mix terracotta marketing CTAs inside dark app chrome in the same beat
- Animate layout width/height; no particle noise
- Promise “100% validity in court”

## 4. Motion language

- Entry: 400–600ms opacity + slight Y translate
- UI feedback: 160–200ms
- Beat cuts: hard or 200ms crossfade
- One easing family (ease-out / power2.out if GSAP)
