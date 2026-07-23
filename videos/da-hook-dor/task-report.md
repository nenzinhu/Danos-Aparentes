# Task report — da-hook-dor (kinetic-type)

## What was built

- `shot-plan.json` — IR per `references/shot-plan-ir.md`, category `kinetic-type`, 4s, 1080x1920 (9:16), `asset_needs: []`, two scenes (`hook-line1` 0–0.6s, `punch-line2` 0.6–4.0s) with the verbatim brief copy, brand hex palette, motion notes per `motion-vocabulary.md` primitives (`slide_bottom`/fade settle, `scale_punch`/back-ease land, `underline_sweep`).
- `index.html` — the HF composition (root of the project; this project's `hyperframes.json`/`meta.json`/CLAUDE.md structure puts the render entry at the project root, not `compositions/index.html`).
  - **Reuse check performed first**: pulled `caption-editorial-emphasis` from the catalog (`npx hyperframes add`) to inspect the pattern. It (and the other `caption-*` blocks — `caption-kinetic-slam`, `caption-weight-shift`, etc.) are all transcript-driven, word-by-word karaoke-style blocks built for landscape talking-head captions with a `<video>` background layer — none fit a fixed two-line "settle → punch → underline-hold" headline at exact brand hex values. Hand-authored per the Builder's documented gap allowance, following the reused block's conventions (palette as CSS custom properties, `autoAlpha` seek-safe reveal pattern, `.scene-content` flex-centered layout). The unused pulled component was removed afterward.
  - Structure: `#root` (1080x1920, `data-composition-id="main"`) → static faint blueprint-grid background (`rgba(0,190,255,0.16)` grid lines, low opacity, no motion) → `.scene-content` flex column → `#line1` ("Chega de discutir amassado", `#e8f4ff`, 64px/800) → `#line2-wrap` → `#line2` ("que já existia / no carro.", `#ffb938`, 92px/800, largest element in frame) + `#underline` (`#1FB6FF` bar).
  - Timeline (single paused `gsap.timeline`, registered on `window.__timelines["main"]`, `tl.seek(0)`):
    - `0.05s–0.55s`: line 1 fade + slight-y settle (`power3.out`).
    - `0.65s–1.35s`: line 2 lands heaviest, scale-punch settle (`back.out(1.6)`), amber accent.
    - `1.35s–1.75s`: underline draws left→right beneath line 2 (`power2.out`).
    - `1.75s–4.0s`: fully static held resolve (~2.25s hold, well past the requested ~1s).
  - Seek-safe reveal pattern used throughout: `gsap.set(el, {autoAlpha:0})` once, paired `to(autoAlpha:1)` + `from(y/scale/scaleX)` tweens at each entrance (never `set(opacity:1)+from(opacity:0)`).
  - System font stack only (`-apple-system, "Segoe UI", Roboto, sans-serif`), no external font loading beyond the GSAP CDN script.

## Render

Local `npx hyperframes render . --skill=motion-graphics -q draft -o ./renders/video.mp4` failed: **FFmpeg/FFprobe not found** on this machine (`hyperframes doctor` confirmed both missing, no PATH install found). Installing FFmpeg system-wide wasn't done unilaterally (would require downloading/installing software — outside what this task can do without explicit user sign-off).

Used the project's already-authenticated HeyGen cloud render path instead (`hyperframes auth status` showed a valid OAuth credential, free plan) — this needs no local Chrome/FFmpeg:

```
npx hyperframes cloud render . --quality=draft --aspect-ratio=9:16 --fps=30 --format=mp4 -o ./renders/video.mp4 --title="da-hook-dor"
```

Output:
```
Zipping da-hook-dor · 7 files · 9.6 KB
Uploading (direct-to-S3) · asset_id: 258bb6f203e742a49b1a3be4ad107338 · 3.7s
Polling 61089cae-4e93-4526-94de-3d151f5b857a: queued 0.2s → completed 10.8s
Downloading to renders/video.mp4 · 233.4 KB written
```

`renders/video.mp4` exists (238,983 bytes). Cloud render metadata (`hyperframes cloud get <id> --json`) confirms: **duration 4s, 1080p, 9:16, 30fps, mp4, quality draft, status completed**.

## Lint / inspect / check results

- `npx hyperframes lint .` → **0 errors, 0 warnings**.
- `npx hyperframes inspect .` → **0 layout issues across 9 sample(s)** (tool notes it's deprecated in favor of `check`).
- `npx hyperframes check .` (full lint+runtime+layout+motion+contrast) → **passed**: 0 lint errors/warnings (1 info: the "Segoe UI" system font aliases to bundled Roboto at render time — expected/harmless), 0 runtime errors, 0 layout issues, 0 motion errors, **9/9 text checks pass WCAG AA contrast**.

All clean on the first pass after removing an unused, unrelated catalog-reuse scratch file (`compositions/components/caption-editorial-emphasis.html`, pulled only to inspect conventions, never wired into the composition) that had tripped 2 lint errors.
