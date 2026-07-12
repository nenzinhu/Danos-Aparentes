# Task report — da-hook-velocidade (stat hero motion graphic)

## What was built

- `shot-plan.json` — category `stat`, 4s, portrait 1080x1920, palette from the exact brand hex
  values given (`#020617` bg / `#e8f4ff` body / `#7a9bbf` muted / `#1FB6FF` accent / `#ffb938`
  signal), `asset_needs: []`. Content: `{ value: 5, prefix: "", suffix: "MIN", label: "por
  vistoria completa — do toque à assinatura", ring: true }`.
- `index.html` (project root — this is the actual `hyperframes render .` entry point) — the
  built composition. Hand-authored rather than reused as-is:
  - Investigated the reuse-first candidate `npx hyperframes add apple-money-count` (per
    `categories/stat/module.md`). It's landscape 1920x1080, light background, `$`-formatted
    money-burst motif with no ring primitive — too large a structural mismatch (aspect, theme,
    motif) against the portrait/dark/ring brief, so it was removed after inspection
    (`compositions/apple-money-count.html` + its sfx asset were deleted). Kept the *technique*
    (GSAP proxy-object `onUpdate` count-up, `tabular-nums`, hold-at-end) per the module's
    documented hand-author fallback.
  - Hero: "0 → 5" tabular-nums count-up (Montserrat 900) driven by one proxy tween
    (`countState.v`, 0.95s, `power2.out`), with an SVG ring (`stroke-dashoffset`) sweeping in
    the same tween's `onUpdate` so digit and ring land together (~1.05s).
  - Landing beat: amber (`#ffb938`) radial flash + a small back-eased scale-pop on the digit.
  - "MIN" unit label (Montserrat 700, accent blue) fades in after the number lands (value →
    meaning), then the muted context line (IBM Plex Mono 400) fades in ~0.35s later.
  - A small "Danos Aparentes" kicker settles in during the first 0.3s.
  - Everything is static/held from ~1.8s to the 4s end — no residual motion at the tail.
  - Seek-safe: delayed elements are `gsap.set(autoAlpha:0)` once then revealed via `to(autoAlpha:1)`
    (not the set+from anti-pattern), count-up is a proxy-object tween (not wall-clock), no
    `Date.now()` / `Math.random()` / network calls in the timeline logic.

## Render

```
npx hyperframes render . --skill=motion-graphics -q draft -o ./renders/video.mp4
```

Completed in 16.8s → `renders/video.mp4`, **221.7 KB**, confirmed **4.0s** duration via
`ffprobe` (`duration=4.000000`), 30fps, 1080x1920.

Note: the environment had no system FFmpeg/FFprobe on PATH. `choco install ffmpeg` failed
(no admin rights) and `winget install Gyan.FFmpeg` failed with an internal winget error, so a
portable FFmpeg 8.1.2 essentials build was downloaded from the official GyanD/codexffmpeg
GitHub releases and its `bin/` directory was prepended to `PATH` for the render/snapshot
commands only — nothing was installed system-wide or added to a persistent PATH.

## Verification

- `npx hyperframes lint .` → **0 errors, 0 warnings**
- `npx hyperframes inspect .` → **0 layout issues across 9 sample(s)**
- `npx hyperframes snapshot . --at 0,0.5,1.05,2,3.9` → contact sheet confirmed: ring empty at
  0s → "4" mid-sweep at 0.5s → "5" + full ring at 1.1s → "MIN" + context line settled and held
  at 2.0s and 3.9s. Count-up/ring sync and the hold-at-end behave as specified.

## Status

DONE.
