# WORK — a black 3D portfolio gallery

A study build in the spirit of an Active-Theory *Work* page: a near-black WebGL
space with work cards floating at different depths, a camera that drifts forward
through them on scroll, hover that lifts a card toward you, pointer parallax,
fog, dust, and heavy depth-of-field. **No assets are copied** — every thumbnail
is generated procedurally, and all titles/categories are invented placeholders.

> Not a Hero/Feature/CTA landing page. One continuous dark gallery you travel.

## Stack
Next.js 15 · React 19 · TypeScript · three.js · @react-three/fiber **v9** ·
@react-three/drei **v10** · @react-three/postprocessing **v3** · GSAP · Lenis ·
Framer Motion · custom GLSL · Tailwind CSS · Zustand.

> React 19 requires the R3F v9 generation (fiber 9 / drei 10 / postprocessing 3).

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

## Structure
```
app/                    layout (Inter + Space Mono), page (scroll track + canvas + UI), globals.css
components/
  ScrollController.tsx  Lenis + GSAP-ticker RAF; publishes scroll(0..1) + pointer(-1..1)
  canvas/
    Experience.tsx      <Canvas>: adaptive DPR, PerformanceMonitor, fog, tone mapping
    CameraRig.tsx       scroll → forward travel + sway + pointer tilt, all damped
    BackgroundShader.tsx fullscreen clip-space quad: animated noise + glow + vignette
    Particles.tsx       dust through the depth (count = quality tier)
    WorkGallery.tsx     instantiates the WorkCards from data
    WorkCard.tsx        plane + procedural texture + CardMaterial; hover lift/scale/frame/label
    HeroTitle.tsx       big WORK title living in 3D, fades as you move in
    PostProcessing.tsx  DepthOfField (lead) + Bloom + Vignette + Noise + Chromatic + SMAA
  ui/
    Navigation.tsx      wordmark + WORK/ABOUT/CONTACT (fly the camera)
    WorkOverlay.tsx     hovered work title/category, bottom-center
    PositionIndicator.tsx  bottom-left NN / total + progress bar
    ScrollHint.tsx      bottom-right SCROLL, fades on travel
    Cursor.tsx          spring ring cursor, grows on hover
shaders/
  noise.ts              simplex GLSL chunk
  cardMaterial.ts       hover UV warp, edge glow, white frame, brightness, depth darkening
  backgroundMaterial.ts dark digital atmosphere
  particlesMaterial.ts  depth-faded soft points
  materials.ts          extend() + R3F JSX type augmentation
hooks/                  useIsMobile, useQualitySettings
data/works.ts           14 placeholder works (designed, non-grid, spread through Z)
lib/                    store (zustand), math, thumbnail generator, lenis singleton
```

## How it reads as a gallery, not a 3D toy
- **Depth, not a list.** Cards span z from ~+2 to ~-44 in a designed-but-not-grid
  layout; the camera starts at z=6 and scroll lerps it to the far end, so you
  physically pass through card groups.
- **Weight.** Camera position, look target, and pointer tilt are all exponentially
  damped — it floats, never cuts or snaps.
- **Hover.** Cards raycast; the hovered card damps forward + scales up, the shader
  warps its UVs, lifts brightness, and draws a thin white frame; a label appears
  in-space and in the bottom overlay.
- **Atmosphere.** Fog + a fullscreen noise/glow backdrop + dust + strong DOF push
  far cards into dark bokeh. The shader also darkens cards by view depth.

## Tuning
- Card layout/titles: `data/works.ts`.
- Focus plane / bokeh: `DepthOfField` in `components/canvas/PostProcessing.tsx`.
- Travel speed/sway: constants in `components/canvas/CameraRig.tsx`.
- Thumbnail look: `lib/thumbnail.ts` (motifs, grain, tint).
